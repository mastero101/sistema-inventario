import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../services/inventory.service';
import { InventoryItem, InventoryItemFormData } from '../../../models/inventory-item.model';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.scss'
})
export class InventoryListComponent implements OnInit {
  tipoOptions: string[] = ['Laptop', 'Escritorio', 'Impresora', 'NoBreak/UPS', 'Telefono'];
  marcaOptions: string[] = ['HP', 'Dell', 'Acer', 'Asus', 'Brother', 'Epson', 'Canon', 'Samsung', 'LG'];
  searchTerm: string = '';
  selectedFilter: string = 'todos';
  selectedDepartamento: string = 'todos';
  showNewItemModal: boolean = false;
  showDeleteModal: boolean = false;
  showEditModal: boolean = false;
  showDetailsModal: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // Data properties
  inventoryItems: InventoryItem[] = [];
  itemToDelete?: InventoryItem;
  itemToEdit?: InventoryItem;
  selectedItem?: InventoryItem;
  newItem: Partial<InventoryItemFormData> = {};
  editForm: Partial<InventoryItemFormData> = {};

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  Math = Math;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  async loadInventory(): Promise<void> {
    this.isLoading = true;
    try {
      this.inventoryItems = await this.inventoryService.getInventoryItems();
    } catch (error) {
      this.errorMessage = 'Error al cargar el inventario';
      console.error('Error loading inventory:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async saveNewItem(): Promise<void> {
    if (!this.validateNewItem()) return;
    
    this.isLoading = true;
    try {
      const createdItem = await this.inventoryService.createInventoryItem(this.newItem as InventoryItemFormData);
      this.inventoryItems.push(createdItem);
      this.closeNewItemModal();
      this.errorMessage = null;
    } catch (error) {
      this.errorMessage = 'Error al crear el equipo';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  async deleteItem(): Promise<void> {
    if (!this.itemToDelete?.id) return;
    
    this.isLoading = true;
    try {
      await this.inventoryService.deleteInventoryItem(this.itemToDelete.id);
      this.inventoryItems = this.inventoryItems.filter(
        item => item.id !== this.itemToDelete?.id
      );
      this.showDeleteModal = false;
      this.itemToDelete = undefined;
      this.errorMessage = null;
    } catch (error) {
      this.errorMessage = 'Error al eliminar el equipo';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  async saveChanges(): Promise<void> {
    if (!this.itemToEdit?.id || !this.editForm) return;
    
    this.isLoading = true;
    try {
      const updatedItem = await this.inventoryService.updateInventoryItem(
        this.itemToEdit.id,
        this.editForm as InventoryItemFormData
      );
      const index = this.inventoryItems.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        this.inventoryItems[index] = updatedItem;
      }
      this.showEditModal = false;
      this.itemToEdit = undefined;
      this.editForm = {};
      this.errorMessage = null;
    } catch (error) {
      this.errorMessage = 'Error al actualizar el equipo';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  // UI Methods
  openNewItemModal(): void {
    this.newItem = {
      estado: 'Disponible',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    this.showNewItemModal = true;
    this.errorMessage = null;
  }

  closeNewItemModal(): void {
    this.showNewItemModal = false;
    this.newItem = {};
    this.errorMessage = null;
  }

  openEditModal(item: InventoryItem): void {
    this.itemToEdit = item;
    this.editForm = { ...item };
    this.showEditModal = true;
    this.errorMessage = null;
  }

  confirmDelete(item: InventoryItem): void {
    this.itemToDelete = item;
    this.showDeleteModal = true;
    this.errorMessage = null;
  }

  // Filter and search methods
  get filteredItems(): InventoryItem[] {
    return this.inventoryItems.filter(item => {
      const matchesSearch = !this.searchTerm || 
        item.marca.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.modelo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.serial.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = 
        this.selectedFilter === 'todos' || 
        item.estado.toLowerCase() === this.selectedFilter.toLowerCase();

      const matchesDepartamento = 
        this.selectedDepartamento === 'todos' || 
        item.departamento === this.selectedDepartamento;

      return matchesSearch && matchesStatus && matchesDepartamento;
    });
  }

  get paginatedItems(): InventoryItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredItems.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredItems.length / this.itemsPerPage);
  }

  // Validation
  private validateNewItem(): boolean {
    const required: (keyof InventoryItemFormData)[] = [
      'tipo', 'marca', 'modelo', 'serial', 'estado', 'ubicacion'
    ];
    const isValid = required.every(field => 
      this.newItem[field] !== undefined && 
      this.newItem[field] !== ''
    );
    
    if (!isValid) {
      this.errorMessage = 'Por favor complete todos los campos requeridos';
    }
    return isValid;
  }

  // Image handling
  async handleImageUpload(event: Event, item: InventoryItem): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      this.isLoading = true;
      try {
        const formData = new FormData();
        formData.append('imagen', file);
        // Here you would update the item with the new image
        // await this.inventoryService.updateItemImage(item.id, formData);
        console.log('Image uploaded:', file);
      } catch (error) {
        this.errorMessage = 'Error al subir la imagen';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  // Add missing methods
  exportToExcel(): void {
    // Implement Excel export logic
    const data = this.inventoryItems.map(item => ({
      ID: item.id,
      Tipo: item.tipo,
      Marca: item.marca,
      Modelo: item.modelo,
      Serial: item.serial,
      Estado: item.estado,
      'Asignado a': item.asignadoA || '',
      Ubicación: item.ubicacion,
      Departamento: item.departamento || '',
      'Fecha de registro': item.fechaRegistro,
      'Último mantenimiento': item.ultimoMantenimiento || ''
    }));
    
    console.log('Exportando datos:', data);
    // TODO: Implement actual Excel export
  }

  openDetailsModal(item: InventoryItem): void {
    this.selectedItem = item;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedItem = undefined;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
