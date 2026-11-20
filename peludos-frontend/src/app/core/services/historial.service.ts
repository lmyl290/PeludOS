import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private http = inject(HttpClient);
  private baseUrl = API_CONFIG.baseUrl;

  getVacunas(idMascota: number) {
    return this.http.get<any[]>(this.baseUrl + '/vacunas?id_mascota=' + idMascota);
  }

  crearVacuna(data: any) {
    return this.http.post<any>(this.baseUrl + '/vacunas', data);
  }

  eliminarVacuna(idVacuna: number) {
    return this.http.delete(this.baseUrl + '/vacunas/' + idVacuna);
  }


  getMedicamentos(idMascota: number) {
    return this.http.get<any[]>(this.baseUrl + '/medicamentos?id_mascota=' + idMascota);
  }

  crearMedicamento(data: any) {
    return this.http.post<any>(this.baseUrl + '/medicamentos', data);
  }

  desactivarMedicamento(idMedicamento: number) {
    return this.http.delete(this.baseUrl + '/medicamentos/' + idMedicamento);
  }
}