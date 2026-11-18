import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  
  { 
    path: 'mascotas', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/mascotas/mascotas.component').then(m => m.MascotasComponent) 
  },

  { 
    path: 'citas', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/citas/citas.component').then(m => m.CitasComponent) 
  },

  { 
    path: 'historial', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/historial/historial.component').then(m => m.HistorialComponent) 
  },

  { 
    path: 'recordatorios', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/recordatorios/recordatorios.component').then(m => m.RecordatoriosComponent) 
  },

  { 
    path: 'veterinarias', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/veterinarias/veterinarias.component').then(m => m.VeterinariasComponent) 
  },

  { 
    path: 'tienda', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/tienda/tienda.component').then(m => m.TiendaComponent) 
  },

  { 
    path: 'carrito', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/tienda/carrito.component').then(m => m.CarritoComponent) 
  },

  { 
    path: 'perfil', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/perfil/perfil.component').then(m => m.PerfilComponent) 
  },


  { path: '**', redirectTo: 'login' }
];
