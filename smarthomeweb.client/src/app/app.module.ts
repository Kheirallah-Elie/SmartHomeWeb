import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { UserListComponent } from './components/user-list.component';
import { AppComponent } from './app.component'; // Ajout de l'import d'AppComponent

@NgModule({
  declarations: [
    AppComponent, // Ajout de AppComponent dans les déclarations
    UserListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent] // Utilisation de AppComponent dans le bootstrap
})
export class AppModule { }
