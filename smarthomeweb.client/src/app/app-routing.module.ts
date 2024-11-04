import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/user-list.component';
import { LoginComponent } from './login/login.component'; // Import the LoginComponent
import { RegisterComponent } from './register/register.component'; // Import the RegisterComponent

const routes: Routes = [
  { path: 'users', component: UserListComponent }, // Define route for UserListComponent
  { path: 'login', component: LoginComponent }, // New route for LoginComponent
  { path: 'register', component: RegisterComponent }, // New route for RegisterComponent
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirect to login by default
  //{ path: '', redirectTo: '/users', pathMatch: 'full' } // Redirect to /users by default
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
