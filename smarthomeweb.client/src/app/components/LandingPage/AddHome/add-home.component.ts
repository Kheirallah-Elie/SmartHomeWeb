import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Home, HomeService } from '../../../services/home.service';


import { Router } from '@angular/router';  // Importer Router

@Component({
  selector: 'add-home',
  templateUrl: './add-home.component.html',
  styleUrls: ['./../add-data.component.css']
})
export class AddHomeComponent implements OnInit {
  home = { name: '', address: '' };
  homes: Home[] = [];
  showAlert = false; // Propriété pour contrôler l'affichage de l'alerte

  constructor(private userService: UserService, private homeService: HomeService, private router: Router) { }

  ngOnInit() {
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
      address: this.home.address || 'Default address',
      rooms: []
    };

    this.homeService.addHome(userId, newHome).subscribe(
      (response) => {
        console.log('Home successfully added:', response);
        this.home = { name: '', address: '' };

        // Mettre le show alerte a True pour afficher l'alerte
        this.showAlert = true;
      },
      (error) => console.error('Adding Home failed :', error)
    );
  }
}
