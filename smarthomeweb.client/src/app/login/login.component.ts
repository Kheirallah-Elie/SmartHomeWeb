import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private userService: UserService, private router: Router) { }

  login() {
    this.userService.login(this.email, this.password).subscribe({
      next: (response) => {
        // Store session data if needed
        localStorage.setItem('user', JSON.stringify(response)); // Example of storing user data
        this.router.navigate(['/home']); // Redirect to home page after login
      },
      error: (error) => {
        this.errorMessage = 'Invalid credentials, please try again.';
      }
    });
  }
}
