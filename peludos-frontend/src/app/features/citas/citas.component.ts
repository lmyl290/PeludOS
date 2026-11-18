import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CitaService } from '../../core/services/cita.service';
import { MascotaService } from '../../core/services/mascota.service';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
    template: `
    <div class="min-h-screen bg-[#FAF8FF] text-slate-950">
      <nav class="bg-[#EDE9FE]/80 backdrop-blur-xs border-b border-[#DDD6FE] px-8 py-4 flex justify-between items-center">
        <a routerLink="/dashboard" class="text-[#9C27B0] font-bold hover:underline flex items-center gap-2 text-sm">
          ← Volver al Panel
        </a>
        <span class="text-xl font-extrabold text-slate-950">Mis <span class="text-[#9C27B0]">Citas</span> 📅</span>
      </nav>

      <main class="p-8 lg:p-12 max-w-7xl mx-auto">
        <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h2 class="text-3xl font-extrabold text-slate-950">Control de <span class="text-[#9C27B0]">Citas</span></h2>
            <p class="text-slate-700 text-sm mt-1 font-medium">Programa y revisa las visitas veterinarias de tus peludos.</p>
          </div>
          
          <button 
            (click)="mostrarFormulario.set(!mostrarFormulario())"
            class="bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer text-sm">
            {{ mostrarFormulario() ? 'Cancelar' : '+ Agendar Cita' }}
          </button>
        </div>

        <div *ngIf="mostrarFormulario()" class="bg-white p-6 rounded-2xl shadow-xs border border-[#C4B5FD] mb-8">
          <h3 class="text-lg font-extrabold text-slate-950 mb-4">Agendar Nueva Cita</h3>
          
          <form (ngSubmit)="guardarCita()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Mascota *</label>
              <select [(ngModel)]="nuevaCita.id_mascota" name="id_mascota" required
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm bg-white">
                <option [ngValue]="null" disabled>Selecciona una mascota...</option>
                <option *ngFor="let m of mascotas()" [ngValue]="m.id_mascota">
                  {{ m.nombre }} ({{ m.especie }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Fecha y Hora *</label>
              <input type="datetime-local" [(ngModel)]="nuevaCita.fecha_cita" name="fecha_cita" required
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Veterinaria *</label>
              <select [(ngModel)]="nuevaCita.id_veterinaria" (ngModelChange)="alCambiarVeterinaria()" name="id_veterinaria" required
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm bg-white">
                <option [ngValue]="null" disabled>Selecciona una veterinaria...</option>
                <option *ngFor="let v of veterinarias()" [ngValue]="v.id_veterinaria">
                  {{ v.nombre_comercial || 'Veterinaria #' + v.id_veterinaria }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Profesional *</label>
              <select [(ngModel)]="nuevaCita.id_profesional" name="id_profesional" required
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm bg-white">
                <option [ngValue]="null" disabled>Selecciona un profesional...</option>
                <option *ngFor="let p of profesionalesFiltrados()" [ngValue]="p.id_profesional">
                  {{ p.nombre || p.especialidad || 'Profesional #' + p.id_profesional }}
                </option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-800 mb-1">Motivo de la consulta</label>
              <input type="text" [(ngModel)]="nuevaCita.motivo" name="motivo" placeholder="Ej. Control general, vacunación, revisión..."
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
            </div>

            <div class="md:col-span-2 flex justify-end mt-2">
              <button type="submit" [disabled]="guardando() || !nuevaCita.id_mascota || !nuevaCita.id_veterinaria || !nuevaCita.id_profesional || !nuevaCita.fecha_cita"
                class="bg-[#9C27B0] hover:bg-[#7B1FA2] disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition cursor-pointer text-sm">
                {{ guardando() ? 'Agendando...' : 'Confirmar Cita' }}
              </button>
            </div>
          </form>
        </div>

        <div *ngIf="cargando()" class="text-slate-600 text-sm">Cargando citas...</div>

        <div *ngIf="error()" class="bg-pink-50 border border-pink-200 text-pink-800 p-4 rounded-xl mb-6 text-sm">
          {{ error() }}
        </div>

        <div *ngIf="!cargando() && !error() && citas().length === 0" class="bg-white p-10 rounded-2xl border border-[#DDD6FE] text-center">
          <p class="text-slate-800 font-semibold mb-2">No tienes citas programadas todavía.</p>
          <p class="text-slate-500 text-sm">Haz clic en "+ Agendar Cita" para programar una visita.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let c of citas()" class="bg-white p-6 rounded-2xl shadow-xs border border-[#DDD6FE] hover:border-[#9C27B0] transition flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border"
                  [ngClass]="{
                    'bg-emerald-50 text-emerald-700 border-emerald-200': c.estado === 'confirmada' || c.estado === 'completada',
                    'bg-[#FAE8FF] text-[#9C27B0] border-[#F0ABFC]': !c.estado || c.estado === 'pendiente' || c.estado === 'programada',
                    'bg-pink-50 text-pink-700 border-pink-200': c.estado === 'cancelada'
                  }">
                  {{ c.estado || 'Programada' }}
                </span>
                <span class="text-xs font-semibold text-slate-400">#{{ c.id_cita }}</span>
              </div>

              <h3 class="text-lg font-extrabold text-slate-950 mb-1">
                {{ nombreMascota(c.id_mascota) }}
              </h3>
              <p class="text-[#9C27B0] font-bold text-sm mb-3">
                📅 {{ c.fecha_cita | date:'dd/MM/yyyy HH:mm' }}
              </p>

              <div class="space-y-1.5 text-xs text-slate-700 border-t border-[#EDE9FE] pt-3">
                <p *ngIf="c.motivo"><strong>Motivo:</strong> {{ c.motivo }}</p>
                <p><strong>Veterinaria:</strong> {{ nombreVeterinaria(c.id_veterinaria) }}</p>
                <p><strong>Profesional:</strong> {{ nombreProfesional(c.id_profesional) }}</p>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-[#EDE9FE] flex justify-end" *ngIf="c.estado !== 'cancelada'">
              <button (click)="cancelar(c.id_cita)" class="text-xs font-bold text-pink-600 hover:underline cursor-pointer">
                Cancelar cita
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})

export class CitasComponent implements OnInit {
  private citaService = inject(CitaService);
  private mascotaService = inject(MascotaService);

  citas = signal<any[]>([]);
  mascotas = signal<any[]>([]);
  veterinarias = signal<any[]>([]);
  profesionales = signal<any[]>([]);

  cargando = signal<boolean>(true);
  guardando = signal<boolean>(false);
  mostrarFormulario = signal<boolean>(false);
  error = signal<string | null>(null);

  nuevaCita: any = {
    id_mascota: null,
    id_veterinaria: null,
    id_profesional: null,
    fecha_cita: '',
    motivo: ''
  };

  profesionalesFiltrados = computed(() => {
    const idVet = this.nuevaCita.id_veterinaria;
    if (!idVet) return this.profesionales();
    return this.profesionales().filter(p => p.id_veterinaria === idVet);
  });

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando.set(true);
    forkJoin({
      citas: this.citaService.getCitas(),
      mascotas: this.mascotaService.getMascotas(),
      veterinarias: this.citaService.getVeterinarias(),
      profesionales: this.citaService.getProfesionales()
    }).subscribe({
      next: (res) => {
        this.citas.set(res.citas);
        this.mascotas.set(res.mascotas);
        this.veterinarias.set(res.veterinarias);
        this.profesionales.set(res.profesionales);
        if (res.mascotas.length > 0) {
          this.nuevaCita.id_mascota = res.mascotas[0].id_mascota;
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error al cargar la información de citas.');
        this.cargando.set(false);
      }
    });
  }

  alCambiarVeterinaria() {
    this.nuevaCita.id_profesional = null;
  }

  guardarCita() {
    this.guardando.set(true);
    this.error.set(null);

    const payload: any = {
      id_mascota: this.nuevaCita.id_mascota,
      id_veterinaria: this.nuevaCita.id_veterinaria,
      id_profesional: this.nuevaCita.id_profesional,
      fecha_cita: this.nuevaCita.fecha_cita,
      motivo: this.nuevaCita.motivo || 'Consulta general'
    };

    this.citaService.crearCita(payload).subscribe({
      next: (creada) => {
        this.citas.update(lista => [creada, ...lista]);
        this.mostrarFormulario.set(false);
        this.guardando.set(false);
        this.nuevaCita.motivo = '';
        this.nuevaCita.fecha_cita = '';
      },
      error: (err) => {
        console.error(err);
        const detalle = err.error?.detail;
        this.error.set(typeof detalle === 'string' ? detalle : 'No se pudo agendar la cita. Verifica los datos y la disponibilidad.');
        this.guardando.set(false);
      }
    });
  }

  cancelar(idCita: number) {
    this.citaService.cancelarCita(idCita).subscribe({
      next: (actualizada) => {
        this.citas.update(lista => lista.map(c => c.id_cita === idCita ? actualizada : c));
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudo cancelar la cita.');
      }
    });
  }

  nombreMascota(id: number): string {
    return this.mascotas().find(m => m.id_mascota === id)?.nombre || 'Mascota #' + id;
  }

  nombreVeterinaria(id: number): string {
    const vet = this.veterinarias().find(v => v.id_veterinaria === id);
    return vet?.nombre_comercial || 'Veterinaria #' + id;
  }


  nombreProfesional(id: number): string {
    const prof = this.profesionales().find(p => p.id_profesional === id);
    return prof?.nombre || prof?.especialidad || 'Profesional #' + id;
  }
}
