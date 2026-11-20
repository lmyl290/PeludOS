import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CitaService } from '../../core/services/cita.service';

@Component({
  selector: 'app-veterinarias',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-[#FAF8FF] text-slate-950">
      <nav class="bg-[#EDE9FE]/80 backdrop-blur-xs border-b border-[#DDD6FE] px-8 py-4 flex justify-between items-center">
        <a routerLink="/dashboard" class="text-[#9C27B0] font-bold hover:underline flex items-center gap-2 text-sm">
          ← Volver al Panel
        </a>
        <span class="text-xl font-extrabold text-slate-950">Directorio de <span class="text-[#9C27B0]">Veterinarias</span> 📍</span>
      </nav>

      <main class="p-8 lg:p-12 max-w-7xl mx-auto">
        <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h2 class="text-3xl font-extrabold text-slate-950">Clínicas <span class="text-[#9C27B0]">Veterinarias</span></h2>
            <p class="text-slate-700 text-sm mt-1 font-medium">Explora centros veterinarios disponibles, horarios y especialistas.</p>
          </div>

          <div class="w-full md:w-80">
            <input type="text" [ngModel]="busqueda()" (ngModelChange)="busqueda.set($event)"
              placeholder="Buscar por nombre o dirección..."
              class="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4B5FD] focus:outline-none focus:border-[#9C27B0] text-sm shadow-2xs">
          </div>
        </div>

        <div *ngIf="cargando()" class="text-slate-600 text-sm">Cargando veterinarias...</div>

        <div *ngIf="error()" class="bg-pink-50 border border-pink-200 text-pink-800 p-4 rounded-xl mb-6 text-sm">
          {{ error() }}
        </div>

        <div *ngIf="!cargando() && !error() && veterinariasFiltradas().length === 0"
          class="bg-white p-10 rounded-2xl border border-[#DDD6FE] text-center">
          <p class="text-slate-800 font-semibold mb-2">No se encontraron veterinarias disponibles.</p>
          <p class="text-slate-500 text-sm">Intenta con otro término de búsqueda o registra una desde la API.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let v of veterinariasFiltradas()"
            class="bg-white p-6 rounded-2xl shadow-xs border border-[#DDD6FE] hover:border-[#9C27B0] transition flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start gap-2 mb-3">
                <div class="w-11 h-11 bg-[#F3E8FF] rounded-xl flex items-center justify-center text-[#9C27B0] text-xl font-bold shrink-0">
                  🏥
                </div>
                <span class="bg-[#FAE8FF] text-[#9C27B0] border border-[#F0ABFC] text-xs font-extrabold px-2.5 py-1 rounded-lg">
                  ⭐ {{ v.calificacion_promedio || '5.0' }}
                </span>
              </div>

              <h3 class="text-xl font-extrabold text-slate-950 mb-2">{{ v.nombre_comercial }}</h3>

              <div class="space-y-1.5 text-xs text-slate-700 border-t border-[#EDE9FE] pt-3">
                <p><strong>📍 Dirección:</strong> {{ v.direccion }}</p>
                <p><strong>📞 Teléfono:</strong> {{ v.telefono }}</p>
                <p *ngIf="v.correo_electronico"><strong>✉️ Correo:</strong> {{ v.correo_electronico }}</p>
                <p *ngIf="v.horario_atencion" class="text-[#7E22CE] font-semibold">
                  <strong>🕒 Horario:</strong> {{ v.horario_atencion }}
                </p>
              </div>

              <!-- Profesionales asociados a esta veterinaria -->
              <div class="mt-4 pt-3 border-t border-[#EDE9FE]" *ngIf="profesionalesDe(v.id_veterinaria).length > 0">
                <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">Especialistas</p>
                <div class="flex flex-wrap gap-1.5">
                  <span *ngFor="let p of profesionalesDe(v.id_veterinaria)"
                     class="bg-[#FAF8FF] border border-[#DDD6FE] text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg">
                     🩺 {{ p.nombre_completo }} — {{ p.especialidad }}
                  </span>

                </div>
              </div>
            </div>

            <div class="mt-5 pt-3 border-t border-[#EDE9FE] flex justify-end">
              <a routerLink="/citas"
                class="bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-bold px-4 py-2 rounded-xl transition">
                Agendar Cita →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class VeterinariasComponent implements OnInit {
  private citaService = inject(CitaService);

  veterinarias = signal<any[]>([]);
  profesionales = signal<any[]>([]);
  busqueda = signal<string>('');
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);

  veterinariasFiltradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.veterinarias();
    return this.veterinarias().filter(v =>
      (v.nombre_comercial && v.nombre_comercial.toLowerCase().includes(q)) ||
      (v.direccion && v.direccion.toLowerCase().includes(q))
    );
  });

  ngOnInit() {
    forkJoin({
      veterinarias: this.citaService.getVeterinarias(),
      profesionales: this.citaService.getProfesionales()
    }).subscribe({
      next: (res) => {
        this.veterinarias.set(res.veterinarias);
        this.profesionales.set(res.profesionales);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar las veterinarias.');
        this.cargando.set(false);
      }
    });
  }

  profesionalesDe(idVeterinaria: number) {
    return this.profesionales().filter(p => p.id_veterinaria === idVeterinaria);
  }
}
