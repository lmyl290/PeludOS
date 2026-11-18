import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-[#FAF8FF] text-slate-950">
      <nav class="bg-[#EDE9FE]/80 backdrop-blur-xs border-b border-[#DDD6FE] px-8 py-4 flex justify-between items-center">
        <a routerLink="/dashboard" class="text-[#9C27B0] font-bold hover:underline flex items-center gap-2 text-sm">
          ← Volver al Panel
        </a>
        <span class="text-xl font-extrabold text-slate-950">Mi <span class="text-[#9C27B0]">Perfil</span> 👤</span>
      </nav>

      <main class="p-8 lg:p-12 max-w-4xl mx-auto">
        <div class="mb-8">
          <h2 class="text-3xl font-extrabold text-slate-950">Configuración de <span class="text-[#9C27B0]">Cuenta</span></h2>
          <p class="text-slate-700 text-sm mt-1 font-medium">Consulta y actualiza tus datos personales y de contacto.</p>
        </div>

        <div *ngIf="cargando()" class="text-slate-600 text-sm">Cargando datos del perfil...</div>

        <div *ngIf="mensaje()" class="bg-[#FAE8FF] border border-[#F0ABFC] text-[#7B1FA2] font-bold p-4 rounded-xl mb-6 text-sm">
          ✓ {{ mensaje() }}
        </div>

        <div *ngIf="error()" class="bg-pink-50 border border-pink-200 text-pink-800 p-4 rounded-xl mb-6 text-sm">
          {{ error() }}
        </div>

        <div *ngIf="!cargando() && usuario()" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <!-- Tarjeta Resumen Lateral -->
          <div class="bg-white p-6 rounded-2xl shadow-xs border border-[#DDD6FE] flex flex-col items-center text-center h-fit">
            <div class="w-20 h-20 rounded-full bg-[#9C27B0] text-white flex items-center justify-center text-3xl font-extrabold mb-4 shadow-xs">
              {{ inicial() }}
            </div>

            <h3 class="text-lg font-extrabold text-slate-950">{{ usuario().nombre_completo }}</h3>
            <p class="text-xs text-slate-500 mt-0.5 mb-3">{{ usuario().correo_electronico }}</p>

            <span class="bg-[#FAE8FF] text-[#9C27B0] border border-[#F0ABFC] text-xs font-extrabold uppercase px-3 py-1 rounded-lg">
              {{ usuario().rol }}
            </span>

            <div class="w-full border-t border-[#EDE9FE] mt-5 pt-4 text-xs text-slate-600 space-y-1.5 text-left">
              <p><strong>ID Usuario:</strong> #{{ usuario().id_usuario }}</p>
              <p><strong>Miembro desde:</strong> {{ usuario().fecha_registro | date:'dd/MM/yyyy' }}</p>
              <p><strong>Estado:</strong> <span class="text-emerald-700 font-bold">Activo</span></p>
            </div>
          </div>

          <!-- Formulario de Edición -->
          <div class="md:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-[#C4B5FD]">
            <h3 class="text-lg font-extrabold text-slate-950 border-b border-[#EDE9FE] pb-3 mb-5">
              Editar Información Personal
            </h3>

            <form (ngSubmit)="guardarCambios()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">Correo electrónico (no editable)</label>
                <input type="email" [value]="usuario().correo_electronico" disabled
                  class="w-full px-4 py-2.5 rounded-xl border border-[#EDE9FE] bg-[#FAF8FF] text-slate-500 text-sm cursor-not-allowed">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">Nombre completo *</label>
                <input type="text" [(ngModel)]="form.nombre_completo" name="nombre_completo" required
                  class="w-full px-4 py-2.5 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">Teléfono de contacto</label>
                <input type="text" [(ngModel)]="form.telefono" name="telefono" placeholder="Ej. 300 123 4567"
                  class="w-full px-4 py-2.5 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">Dirección predeterminada</label>
                <input type="text" [(ngModel)]="form.direccion" name="direccion" placeholder="Ej. Calle 123 # 45-67"
                  class="w-full px-4 py-2.5 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
              </div>

              <div class="pt-3 flex justify-end">
                <button type="submit" [disabled]="guardando() || !form.nombre_completo"
                  class="bg-[#9C27B0] hover:bg-[#7B1FA2] disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-xs cursor-pointer text-sm">
                  {{ guardando() ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>
    </div>
  `
})
export class PerfilComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);

  usuario = this.usuarioService.usuario;
  cargando = signal<boolean>(true);
  guardando = signal<boolean>(false);
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);

  form = {
    nombre_completo: '',
    telefono: '',
    direccion: ''
  };

  inicial(): string {
    const nombre = this.usuario()?.nombre_completo || 'U';
    return nombre.charAt(0).toUpperCase();
  }

  ngOnInit() {
    this.usuarioService.getPerfil().subscribe({
      next: (data) => {
        this.form = {
          nombre_completo: data.nombre_completo || '',
          telefono: data.telefono || '',
          direccion: data.direccion || ''
        };
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudo cargar la información de tu perfil.');
        this.cargando.set(false);
      }
    });
  }

  guardarCambios() {
    if (!this.form.nombre_completo) return;
    this.guardando.set(true);
    this.mensaje.set(null);
    this.error.set(null);

    const payload = {
      nombre_completo: this.form.nombre_completo,
      telefono: this.form.telefono || null,
      direccion: this.form.direccion || null
    };

    this.usuarioService.actualizarPerfil(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensaje.set('Tus datos han sido actualizados correctamente.');
      },
      error: (err) => {
        console.error(err);
        this.guardando.set(false);
        this.error.set(err?.error?.detail || 'Error al actualizar el perfil.');
      }
    });
  }
}
