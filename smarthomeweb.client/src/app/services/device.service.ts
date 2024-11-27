import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Device {
  deviceId: string;
  description: string;
  state: boolean;
}


@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private apiUrl = 'https://localhost:7156/api/User';

  constructor(private http: HttpClient) { }

  addDevice(userId: string, homeId: string, roomId: string, device: Device): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/homes/${homeId}/rooms/${roomId}/devices`, device);
  }

  toggleDeviceState(userId: string, homeId: string, roomId: string, deviceId: string): Observable<any> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/toggle`, {});
  }
}
