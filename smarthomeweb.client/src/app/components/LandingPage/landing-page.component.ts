import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { DeviceService } from '../../services/device.service'
import { HomeService } from '../../services/home.service';
import * as signalR from "@microsoft/signalr";
import { Router } from '@angular/router';  // Importer Router
import { SignalRService } from '../../services/device-signalr.service';

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
  homeToDeleteId: string | null = null;  // ID de la maison à supprimer
  modalsState: { [homeId: string]: boolean } = {};

  constructor(
    private userService: UserService,
    private homeService: HomeService,
    private deviceService: DeviceService,
    private signalRService: SignalRService,  // Inject SignalRService
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadConnectedUser(); // Charge l'utilisateur connecté lors de l'initialisation
    this.startSignalRConnection(); // Establish connection for device updates
    this.startSignalRConnectionWithAzureFunction();
  }

  // Méthode pour charger l'utilisateur connecté
  private loadConnectedUser(): void {
    const userId = this.userService.getUserId();

    if (userId) {
      this.userService.getUserById(userId).subscribe(
        user => {
          this.user = user; // Charge les informations de l'utilisateur connecté
        },
        error => {
          console.error('Error fetching connected user:', error);
        }
      );
    } else {
      console.warn('No user ID found in localStorage');
    }
  }

  openConfirmationModal(homeId: string): void {
    this.homeToDeleteId = homeId;
    this.modalsState[homeId] = true;
  }

  closeConfirmationModal(homeId: string): void {
    this.modalsState[homeId] = false;
    this.homeToDeleteId = null;
  }

  openModal(user: any): void {
    this.selectedUser = user; // Définit l'utilisateur sélectionné
  }

  closeModal(): void {
    this.selectedUser = null; // Réinitialise l'utilisateur sélectionné
  }

  private startSignalRConnection(): void { // with self
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7156/User')
      .build();

    this.hubConnection.start().then(() => {
      console.log('SignalR connection established');
    }).catch(err => console.error('Error establishing SignalR connection:', err));

    this.hubConnection.on('DeviceStateChanged', (update) => {
      console.log('Device state changed:', update);
      this.loadConnectedUser(); // Recharge les données pour refléter les changements
    });
  }

  
  // Méthode pour basculer l'état d'un appareil
  toggleDeviceState(homeId: string, roomId: string, deviceId: string): void {

    console.log("User ID: " + this.user.userId + "\nHome ID: " + homeId + "\nRoom ID: " + roomId + "\nDevice ID: " + deviceId);
    // Vérifie que les ID sont définis avant de faire l'appel
    if (!this.user?.userId || !homeId || !roomId || !deviceId) {
      console.error('One or more IDs are undefined:', { userId: this.user?.userId, homeId, roomId, deviceId });
      return;
    }

    // Toggle device state locally
    this.deviceService.toggleDeviceState(this.user.userId, homeId, roomId, deviceId).subscribe(
      () => {
        this.loadConnectedUser(); // Recharge les données de l'utilisateur pour mettre à jour l'état

        // Notify the Azure Function of the state change via SignalR
        this.signalRService.sendMessage({
          userId: this.user.userId,
          homeId: homeId,
          roomId: roomId,
          deviceId: deviceId
        });
        console.log("Sending data to Azure Function")

      },
      (error) => {
        console.error('Error toggling device state:', error);
      }
    );
  }
  
  private startSignalRConnectionWithAzureFunction(): void {
    this.signalRService.startConnection();
    this.signalRService.addMessageListener((message: string) => {
      console.log('Real-time device update:', message);
      this.loadConnectedUser(); // Update the UI when a device state changes
    });
  }


  deleteHome(): void {
    if (!this.homeToDeleteId || !this.user?.userId) {
      console.error('Home ID or User ID is missing.');
      return;
    }

    console.log(`Attempting to delete home with ID: ${this.homeToDeleteId}`);

    this.homeService.deleteHome(this.user.userId, this.homeToDeleteId).subscribe(
      () => {
        console.log(`Home with ID ${this.homeToDeleteId} deleted successfully.`);
        this.loadConnectedUser();
        this.closeConfirmationModal(this.homeToDeleteId!); // Ferme la modale après la suppression
      },
      (error) => {
        console.error(`Error deleting home with ID ${this.homeToDeleteId}:`, error);
      }
    );
  }
}
