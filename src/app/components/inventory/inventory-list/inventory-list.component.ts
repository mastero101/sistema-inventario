import { Component } from '@angular/core';
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
  fechaRegistro: string;
  ultimoMantenimiento?: string;
  departamento?: string;
  imagen?: string;
}

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.scss'
})
export class InventoryListComponent {
  searchTerm: string = '';
  selectedFilter: string = 'todos';
  selectedDepartamento: string = 'todos';
  showNewItemModal: boolean = false;
  showDeleteModal: boolean = false;
  itemToDelete?: InventoryItem;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  showEditModal: boolean = false;
  itemToEdit?: InventoryItem;
  editForm: Partial<InventoryItem> = {};
  showDetailsModal: boolean = false;
  selectedItem?: InventoryItem;
  newItem: Partial<InventoryItem> = {};

  // Agregar Math como propiedad
  Math = Math;

  // Datos de ejemplo expandidos
  inventoryItems: InventoryItem[] = [
    {
      id: 'EQ001',
      tipo: 'Laptop',
      marca: 'Dell',
      modelo: 'Latitude 5420',
      serial: 'DLL2024001',
      estado: 'Asignado',
      asignadoA: 'Juan Pérez',
      ubicacion: 'Oficina 101',
      fechaRegistro: '2024-01-15',
      ultimoMantenimiento: '2023-12-20',
      departamento: 'Desarrollo'
    },
    {
      id: 'EQ002',
      tipo: 'Monitor',
      marca: 'HP',
      modelo: 'P24h G4',
      serial: 'HP2024002',
      estado: 'Disponible',
      asignadoA: 'Juan Gómez',
      ubicacion: 'Almacén',
      fechaRegistro: '2024-01-10',
      departamento: 'TI'
    },
    {
      id: 'EQ003',
      tipo: 'Desktop',
      marca: 'Lenovo',
      modelo: 'ThinkCentre M70q',
      serial: 'LEN2024003',
      estado: 'Mantenimiento',
      asignadoA: 'Ana Gómez',
      ubicacion: 'Taller TI',
      fechaRegistro: '2024-01-05',
      ultimoMantenimiento: '2024-01-20',
      departamento: 'Contabilidad'
    }
  ];

  // Métodos para la gestión del inventario
  openNewItemModal(): void {
    this.newItem = {
      estado: 'Disponible', // Valor por defecto
      fechaRegistro: new Date().toISOString().split('T')[0] // Fecha actual
    };
    this.showNewItemModal = true;
  }

  closeNewItemModal(): void {
    this.showNewItemModal = false;
    this.newItem = {};
  }

  confirmDelete(item: InventoryItem): void {
    this.itemToDelete = item;
    this.showDeleteModal = true;
  }

  deleteItem(): void {
    if (this.itemToDelete) {
      this.inventoryItems = this.inventoryItems.filter(
        item => item.id !== this.itemToDelete?.id
      );
      this.showDeleteModal = false;
      this.itemToDelete = undefined;
    }
  }

  // Métodos para filtrado y búsqueda
  get filteredItems(): InventoryItem[] {
    return this.inventoryItems.filter(item => {
      const matchesSearch = 
        item.marca.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.modelo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.serial.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = 
        this.selectedFilter === 'todos' || 
        item.estado.toLowerCase() === this.selectedFilter;

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

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Método para exportar a Excel
  exportToExcel(): void {
    // Aquí iría la lógica para exportar a Excel
    console.log('Exportando a Excel...');
  }

  // Método para abrir el modal de edición
  openEditModal(item: InventoryItem): void {
    this.itemToEdit = item;
    this.editForm = { ...item }; // Crea una copia del item para editar
    this.showEditModal = true;
  }

  // Método para guardar los cambios
  saveChanges(): void {
    if (this.itemToEdit && this.editForm) {
      const index = this.inventoryItems.findIndex(item => item.id === this.itemToEdit?.id);
      if (index !== -1) {
        this.inventoryItems[index] = { ...this.itemToEdit, ...this.editForm };
        this.showEditModal = false;
        this.itemToEdit = undefined;
        this.editForm = {};
      }
    }
  }

  // Método para abrir el modal de detalles
  openDetailsModal(item: InventoryItem): void {
    this.selectedItem = item;
    this.showDetailsModal = true;
    console.log('Abriendo modal para:', item); // Para debugging
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedItem = undefined;
  }

  // Método para cambiar la imagen
  async changeImage(event: any): Promise<void> {
    const file = event.target.files[0];
    if (file && this.selectedItem) {
      try {
        // Aquí iría la lógica para subir la imagen a tu servidor
        // const imageUrl = await this.uploadImage(file);
        // this.selectedItem.imagen = imageUrl;
        console.log('Imagen seleccionada:', file);
      } catch (error) {
        console.error('Error al cargar la imagen:', error);
      }
    }
  }

  // Método para previsualizar la imagen (opcional)
  previewImage(event: any): void {
    const file = event.target.files[0];
    if (file && this.selectedItem) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedItem!.imagen = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveNewItem(): void {
    if (this.validateNewItem()) {
      // Generar ID único
      const newId = `EQ${String(this.inventoryItems.length + 1).padStart(3, '0')}`;
      
      // Crear el nuevo item combinando los datos del formulario
      const itemToSave: InventoryItem = {
        ...this.newItem as InventoryItem,
        id: newId, // El ID se asigna después del spread para evitar sobrescritura
        fechaRegistro: new Date().toISOString().split('T')[0]
      };

      // Agregar el nuevo item al array
      this.inventoryItems.push(itemToSave);
      
      // Cerrar el modal y limpiar el formulario
      this.closeNewItemModal();
      
      // Opcional: Mostrar mensaje de éxito
      alert('Equipo agregado exitosamente');
    }
  }

  private validateNewItem(): boolean {
    // Validación básica con type safety
    const required: (keyof InventoryItem)[] = ['tipo', 'marca', 'modelo', 'serial', 'estado', 'departamento', 'ubicacion'];
    return required.every(field => 
      field in this.newItem && 
      this.newItem[field] !== undefined && 
      this.newItem[field] !== ''
    );
  }
}
