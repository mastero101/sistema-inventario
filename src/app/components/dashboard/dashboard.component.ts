import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  // Datos de ejemplo
  statsData = {
    totalEquipos: 156,
    equiposAsignados: 132,
    enMantenimiento: 8,
    disponibles: 16
  };
}
