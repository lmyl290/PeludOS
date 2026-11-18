import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecordatorioService } from '../../core/services/recordatorio.service';
import { MascotaService } from '../../core/services/mascota.service';

@Component({
  selector: 'app-recordatorios',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-[#FAF8FF] text-slate-950">
      <nav class="bg-[#EDE9FE]/80 backdrop-blur-xs border-b border-[#DDD6FE] px-8 py-4 flex justify-between items-center">
        <a routerLink="/dashboard" class="text-[#9C27B0] font-bold hover:underline flex items-center gap-2 text-sm">
          ← Volver al Panel
        </a>
        <span class="text-xl font-extrabold text-slate-950">Mis <span class="text-[#9C27B0]">Recordatorios</span> ⏰</span>
      </nav>

      <main class="p-8 lg:p-12 max-w-7xl mx-auto">
        <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h2 class="text-3xl font-extrabold text-slate-950">Alertas y <span class="text-[#9C27B0]">Recordatorios</span></h2>
            <p class="text-slate-700 text-sm mt-1 font-medium">Programa avisos para vacunas, dosis de medicamentos y citas.</p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div *ngIf="mascotas().length > 0" class="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-[#C4B5FD] shadow-2xs">
              <label class="text-xs font-extrabold text-slate-700 uppercase">Mascota:</label>
              <select [ngModel]="mascotaSeleccionada()" (ngModelChange)="seleccionarMascota($event)"
                class="font-bold text-[#9C27B0] bg-transparent focus:outline-none text-sm cursor-pointer">
                <option *ngFor="let m of mascotas()" [ngValue]="m.id_mascota">
                  {{ m.nombre }} ({{ m.especie }})
                </option>
              </select>
            </div>

            <button *ngIf="mascotaSeleccionada()"
              (click)="mostrarFormulario.set(!mostrarFormulario())"
              class="bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer text-sm">
              {{ mostrarFormulario() ? 'Cancelar' : '+ Nuevo Recordatorio' }}
            </button>
          </div>
        </div>

        <div *ngIf="mostrarFormulario()" class="bg-white p-6 rounded-2xl shadow-xs border border-[#C4B5FD] mb-8">
          <h3 class="text-lg font-extrabold text-slate-950 mb-4">Crear Recordatorio</h3>

          <form (ngSubmit)="guardarRecordatorio()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Título *</label>
              <input type="text" [(ngModel)]="nuevoRec.titulo" name="titulo" required placeholder="Ej. Refuerzo Triple Felina"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Tipo *</label>
              <select [(ngModel)]="nuevoRec.tipo" name="tipo" required
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm bg-white">
                <option value="vacuna">💉 Vacuna</option>
                <option value="medicamento">💊 Medicamento</option>
                <option value="cita">📅 Cita</option>
                <option value="otro">🐾 Otro</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Fecha y Hora Programada *</label>
              <input type="datetime-local" [(ngModel)]="nuevoRec.fecha_programada" name="fecha_programada" required
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Frecuencia (opcional)</label>
              <input type="text" [(ngModel)]="nuevoRec.frecuencia" name="frecuencia" placeholder="Ej. Único, Cada 8 horas, Anual"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
            </div>

            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-800 mb-1">Descripción / Notas</label>
              <input type="text" [(ngModel)]="nuevoRec.descripcion" name="descripcion" placeholder="Detalles adicionales del recordatorio..."
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
            </div>

            <div class="md:col-span-2 flex justify-end mt-2">
              <button type="submit" [disabled]="guardando() || !nuevoRec.titulo || !nuevoRec.fecha_programada"
                class="bg-[#9C27B0] hover:bg-[#7B1FA2] disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition cursor-pointer text-sm">
                {{ guardando() ? 'Guardando...' : 'Guardar Recordatorio' }}
              </button>
            </div>
          </form>
        </div>

        <div *ngIf="error()" class="bg-pink-50 border border-pink-200 text-pink-800 p-4 rounded-xl mb-6 text-sm">
          {{ error() }}
        </div>

        <div *ngIf="!cargando() && mascotas().length === 0" class="bg-white p-10 rounded-2xl border border-[#DDD6FE] text-center">
          <p class="text-slate-800 font-semibold mb-3">Primero debes registrar una mascota para crear recordatorios.</p>
          <a routerLink="/mascotas" class="text-[#9C27B0] font-bold hover:underline">Ir a Mis Mascotas →</a>
        </div>

        <div *ngIf="cargandoLista()" class="text-slate-600 text-sm">Cargando recordatorios...</div>

        <div *ngIf="mascotaSeleccionada() && !cargandoLista() && recordatorios().length === 0"
          class="bg-white p-10 rounded-2xl border border-[#DDD6FE] text-center">
          <p class="text-slate-800 font-semibold mb-2">No hay recordatorios programados para esta mascota.</p>
          <p class="text-slate-500 text-sm">Haz clic en "+ Nuevo Recordatorio" para programar una alerta.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let r of recordatorios()"
            class="bg-white p-6 rounded-2xl shadow-xs border border-[#DDD6FE] hover:border-[#9C27B0] flex flex-col justify-between transition"
            [ngClass]="{'opacity-65': r.notificado}">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="bg-[#FAE8FF] text-[#9C27B0] border border-[#F0ABFC] text-xs font-bold uppercase px-2.5 py-1 rounded-lg">
                  {{ r.tipo }}
                </span>
                <span class="text-xs font-bold px-2.5 py-1 rounded-lg border"
                  [ngClass]="r.notificado ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#F3E8FF] text-[#7E22CE] border-[#DDD6FE]'">
                  {{ r.notificado ? 'Completado' : 'Pendiente' }}
                </span>
              </div>

              <h3 class="text-lg font-extrabold text-slate-950 mb-1" [ngClass]="{'line-through': r.notificado}">
                {{ r.titulo }}
              </h3>

              <p class="text-[#9C27B0] font-bold text-sm mb-3">
                🕒 {{ r.fecha_programada | date:'dd/MM/yyyy HH:mm' }}
              </p>

              <div class="space-y-1.5 text-xs text-slate-700 border-t border-[#EDE9FE] pt-3">
                <p *ngIf="r.frecuencia"><strong>Frecuencia:</strong> {{ r.frecuencia }}</p>
                <p *ngIf="r.descripcion">{{ r.descripcion }}</p>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-[#EDE9FE] flex justify-between items-center">
              <button (click)="alternarEstado(r)" class="text-xs font-bold text-[#9C27B0] hover:underline cursor-pointer">
                {{ r.notificado ? 'Marcar pendiente' : '✓ Marcar completado' }}
              </button>
              <button (click)="eliminar(r.id_recordatorio)" class="text-xs font-bold text-pink-600 hover:underline cursor-pointer">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class RecordatoriosComponent implements OnInit {
  private recordatorioService = inject(RecordatorioService);
  private mascotaService = inject(MascotaService);

  mascotas = signal<any[]>([]);
  mascotaSeleccionada = signal<number | null>(null);
  recordatorios = signal<any[]>([]);

  cargando = signal<boolean>(true);
  cargandoLista = signal<boolean>(false);
  guardando = signal<boolean>(false);
  mostrarFormulario = signal<boolean>(false);
  error = signal<string | null>(null);

  nuevoRec: any = {
    titulo: '',
    tipo: 'vacuna',
    fecha_programada: '',
    frecuencia: '',
    descripcion: ''
  };

  ngOnInit() {
    this.mascotaService.getMascotas().subscribe({
      next: (lista) => {
        this.mascotas.set(lista);
        this.cargando.set(false);
        if (lista.length > 0) {
          this.seleccionarMascota(lista[0].id_mascota);
        }
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar tus mascotas.');
        this.cargando.set(false);
      }
    });
  }

  seleccionarMascota(idMascota: number) {
    this.mascotaSeleccionada.set(idMascota);
    this.cargandoLista.set(true);
    this.error.set(null);

    this.recordatorioService.getRecordatorios(idMascota).subscribe({
      next: (data) => {
        this.recordatorios.set(data);
        this.cargandoLista.set(false);
      },
      error: (err) => {

console.error(err);
this.error.set('Error al cargar los recordatorios.');
this.cargandoLista.set(false);
}
});
}
guardarRecordatorio() {
const idMascota = this.mascotaSeleccionada();
if (!idMascota || !this.nuevoRec.titulo || !this.nuevoRec.fecha_programada) return;
this.guardando.set(true);
this.error.set(null);
const payload = {
id_mascota: idMascota,
titulo: this.nuevoRec.titulo,
tipo: this.nuevoRec.tipo,
fecha_programada: this.nuevoRec.fecha_programada,
frecuencia: this.nuevoRec.frecuencia || null,
descripcion: this.nuevoRec.descripcion || null
};
this.recordatorioService.crearRecordatorio(payload).subscribe({
next: (creado) => {
this.recordatorios.update(lista => [creado, ...lista]);
this.mostrarFormulario.set(false);
this.guardando.set(false);
this.nuevoRec = { titulo: '', tipo: 'vacuna', fecha_programada: '', frecuencia: '', descripcion: '' };
},
error: (err) => {
console.error(err);
this.error.set('No se pudo crear el recordatorio. Revisa los datos ingresados.');
this.guardando.set(false);
}
});
}
alternarEstado(rec: any) {
const nuevoEstado = !rec.notificado;
this.recordatorioService.marcarNotificado(rec.id_recordatorio, nuevoEstado).subscribe({
next: (actualizado) => {
this.recordatorios.update(lista =>
lista.map(r => r.id_recordatorio === rec.id_recordatorio ? actualizado : r)
);
},
error: (err) => console.error(err)
});
}
eliminar(idRecordatorio: number) {
this.recordatorioService.desactivarRecordatorio(idRecordatorio).subscribe({
next: () => {
this.recordatorios.update(lista => lista.filter(r => r.id_recordatorio !== idRecordatorio));
},
error: (err) => console.error(err)
});
}
}