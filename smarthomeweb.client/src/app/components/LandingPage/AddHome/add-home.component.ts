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

  constructor(private userService: UserService, private homeService: HomeService, private router: Router) { }

  ngOnInit() {
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
      },
      (error) => console.error('Adding Home failed :', error)
    );
  }
}
