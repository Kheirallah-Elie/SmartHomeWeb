import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { DeviceService } from '../services/device.service'

// To adapt our database to the existing received payload from our web app
const arduinoJsonStructure = {
  "deviceId": "SmartHome",
  "rooms": [
    {
      "id":"1",
      "devices": [
        {
          "id": "1",
          "isOn": false,
        }
      ]
    }
  ]
};

interface Device {
  id: string;
  isOn: boolean;
}

interface Room {
  id: string;
  devices: Device[];
}

interface TelemetryData {
  deviceId: string;
  rooms: Room[];
}

/* TODO NEXT RECEIVED TELEMETRY FROM IOT HUB on Device toggle from the Arduino, adapt it with our database to toggle a device from the Arduino

Telemetry received:
{
  "homeId": "HomeId001",
  "topic": "team5",
  "username": "johndoe",
  "id": 1,
  "deviceId": "SmartHome", // I want this
  "rooms": [
    {
      "id": 1,
      "name": "Living Room", // I want this
      "devices": [
        {
          "id": 1,
          "name": "Light", // I want this
          "isOn": true, // I want this
          "type": "lighting",
          "description": "Main ceiling light"
        },
        {
          "id": 2,
          "name": "Socket", // I want this
          "isOn": false, // I want this
          "type": "socket",
          "description": "Smart socket"
        }
      ]
    },
    {
      "id": 2,
      "name": "Kitchen", // I want this 
      "devices": [
        {
          "id": 1,
          "name": "Light", // I want this
          "isOn": false, // I want this
          "type": "lighting",
          "description": "Main ceiling light"
        },
        {
          "id": 2,
          "name": "Socket", // I want this
          "isOn": false, // I want this
          "type": "socket",
          "description": "Smart socket"
        }
      ]
    }
  ]
}

*/

@Injectable({
  providedIn: 'root'
})

export class SignalRService {

  constructor(private deviceService: DeviceService) { }


  private hubConnection!: signalR.HubConnection;
  private messageSubject = new BehaviorSubject<string>('');
  message$ = this.messageSubject.asObservable();

  /**
   * Start the SignalR connection with Azure SignalR Service.
   */
  startConnection(userId : string): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://smarthomeapp.azurewebsites.net/api', {
        accessTokenFactory: async () => {
          try {
            const response = await fetch('https://smarthomeapp.azurewebsites.net/api/Negotiate', {
              method: 'POST',
            });
            const data = await response.json();

            if (!data || !data.accessToken) {
              throw new Error("Access token not found in response");
            }
            return data.accessToken; // Retrieve the access token for authentication
          } catch (error) {
            console.error('Error fetching SignalR access token:', error);
            throw error;
          }
        }
      })
      .configureLogging(signalR.LogLevel.Information) // Configure SignalR logging level
      .withAutomaticReconnect() // Enable automatic reconnection
      .build();

    // Start the connection and handle success/error
    this.hubConnection.start()
      .then(() => console.log('SignalR connection started'))
      .catch(err => console.error('Error starting SignalR connection:', err));

    // Register a listener for receiving telemetry messages
    // Register a listener for receiving telemetry messages
    this.hubConnection.on('ReceiveTelemetry', (message: string) => {
      this.messageSubject.next(message); // Update the observable with the received message
      this.handleTelemetry(userId, message); // Call the function to handle the telemetry and update the device state
    });
  }

  /**
 * Handle received telemetry and update the database
 * @param message The received telemetry message.
 */
  handleTelemetry(userId: string, message: string): void {
    try {
      // Check if message is a string and needs parsing
      const telemetryData: TelemetryData = (typeof message === 'string') ? JSON.parse(message) : message;

      // Log the parsed telemetryData to verify structure
      console.log('Received telemetry data:', telemetryData);

      const { deviceId, rooms } = telemetryData;

      // exit if nothing is received
      if (!rooms) {
        return;
      }

      // Iterate over rooms and devices to update their state
      rooms.forEach((room: Room) => {
        // Check if devices is undefined or null
        if (!room.devices) {
          return;
        }

        room.devices.forEach((device: Device) => {
          const { id: id, isOn } = device;

          // Call the device service to update the device state in the database
          this.deviceService.updateDeviceState(userId, deviceId, room.id, device.id, isOn);
        });
      });
    } catch (error) {
      //console.error('Error processing telemetry message:', error);
    }
  }



  /**
   * Send a command to the Azure Function to be forwarded to the IoT device.
   * @param payload An object containing the device ID and command.
   */
  sendMessage(payload: { userId: string; homeId: string; roomId: string; deviceId: string, deviceState :boolean }) {
    // We are manually replacing the information we need from the payload to the correct JSON structure that expects the data from the Arduino Board
    arduinoJsonStructure.deviceId = payload.homeId;
    arduinoJsonStructure.rooms[0].id = payload.roomId;
    arduinoJsonStructure.rooms[0].devices[0].id = payload.deviceId;
    arduinoJsonStructure.rooms[0].devices[0].isOn = payload.deviceState;
   
    fetch('https://smarthomeapp.azurewebsites.net/api/SendToDevice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(arduinoJsonStructure) // Send the payload as a JSON string
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(result => console.log('Command sent:', result))
      .catch(error => console.error('Error sending command:', error));
  }

  /**
   * Register a custom message listener for the SignalR connection.
   * @param callback A function to handle incoming messages.
   */
  addMessageListener(callback: (message: string) => void) {
    this.hubConnection.on('ReceiveTelemetry', callback);
  }
}
