// user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: any[] = []; // Liste des utilisateurs
  selectedUser: any = null; // To store the selected user for the modal

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers(); // Charge les utilisateurs lors de l'initialisation
  }

  // Méthode pour charger les utilisateurs
  private loadUsers(): void {
    this.userService.getUsers().subscribe(
      (users) => {
        this.users = users; // Affecte les utilisateurs récupérés à la variable
        console.log('Fetched users:', this.users); // Log pour vérifier la structure
      },
      (error) => {
        console.error('Error fetching users:', error); // Gestion des erreurs
      }
    );
  }

  openModal(user: any): void {
    this.selectedUser = user; // Set the selected user
  }

  closeModal(): void {
    this.selectedUser = null; // Reset selected user
  }

  // Méthode pour basculer l'état d'un appareil
  toggleDeviceState(userId: string, homeId: string, roomId: string, deviceId: string): void {
    // Vérification des ID avant de faire l'appel
    if (!userId || !homeId || !roomId || !deviceId) {
      console.error('One or more IDs are undefined:', { userId, homeId, roomId, deviceId });
      return; // Sort de la méthode si un ID est indéfini
    }

    this.userService.toggleDeviceState(userId, homeId, roomId, deviceId).subscribe(
      () => {
        console.log(homeId);
        this.loadUsers(); // Recharge les utilisateurs pour mettre à jour l'état
      },
      (error) => {
        console.error('Error toggling device state:', error); // Gestion des erreurs
      }
    );
  }
}



// Le but serait de pouvoir afficher cette page pour commencer, il faut resoudre un souci de routage
