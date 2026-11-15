import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#FFFBF5] text-slate-800">
      
      <!-- Barra de navegación superior acorde al diseño -->
      <nav class="bg-white border-b border-orange-100 px-8 py-4 flex justify-between items-center shadow-xs">
        <div class="flex items-center gap-3">
          <!-- Icono SVG de Huella unificado -->
          <svg class="w-10 h-10 text-purple-600" viewBox="0 0 64 64" fill="currentColor">
            <circle cx="14" cy="24" r="5.5"/>
            <circle cx="25" cy="14" r="6"/>
            <circle cx="39" cy="14" r="6"/>
            <circle cx="50" cy="24" r="5.5"/>
            <path d="M32 25c-9.5 0-17 7.5-17 16.5 0 5.5 4 9.5 9.5 9.5 2.5 0 5-1 7.5-1s5 1 7.5 1c5.5 0 9.5-4 9.5-9.5C49 32.5 41.5 25 32 25zm-1 18h-6v-6h6v6zm0-8h-6v-6h6v6zm8 8h-6v-6h6v6zm0-8h-6v-6h6v6z"/>
          </svg>
          <span class="text-2xl font-extrabold text-purple-600 tracking-tight">PeludOS</span>
        </div>
        
        <button 
          (click)="logout()" 
          class="bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer text-sm">
          Cerrar sesión
        </button>
      </nav>

      <!-- Contenido Principal -->
      <main class="p-8 lg:p-12 max-w-7xl mx-auto">
        <div class="mb-8">
          <h2 class="text-3xl font-extrabold text-slate-800">Bienvenido a PeludOS 🐾</h2>
          <p class="text-slate-600 mt-1 text-lg">Panel principal listo para administrar mascotas, citas e historial médico.</p>
        </div>

        <!-- Tarjetas de módulos modernos -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 font-bold text-xl">🐶</div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Mascotas</h3>
            <p class="text-slate-500 text-sm">Gestiona los perfiles, razas y cuidados de cada uno de tus peludos.</p>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 font-bold text-xl">📅</div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Citas</h3>
            <p class="text-slate-500 text-sm">Programa y lleva el control de las visitas veterinarias y peluquería.</p>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 font-bold text-xl">📋</div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Historial Médico</h3>
            <p class="text-slate-500 text-sm">Consulta vacunas, tratamientos y recomendaciones médicas anteriores.</p>
          </div>
        </div>
      </main>

    </div>
  `
})
export class DashboardComponent {
  private auth = inject(AuthService);
  logout() { 
    this.auth.logout(); 
  }
}