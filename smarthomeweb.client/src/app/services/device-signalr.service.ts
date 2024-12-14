import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

// To adapt our database to the existing received payload from our web app
const arduinoJsonStructure = {
  "deviceId": "SmartHome",
  "rooms": [
    {
      "name": "Living Room",
      "devices": [
        {
          "name": "Light",
          "isOn": false,
        }
      ]
    }
  ]
};

/* TODO NEXT RECEIVED TELEMETRY FROM IOT HUB on Device toggle from the Arduino, adapt it with our database to toggle a device from the Arduino

Telemetry received:
{
  "homeId": "HomeId001",
  "topic": "team5",
  "username": "johndoe",
  "id": 1,
  "deviceId": "SmartHome",
  "rooms": [
    {
      "id": 1,
      "name": "Living Room",
      "devices": [
        {
          "id": 1,
          "name": "Light",
          "isOn": true,
          "type": "lighting",
          "description": "Main ceiling light"
        },
        {
          "id": 2,
          "name": "Socket",
          "isOn": false,
          "type": "socket",
          "description": "Smart socket"
        }
      ]
    },
    {
      "id": 2,
      "name": "Kitchen",
      "devices": [
        {
          "id": 1,
          "name": "Light",
          "isOn": false,
          "type": "lighting",
          "description": "Main ceiling light"
        },
        {
          "id": 2,
          "name": "Socket",
          "isOn": false,
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
  private hubConnection!: signalR.HubConnection;
  private messageSubject = new BehaviorSubject<string>('');
  message$ = this.messageSubject.asObservable();

  /**
   * Start the SignalR connection with Azure SignalR Service.
   */
  startConnection(): void {
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
            console.log("I'm trying to get in here")
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
      console.log('Telemetry received:', message);
      this.messageSubject.next(message); // Update the observable with the received message
    });
  }

  /**
   * Send a command to the Azure Function to be forwarded to the IoT device.
   * @param payload An object containing the device ID and command.
   */
  sendMessage(payload: { userId: string; homeId: string; roomId: string; deviceId: string, deviceState :boolean }) {
    // We are manually replacing the information we need from the payload to the correct JSON structure that expects the data from the Arduino Board
    arduinoJsonStructure.deviceId = payload.homeId;
    arduinoJsonStructure.rooms[0].name = payload.roomId;
    arduinoJsonStructure.rooms[0].devices[0].name = payload.deviceId;
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
