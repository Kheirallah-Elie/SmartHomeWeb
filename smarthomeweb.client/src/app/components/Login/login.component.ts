import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private userService: UserService, private router: Router) { }

  login() {
    this.userService.login(this.email, this.password).subscribe({
      next: (response) => {
        // Authentification réussie, redirection vers la page des utilisateurs
        this.router.navigate(['/users']);
      },
      error: (error) => {
        // Vérifie si l'erreur est liée à l'email ou au mot de passe
        if (error.status === 401) {
          // Si l'erreur est un échec d'authentification
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else {
          // Pour toute autre erreur
          this.errorMessage = 'An unexpected error occurred. Please try again later.';
        }
      }
    });
  }
}
