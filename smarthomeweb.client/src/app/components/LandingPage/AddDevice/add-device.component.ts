import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Home, HomeService } from '../../../services/home.service';
import { Room, RoomService } from '../../../services/room.service';
import { DeviceService } from '../../../services/device.service';
import { Router } from '@angular/router';  // Importer Router

@Component({
  selector: 'add-device',
  templateUrl: './add-device.component.html',
  styleUrls: ['./../add-data.component.css']
})
export class AddDeviceComponent implements OnInit {
  home = { name: '', address: '' };
  room = { name: '', homeId: '' };
  device = { name: '', homeId: '', roomId: '', state: false };
  homes: Home[] = [];
  rooms: Room[] = [];
  showAlert = false; // Propriété pour contrôler l'affichage de l'alerte

  constructor(private userService: UserService, private homeService: HomeService, private roomService: RoomService, private deviceService: DeviceService, private router: Router) { }

  ngOnInit() {
    this.loadHomes();
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

    this.deviceService.addDevice(userId, this.device.homeId, this.device.roomId, newDevice).subscribe(
      (response) => {
        console.log('Appareil ajouté avec succès:', response);
        this.device = { name: '', homeId: '', roomId: '', state: false };

        // Mettre le show alerte a True pour afficher l'alerte
        this.showAlert = true;
      },
      (error) => console.error('Erreur lors de l\'ajout de l\'appareil :', error)
    );
  }
}
