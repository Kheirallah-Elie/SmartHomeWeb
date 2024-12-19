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
  private apiUrl = 'https://web-app-t5-dev-aca2dahff0bkb5g9.westeurope-01.azurewebsites.net/api/User';
  
  constructor(private http: HttpClient) { }

  addDevice(userId: string, homeId: string, roomId: string, device: Device): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/homes/${homeId}/rooms/${roomId}/devices`, device);
  }

  toggleDeviceState(userId: string, homeId: string, roomId: string, deviceId: string): Observable<any> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/toggle`, {});
  }

  getDeviceState(userId: string, homeId: string, roomId: string, deviceId: string): Observable<{ state: boolean }> {
    const url = `api/User/${userId}/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/state`;
    return this.http.get<{ state: boolean }>(url);
  }

    // Update the state of a specific device in the database
  updateDeviceState(userId: string, homeId: string, roomId: string, deviceId: string, deviceState: boolean): void {
    const payload = {
      userId,
      homeId,
      roomId,
      deviceId,
      deviceState
    };
    
    // Assuming there's an API endpoint to update the device state
    this.http.put(`${this.apiUrl}/${userId}/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/state`, payload.deviceState)
      .subscribe(
        response => {
          console.log('Device state updated in the database:', response);
        },
        error => {
          console.error('Error updating device state:', error);
        }
      );

  }

updateDevicesInBatch(payload: {
  userId: string,
  homeId: string,
  rooms: {
    roomId: string,
    devices: {
      deviceId: string,
      state: boolean,
      description?: string
    }[]
  }[]
}): Observable<any> {
  return this.http.put(`${this.apiUrl}/${payload.userId}/homes/${payload.homeId}/rooms/devices/batch`, payload);
}

}
