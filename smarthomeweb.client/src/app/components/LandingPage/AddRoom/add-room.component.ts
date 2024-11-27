import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Home, HomeService } from '../../../services/home.service';
import { Room, RoomService } from '../../../services/room.service';
import { Router } from '@angular/router';  // Importer Router

@Component({
  selector: 'add-room',
  templateUrl: './add-room.component.html',
  styleUrls: ['./../add-data.component.css']
})
export class AddRoomComponent implements OnInit {
  home = { name: '', address: '' };
  room = { name: '', homeId: '' };
  homes: Home[] = [];
  rooms: Room[] = [];


  constructor(private userService: UserService, private homeService: HomeService, private roomService: RoomService, private router: Router) { }

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
      this.homeService.getHomesByUserId(userId).subscribe(
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
      this.roomService.getRoomsByHomeId(userId, homeId).subscribe(
        (rooms) => {
          this.rooms = rooms;
        },
        (error) => console.error('Error loading rooms:', error)
      );
    } else {
      console.error('No user ID found');
    }
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

    this.roomService.addRoom(userId, this.room.homeId, newRoom).subscribe(
      (response) => {
        console.log('Pièce ajoutée avec succès:', response);
        this.room = { name: '', homeId: '' };
      },
      (error) => console.error('Erreur lors de l\'ajout de la pièce :', error)
    );
  }

}
