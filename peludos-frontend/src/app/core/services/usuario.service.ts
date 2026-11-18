import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_CONFIG } from '../api.config';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private url = API_CONFIG.baseUrl + '/usuarios/me';

  usuario = signal<any>(null);

  getPerfil() {
    return this.http.get<any>(this.url).pipe(
      tap((res) => this.usuario.set(res))
    );
  }

  actualizarPerfil(data: { nombre_completo?: string; telefono?: string | null; direccion?: string | null }) {
    return this.http.patch<any>(this.url, data).pipe(
      tap((res) => this.usuario.set(res))
    );
  }

  desactivarCuenta() {
    return this.http.delete<any>(this.url);
  }
}
