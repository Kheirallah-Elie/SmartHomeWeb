import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Device } from './device.service'
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private apiUrl = 'https://web-app-t5-dev-aca2dahff0bkb5g9.westeurope-01.azurewebsites.net/api/User';

  constructor(private http: HttpClient) { }

  addHome(userId: string, home: Home): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/homes`, home);
  }

  deleteHome(userId: string, homeId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/homes/${homeId}`);
  }

  getHomesByUserId(userId: string): Observable<Home[]> {
    return this.http.get<Home[]>(`${this.apiUrl}/${userId}/homes`);
  }
}
