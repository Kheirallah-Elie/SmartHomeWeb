import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './components/LandingPage/landing-page.component';
import { LoginComponent } from './components/Login/login.component'; // Import the LoginComponent
import { RegisterComponent } from './components/Register/register.component'; // Import the RegisterComponent
import { AddHomeComponent } from './components/LandingPage/AddHome/add-home.component';
import { AddRoomComponent } from './components/LandingPage/AddRoom/add-room.component';
import { AddDeviceComponent } from './components/LandingPage/AddDevice/add-device.component';


const routes: Routes = [
  { path: 'users', component: LandingPageComponent }, // Define route for UserListComponent
  { path: 'login', component: LoginComponent }, // New route for LoginComponent
  { path: 'register', component: RegisterComponent }, // New route for RegisterComponent
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirect to users for now, change to login for later, unless user is already connected
  { path: 'add-home', component: AddHomeComponent },
  { path: 'add-room', component: AddRoomComponent },
  { path: 'add-device', component: AddDeviceComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
