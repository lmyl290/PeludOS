import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_CONFIG } from '../api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenKey = 'peludos_token';

  login(credentials: { email: string; password: string }) {
    const body = new HttpParams()
      .set('username', credentials.email)
      .set('password', credentials.password);

    return this.http.post<{ access_token: string }>(
      `${API_CONFIG.baseUrl}/auth/login`,
      body.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    ).pipe(
      tap((res: any) => localStorage.setItem(this.tokenKey, res.access_token))
    );
  }

  register(data: any) {
    return this.http.post(`${API_CONFIG.baseUrl}/auth/register`, data);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  loginWithGoogle() {
    window.location.href = `${API_CONFIG.baseUrl}/auth/google`;
  }


}