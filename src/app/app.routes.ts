import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    title: 'Dashboard - Inventario Hospital'
  },
  {
    path: 'inventory',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/inventory/inventory-list/inventory-list.component')
          .then(m => m.InventoryListComponent),
        title: 'Lista de Equipos'
      },
      {
        path: 'new',
        loadComponent: () => import('./components/inventory/inventory-form/inventory-form.component')
          .then(m => m.InventoryFormComponent),
        title: 'Nuevo Equipo'
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./components/inventory/inventory-form/inventory-form.component')
          .then(m => m.InventoryFormComponent),
        title: 'Editar Equipo'
      }
    ]
  },
  {
    path: 'reports',
    loadComponent: () => import('./components/reports/reports.component')
      .then(m => m.ReportsComponent),
    title: 'Reportes'
  },
  {
    path: 'users',
    loadComponent: () => import('./components/shared/user-management/user-management.component')
      .then(m => m.UserManagementComponent),
    title: 'Gestión de Usuarios'
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./components/shared/user-profile/user-profile.component')
      .then(m => m.UserProfileComponent),
    title: 'Mi Perfil'
  },
  {
    path: '**',
    loadComponent: () => import('./components/shared/not-found/not-found.component')
      .then(m => m.NotFoundComponent),
    title: 'Página no encontrada'
  }
];
