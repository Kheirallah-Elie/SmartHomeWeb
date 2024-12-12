import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

// For testing connection with the Arduino now, message sent succesfully
const testingPayload = {
  "homeId": "HomeId001",
  "topic": "team5",
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
          "isOn": false
        }
      ]
    }
  ]
};


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
  sendMessage(payload: { userId: string; homeId: string; roomId: string; deviceId: string }) {

    fetch('https://smarthomeapp.azurewebsites.net/api/SendToDevice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testingPayload) // Send the payload as a JSON string
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
  addMessageListener(callback: (message: string) => void): void {
    this.message$.subscribe(callback);
  }
}
