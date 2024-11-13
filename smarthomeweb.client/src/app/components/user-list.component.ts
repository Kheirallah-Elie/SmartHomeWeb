import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import * as signalR from "@microsoft/signalr";
import { Router } from '@angular/router';  // Importer Router

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  user: any = null; // Stocke les informations de l'utilisateur connecté
  private hubConnection: signalR.HubConnection | null = null;
  selectedUser: any = null; // Pour stocker l'utilisateur sélectionné pour le modal

  constructor(private userService: UserService, private router: Router) { }  // Ajouter Router ici

  ngOnInit(): void {
    this.loadConnectedUser(); // Charge l'utilisateur connecté lors de l'initialisation
    this.startSignalRConnection();
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

    this.userService.toggleDeviceState(this.user.userId, homeId, roomId, deviceId).subscribe(
      () => {
        console.log(homeId);
        this.loadConnectedUser(); // Recharge les données de l'utilisateur pour mettre à jour l'état
      },
      (error) => {
        console.error('Error toggling device state:', error);
      }
    );
  }

  // Méthode de déconnexion
  logout() {
    // Appeler la méthode de déconnexion du service
    this.userService.logout().subscribe(
      response => {
        console.log('Logout successful');
        this.router.navigate(['/login']);  // Effectuer la redirection vers la page de login
      },
      error => {
        console.error('Logout failed:', error);
      }
    );
  }

  private startSignalRConnection(): void {
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
}
