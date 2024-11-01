import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html', // Link the HTML file here
  styleUrls: ['./user-list.component.css'] // (optional) link a CSS file for styling
})
export class UserListComponent implements OnInit {
  users: any[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getUsers().subscribe(users => this.users = users);
  }

  toggleDeviceState(userId: string, homeId: string, roomId: string, deviceId: string): void {
    this.userService.toggleDeviceState(userId, homeId, roomId, deviceId).subscribe(() => {
      this.ngOnInit(); // Refresh the state
    });
  }
}
