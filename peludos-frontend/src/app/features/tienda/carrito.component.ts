import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TiendaService } from '../../core/services/tienda.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-[#FAF8FF] text-slate-950">
      <nav class="bg-[#EDE9FE]/80 backdrop-blur-xs border-b border-[#DDD6FE] px-8 py-4 flex justify-between items-center">
        <a routerLink="/tienda" class="text-[#9C27B0] font-bold hover:underline flex items-center gap-2 text-sm">
          ← Seguir comprando
        </a>
        <span class="text-xl font-extrabold text-slate-950">Mi <span class="text-[#9C27B0]">Carrito</span> 🛒</span>
        <a routerLink="/dashboard" class="text-slate-700 font-bold hover:text-[#9C27B0] text-sm">Inicio</a>
      </nav>

      <main class="p-8 lg:p-12 max-w-5xl mx-auto">
        <h2 class="text-3xl font-extrabold text-slate-950 mb-6">Resumen de tu <span class="text-[#9C27B0]">Compra</span></h2>

        <div *ngIf="pedidoExitoso()" class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl mb-6">
          <h3 class="font-extrabold text-lg mb-1">¡Pedido realizado con éxito! 🎉</h3>
          <p class="text-sm mb-4">Tu compra ha sido registrada correctamente.</p>
          <a routerLink="/tienda" class="bg-[#9C27B0] text-white text-xs font-bold px-4 py-2 rounded-xl">Volver a la tienda</a>
        </div>

        <div *ngIf="error()" class="bg-pink-50 border border-pink-200 text-pink-800 p-4 rounded-xl mb-6 text-sm">
          {{ error() }}
        </div>

        <div *ngIf="cargando()" class="text-slate-600 text-sm">Cargando carrito...</div>

        <div *ngIf="!cargando() && items().length === 0 && !pedidoExitoso()"
          class="bg-white p-12 rounded-2xl border border-[#DDD6FE] text-center">
          <p class="text-4xl mb-3">🛒</p>
          <p class="text-slate-800 font-bold text-lg mb-2">Tu carrito está vacío</p>
          <p class="text-slate-500 text-sm mb-6">Explora la tienda para consentir a tus peludos.</p>
          <a routerLink="/tienda" class="bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition">
            Ir a la Tienda
          </a>
        </div>

        <div *ngIf="!cargando() && items().length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Lista de productos -->
          <div class="lg:col-span-2 space-y-4">
            <div *ngFor="let item of items()"
              class="bg-white p-5 rounded-2xl shadow-xs border border-[#DDD6FE] flex items-center justify-between gap-4">
              <div>
                <h3 class="font-extrabold text-slate-950 text-base">{{ nombreProducto(item.id_producto) }}</h3>
                <p class="text-xs text-slate-600 mt-0.5">Precio unitario: \${{ item.precio_unitario | number:'1.0-0' }}</p>
                <p class="text-sm font-extrabold text-[#9C27B0] mt-1">Subtotal: \${{ item.subtotal | number:'1.0-0' }}</p>
              </div>

              <div class="flex items-center gap-3">
                <div class="flex items-center border border-[#C4B5FD] rounded-xl overflow-hidden bg-[#FAF8FF]">
                  <button (click)="cambiarCantidad(item, item.cantidad - 1)"
                    class="px-3 py-1.5 font-bold text-slate-800 hover:bg-[#EDE9FE] cursor-pointer">-</button>
                  <span class="px-3 py-1.5 font-extrabold text-sm text-slate-950">{{ item.cantidad }}</span>
                  <button (click)="cambiarCantidad(item, item.cantidad + 1)"
                    class="px-3 py-1.5 font-bold text-slate-800 hover:bg-[#EDE9FE] cursor-pointer">+</button>
                </div>

                <button (click)="quitar(item.id_detalle_carrito)" class="text-xs font-bold text-pink-600 hover:underline cursor-pointer">
                  Quitar
                </button>
              </div>
            </div>
          </div>

          <!-- Total y envío -->
          <div class="bg-white p-6 rounded-2xl shadow-xs border border-[#C4B5FD] h-fit space-y-4">
            <h3 class="text-lg font-extrabold text-slate-950 border-b border-[#EDE9FE] pb-3">Total del Pedido</h3>

            <div class="flex justify-between text-sm text-slate-700">
              <span>Artículos ({{ tiendaService.totalItems() }})</span>
              <span class="font-bold">\${{ tiendaService.totalPagar() | number:'1.0-0' }}</span>
            </div>

            <div class="flex justify-between text-lg font-extrabold text-slate-950 border-t border-[#EDE9FE] pt-3">
              <span>Total</span>
              <span class="text-[#9C27B0]">\${{ tiendaService.totalPagar() | number:'1.0-0' }}</span>
            </div>

            <div class="pt-2 space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">Dirección de entrega *</label>
                <input type="text" [(ngModel)]="direccion" placeholder="Ej. Calle 123 # 45-67"
                  class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">Notas (opcional)</label>
                <input type="text" [(ngModel)]="notas" placeholder="Ej. Dejar en portería"
                  class="w-full px-3.5 py-2 rounded-xl border border-[#DDD6FE] focus:outline-none focus:border-[#9C27B0] text-sm">
              </div>

              <button (click)="confirmarCompra()" [disabled]="procesando() || !direccion"
                class="w-full bg-[#9C27B0] hover:bg-[#7B1FA2] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-xs cursor-pointer text-sm">
                {{ procesando() ? 'Procesando...' : 'Finalizar Compra' }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class CarritoComponent implements OnInit {
  tiendaService = inject(TiendaService);

  productos = signal<any[]>([]);
  cargando = signal<boolean>(true);
  procesando = signal<boolean>(false);
  pedidoExitoso = signal<boolean>(false);
  error = signal<string | null>(null);

  direccion = '';
  notas = '';

  items() {
    return this.tiendaService.carrito()?.items || [];
  }

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
        this.error.set('Error al cargar el carrito.');
        this.cargando.set(false);
      }
    });
  }

  nombreProducto(idProducto: number): string {
    return this.productos().find(p => p.id_producto === idProducto)?.nombre_producto || 'Producto #' + idProducto;
  }

  cambiarCantidad(item: any, nuevaCantidad: number) {
    if (nuevaCantidad < 1) {
      this.quitar(item.id_detalle_carrito);
      return;
    }
    this.tiendaService.actualizarCantidad(item.id_detalle_carrito, nuevaCantidad).subscribe();
  }

  quitar(idDetalleCarrito: number) {
    this.tiendaService.eliminarItem(idDetalleCarrito).subscribe();
  }

  confirmarCompra() {
    if (!this.direccion) return;
    this.procesando.set(true);
    this.error.set(null);

    this.tiendaService.crearPedido(this.direccion, this.notas).subscribe({
      next: () => {
        this.tiendaService.cargarCarrito().subscribe();
        this.procesando.set(false);
        this.pedidoExitoso.set(true);
      },
      error: (err) => {
        console.error(err);
        this.error.set(err?.error?.detail || 'No se pudo procesar el pedido.');
        this.procesando.set(false);
      }
    });
  }
}
