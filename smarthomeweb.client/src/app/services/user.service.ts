import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';


// Add at the top of your UserService file
export interface Home {
  homeId: string;
  nickname: string;
  address: string;
  rooms: Room[];
}

export interface Room {
  roomId: string;
  name: string;
  devices: Device[];
}

export interface Device {
  deviceId: string;
  description: string;
  state: boolean;
}


@Injectable({
  providedIn: 'root'
})


export class UserService {
  private apiUrl = 'https://localhost:7156/api/User';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  addHome(userId: string, home: any): Observable<any> {
    console.log("Home envoyé :", home);
    return this.http.post(`${this.apiUrl}/${userId}/homes`, home);
  }

  // Méthode pour ajouter une pièce
  addRoom(userId: string, homeId: string, room: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/homes/${homeId}/rooms`, room);
  }

  // Méthode pour ajouter un appareil
  addDevice(userId: string, homeId: string, roomId: string, device: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/homes/${homeId}/rooms/${roomId}/devices`, device);
  }

  toggleDeviceState(userId: string, homeId: string, roomId: string, deviceId: string): Observable<any> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/toggle`, {});
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        // Stocke l'ID utilisateur dans localStorage après une connexion réussie
        localStorage.setItem('userId', response.userId);
      })
    );
  }

  logout(): Observable<any> {
    // Supprime l'ID utilisateur de localStorage à la déconnexion
    localStorage.removeItem('userId');
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  isAuthenticated(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/isAuthenticated`);
  }

  // Méthode pour récupérer l'ID utilisateur stocké dans localStorage
  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  // Method to fetch homes for a specific user
  getHomesByUserId(userId: string): Observable<Home[]> {
    return this.http.get<Home[]>(`${this.apiUrl}/${userId}/homes`);
  }

  // Method to fetch rooms for a specific home of a user
  getRoomsByHomeId(userId: string, homeId: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/${userId}/homes/${homeId}/rooms`);
  }
}

export interface User {
  userId: string;
  name: string;
  email: string;
  password: string;
  //homes: Home[];
}
