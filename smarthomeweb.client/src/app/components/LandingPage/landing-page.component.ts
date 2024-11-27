import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { DeviceService } from '../../services/device.service'
import * as signalR from "@microsoft/signalr";
import { Router } from '@angular/router';  // Importer Router

@Component({
  selector: 'landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  user: any = null; // Stocke les informations de l'utilisateur connecté
  private hubConnection: signalR.HubConnection | null = null;
  selectedUser: any = null; // Pour stocker l'utilisateur sélectionné pour le modal
  latestUpdate: string = '';

  constructor(private userService: UserService, private deviceService: DeviceService, private router: Router) { }  // Ajouter Router ici

  ngOnInit(): void {
    this.loadConnectedUser(); // Charge l'utilisateur connecté lors de l'initialisation
    this.startSignalRConnection();
    //this.startSignalRConnectionWithAzureFunction(); // Causing error, to diagnose.... This is the function that will connect with Azure Function through SignalR
  }

  // Méthode pour charger l'utilisateur connecté
  private loadConnectedUser(): void {
    const userId = this.userService.getUserId();

    console.log("user ID ->", userId);//debug

    if (userId) {
      this.userService.getUserById(userId).subscribe(
        user => {
          this.user = user; // Charge les informations de l'utilisateur connecté
          console.log('Connected user:', this.user);
        },
        error => {
          console.error('Error fetching connected user:', error);
        }
      );
    } else {
      console.warn('No user ID found in localStorage');
    }
  }

  openModal(user: any): void {
    this.selectedUser = user; // Définit l'utilisateur sélectionné
  }

  closeModal(): void {
    this.selectedUser = null; // Réinitialise l'utilisateur sélectionné
  }

  // Méthode pour basculer l'état d'un appareil
  toggleDeviceState(homeId: string, roomId: string, deviceId: string): void {
    // Vérifie que les ID sont définis avant de faire l'appel
    if (!this.user?.userId || !homeId || !roomId || !deviceId) {
      console.error('One or more IDs are undefined:', { userId: this.user?.userId, homeId, roomId, deviceId });
      return;
    }

    this.deviceService.toggleDeviceState(this.user.userId, homeId, roomId, deviceId).subscribe(
      () => {
        console.log(homeId);
        this.loadConnectedUser(); // Recharge les données de l'utilisateur pour mettre à jour l'état
      },
      (error) => {
        console.error('Error toggling device state:', error);
      }
    );
  }


  private startSignalRConnection(): void { // with self
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7156/deviceHub')
      .build();

    this.hubConnection.start().then(() => {
      console.log('SignalR connection established');
    }).catch(err => console.error('Error establishing SignalR connection:', err));

    this.hubConnection.on('DeviceStateChanged', (update) => {
      console.log('Device state changed:', update);
      this.loadConnectedUser(); // Recharge les données pour refléter les changements
    });
  }

  private startSignalRConnectionWithAzureFunction(): void {
    fetch('https://smarthomeapp.azurewebsites.net/api/negotiate')
      .then(response => response.json())
      .then(connectionInfo => {
        console.log('Connection Info:', connectionInfo);

        this.hubConnection = new signalR.HubConnectionBuilder()
          .withUrl(connectionInfo.url, { accessTokenFactory: () => connectionInfo.accessToken })
          .build();

        console.log('Attempting to start SignalR connection...');

        this.hubConnection.start()
          .then(() => {
            console.log('SignalR Connected');
            this.logConnectionState();
          })
          .catch(err => {
            console.error('SignalR Connection Error:', err);
          });

        this.hubConnection.onclose(error => {
          console.error('SignalR connection closed due to an error:', error);
          this.logConnectionState();
        });

        this.hubConnection.onreconnected(connectionId => {
          console.log('Reconnected to SignalR with connection ID:', connectionId);
          this.logConnectionState();
        });

        this.hubConnection.onreconnecting(error => {
          console.log('Reconnecting to SignalR...');
          this.logConnectionState();
        });

        setInterval(() => {
          this.logConnectionState();
        }, 5000);
      })
      .catch(err => {
        console.error('Negotiate request failed:', err);
      });
  }

  private logConnectionState() {
    if (this.hubConnection) {
      const state = this.hubConnection.state;
      console.log('SignalR Connection State:', state);

      switch (state) {
        case signalR.HubConnectionState.Disconnected:
          console.log('Connection is disconnected');
          break;
        case signalR.HubConnectionState.Connecting:
          console.log('Connecting to SignalR...');
          break;
        case signalR.HubConnectionState.Connected:
          console.log('Successfully connected to SignalR');
          break;
        case signalR.HubConnectionState.Reconnecting:
          console.log('Reconnecting to SignalR...');
          break;
        default:
          console.log('Unknown connection state');
      }
    }
  }

  private setupRealTimeEventListeners() {
    if (this.hubConnection) {
      this.hubConnection.on('DeviceStateChanged', (update) => {
        console.log('Device state changed:', update);
        this.latestUpdate = update;
      });
    }
  }


}
