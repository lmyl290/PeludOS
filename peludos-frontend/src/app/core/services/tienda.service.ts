import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_CONFIG } from '../api.config';

@Injectable({ providedIn: 'root' })
export class TiendaService {
  private http = inject(HttpClient);
  private baseUrl = API_CONFIG.baseUrl;

  carrito = signal<any>({ items: [] });

  totalItems = computed(() => {
    const items = this.carrito()?.items || [];
    return items.reduce((acc: number, item: any) => acc + (item.cantidad || 0), 0);
  });

  totalPagar = computed(() => {
    const items = this.carrito()?.items || [];
    return items.reduce((acc: number, item: any) => acc + Number(item.subtotal || 0), 0);
  });

  getProductos() {
    return this.http.get<any[]>(this.baseUrl + '/productos');
  }

  cargarCarrito() {
    return this.http.get<any>(this.baseUrl + '/carrito').pipe(
      tap((res) => this.carrito.set(res))
    );
  }

  agregarAlCarrito(idProducto: number, cantidad: number = 1) {
    return this.http.post<any>(this.baseUrl + '/carrito/items', {
      id_producto: idProducto,
      cantidad: cantidad
    }).pipe(
      tap((res) => this.carrito.set(res))
    );
  }

  actualizarCantidad(idDetalleCarrito: number, cantidad: number) {
    return this.http.patch<any>(this.baseUrl + '/carrito/items/' + idDetalleCarrito, {
      cantidad: cantidad
    }).pipe(
      tap((res) => this.carrito.set(res))
    );
  }

  eliminarItem(idDetalleCarrito: number) {
    return this.http.delete<any>(this.baseUrl + '/carrito/items/' + idDetalleCarrito).pipe(
      tap((res) => this.carrito.set(res))
    );
  }

  crearPedido(direccionEntrega: string, notas: string = '') {
    return this.http.post<any>(this.baseUrl + '/pedidos', {
      direccion_entrega: direccionEntrega,
      notas: notas || null
    });
  }
}
