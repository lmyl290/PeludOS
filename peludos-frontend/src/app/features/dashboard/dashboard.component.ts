import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TiendaService } from '../../core/services/tienda.service';
import { UsuarioService } from '../../core/services/usuario.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-[#FAF8FF] text-slate-950 flex">
      
      <!-- PANEL LATERAL IZQUIERDO -->
      <aside class="w-64 bg-[#DDD6FE] text-slate-950 flex flex-col justify-between shrink-0 min-h-screen p-5 border-r border-[#C4B5FD]">
        <div>
          <!-- Logo PeludOS -->
          <div class="flex items-center gap-3 px-2 mb-8">
            <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-[#C4B5FD] shadow-xs">
              <svg class="w-7 h-7 text-[#9C27B0]" viewBox="0 0 64 64" fill="currentColor">
                <circle cx="14" cy="24" r="5.5"/>
                <circle cx="25" cy="14" r="6"/>
                <circle cx="39" cy="14" r="6"/>
                <circle cx="50" cy="24" r="5.5"/>
                <path d="M32 25c-9.5 0-17 7.5-17 16.5 0 5.5 4 9.5 9.5 9.5 2.5 0 5-1 7.5-1s5 1 7.5 1c5.5 0 9.5-4 9.5-9.5C49 32.5 41.5 25 32 25zm-1 18h-6v-6h6v6zm0-8h-6v-6h6v6zm8 8h-6v-6h6v6zm0-8h-6v-6h6v6z"/>
              </svg>
            </div>
            <span class="text-2xl font-extrabold tracking-tight text-slate-950">Pelud<span class="text-[#9C27B0]">OS</span></span>
          </div>

          <!-- Navegación Lateral -->
          <nav class="space-y-1.5">
            <a routerLink="/dashboard" routerLinkActive="bg-[#9C27B0] text-white font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-950 hover:bg-white/60 transition">
              <span>🏠</span>
              <span>Inicio</span>
            </a>

            <a routerLink="/veterinarias" routerLinkActive="bg-[#9C27B0] text-white font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-950 hover:bg-white/60 transition">
              <span>📍</span>
              <span>Veterinarias</span>
            </a>

            <a routerLink="/tienda" routerLinkActive="bg-[#9C27B0] text-white font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-950 hover:bg-white/60 transition">
              <span>🏪</span>
              <span>Tienda</span>
            </a>

            <div class="pt-5 pb-1 px-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
              Mis Peludos
            </div>

            <a routerLink="/mascotas" routerLinkActive="bg-[#9C27B0] text-white font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-950 hover:bg-white/60 transition">
              <span>🐾</span>
              <span>Mascotas</span>
            </a>

            <a routerLink="/citas" routerLinkActive="bg-[#9C27B0] text-white font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-950 hover:bg-white/60 transition">
              <span>📅</span>
              <span>Citas</span>
            </a>

            <a routerLink="/historial" routerLinkActive="bg-[#9C27B0] text-white font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-950 hover:bg-white/60 transition">
              <span>📋</span>
              <span>Historial Médico</span>
            </a>

            <a routerLink="/recordatorios" routerLinkActive="bg-[#9C27B0] text-white font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-950 hover:bg-white/60 transition">
              <span>⏰</span>
              <span>Recordatorios</span>
            </a>
          </nav>
        </div>

        <div class="pt-4 border-t border-[#C4B5FD]">
          <button (click)="logout()"
            class="w-full flex items-center justify-center gap-2 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-bold py-2.5 px-4 rounded-xl transition shadow-sm text-sm cursor-pointer">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <!-- CONTENIDO DERECHO -->
      <div class="flex-1 flex flex-col">
        
        <!-- Barra superior -->
        <header class="bg-[#EDE9FE]/80 backdrop-blur-xs border-b border-[#DDD6FE] px-8 py-4 flex justify-between items-center">
          <div class="flex items-center gap-2.5">
            <span class="bg-[#9C27B0] text-white text-xs font-bold px-3 py-1 rounded-lg shadow-2xs">Panel Activo</span>
            <span class="text-xs font-semibold text-slate-800">Gestión integral de mascotas</span>
          </div>

          <div class="flex items-center gap-3">
            <!-- Botón Carrito -->
            <button routerLink="/carrito"
              class="relative flex items-center gap-2 bg-white hover:bg-[#F3E8FF] border border-[#C4B5FD] text-slate-950 px-4 py-1.5 rounded-full text-sm font-bold shadow-2xs transition cursor-pointer">
              <span>🛒</span>
              <span>Carrito</span>
              <span class="bg-[#9C27B0] text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                {{ tiendaService.totalItems() }}
              </span>
            </button>

            <!-- Botón Mi Cuenta -->
            <button routerLink="/perfil"
              class="flex items-center gap-2.5 bg-white hover:bg-[#F3E8FF] border border-[#C4B5FD] text-slate-950 px-4 py-1.5 rounded-full text-sm font-bold shadow-2xs transition cursor-pointer">
              <span class="w-6 h-6 rounded-full bg-[#9C27B0] text-white flex items-center justify-center text-xs">🐾</span>
              <span>{{ usuarioService.usuario()?.nombre_completo || 'Mi Cuenta' }}</span>
            </button>
          </div>
        </header>

        <!-- Área Principal -->
        <main class="p-8 lg:p-10 max-w-6xl w-full mx-auto">
          <div class="mb-8">
            <h2 class="text-3xl font-extrabold text-slate-950">
              Bienvenido a <span class="text-[#9C27B0]">PeludOS</span> 🐾
            </h2>
            <p class="text-slate-800 mt-1 text-base font-medium">
              Panel principal listo para administrar mascotas, citas, historial médico y recordatorios.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Tarjeta Mascotas -->
            <div routerLink="/mascotas" class="group cursor-pointer bg-white p-6 rounded-2xl shadow-xs border border-[#DDD6FE] hover:border-[#9C27B0] hover:shadow-md transition">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 bg-[#F3E8FF] group-hover:bg-[#9C27B0] group-hover:text-white rounded-xl flex items-center justify-center text-[#9C27B0] font-bold text-xl transition">🐶</div>
                <span class="text-xs font-bold text-[#9C27B0] bg-[#FAE8FF] border border-[#F0ABFC] px-2.5 py-1 rounded-lg">Perfiles</span>
              </div>
              <h3 class="text-xl font-extrabold text-slate-950 mb-2 group-hover:text-[#9C27B0] transition">Mascotas</h3>
              <p class="text-slate-700 text-sm">Gestiona los perfiles, razas y cuidados de cada uno de tus peludos.</p>
            </div>

            <!-- Tarjeta Citas -->
            <div routerLink="/citas" class="group cursor-pointer bg-white p-6 rounded-2xl shadow-xs border border-[#DDD6FE] hover:border-[#9C27B0] hover:shadow-md transition">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 bg-[#F3E8FF] group-hover:bg-[#9C27B0] group-hover:text-white rounded-xl flex items-center justify-center text-[#9C27B0] font-bold text-xl transition">📅</div>
                <span class="text-xs font-bold text-[#7E22CE] bg-[#F3E8FF] border border-[#DDD6FE] px-2.5 py-1 rounded-lg">Agenda</span>
              </div>
              <h3 class="text-xl font-extrabold text-slate-950 mb-2 group-hover:text-[#9C27B0] transition">Citas</h3>
              <p class="text-slate-700 text-sm">Programa y lleva el control de las visitas veterinarias y peluquería.</p>
            </div>

            <!-- Tarjeta Historial Médico -->
            <div routerLink="/historial" class="group cursor-pointer bg-white p-6 rounded-2xl shadow-xs border border-[#DDD6FE] hover:border-[#9C27B0] hover:shadow-md transition">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 bg-[#F3E8FF] group-hover:bg-[#9C27B0] group-hover:text-white rounded-xl flex items-center justify-center text-[#9C27B0] font-bold text-xl transition">📋</div>
                <span class="text-xs font-bold text-[#9C27B0] bg-[#FAE8FF] border border-[#F0ABFC] px-2.5 py-1 rounded-lg">Clínico</span>
              </div>
              <h3 class="text-xl font-extrabold text-slate-950 mb-2 group-hover:text-[#9C27B0] transition">Historial Médico</h3>
              <p class="text-slate-700 text-sm">Consulta vacunas, tratamientos y recomendaciones médicas anteriores.</p>
            </div>

                        <!-- Tarjeta Recordatorios -->
            <div routerLink="/recordatorios" class="group cursor-pointer bg-white p-6 rounded-2xl shadow-xs border border-[#DDD6FE] hover:border-[#9C27B0] hover:shadow-md transition">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 bg-[#F3E8FF] group-hover:bg-[#9C27B0] group-hover:text-white rounded-xl flex items-center justify-center text-[#9C27B0] font-bold text-xl transition">⏰</div>
                <span class="text-xs font-bold text-[#7E22CE] bg-[#F3E8FF] border border-[#DDD6FE] px-2.5 py-1 rounded-lg">Alertas</span>
              </div>
              <h3 class="text-xl font-extrabold text-slate-950 mb-2 group-hover:text-[#9C27B0] transition">Recordatorios</h3>
              <p class="text-slate-700 text-sm">Crea alertas para vacunas, dosis de medicamentos y próximas citas.</p>
            </div>

Alertas

Recordatorios
Crea alertas para vacunas, dosis de medicamentos y próximas citas.
`
})
export class DashboardComponent implements OnInit {
private auth = inject(AuthService);
tiendaService = inject(TiendaService);
usuarioService = inject(UsuarioService);
ngOnInit() {
this.tiendaService.cargarCarrito().subscribe();
this.usuarioService.getPerfil().subscribe();
}
logout() {
this.auth.logout();
}
}