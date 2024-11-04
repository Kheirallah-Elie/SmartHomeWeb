import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    return this.http.post(`${this.apiUrl}/${userId}/homes`, home);
  }

  toggleDeviceState(userId: string, homeId: string, roomId: string, deviceId: string): Observable<any> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/toggle`, {});
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  isAuthenticated(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/isAuthenticated`);
  }
}

export interface User {
  userId: string;
  name: string;
  email: string;
  password: string;
  //homes: Home[];
}
