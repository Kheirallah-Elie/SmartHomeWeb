import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { AppRoutingModule } from './app-routing.module';
import { LandingPageComponent } from './components/LandingPage/landing-page.component';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/Login/login.component';
import { RegisterComponent } from './components/Register/register.component';

import { HeaderPageComponent } from './components/header-page.component';

import { AddHomeComponent } from './components/LandingPage/AddHome/add-home.component';
import { AddRoomComponent } from './components/LandingPage/AddRoom/add-room.component';
import { AddDeviceComponent } from './components/LandingPage/AddDevice/add-device.component';

@NgModule({
  declarations: [
    AppComponent, // Ajout de AppComponent dans les déclarations
    LandingPageComponent,
    LoginComponent,
    RegisterComponent,
    AddHomeComponent,
    AddRoomComponent,
    AddDeviceComponent,
    HeaderPageComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule, // Add FormsModule to the imports array
    AppRoutingModule
  ],
  exports: [
    HeaderPageComponent // Export to make it reusable across modules
  ],

  providers: [],
  bootstrap: [AppComponent] // Utilisation de AppComponent dans le bootstrap
})
export class AppModule { }
