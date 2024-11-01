import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/user-list.component';

const routes: Routes = [
  { path: 'users', component: UserListComponent }, // Define route for UserListComponent
  { path: '', redirectTo: '/users', pathMatch: 'full' } // Redirect to /users by default
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
