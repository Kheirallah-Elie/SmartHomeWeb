import { Component, OnInit } from '@angular/core';
import { UserService, Home, Room } from '../services/user.service';
import { Router } from '@angular/router';  // Importer Router

@Component({
  selector: 'app-add-data',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.css']
})
export class AddDataComponent implements OnInit {
  home = { name: '', address: '' };
  room = { name: '', homeId: '' };
  device = { name: '', homeId: '', roomId: '', state: false };
  homes: Home[] = [];
  rooms: Room[] = [];


  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.loadHomes();
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

  loadHomes() {
    const userId = this.userService.getUserId();
    if (userId) { // Add null check
      this.userService.getHomesByUserId(userId).subscribe(
        (homes) => {
          this.homes = homes;
        },
        (error) => console.error('Error loading homes:', error)
      );
    } else {
      console.error('No user ID found');
    }
  }

  loadRooms(homeId: string) {
    const userId = this.userService.getUserId();
    if (userId) { // Add null check
      this.userService.getRoomsByHomeId(userId, homeId).subscribe(
        (rooms) => {
          this.rooms = rooms;
        },
        (error) => console.error('Error loading rooms:', error)
      );
    } else {
      console.error('No user ID found');
    }
  }

  addHome() {
    const userId = this.userService.getUserId();
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    const newHome = {
      homeId: crypto.randomUUID(),
      nickname: this.home.name,
      address: this.home.address || 'Adresse par défaut',
      rooms: []
    };

    this.userService.addHome(userId, newHome).subscribe(
      (response) => {
        console.log('Maison ajoutée avec succès:', response);
        this.home = { name: '', address: '' };
        this.loadHomes(); // Reload homes list
      },
      (error) => console.error('Erreur lors de l\'ajout de la maison :', error)
    );
  }

  addRoom() {
    const userId = this.userService.getUserId();
    if (!userId || !this.room.homeId) {
      console.error('User ID or Home ID is missing');
      return;
    }

    const newRoom = {
      roomId: crypto.randomUUID(),
      name: this.room.name,
      devices: []
    };

    this.userService.addRoom(userId, this.room.homeId, newRoom).subscribe(
      (response) => {
        console.log('Pièce ajoutée avec succès:', response);
        this.room = { name: '', homeId: '' };
        this.loadRooms(this.room.homeId);
      },
      (error) => console.error('Erreur lors de l\'ajout de la pièce :', error)
    );
  }

  addDevice() {
    const userId = this.userService.getUserId();
    if (!userId || !this.device.roomId) {
      console.error('User ID or Room ID is missing');
      return;
    }

    const newDevice = {
      deviceId: crypto.randomUUID(),
      description: this.device.name,
      state: this.device.state
    };

    this.userService.addDevice(userId, this.device.homeId, this.device.roomId, newDevice).subscribe(
      (response) => {
        console.log('Appareil ajouté avec succès:', response);
        this.device = { name: '', homeId: '', roomId: '', state: false };
      },
      (error) => console.error('Erreur lors de l\'ajout de l\'appareil :', error)
    );
  }
}
