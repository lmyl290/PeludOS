import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex bg-[#FAF8FF]">
      
      <!-- Mitad Izquierda: Fotografía y Eslogan (Oculto en celulares) -->
      <div class="hidden lg:flex lg:w-1/2 relative bg-slate-950">
        <img 
          src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80" 
          alt="Cachorro Beagle" 
          class="w-full h-full object-cover"
        />
        <!-- Degradado oscuro inferior para que el texto blanco resalte -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-12">
          <h2 class="text-white text-4xl font-extrabold leading-tight drop-shadow-md">
            Todo el cuidado de tu mascota en un solo lugar
          </h2>
        </div>
      </div>

      <!-- Mitad Derecha: Formulario de Inicio de Sesión -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div class="w-full max-w-md space-y-7">
          
          <!-- Logotipo PeludOS -->
          <div class="text-center">
            <div class="flex items-center justify-center gap-3 mb-2">
              <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-[#DDD6FE] shadow-xs">
                <svg class="w-10 h-10 text-[#9C27B0]" viewBox="0 0 64 64" fill="currentColor">
                  <circle cx="14" cy="24" r="5.5"/>
                  <circle cx="25" cy="14" r="6"/>
                  <circle cx="39" cy="14" r="6"/>
                  <circle cx="50" cy="24" r="5.5"/>
                  <path d="M32 25c-9.5 0-17 7.5-17 16.5 0 5.5 4 9.5 9.5 9.5 2.5 0 5-1 7.5-1s5 1 7.5 1c5.5 0 9.5-4 9.5-9.5C49 32.5 41.5 25 32 25zm-1 18h-6v-6h6v6zm0-8h-6v-6h6v6zm8 8h-6v-6h6v6zm0-8h-6v-6h6v6z"/>
                </svg>
              </div>
              <span class="text-4xl font-extrabold text-slate-950 tracking-tight">Pelud<span class="text-[#9C27B0]">OS</span></span>
            </div>
            <p class="text-slate-700 text-lg font-medium">Ingresa a tu cuenta para cuidar a tu mascota</p>
          </div>

          <!-- Formulario -->
          <form (ngSubmit)="onSubmit()" class="space-y-5">
            
            <!-- Campo Correo Electrónico -->
            <div>
              <label class="block text-sm font-bold text-slate-900 mb-1.5">Correo electrónico</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </span>
                <input 
                  type="email" 
                  [(ngModel)]="email" 
                  name="email" 
                  required 
                  class="w-full pl-11 pr-4 py-2.5 bg-white border border-[#DDD6FE] rounded-xl text-slate-900 focus:ring-2 focus:ring-[#9C27B0]/20 focus:border-[#9C27B0] outline-none transition" 
                  placeholder="Correo electrónico"
                />
              </div>
            </div>

            <!-- Campo Contraseña -->
            <div>
              <label class="block text-sm font-bold text-slate-900 mb-1.5">Contraseña</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  [(ngModel)]="password" 
                  name="password" 
                  required 
                  class="w-full pl-11 pr-11 py-2.5 bg-white border border-[#DDD6FE] rounded-xl text-slate-900 focus:ring-2 focus:ring-[#9C27B0]/20 focus:border-[#9C27B0] outline-none transition" 
                  placeholder="Contraseña"
                />
                <!-- Botón Ojito para mostrar/ocultar contraseña -->
                <button 
                  type="button" 
                  (click)="showPassword = !showPassword" 
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <svg *ngIf="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                  <svg *ngIf="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Recordarme y Olvidaste contraseña -->
            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
                <input type="checkbox" class="rounded border-[#C4B5FD] text-[#9C27B0] focus:ring-[#9C27B0]"/>
                <span>Recordarme</span>
              </label>
              <a routerLink="/forgot-password" class="text-[#9C27B0] hover:underline font-bold">¿Olvidaste tu contraseña?</a>
            </div>

            <!-- Mensaje de Error -->
            <p *ngIf="error" class="text-pink-800 text-sm text-center bg-pink-50 py-2 rounded-xl border border-pink-200">{{ error }}</p>

            <!-- Botón Principal -->
            <button 
              type="submit" 
              class="w-full bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-bold py-2.5 rounded-xl shadow-xs transition duration-200 cursor-pointer"
            >
              Iniciar Sesión
            </button>
          </form>

          <!-- Separador -->
          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-[#DDD6FE]"></div>
            <span class="flex-shrink mx-4 text-slate-500 text-xs font-medium">o continúa con</span>
            <div class="flex-grow border-t border-[#DDD6FE]"></div>
          </div>

          <!-- Botón Google -->
          <button 
            type="button" 
            (click)="loginWithGoogle()"
            class="w-full bg-white hover:bg-[#F3E8FF] text-slate-900 font-bold py-2.5 px-4 border border-[#DDD6FE] rounded-xl shadow-2xs flex items-center justify-center gap-3 transition cursor-pointer"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"/>
            </svg>
            <span>Continuar con Google</span>
          </button>

          <!-- Enlace de Registro -->
          <p class="text-center text-sm text-slate-700 font-medium">
            ¿No tienes cuenta? <a routerLink="/register" class="text-[#9C27B0] font-bold hover:underline">Regístrate aquí</a>
          </p>

        </div>
      </div>

    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  
  email = '';
  password = '';
  error = '';
  showPassword = false;

  onSubmit() {
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('¡Login exitoso! Respuesta del servidor:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Detalle exacto del error en el cliente:', err);
        this.error = 'Credenciales incorrectas o servidor no disponible.';
      }
    });
  }

  loginWithGoogle() {
    this.auth.loginWithGoogle();
  }
}
