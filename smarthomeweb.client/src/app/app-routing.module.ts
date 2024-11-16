import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/user-list.component';
import { LoginComponent } from './login/login.component'; // Import the LoginComponent
import { RegisterComponent } from './register/register.component'; // Import the RegisterComponent
import { AddDataComponent } from './components/add-data.component';

const routes: Routes = [
  { path: 'users', component: UserListComponent }, // Define route for UserListComponent
  { path: 'login', component: LoginComponent }, // New route for LoginComponent
  { path: 'register', component: RegisterComponent }, // New route for RegisterComponent
  { path: '', redirectTo: '/', pathMatch: 'full' }, // Redirect to users for now, change to login for later, unless user is already connected
  //{ path: '', redirectTo: '/users', pathMatch: 'full' } // Redirect to /users by default
  { path: 'add', component: AddDataComponent },//pour ajouter des données à l'user
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
