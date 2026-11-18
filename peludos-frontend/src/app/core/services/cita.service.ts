import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private http = inject(HttpClient);
  private baseUrl = API_CONFIG.baseUrl;

  getCitas() {
    return this.http.get<any[]>(`${this.baseUrl}/citas`);
  }

  crearCita(data: any) {
    return this.http.post<any>(`${this.baseUrl}/citas`, data);
  }

  cancelarCita(idCita: number) {
    return this.http.patch<any>(`${this.baseUrl}/citas/${idCita}`, { estado: 'cancelada' });
  }

  getVeterinarias() {
    return this.http.get<any[]>(`${this.baseUrl}/veterinarias`);
  }

  getProfesionales() {
    return this.http.get<any[]>(`${this.baseUrl}/profesionales`);
  }
}
