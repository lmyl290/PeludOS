import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HistorialService } from '../../core/services/historial.service';
import { MascotaService } from '../../core/services/mascota.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
    template: `
    <div class="min-h-screen bg-[#FAF8FF] text-slate-950">
      <nav class="bg-[#EDE9FE]/80 backdrop-blur-xs border-b border-[#DDD6FE] px-8 py-4 flex justify-between items-center">
        <a routerLink="/dashboard" class="text-[#9C27B0] font-bold hover:underline flex items-center gap-2 text-sm">
          ← Volver al Panel
        </a>
        <span class="text-xl font-extrabold text-slate-950">Historial <span class="text-[#9C27B0]">Médico</span> 📋</span>
      </nav>

      <main class="p-8 lg:p-12 max-w-7xl mx-auto">
        <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h2 class="text-3xl font-extrabold text-slate-950">Expediente <span class="text-[#9C27B0]">Clínico</span></h2>
            <p class="text-slate-700 text-sm mt-1 font-medium">Consulta y registra vacunas y tratamientos de tus peludos.</p>
          </div>

          <div class="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-[#C4B5FD] shadow-2xs">
            <label class="text-xs font-extrabold text-slate-700 uppercase">Mascota:</label>
            <select [ngModel]="mascotaSeleccionada()" (ngModelChange)="seleccionarMascota($event)"
              class="font-bold text-[#9C27B0] bg-transparent focus:outline-none text-sm cursor-pointer">
              <option *ngFor="let m of mascotas()" [ngValue]="m.id_mascota">
                {{ m.nombre }} ({{ m.especie }})
              </option>
            </select>
          </div>
        </div>

        <div *ngIf="error()" class="bg-pink-50 border border-pink-200 text-pink-800 p-4 rounded-xl mb-6 text-sm">
          {{ error() }}
        </div>

        <div *ngIf="!cargando() && mascotas().length === 0" class="bg-white p-10 rounded-2xl border border-[#DDD6FE] text-center">
          <p class="text-slate-800 font-semibold mb-3">Primero debes registrar una mascota para ver su historial médico.</p>
          <a routerLink="/mascotas" class="text-[#9C27B0] font-bold hover:underline">Ir a Mis Mascotas →</a>
        </div>

        <div *ngIf="mascotaSeleccionada()" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- VACUNAS -->
          <section class="bg-white p-6 rounded-2xl shadow-xs border border-[#DDD6FE]">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-extrabold text-slate-950 flex items-center gap-2">💉 Vacunas</h3>
              <button (click)="formVacuna.set(!formVacuna())"
                class="bg-[#FAE8FF] hover:bg-[#F5D0FE] text-[#9C27B0] border border-[#F0ABFC] font-bold px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer">
                {{ formVacuna() ? 'Cancelar' : '+ Agregar Vacuna' }}
              </button>
            </div>

            <form *ngIf="formVacuna()" (ngSubmit)="guardarVacuna()" class="bg-[#FAF8FF] p-4 rounded-xl border border-[#C4B5FD] mb-6 space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">Nombre de la vacuna *</label>
                <input type="text" [(ngModel)]="nuevaVacuna.nombre_vacuna" name="nombre_vacuna" required placeholder="Ej. Rabia, Triple Felina"
                  class="w-full px-3 py-2 rounded-lg border border-[#DDD6FE] text-sm bg-white focus:outline-none focus:border-[#9C27B0]">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-800 mb-1">Fecha aplicación *</label>
                  <input type="date" [(ngModel)]="nuevaVacuna.fecha_aplicacion" name="fecha_aplicacion" required
                    class="w-full px-3 py-2 rounded-lg border border-[#DDD6FE] text-sm bg-white">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-800 mb-1">Próxima dosis</label>
                  <input type="date" [(ngModel)]="nuevaVacuna.fecha_proxima_dosis" name="fecha_proxima_dosis"
                    class="w-full px-3 py-2 rounded-lg border border-[#DDD6FE] text-sm bg-white">
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-800 mb-1">Dosis #</label>
                  <input type="number" [(ngModel)]="nuevaVacuna.numero_dosis" name="numero_dosis" min="1"
                    class="w-full px-3 py-2 rounded-lg border border-[#DDD6FE] text-sm bg-white">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-800 mb-1">Lote</label>
                  <input type="text" [(ngModel)]="nuevaVacuna.lote" name="lote" placeholder="Opcional"
                    class="w-full px-3 py-2 rounded-lg border border-[#DDD6FE] text-sm bg-white">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-800 mb-1">Veterinario</label>
                  <input type="text" [(ngModel)]="nuevaVacuna.veterinario_nombre" name="veterinario_nombre" placeholder="Dr/Dra."
                    class="w-full px-3 py-2 rounded-lg border border-[#DDD6FE] text-sm bg-white">
                </div>
              </div>

              <div class="flex justify-end pt-1">
                <button type="submit" [disabled]="guardando() || !nuevaVacuna.nombre_vacuna || !nuevaVacuna.fecha_aplicacion"
                  class="bg-[#9C27B0] hover:bg-[#7B1FA2] disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer">
                  Guardar Vacuna
                </button>
              </div>
            </form>

            <div *ngIf="cargandoHistorial()" class="text-slate-500 text-sm">Cargando vacunas...</div>

            <div *ngIf="!cargandoHistorial() && vacunas().length === 0" class="text-center py-8 text-slate-500 text-sm">
              No hay vacunas registradas para esta mascota.
            </div>

            <div class="space-y-3">
              <div *ngFor="let v of vacunas()" class="p-4 rounded-xl border border-[#DDD6FE] bg-[#FAF8FF]">
                <div class="flex justify-between items-start">
                  <h4 class="font-extrabold text-slate-950">{{ v.nombre_vacuna }}</h4>
                  <span class="bg-[#FAE8FF] text-[#9C27B0] border border-[#F0ABFC] text-xs font-bold px-2.5 py-0.5 rounded-md">
                    Dosis #{{ v.numero_dosis }}
                  </span>
                </div>
                <div class="text-xs text-slate-700 mt-2 space-y-1">
                  <p><strong>Aplicada:</strong> {{ v.fecha_aplicacion }}</p>
                  <p *ngIf="v.fecha_proxima_dosis" class="text-[#9C27B0] font-semibold"><strong>Próximo refuerzo:</strong> {{ v.fecha_proxima_dosis }}</p>
                  <p *ngIf="v.veterinario_nombre"><strong>Veterinario:</strong> {{ v.veterinario_nombre }}</p>
                  <p *ngIf="v.lote"><strong>Lote:</strong> {{ v.lote }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- MEDICAMENTOS -->
          <section class="bg-white p-6 rounded-2xl shadow-xs border border-[#DDD6FE]">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-extrabold text-slate-950 flex items-center gap-2">💊 Medicamentos</h3>
              <button (click)="formMed.set(!formMed())"
                class="bg-[#FAE8FF] hover:bg-[#F5D0FE] text-[#9C27B0] border border-[#F0ABFC] font-bold px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer">
                {{ formMed() ? 'Cancelar' : '+ Agregar Medicamento' }}
              </button>
            </div>

            <form *ngIf="formMed()" (ngSubmit)="guardarMedicamento()" class="bg-[#FAF8FF] p-4 rounded-xl border border-[#C4B5FD] mb-6 space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">Nombre del medicamento *</label>
                <input type="text" [(ngModel)]="nuevoMed.nombre_medicamento" name="nombre_medicamento" required placeholder="Ej. Antiparasitario, Meloxicam"
                  class="w-full px-3 py-2 rounded-lg border border-[#DDD6FE] text-sm bg-white focus:outline-none focus:border-[#9C27B0]">
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-800 mb-1">Dosis</label>
                  <input type="text" [(ngModel)]="nuevoMed.dosis" name="dosis" placeholder="Ej. 1 tableta"
                    class="w-full px-3 py-2 rounded-lg border border-[#DDD6FE] text-sm bg-white">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-800 mb-1">Unidad</label>
                  <input type="text" [(ngModel)]="nuevoMed.unidad_medida" name="unidad_medida" placeholder="mg, ml, gotas"
                    class="w-full px-3 py-2 rounded-lg border border-[#DDD6FE] text-sm bg-white">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-800 mb-1">Frecuencia</label>
                  <input type="text" [(ngModel)]="nuevoMed.frecuencia_administracion" name="frecuencia" placeholder="Cada 12h"
                    class="w-full px-3 py-2 rounded-lg border border-[#DDD6FE] text-sm bg-white">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-800 mb-1">Fecha inicio *</label>
                  <input type="date" [(ngModel)]="nuevoMed.fecha_inicio" name="fecha_inicio" required
                    class="w-full px-3 py-2 rounded-lg border border-[#DDD6FE] text-sm bg-white">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-800 mb-1">Fecha fin</label>

Fecha inicio *
<input type="date" [(ngModel)]="nuevoMed.fecha_inicio" name="fecha_inicio" required
class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">

Fecha fin
<input type="date" [(ngModel)]="nuevoMed.fecha_fin" name="fecha_fin"
class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">

Observaciones
<input type="text" [(ngModel)]="nuevoMed.observaciones" name="observaciones" placeholder="Ej. Dar con comida"
class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
<button type="submit" [disabled]="guardando() || !nuevoMed.nombre_medicamento || !nuevoMed.fecha_inicio"
class="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold px-4 py-2 rounded-lg text-xs cursor-pointer">
Guardar Medicamento


<div *ngIf="cargandoHistorial()" class="text-slate-400 text-sm">Cargando medicamentos...
<div *ngIf="!cargandoHistorial() && medicamentos().length === 0" class="text-center py-8 text-slate-400 text-sm">
No hay medicamentos registrados para esta mascota.
<div *ngFor="let med of medicamentos()" class="p-4 rounded-xl border border-slate-100 bg-slate-50/50">

{{ med.nombre_medicamento }}
<button (click)="eliminarMed(med.id_medicamento)" class="text-xs text-red-500 hover:underline cursor-pointer">
Finalizar



<p *ngIf="med.dosis">Dosis: {{ med.dosis }} {{ med.unidad_medida || '' }}
<p *ngIf="med.frecuencia_administracion">Frecuencia: {{ med.frecuencia_administracion }}
Inicio: {{ med.fecha_inicio }} <span *ngIf="med.fecha_fin">• Fin: {{ med.fecha_fin }}
<p *ngIf="med.observaciones" class="text-slate-500 italic">{{ med.observaciones }}

`
})
export class HistorialComponent implements OnInit {
private historialService = inject(HistorialService);
private mascotaService = inject(MascotaService);
mascotas = signal<any[]>([]);
mascotaSeleccionada = signal<number | null>(null);
vacunas = signal<any[]>([]);
medicamentos = signal<any[]>([]);
cargando = signal(true);
cargandoHistorial = signal(false);
guardando = signal(false);
formVacuna = signal(false);
formMed = signal(false);
error = signal<string | null>(null);
nuevaVacuna: any = {
nombre_vacuna: '',
fecha_aplicacion: '',
fecha_proxima_dosis: '',
numero_dosis: 1,
lote: '',
veterinario_nombre: ''
};
nuevoMed: any = {
nombre_medicamento: '',
dosis: '',
unidad_medida: '',
frecuencia_administracion: '',
fecha_inicio: '',
fecha_fin: '',
observaciones: ''
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
this.cargandoHistorial.set(true);
this.error.set(null);
forkJoin({
vacunas: this.historialService.getVacunas(idMascota),
medicamentos: this.historialService.getMedicamentos(idMascota)
}).subscribe({
next: (res) => {
this.vacunas.set(res.vacunas);
this.medicamentos.set(res.medicamentos);
this.cargandoHistorial.set(false);
},
error: (err) => {
console.error(err);
this.error.set('Error al cargar el historial médico.');
this.cargandoHistorial.set(false);
}
});
}
guardarVacuna() {
const idMascota = this.mascotaSeleccionada();
if (!idMascota) return;
this.guardando.set(true);
const payload = {
id_mascota: idMascota,
nombre_vacuna: this.nuevaVacuna.nombre_vacuna,
fecha_aplicacion: this.nuevaVacuna.fecha_aplicacion,
fecha_proxima_dosis: this.nuevaVacuna.fecha_proxima_dosis || null,
numero_dosis: this.nuevaVacuna.numero_dosis || 1,
lote: this.nuevaVacuna.lote || null,
veterinario_nombre: this.nuevaVacuna.veterinario_nombre || null
};
this.historialService.crearVacuna(payload).subscribe({
next: (creada) => {
this.vacunas.update(lista => [creada, ...lista]);
this.formVacuna.set(false);
this.guardando.set(false);
this.nuevaVacuna = { nombre_vacuna: '', fecha_aplicacion: '', fecha_proxima_dosis: '', numero_dosis: 1, lote: '', veterinario_nombre: '' };
},
error: (err) => {
console.error(err);
this.error.set('No se pudo guardar la vacuna.');
this.guardando.set(false);
}
});
}
guardarMedicamento() {
const idMascota = this.mascotaSeleccionada();
if (!idMascota) return;
this.guardando.set(true);
const payload = {
id_mascota: idMascota,
nombre_medicamento: this.nuevoMed.nombre_medicamento,
dosis: this.nuevoMed.dosis || null,
unidad_medida: this.nuevoMed.unidad_medida || null,
frecuencia_administracion: this.nuevoMed.frecuencia_administracion || null,
fecha_inicio: this.nuevoMed.fecha_inicio,
fecha_fin: this.nuevoMed.fecha_fin || null,
observaciones: this.nuevoMed.observaciones || null
};
this.historialService.crearMedicamento(payload).subscribe({
next: (creado) => {
this.medicamentos.update(lista => [creado, ...lista]);
this.formMed.set(false);
this.guardando.set(false);
this.nuevoMed = { nombre_medicamento: '', dosis: '', unidad_medida: '', frecuencia_administracion: '', fecha_inicio: '', fecha_fin: '', observaciones: '' };
},
error: (err) => {
console.error(err);
this.error.set('No se pudo guardar el medicamento.');
this.guardando.set(false);
}
});
}
eliminarMed(idMedicamento: number) {
this.historialService.desactivarMedicamento(idMedicamento).subscribe({
next: () => {
this.medicamentos.update(lista => lista.filter(m => m.id_medicamento !== idMedicamento));
},
error: (err) => console.error(err)
});
}
}