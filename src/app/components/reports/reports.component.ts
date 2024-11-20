import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface InventoryItem {
  id: string;
  tipo: string;
  marca: string;
  modelo: string;
  serial: string;
  estado: 'Disponible' | 'Asignado' | 'Mantenimiento' | 'Dañado';
  asignadoA?: string;
  ubicacion: string;
  departamento: string;
  fechaRegistro: string;
  ultimoMantenimiento?: string;
}

interface StatsMap {
  [key: string]: number;
}

interface Report {
  id: string;
  tipo: string;
  fechaGeneracion: string;
  generadoPor: string;
  estado: 'Generado' | 'En Proceso' | 'Error';
  formatoArchivo: 'PDF' | 'Excel';
  periodo: {
    inicio: string;
    fin: string;
  };
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  reports: Report[] = [];
  
  // Filtros
  filterCriteria = {
    tipo: '',
    estado: '',
    fechaInicio: '',
    fechaFin: ''
  };

  // Paginación
  itemsPerPage: number = 10;
  currentPage: number = 1;

  selectedReport: Report | null = null;

  ngOnInit() {
    this.loadReports();
  }

  // Acciones de Reportes
  generateReport(): void {
    const newReport: Report = {
      id: `REP${String(this.reports.length + 1).padStart(3, '0')}`,
      tipo: this.filterCriteria.tipo || 'Reporte General',
      fechaGeneracion: new Date().toISOString().split('T')[0],
      generadoPor: 'Admin',
      estado: 'Generado',
      formatoArchivo: 'PDF',
      periodo: {
        inicio: this.filterCriteria.fechaInicio || new Date().toISOString().split('T')[0],
        fin: this.filterCriteria.fechaFin || new Date().toISOString().split('T')[0]
      }
    };

    this.reports.unshift(newReport);
    alert('Reporte generado exitosamente');
  }

  downloadReport(report: Report): void {
    // Aquí iría la lógica de descarga real
    alert(`Descargando reporte ${report.id} en formato ${report.formatoArchivo}`);
  }

  viewReportDetails(report: Report): void {
    this.selectedReport = report;
  }

  closeReportDetails(): void {
    this.selectedReport = null;
  }

  deleteReport(report: Report): void {
    if (confirm('¿Está seguro de eliminar este reporte?')) {
      this.reports = this.reports.filter(r => r.id !== report.id);
      alert('Reporte eliminado exitosamente');
    }
  }

  // Paginación
  get filteredReports(): Report[] {
    return this.reports.filter(report => {
      if (this.filterCriteria.tipo && report.tipo !== this.filterCriteria.tipo) {
        return false;
      }
      if (this.filterCriteria.estado && report.estado !== this.filterCriteria.estado) {
        return false;
      }
      if (this.filterCriteria.fechaInicio) {
        const startDate = new Date(this.filterCriteria.fechaInicio);
        if (new Date(report.fechaGeneracion) < startDate) return false;
      }
      if (this.filterCriteria.fechaFin) {
        const endDate = new Date(this.filterCriteria.fechaFin);
        if (new Date(report.fechaGeneracion) > endDate) return false;
      }
      return true;
    });
  }

  get paginatedReports(): Report[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredReports.slice(start, start + this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.itemsPerPage, this.filteredReports.length);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredReports.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  private loadReports(): void {
    // Datos de ejemplo
    this.reports = [
      {
        id: 'REP001',
        tipo: 'Reporte General',
        fechaGeneracion: '2024-01-20',
        generadoPor: 'Admin',
        estado: 'Generado',
        formatoArchivo: 'PDF',
        periodo: {
          inicio: '2024-01-01',
          fin: '2024-01-31'
        }
      },
      {
        id: 'REP002',
        tipo: 'Por Departamento',
        fechaGeneracion: '2024-01-15',
        generadoPor: 'Admin',
        estado: 'En Proceso',
        formatoArchivo: 'Excel',
        periodo: {
          inicio: '2024-01-01',
          fin: '2024-01-15'
        }
      },
      {
        id: 'REP003',
        tipo: 'Por Estado',
        fechaGeneracion: '2024-01-10',
        generadoPor: 'Admin',
        estado: 'Error',
        formatoArchivo: 'PDF',
        periodo: {
          inicio: '2023-12-01',
          fin: '2024-01-10'
        }
      }
    ];
  }
}
