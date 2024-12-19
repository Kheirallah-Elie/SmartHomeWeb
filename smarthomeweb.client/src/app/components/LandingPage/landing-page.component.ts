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

  telemetryMessage: string = '';  // Variable to hold the received telemetry message

  constructor(
    private userService: UserService,
    private homeService: HomeService,
    private deviceService: DeviceService,
    private signalRService: SignalRService,  // Inject SignalRService
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadConnectedUser(); // Charge l'utilisateur connecté lors de l'initialisation
    this.startSignalRConnectionWithAzureFunction();

    // Subscribe to the telemetry messages and update the UI when a new message is received
    this.signalRService.message$.subscribe((message) => {
      this.telemetryMessage = message;
      this.loadConnectedUser();
    });
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

  // Méthode pour basculer l'état d'un appareil
  async toggleDeviceState(homeId: string, roomId: string, deviceId: string): Promise<void> {

    if (!this.user?.userId || !homeId || !roomId || !deviceId) {
      console.error('One or more IDs are undefined:', { userId: this.user?.userId, homeId, roomId, deviceId });
      return;
    }

    try {
      // Toggle device state locally
      await this.deviceService.toggleDeviceState(this.user.userId, homeId, roomId, deviceId).toPromise();

      // Get the updated device state
      const deviceState = await this.getDeviceState(this.user.userId, homeId, roomId, deviceId);

      console.log("User ID: " + this.user.userId + "\nHome ID: " + homeId + "\nRoom ID: " + roomId + "\nDevice ID: " + deviceId + "\nDevice state: " + deviceState);


      this.signalRService.updateSignalR(this.user.userId, homeId, roomId, deviceId, deviceState);
      // Reload user data to refresh the UI
      this.loadConnectedUser();

    } catch (error) {
      console.error('Error toggling device state or fetching the updated state:', error);
    }
  }


  private startSignalRConnectionWithAzureFunction(): void {
    this.signalRService.startConnection("675cadd7ac30c2e22ce93352"); // testing with the Helb userID
    this.signalRService.addMessageListener((message: string) => {
      this.loadConnectedUser(); // Update the UI when a device state changes
    });
  }


  private getDeviceState(userId: string, homeId: string, roomId: string, deviceId: string): Promise<boolean> {
    return this.deviceService.getDeviceState(userId, homeId, roomId, deviceId).toPromise()
      .then(
        (response) => {
          if (response && response.state !== undefined) {
            return response.state;
          }
          console.error('Device state is undefined');
          return false; // Fallback state
        },
        (error) => {
          console.error('Error fetching device state:', error);
          return false; // Fallback state in case of an error
        }
      );
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
