import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private userService: UserService, private router: Router) { }

  register() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = "Passwords don't match.";
      return;
    }

    this.userService.createUser({
        email: this.email, password: this.password,
        userId: '',
        name: ''
    }).subscribe({
      next: (response) => {
        this.successMessage = 'Registration successful! You can now log in.';
        setTimeout(() => this.router.navigate(['/login']), 2000); // Redirect to login after 2 seconds
      },
      error: (error) => {
        this.errorMessage = 'Registration failed, please try again.';
      }
    });
  }
}
