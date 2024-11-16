import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-add-data',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.css']
})
export class AddDataComponent {
  // Modèles pour les données
  home = { name: '', address: '' }; // Maison
  room = { name: '', homeId: '' }; // Pièce
  device = { name: '', homeId: '', roomId: '', state: false }; // Appareil

  constructor(private userService: UserService) { }

  // Ajouter une maison
  addHome() {
    const userId = this.userService.getUserId(); // Récupérer l'ID utilisateur
    console.log("UserId------------------------------------------>", userId);
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    const newHome = {
      homeId: crypto.randomUUID(),
      nickname: this.home.name,
      address: this.home.address || "Adresse par défaut", // Utilisez l'adresse saisie ou une valeur par défaut
      rooms: []
    };
    console.log("homeID------------------------------------------>", newHome.homeId.toString());
    this.userService.addHome(userId, newHome).subscribe(
      response => {
        console.log('Maison ajoutée avec succès :', response);
        this.home = { name: '', address: '' }; // Réinitialise le formulaire
        window.alert('Maison ajoutée avec succès !'); // Affiche un message d'alerte
      },
      error => {
        console.error('Erreur lors de l\'ajout de la maison :', error);
      }
    );
  }

  // Ajouter une pièce
  addRoom() {
    const userId = this.userService.getUserId();
    if (!userId || !this.room.homeId) {
      console.error('User ID or Home ID is missing');
      return;
    }

    const newRoom = {
      roomId: crypto.randomUUID(), // Génère un ID unique
      name: this.room.name,
      devices: [] // Initialise avec des appareils vides
    };

    this.userService.addRoom(userId, this.room.homeId, newRoom).subscribe(
      response => {
        console.log('Pièce ajoutée avec succès :', response);
        this.room = { name: '', homeId: '' }; // Réinitialise le formulaire
        window.alert('Pièce ajoutée avec succès !'); // Affiche un message d'alerte
      },
      error => {
        console.error('Erreur lors de l\'ajout de la pièce :', error);
      }
    );
  }

  // Ajouter un appareil
  addDevice() {
    const userId = this.userService.getUserId();
    if (!userId || !this.device.roomId) {
      console.error('User ID or Room ID is missing');
      return;
    }

    // Création d'un nouvel appareil avec le bon format
    const newDevice = {
      deviceId: crypto.randomUUID(), // Génère un ID unique
      description: this.device.name, // Nom de l'appareil
      state: this.device.state       // État de l'appareil
    };

    console.log("Home id -*/**/*/*/*/*/*/->", this.device.homeId);//debug
    console.log("Room id -*/*/*/*/*/*/*/*->", this.device.roomId);//debug
    // Envoi des données au back-end
    this.userService.addDevice(userId, this.device.homeId, this.device.roomId, newDevice).subscribe(
      response => {
        console.log('Appareil ajouté avec succès :', response);
        this.device = { name: '', homeId: '', roomId: '', state: false }; // Réinitialise le formulaire
        window.alert('Appareil ajouté avec succès !'); // Affiche un message d'alerte
      },
      error => {
        console.error('Erreur lors de l\'ajout de l\'appareil :', error);
      }
    );
  }
}
