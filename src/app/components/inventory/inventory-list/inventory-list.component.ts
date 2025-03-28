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
  // Opciones para los selectores
  tipoOptions: string[] = ['Laptop', 'Escritorio', 'Impresora', 'NoBreak/UPS', 'Telefono'];
  marcaOptions: string[] = ['HP', 'Dell', 'Acer', 'Asus', 'Brother', 'Epson', 'Canon', 'Samsung', 'LG', 'APC', 'Cyberpower'];
  departamentoOptions: string[] = ['TI', 'Ventas', 'Contabilidad', 'RRHH', 'Operaciones'];
  estadoOptions: string[] = ['Disponible', 'Asignado', 'Mantenimiento', 'Dañado'];
  
  // Filtros de búsqueda
  searchTerm: string = '';
  selectedFilter: string = 'todos';
  selectedDepartamento: string = 'todos';
  fechaDesde: string = '';
  fechaHasta: string = '';
  
  // Estados de UI
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
  
  // Imagen seleccionada para nuevo item o edición
  selectedFile: File | null = null;
  selectedEditFile: File | null = null;

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  Math = Math;

  constructor(
    private inventoryService: InventoryService,
  ) {}

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

  async searchInventory(): Promise<void> {
    this.isLoading = true;
    try {
      this.inventoryItems = await this.inventoryService.searchInventory(
        this.searchTerm,
        this.selectedFilter !== 'todos' ? this.selectedFilter : undefined,
        this.selectedDepartamento !== 'todos' ? this.selectedDepartamento : undefined,
        this.fechaDesde,
        this.fechaHasta
      );
      this.currentPage = 1; // Reset to first page after search
      this.errorMessage = null;
    } catch (error) {
      this.errorMessage = 'Error al buscar en el inventario';
      console.error('Error searching inventory:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async saveNewItem(): Promise<void> {
    if (!this.validateNewItem()) return;
    
    this.isLoading = true;
    try {
      // Ensure proper typing
      const itemToCreate: InventoryItemFormData = {
        tipo: this.newItem.tipo!,
        marca: this.newItem.marca!,
        modelo: this.newItem.modelo!,
        serial: this.newItem.serial!,
        estado: this.newItem.estado! as 'Disponible' | 'Asignado' | 'Mantenimiento' | 'Dañado',
        ubicacion: this.newItem.ubicacion!,
        fechaRegistro: this.newItem.fechaRegistro || new Date().toISOString().split('T')[0],
        asignadoA: this.newItem.asignadoA,
        ultimoMantenimiento: this.newItem.ultimoMantenimiento,
        departamento: this.newItem.departamento as any,
        imagen: this.selectedFile || undefined
      };
      
      const createdItem = await this.inventoryService.createInventoryItem(itemToCreate);
      this.inventoryItems.unshift(createdItem); // Add to beginning of array
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
      // Ensure proper typing for update
      const itemToUpdate: InventoryItemFormData = {
        tipo: this.editForm.tipo!,
        marca: this.editForm.marca!,
        modelo: this.editForm.modelo!,
        serial: this.editForm.serial!,
        estado: this.editForm.estado! as 'Disponible' | 'Asignado' | 'Mantenimiento' | 'Dañado',
        ubicacion: this.editForm.ubicacion!,
        fechaRegistro: this.editForm.fechaRegistro!,
        asignadoA: this.editForm.asignadoA,
        ultimoMantenimiento: this.editForm.ultimoMantenimiento,
        departamento: this.editForm.departamento as any,
        imagen: this.selectedEditFile || undefined
      };
      
      const updatedItem = await this.inventoryService.updateInventoryItem(
        this.itemToEdit.id,
        itemToUpdate
      );
      
      const index = this.inventoryItems.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        this.inventoryItems[index] = updatedItem;
      }
      
      this.showEditModal = false;
      this.itemToEdit = undefined;
      this.editForm = {};
      this.selectedEditFile = null;
      this.errorMessage = null;
    } catch (error) {
      this.errorMessage = 'Error al actualizar el equipo';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  // Manejo de archivos
  onFileSelected(event: Event, isEdit: boolean = false): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (isEdit) {
        this.selectedEditFile = input.files[0];
      } else {
        this.selectedFile = input.files[0];
      }
    }
  }

  // UI Methods
  openNewItemModal(): void {
    this.newItem = {
      estado: 'Disponible',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    this.selectedFile = null;
    this.showNewItemModal = true;
    this.errorMessage = null;
  }

  closeNewItemModal(): void {
    this.showNewItemModal = false;
    this.newItem = {};
    this.selectedFile = null;
    this.errorMessage = null;
  }

  openEditModal(item: InventoryItem): void {
    this.itemToEdit = item;
    this.editForm = { ...item };
    this.selectedEditFile = null;
    this.showEditModal = true;
    this.errorMessage = null;
  }

  confirmDelete(item: InventoryItem): void {
    this.itemToDelete = item;
    this.showDeleteModal = true;
    this.errorMessage = null;
  }

  // Get paginated items
  get filteredItems(): InventoryItem[] {
    return this.inventoryItems;
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

  // Pagination methods
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

  // Export to Excel method (mock for now)
  exportToExcel(): void {
    console.log('Exportando datos:', this.inventoryItems);
    // Implementación real requeriría una librería como ExcelJS
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedFilter = 'todos';
    this.selectedDepartamento = 'todos';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.loadInventory();
  }

  openDetailsModal(item: InventoryItem): void {
    this.selectedItem = item;
    this.showDetailsModal = true;
  }
  
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedItem = undefined;
  }
}