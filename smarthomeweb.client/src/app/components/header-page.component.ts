import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';  

@Component({
  selector: 'header-tab',
  templateUrl: './header-page.component.html',
  styleUrls: ['./LandingPage/landing-page.component.css']

})
export class HeaderPageComponent {

  constructor(private userService: UserService, private router: Router) { }  // Ajouter Router ici

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
}
