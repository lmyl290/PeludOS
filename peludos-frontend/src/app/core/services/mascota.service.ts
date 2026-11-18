import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';

@Injectable({ providedIn: 'root' })
export class MascotaService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/mascotas`;

  getMascotas() {
    return this.http.get<any[]>(this.url);
  }

  crearMascota(data: any) {
    return this.http.post<any>(this.url, data);
  }

  eliminarMascota(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
