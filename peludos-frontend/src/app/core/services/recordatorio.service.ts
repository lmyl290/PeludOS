import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';

@Injectable({ providedIn: 'root' })
export class RecordatorioService {
  private http = inject(HttpClient);
  private baseUrl = API_CONFIG.baseUrl;

  getRecordatorios(idMascota: number) {
    return this.http.get<any[]>(this.baseUrl + '/recordatorios?id_mascota=' + idMascota);
  }

  crearRecordatorio(data: any) {
    return this.http.post<any>(this.baseUrl + '/recordatorios', data);
  }

  marcarNotificado(idRecordatorio: number, notificado: boolean) {
    return this.http.patch<any>(this.baseUrl + '/recordatorios/' + idRecordatorio, {
      notificado: notificado
    });
  }

  desactivarRecordatorio(idRecordatorio: number) {
    return this.http.delete(this.baseUrl + '/recordatorios/' + idRecordatorio);
  }
}
