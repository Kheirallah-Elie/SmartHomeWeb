import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'header-tab',
  templateUrl: './header-page.component.html',
  styleUrls: ['./LandingPage/landing-page.component.css']
})
export class HeaderPageComponent implements OnInit {
  user: any = null;
  userName: string = ''; // Extracted username
  showProfileModal: boolean = false;
  selectedUser: any = null; // For selected user modal
  totalRooms: number = 0;
  showDropdown: boolean = false; // For dropdown visibility


  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.loadUser();
      const userId = this.userService.getUserId();
      if (userId) {
        this.userService.getUserById(userId).subscribe(user => {
          this.userName = user.email.split('@')[0]; // Extract username from email
        });
      }
  }

  toggleDropdown(state: boolean): void {
    this.showDropdown = state;
  }

  openModal(user: any): void {
    this.showProfileModal = true;
    this.selectedUser = user;
  }

  closeModal(): void {
    this.showProfileModal = false;
  }

  private loadUser(): void {
    const userId = this.userService.getUserId();

    if (userId) {
      this.userService.getUserById(userId).subscribe(
        user => {
          this.selectedUser = user;
          this.userName = this.extractUsername(this.selectedUser.email); // Extract name from email
          this.totalRooms = this.selectedUser.homes.reduce((acc: number, home: any) => acc + home.rooms.length, 0); // Calculate total rooms
        },
        error => {
          console.error('Error loading user:', error);
        }
      );
    } else {
      console.warn('No user ID found');
    }
  }

  private extractUsername(email: string): string {
    const match = email.match(/^([^@]+)/);
    return match ? match[1] : '';
  }

  toggleProfileModal(): void {
    this.showProfileModal = !this.showProfileModal;
  }

  logout(): void {
    this.userService.logout().subscribe(
      () => {
        console.log('Logout successful');
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Logout failed:', error);
      }
    );
  }
}
