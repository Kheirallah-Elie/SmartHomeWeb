import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { DeviceService } from '../services/device.service'

// To adapt our database to the existing received payload from our web app
const arduinoJsonStructure = {
  "homeId": "HomeId001",
  "topic": "team5",
  "username": "johndoe",
  "id": 1,
  "deviceId": "SmartHome",
  "rooms": [
    {
      "id": 1,
      "name": "",
      "devices": [
        {
          "id": 1,
          "name": "",
          "isOn": false,
          "type": "",
          "description": ""
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
  startConnection(userId: string): void {
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

      // Exit if no rooms are received
      if (!rooms || !Array.isArray(rooms)) {
        return;
      }

      // Iterate over rooms and devices to update their state
      rooms.forEach((room: Room) => {
        // Ensure room.id is converted to a string
        const roomId: string = room.id !== undefined && room.id !== null ? String(room.id) : '';

        room.devices.forEach((device: Device) => {
          // Ensure device.id is converted to a string
          const deviceId: string = device.id !== undefined && device.id !== null ? String(device.id) : '';
          const { isOn } = device;

          // Validate that roomId and deviceId are valid strings
          if (roomId && deviceId) {
            // Call the device service to update the device state in the database
            this.deviceService.updateDeviceState(userId, "SmartHome", roomId, deviceId, isOn);
            this.updateFromArduino(userId, "SmartHome", roomId, deviceId, isOn);

          } else {
            console.warn(`Invalid room or device ID. Skipping update for room: ${roomId}, device: ${deviceId}`);
          }
        });
      });
    } catch (error) {
      console.error('Error processing telemetry message:', error);
    }
  }

  /**
   * Send a command to the Azure Function to be forwarded to the IoT device.
   * @param payload An object containing the device ID and command.
   */
  sendMessage(payload: { userId: string; homeId: string; roomId: string; deviceId: string, deviceState: boolean }) {
    // We are manually replacing the information we need from the payload to the correct JSON structure that expects the data from the Arduino Board
    arduinoJsonStructure.deviceId = payload.homeId;
    arduinoJsonStructure.rooms[0].id = parseInt(payload.roomId);
    arduinoJsonStructure.rooms[0].devices[0].id = parseInt(payload.deviceId); // MAKE SURE ID'S ARE PARSEABLE INTO INT
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

  private async updateDeviceAndSignalR(
    userId: string,
    homeId: string,
    roomId: string,
    deviceId: string,
    deviceState: boolean
  ): Promise<void> {
    try {
      // Update the device state in the database
      await this.deviceService.updateDeviceState(userId, homeId, roomId, deviceId, deviceState);

      // Update SignalR
      this.updateFromArduino(userId, homeId, roomId, deviceId, deviceState);
    } catch (error) {
      console.error(`Failed to update device (Room: ${roomId}, Device: ${deviceId}):`, error);
    }
  }

  updateFromArduino(userId: string, homeId: string, roomId: string, deviceId: string, deviceState: boolean): void {
    const payload = this.createPayload(userId, homeId, roomId, deviceId, deviceState);
    // Custom behavior specific to updateFromArduino can go here
    console.log('Updating from Arduino with payload:', payload);
  }

  updateSignalR(userId: string, homeId: string, roomId: string, deviceId: string, deviceState: boolean): void {
    const payload = this.createPayload(userId, homeId, roomId, deviceId, deviceState);
    this.sendMessage(payload); // Leverage the shared payload logic and call sendMessage
  }

  private createPayload(
    userId: string,
    homeId: string,
    roomId: string,
    deviceId: string,
    deviceState: boolean
  ): { userId: string; homeId: string; roomId: string; deviceId: string; deviceState: boolean } {
    return {
      userId,
      homeId,
      roomId,
      deviceId,
      deviceState,
    };
  }
}
