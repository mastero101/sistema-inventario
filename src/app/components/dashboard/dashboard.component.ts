import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, GeneralStats, RecentChange } from '../../services/stats.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats: GeneralStats | null = null;
  recentChanges: RecentChange[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private statsService: StatsService) { }

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading = true;
      const [stats, changes] = await Promise.all([
        this.statsService.getGeneralStats(),
        this.statsService.getRecentChanges()
      ]);
      this.stats = stats;
      this.recentChanges = changes;
    } catch (error) {
      this.errorMessage = 'No se pudieron cargar las estadísticas';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  // Getters for specific stats used in template
  get totalEquipos(): number { return this.stats?.total || 0; }
  get equiposAsignados(): number { return this.stats?.porEstado?.['Asignado'] || 0; }
  get enMantenimiento(): number { return this.stats?.porEstado?.['Mantenimiento'] || 0; }
  get disponibles(): number { return this.stats?.porEstado?.['Disponible'] || 0; }
}
