import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TiendaService } from '../../core/services/tienda.service';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-[#FAF8FF] text-slate-950">
      <nav class="bg-[#EDE9FE]/80 backdrop-blur-xs border-b border-[#DDD6FE] px-8 py-4 flex justify-between items-center">
        <a routerLink="/dashboard" class="text-[#9C27B0] font-bold hover:underline flex items-center gap-2 text-sm">
          ← Volver al Panel
        </a>

        <span class="text-xl font-extrabold text-slate-950">Tienda <span class="text-[#9C27B0]">PeludOS</span> 🏪</span>

        <button routerLink="/carrito"
          class="flex items-center gap-2 bg-white hover:bg-[#F3E8FF] border border-[#C4B5FD] text-slate-950 px-4 py-1.5 rounded-full text-sm font-bold shadow-2xs transition cursor-pointer">
          <span>🛒</span>
          <span>Carrito</span>
          <span class="bg-[#9C27B0] text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full">
            {{ tiendaService.totalItems() }}
          </span>
        </button>
      </nav>

      <main class="p-8 lg:p-12 max-w-7xl mx-auto">
        <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h2 class="text-3xl font-extrabold text-slate-950">Catálogo de <span class="text-[#9C27B0]">Productos</span></h2>
            <p class="text-slate-700 text-sm mt-1 font-medium">Alimentos, accesorios, juguetes y cuidado para tus mascotas.</p>
          </div>

          <div class="flex flex-wrap gap-3 w-full md:w-auto">
            <select [ngModel]="categoriaSeleccionada()" (ngModelChange)="categoriaSeleccionada.set($event)"
              class="px-4 py-2.5 rounded-xl bg-white border border-[#C4B5FD] focus:outline-none focus:border-[#9C27B0] text-sm font-semibold text-slate-800">
              <option value="">Todas las categorías</option>
              <option *ngFor="let cat of categorias()" [value]="cat">{{ cat }}</option>
            </select>

            <input type="text" [ngModel]="busqueda()" (ngModelChange)="busqueda.set($event)"
              placeholder="Buscar producto..."
              class="w-full md:w-64 px-4 py-2.5 rounded-xl bg-white border border-[#C4B5FD] focus:outline-none focus:border-[#9C27B0] text-sm">
          </div>
        </div>

        <div *ngIf="mensaje()" class="bg-[#FAE8FF] border border-[#F0ABFC] text-[#7B1FA2] font-bold p-3.5 rounded-xl mb-6 text-sm flex justify-between items-center">
          <span>✓ {{ mensaje() }}</span>
          <a routerLink="/carrito" class="underline text-xs">Ver carrito →</a>
        </div>

        <div *ngIf="error()" class="bg-pink-50 border border-pink-200 text-pink-800 p-4 rounded-xl mb-6 text-sm">
          {{ error() }}
        </div>

        <div *ngIf="cargando()" class="text-slate-600 text-sm">Cargando productos...</div>

        <div *ngIf="!cargando() && !error() && productosFiltrados().length === 0"
          class="bg-white p-10 rounded-2xl border border-[#DDD6FE] text-center">
          <p class="text-slate-800 font-semibold mb-2">No hay productos disponibles en este momento.</p>
          <p class="text-slate-500 text-sm">Prueba limpiando los filtros o registra productos desde tu API.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div *ngFor="let p of productosFiltrados()"
            class="bg-white rounded-2xl shadow-xs border border-[#DDD6FE] hover:border-[#9C27B0] overflow-hidden flex flex-col justify-between transition">
            <div>
              <div class="h-44 bg-[#F3E8FF] flex items-center justify-center overflow-hidden relative">
                <img *ngIf="p.imagen_url" [src]="p.imagen_url" [alt]="p.nombre_producto" class="w-full h-full object-cover">
                <span *ngIf="!p.imagen_url" class="text-5xl">🦴</span>
                <span *ngIf="p.categoria"
                  class="absolute top-3 left-3 bg-white/95 text-[#9C27B0] border border-[#DDD6FE] text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg">
                  {{ p.categoria }}
                </span>
              </div>

              <div class="p-5">
                <h3 class="text-lg font-extrabold text-slate-950 mb-1">{{ p.nombre_producto }}</h3>
                <p class="text-slate-600 text-xs line-clamp-2 mb-3">{{ p.descripcion || 'Producto seleccionado para el bienestar de tu peludo.' }}</p>
                <p class="text-xs text-slate-500">
                  Disponible: <strong class="text-slate-800">{{ p.stock }} {{ p.unidad_medida || 'unidades' }}</strong>
                </p>
              </div>
            </div>

            <div class="px-5 pb-5 pt-3 border-t border-[#EDE9FE] flex items-center justify-between gap-2">
              <span class="text-xl font-extrabold text-[#9C27B0]">
                \${{ p.precio_venta | number:'1.0-0' }}
              </span>

              <button (click)="agregar(p)" [disabled]="p.stock <= 0 || agregandoId() === p.id_producto"
                class="bg-[#9C27B0] hover:bg-[#7B1FA2] disabled:opacity-40 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer">
                {{ p.stock <= 0 ? 'Agotado' : (agregandoId() === p.id_producto ? 'Agregando...' : '+ Agregar') }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class TiendaComponent implements OnInit {
  tiendaService = inject(TiendaService);

  productos = signal<any[]>([]);
  busqueda = signal<string>('');
  categoriaSeleccionada = signal<string>('');
  cargando = signal<boolean>(true);
  agregandoId = signal<number | null>(null);
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);

  categorias = computed(() => {
    const cats = this.productos().map(p => p.categoria).filter(Boolean);
    return Array.from(new Set(cats));
  });

  productosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const cat = this.categoriaSeleccionada();
    return this.productos().filter(p => {
      const coincideTexto = !q || (p.nombre_producto && p.nombre_producto.toLowerCase().includes(q));
      const coincideCat = !cat || p.categoria === cat;
      return coincideTexto && coincideCat;
    });
  });

  ngOnInit() {
    forkJoin({
      productos: this.tiendaService.getProductos(),
      carrito: this.tiendaService.cargarCarrito()
    }).subscribe({
      next: (res) => {
        this.productos.set(res.productos);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar los productos de la tienda.');
        this.cargando.set(false);
      }
    });
  }

  agregar(producto: any) {
    this.agregandoId.set(producto.id_producto);
    this.mensaje.set(null);

    this.tiendaService.agregarAlCarrito(producto.id_producto, 1).subscribe({
      next: () => {
        this.agregandoId.set(null);
        this.mensaje.set('Agregaste "' + producto.nombre_producto + '" al carrito.');
      },
      error: (err) => {
        console.error(err);
        this.agregandoId.set(null);
        this.error.set('No se pudo agregar el producto al carrito.');
      }
    });
  }
}
