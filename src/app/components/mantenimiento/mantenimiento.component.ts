import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem } from '../../models/inventory-item.model';

@Component({
    selector: 'app-mantenimiento',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './mantenimiento.component.html',
    styleUrls: ['./mantenimiento.component.scss']
})
export class MantenimientoComponent implements OnInit {
    isLoading: boolean = false;
    errorMessage: string | null = null;
    itemsInMaintenance: InventoryItem[] = [];
    searchTerm: string = '';

    constructor(private inventoryService: InventoryService) { }

    ngOnInit(): void {
        this.loadMaintenanceItems();
    }

    async loadMaintenanceItems(): Promise<void> {
        this.isLoading = true;
        try {
            const allItems = await this.inventoryService.getInventoryItems();
            // Filtrar items que están en mantenimiento o que requieren atención
            this.itemsInMaintenance = allItems.filter(item =>
                item.estado === 'Mantenimiento' || item.estado === 'Dañado'
            );
        } catch (error) {
            this.errorMessage = 'Error al cargar los equipos en mantenimiento';
            console.error(error);
        } finally {
            this.isLoading = false;
        }
    }

    getStatusClass(status: string): string {
        switch (status?.toLowerCase()) {
            case 'mantenimiento':
                return 'bg-amber-100 text-amber-700 border border-amber-200';
            case 'dañado':
                return 'bg-red-100 text-red-700 border border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    }

    async returnToOperation(item: InventoryItem): Promise<void> {
        if (!item.id) return;

        if (confirm(`¿Confirmar que el equipo ${item.marca} ${item.modelo} ha sido reparado y está listo para operar?`)) {
            try {
                this.isLoading = true;
                // Cambiar estado a Disponible
                const updatedData = { ...item, estado: 'Disponible' as const };
                // El servicio usa InventoryItemFormData, pero el modelo es similar
                await this.inventoryService.updateInventoryItem(item.id, updatedData as any);
                await this.loadMaintenanceItems();
            } catch (error) {
                this.errorMessage = 'Error al actualizar el estado del equipo';
            } finally {
                this.isLoading = false;
            }
        }
    }

    get filteredItems() {
        if (!this.searchTerm) return this.itemsInMaintenance;
        const search = this.searchTerm.toLowerCase();
        return this.itemsInMaintenance.filter(e =>
            e.marca.toLowerCase().includes(search) ||
            e.modelo.toLowerCase().includes(search) ||
            e.serial.toLowerCase().includes(search)
        );
    }

    // Lógica para reportes de mantenimiento
    showReportModal: boolean = false;
    selectedItemForReport: InventoryItem | null = null;
    newReport = {
        item_id: '',
        tipo_mantenimiento: 'Correctivo',
        descripcion: '',
        tecnico: '',
        costo: 0,
        notas: '',
        fecha: new Date().toISOString().split('T')[0]
    };

    openReportModal(item: InventoryItem): void {
        this.selectedItemForReport = item;
        this.newReport = {
            item_id: item.id || '',
            tipo_mantenimiento: 'Correctivo',
            descripcion: '',
            tecnico: '',
            costo: 0,
            notas: '',
            fecha: new Date().toISOString().split('T')[0]
        };
        this.showReportModal = true;
    }

    closeReportModal(): void {
        this.showReportModal = false;
        this.selectedItemForReport = null;
    }

    async saveReport(): Promise<void> {
        if (!this.newReport.descripcion || !this.newReport.tecnico) {
            this.errorMessage = 'Por favor complete los campos requeridos (Descripción y Técnico)';
            return;
        }

        this.isLoading = true;
        try {
            await this.inventoryService.createMaintenanceReport(this.newReport as any);
            this.closeReportModal();
            alert('Reporte de mantenimiento guardado correctamente');
        } catch (error) {
            this.errorMessage = 'Error al guardar el reporte de mantenimiento';
            console.error(error);
        } finally {
            this.isLoading = false;
        }
    }

    // Lógica para historial de mantenimiento
    showHistoryModal: boolean = false;
    maintenanceHistory: any[] = [];
    selectedItemForHistory: InventoryItem | null = null;

    async openHistoryModal(item: InventoryItem): Promise<void> {
        if (!item.id) return;
        this.selectedItemForHistory = item;
        this.isLoading = true;
        try {
            this.maintenanceHistory = await this.inventoryService.getMaintenanceReports(item.id);
            this.showHistoryModal = true;
        } catch (error) {
            this.errorMessage = 'Error al cargar el historial de mantenimiento';
        } finally {
            this.isLoading = false;
        }
    }

    closeHistoryModal(): void {
        this.showHistoryModal = false;
        this.selectedItemForHistory = null;
        this.maintenanceHistory = [];
    }

    // Lógica de descarga PDF
    async printHistory(): Promise<void> {
        if (!this.selectedItemForHistory?.id) return;
        try {
            await this.inventoryService.downloadMaintenancePDF(this.selectedItemForHistory.id);
        } catch (error) {
            this.errorMessage = 'Error al generar el PDF del reporte';
            console.error(error);
        }
    }
}



