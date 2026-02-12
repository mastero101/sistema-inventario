import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem } from '../../models/inventory-item.model';

@Component({
    selector: 'app-equipos',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './equipos.component.html',
    styleUrls: ['./equipos.component.scss']
})
export class EquiposComponent implements OnInit {
    isLoading: boolean = false;
    errorMessage: string | null = null;
    equipos: InventoryItem[] = [];
    searchTerm: string = '';

    constructor(private inventoryService: InventoryService) { }

    ngOnInit(): void {
        this.loadEquipos();
    }

    async loadEquipos(): Promise<void> {
        this.isLoading = true;
        try {
            this.equipos = await this.inventoryService.getInventoryItems();
            // En un caso real, podríamos filtrar aquí para mostrar solo "Equipos" específicos
            // o dejarlo como una vista general de hardware.
        } catch (error) {
            this.errorMessage = 'Error al cargar los equipos';
            console.error(error);
        } finally {
            this.isLoading = false;
        }
    }

    getStatusClass(status: string): string {
        switch (status?.toLowerCase()) {
            case 'disponible':
                return 'bg-green-100 text-green-700 border border-green-200';
            case 'asignado':
                return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'mantenimiento':
                return 'bg-amber-100 text-amber-700 border border-amber-200';
            case 'dañado':
                return 'bg-red-100 text-red-700 border border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    }

    get filteredEquipos() {
        if (!this.searchTerm) return this.equipos;
        const search = this.searchTerm.toLowerCase();
        return this.equipos.filter(e =>
            e.marca.toLowerCase().includes(search) ||
            e.modelo.toLowerCase().includes(search) ||
            e.serial.toLowerCase().includes(search) ||
            e.tipo.toLowerCase().includes(search)
        );
    }
}
