import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { AppRoutingModule } from './app-routing.module';
import { UserListComponent } from './components/user-list.component';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@NgModule({
  declarations: [
    AppComponent, // Ajout de AppComponent dans les déclarations
    UserListComponent, LoginComponent, RegisterComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule, // Add FormsModule to the imports array
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent] // Utilisation de AppComponent dans le bootstrap
})
export class AppModule { }
