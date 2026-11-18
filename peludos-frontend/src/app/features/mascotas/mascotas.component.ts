import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MascotaService } from '../../core/services/mascota.service';

@Component({
  selector: 'app-mascotas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-[#FAF8FF] text-slate-950">
      <nav class="bg-[#EDE9FE]/80 backdrop-blur-xs border-b border-[#DDD6FE] px-8 py-4 flex justify-between items-center">
        <a routerLink="/dashboard" class="text-[#9C27B0] font-bold hover:underline flex items-center gap-2 text-sm">
          ← Volver al Panel
        </a>
        <span class="text-xl font-extrabold text-slate-950">Mis <span class="text-[#9C27B0]">Mascotas</span> 🐶</span>
      </nav>

      <main class="p-8 lg:p-12 max-w-7xl mx-auto">
        <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h2 class="text-3xl font-extrabold text-slate-950">Tus <span class="text-[#9C27B0]">Peludos</span></h2>
            <p class="text-slate-700 text-sm mt-1 font-medium">Administra la información básica y médica de tus mascotas.</p>
          </div>
          
          <button 
            (click)="mostrarFormulario.set(!mostrarFormulario())"
            class="bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer text-sm">
            {{ mostrarFormulario() ? 'Cancelar' : '+ Registrar Mascota' }}
          </button>
        </div>

        <div *ngIf="mostrarFormulario()" class="bg-white p-6 rounded-2xl shadow-xs border border-[#C4B5FD] mb-8">
          <h3 class="text-lg font-extrabold text-slate-950 mb-4">Nueva Mascota</h3>
          
          <form (ngSubmit)="guardarMascota()" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Nombre *</label>
              <input type="text" [(ngModel)]="nuevaMascota.nombre" name="nombre" required placeholder="Ej. Max"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Especie *</label>
              <select [(ngModel)]="nuevaMascota.especie" name="especie" required
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm bg-white">
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Ave">Ave</option>
                <option value="Conejo">Conejo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Raza</label>
              <input type="text" [(ngModel)]="nuevaMascota.raza" name="raza" placeholder="Ej. Labrador"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Sexo</label>
              <select [(ngModel)]="nuevaMascota.sexo" name="sexo"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm bg-white">
                <option value="">Seleccionar...</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Fecha de Nacimiento</label>
              <input type="date" [(ngModel)]="nuevaMascota.fecha_nacimiento" name="fecha_nacimiento"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Peso (kg)</label>
              <input type="number" step="0.1" [(ngModel)]="nuevaMascota.peso_kg" name="peso_kg" placeholder="Ej. 12.5"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Color</label>
              <input type="text" [(ngModel)]="nuevaMascota.color_mascota" name="color_mascota" placeholder="Ej. Dorado"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Alergias</label>
              <input type="text" [(ngModel)]="nuevaMascota.alergias" name="alergias" placeholder="Ninguna o especificar"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Condiciones Médicas</label>
              <input type="text" [(ngModel)]="nuevaMascota.condiciones_medicas" name="condiciones_medicas" placeholder="Opcional"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
            </div>

            <div class="md:col-span-3 flex justify-end mt-2">
              <button type="submit" [disabled]="guardando() || !nuevaMascota.nombre"
                class="bg-[#9C27B0] hover:bg-[#7B1FA2] disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition cursor-pointer text-sm">
                {{ guardando() ? 'Guardando...' : 'Guardar Mascota' }}
              </button>
            </div>
          </form>
        </div>

        <div *ngIf="cargando()" class="text-slate-600 text-sm">Cargando mascotas...</div>

        <div *ngIf="error()" class="bg-pink-50 border border-pink-200 text-pink-800 p-4 rounded-xl mb-6 text-sm">
          {{ error() }}
        </div>

        <div *ngIf="!cargando() && !error() && mascotas().length === 0" class="bg-white p-10 rounded-2xl border border-[#DDD6FE] text-center">
          <p class="text-slate-800 font-semibold mb-2">Aún no tienes mascotas registradas.</p>
          <p class="text-slate-500 text-sm">Haz clic en "+ Registrar Mascota" para agregar a tu primer peludo.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div *ngFor="let m of mascotas()" class="bg-white p-6 rounded-2xl shadow-xs border border-[#DDD6FE] hover:border-[#9C27B0] transition flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-xl font-extrabold text-slate-950">{{ m.nombre }}</h3>
                <span class="bg-[#FAE8FF] text-[#9C27B0] border border-[#F0ABFC] text-xs font-bold px-2.5 py-1 rounded-lg">
                  {{ m.especie }}
                </span>
              </div>
              
              <p class="text-slate-600 text-sm mb-4 font-medium">
                {{ m.raza || 'Raza no especificada' }} 
                <span *ngIf="m.sexo">• {{ m.sexo }}</span>
              </p>

              <div class="space-y-1.5 text-xs text-slate-700 border-t border-[#EDE9FE] pt-3">
                <p *ngIf="m.fecha_nacimiento"><strong>Nacimiento:</strong> {{ m.fecha_nacimiento }}</p>
                <p *ngIf="m.peso_kg"><strong>Peso:</strong> {{ m.peso_kg }} kg</p>
                <p *ngIf="m.color_mascota"><strong>Color:</strong> {{ m.color_mascota }}</p>
                <p *ngIf="m.alergias" class="text-[#9C27B0]"><strong>Alergias:</strong> {{ m.alergias }}</p>
                <p *ngIf="m.condiciones_medicas" class="text-[#7E22CE]"><strong>Condiciones:</strong> {{ m.condiciones_medicas }}</p>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-[#EDE9FE] flex justify-end">
              <button (click)="eliminar(m.id_mascota)" class="text-xs font-bold text-pink-600 hover:underline cursor-pointer">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  
  `
})
export class MascotasComponent implements OnInit {
  private mascotaService = inject(MascotaService);
  
  mascotas = signal<any[]>([]);
  cargando = signal<boolean>(true);
  guardando = signal<boolean>(false);
  mostrarFormulario = signal<boolean>(false);
  error = signal<string | null>(null);

  nuevaMascota: any = {
    nombre: '',
    especie: 'Perro',
    raza: '',
    sexo: '',
    fecha_nacimiento: '',
    peso_kg: null,
    color_mascota: '',
    alergias: '',
    condiciones_medicas: ''
  };

  ngOnInit() {
    this.cargarMascotas();
  }

  cargarMascotas() {
    this.cargando.set(true);
    this.mascotaService.getMascotas().subscribe({
      next: (data) => {
        this.mascotas.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar las mascotas.');
        this.cargando.set(false);
      }
    });
  }

  guardarMascota() {
    if (!this.nuevaMascota.nombre) return;
    this.guardando.set(true);
    this.error.set(null);

    const payload: any = {
      nombre: this.nuevaMascota.nombre,
      especie: this.nuevaMascota.especie,
      raza: this.nuevaMascota.raza || null,
      sexo: this.nuevaMascota.sexo || null,
      fecha_nacimiento: this.nuevaMascota.fecha_nacimiento || null,
      peso_kg: this.nuevaMascota.peso_kg || null,
      color_mascota: this.nuevaMascota.color_mascota || null,
      alergias: this.nuevaMascota.alergias || null,
      condiciones_medicas: this.nuevaMascota.condiciones_medicas || null
    };

    this.mascotaService.crearMascota(payload).subscribe({
next: (creada) => {
this.mascotas.update(lista => [...lista, creada]);
this.nuevaMascota = {
nombre: '',
especie: 'Perro',
raza: '',
sexo: '',
fecha_nacimiento: '',
peso_kg: null,
color_mascota: '',
alergias: '',
condiciones_medicas: ''
};
this.mostrarFormulario.set(false);
this.guardando.set(false);
},
error: (err) => {
console.error(err);
this.error.set('Error al guardar la mascota. Verifica los datos ingresados.');
this.guardando.set(false);
}
});
}
eliminar(id: number) {
this.mascotaService.eliminarMascota(id).subscribe({
next: () => {
this.mascotas.update(lista => lista.filter(m => m.id_mascota !== id));
},
error: (err) => console.error(err)
});
}
}