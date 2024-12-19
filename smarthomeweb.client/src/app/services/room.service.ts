import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Device } from './device.service'
import { Observable } from 'rxjs';

export interface Room {
  roomId: string;
  name: string;
  devices: Device[];
}

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private apiUrl = 'https://web-app-t5-dev-aca2dahff0bkb5g9.westeurope-01.azurewebsites.net/api/User';

  constructor(private http: HttpClient) { }

  addRoom(userId: string, homeId: string, room: Room): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/homes/${homeId}/rooms`, room);
  }

  getRoomsByHomeId(userId: string, homeId: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/${userId}/homes/${homeId}/rooms`);
  }
}
