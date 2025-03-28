import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { PaginatedService } from '../../../services/paginated.service';
import { InventoryItem } from '../../../models/inventory-item.model';

// Define interface outside the component
interface FilterOption {
  id: number;
  value: string;
}

// Add CreateInventoryRequest interface
interface CreateInventoryRequest {
  serialNumber: string;
  inventoryNumber: string;
  description: string;
  assignedTo?: string;
  numberOfCopies: number;
  brandId: number;
  modelId: number;
  itemTypeId: number;
  sourceId: number;
  assignedAreaId: number;
  assignedSubAreaId: number;
  statusId: number;
}

// Add DynamicCategoryElement interface
interface DynamicCategoryElement {
  id: number;
  elementKey: string;
  elementValue: string;
}

@Component({
  selector: 'app-inventory-paginated',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-paginated.component.html',
  styleUrls: ['./inventory-paginated.component.scss']
})
export class InventoryPaginatedComponent implements OnInit {
  // Basic properties
  isLoading: boolean = false;
  errorMessage: string | null = null;
  inventoryItems: InventoryItem[] = [];
  totalItems: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;

  // Filter properties
  searchTerm: string = '';
  selectedType: number = 0;
  selectedBrand: number = 0;
  selectedStatus: number = 0;
  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  // Update filter options to be dynamic
  typeOptions: FilterOption[] = [];
  brandOptions: FilterOption[] = [];
  statusOptions: FilterOption[] = [];
  modelOptions: FilterOption[] = [];
  sourceOptions: FilterOption[] = [];
  areaOptions: FilterOption[] = [];
  subAreaOptions: FilterOption[] = [];

  constructor(
    private readonly paginatedService: PaginatedService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}

  // Update createItem to ensure all required IDs are set
  async createItem(): Promise<void> {
    try {
      // Validate required fields
      if (!this.newItem.serialNumber || !this.newItem.inventoryNumber) {
        throw new Error('Serial y número de inventario son requeridos');
      }

      // Ensure all IDs are valid
      if (!this.newItem.brandId || !this.newItem.modelId || !this.newItem.itemTypeId ||
          !this.newItem.sourceId || !this.newItem.assignedAreaId ||
          !this.newItem.assignedSubAreaId || !this.newItem.statusId) {
        throw new Error('Todos los campos de selección son requeridos');
      }

      this.isLoading = true;
      await this.paginatedService.createInventoryItem(this.newItem);
      this.toggleModal();
      await this.loadPaginatedInventory();
    } catch (error) {
      this.errorMessage = 'Error al crear el elemento: ' + (error as Error).message;
    } finally {
      this.isLoading = false;
    }
  }

  async loadPaginatedInventory(): Promise<void> {
    this.isLoading = true;
    try {
      if (isPlatformBrowser(this.platformId)) {
        const paginatedResponse = await this.paginatedService.getPaginatedInventory({
          pageIndex: this.currentPage,
          pageSize: this.pageSize,
          sortDirection: 'asc',
          sortProperty: 'string',
          searchValue: this.searchTerm,
          itemTypeId: this.selectedType,
          brandId: this.selectedBrand,
          statusId: this.selectedStatus
        });

        this.inventoryItems = paginatedResponse.content.items;
        this.totalItems = paginatedResponse.content.totalItems;
        this.totalPages = paginatedResponse.content.totalPages;
      }
    } catch (error) {
      this.errorMessage = 'Error al cargar el inventario: ' + (error as Error).message;
    } finally {
      this.isLoading = false;
    }
  }

  // Remove the helper methods as they're no longer needed
  // Remove getTypeId, getBrandId, and getStatusId methods
  // Add search handler with debounce
  onSearch(): void {
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    this.searchDebounce = setTimeout(() => {
      this.currentPage = 0;
      this.loadPaginatedInventory();
    }, 300);
  }

  // Add filter handlers
  onFilterChange(): void {
    this.currentPage = 0;
    this.loadPaginatedInventory();
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPaginatedInventory();
  }

  getStatusClass(status: string): string {
      switch (status?.toLowerCase()) {
        case 'nuevo':
          return 'bg-green-100 text-green-800 border border-green-200';
        case 'asignado':
          return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        case 'en mantenimiento':
          return 'bg-red-100 text-red-800 border border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border border-gray-200';
      }
    }

  // Update the deleteItem method signature to accept optional undefined
  async deleteItem(id: string | undefined): Promise<void> {
    if (!id) return; // Early return if id is undefined
    
    if (confirm('¿Está seguro que desea eliminar este elemento?')) {
      try {
        this.isLoading = true;
        await this.paginatedService.deleteInventoryItem(id);
        // Reload the data after successful deletion
        await this.loadPaginatedInventory();
      } catch (error) {
        this.errorMessage = 'Error al eliminar el elemento: ' + (error as Error).message;
      } finally {
        this.isLoading = false;
      }
    }
  }

  async exportToExcel(): Promise<void> {
    try {
      this.isLoading = true;
      await this.paginatedService.downloadExcel({
        searchValue: this.searchTerm,
        itemTypeId: this.selectedType,
        brandId: this.selectedBrand,
        statusId: this.selectedStatus
      });
    } catch (error) {
      this.errorMessage = 'Error al exportar a Excel: ' + (error as Error).message;
    } finally {
      this.isLoading = false;
    }
  }

  // Add modal and form properties
  showModal: boolean = false;
  newItem: CreateInventoryRequest = {
    serialNumber: '',
    inventoryNumber: '',
    description: '',
    assignedTo: '',
    numberOfCopies: 1,
    brandId: 0,
    modelId: 0,
    itemTypeId: 0,
    sourceId: 0,
    assignedAreaId: 0,
    assignedSubAreaId: 0,
    statusId: 0
  };

  // Add modal methods
  toggleModal(): void {
    this.showModal = !this.showModal;
    if (!this.showModal) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newItem = {
      serialNumber: '',
      inventoryNumber: '',
      description: '',
      assignedTo: '',
      numberOfCopies: 1,
      brandId: 0,
      modelId: 0,
      itemTypeId: 0,
      sourceId: 0,
      assignedAreaId: 0,
      assignedSubAreaId: 0,
      statusId: 0
    };
  }

  ngOnInit(): void {
    // Check authentication before initializing
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      if (token) {
        this.initializeComponent();
      } else {
        this.errorMessage = 'Por favor inicie sesión para acceder al inventario';
      }
    }
  }

  private async initializeComponent(): Promise<void> {
    try {
      this.isLoading = true;
      await this.loadCategories();
      await this.loadPaginatedInventory();
    } catch (error) {
      this.errorMessage = 'Error al inicializar: ' + (error as Error).message;
    } finally {
      this.isLoading = false;
    }
  }

  // Remove the first loadCategories method (around line 76)
  // and keep only this improved version
  async loadCategories(): Promise<void> {
    try {
      this.isLoading = true;
      
      const [brands, types, statuses, models, sources, areas, subAreas] = await Promise.all([
        this.paginatedService.getCategoryElements('Marcas'),
        this.paginatedService.getCategoryElements('Tipo'),
        this.paginatedService.getCategoryElements('Estados'),
        this.paginatedService.getCategoryElements('Modelos'),
        this.paginatedService.getCategoryElements('Origen'),
        this.paginatedService.getCategoryElements('Areas'),
        this.paginatedService.getCategoryElements('SubAreas')
      ]);

      // Map results only if they exist
      this.brandOptions = brands?.map((b: DynamicCategoryElement) => ({ id: b.id, value: b.elementValue })) || [];
      this.typeOptions = types?.map((t: DynamicCategoryElement) => ({ id: t.id, value: t.elementValue })) || [];
      this.statusOptions = statuses?.map((s: DynamicCategoryElement) => ({ id: s.id, value: s.elementValue })) || [];
      this.modelOptions = models?.map((m: DynamicCategoryElement) => ({ id: m.id, value: m.elementValue })) || [];
      this.sourceOptions = sources?.map((s: DynamicCategoryElement) => ({ id: s.id, value: s.elementValue })) || [];
      this.areaOptions = areas?.map((a: DynamicCategoryElement) => ({ id: a.id, value: a.elementValue })) || [];
      this.subAreaOptions = subAreas?.map((sa: DynamicCategoryElement) => ({ id: sa.id, value: sa.elementValue })) || [];
    } catch (error) {
      console.error('Error loading categories:', error);
      this.errorMessage = 'Error al cargar las categorías. Por favor, verifique su conexión e inicie sesión nuevamente.';
      throw error;
    }
  }

  // Add these properties to the component class
  showDetailsModal: boolean = false;
  selectedItem: any = null;  // You might want to create a proper interface for this

  // Add this method to close the details modal
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedItem = null;
  }

  // Update showItemDetails method to handle the response data
  async showItemDetails(id: string | undefined): Promise<void> {
    if (!id) return;
    
    try {
      this.isLoading = true;
      const item = await this.paginatedService.getInventoryItemById(id);
      this.selectedItem = item;
      this.showDetailsModal = true;
    } catch (error) {
      this.errorMessage = 'Error al cargar los detalles del item: ' + (error as Error).message;
    } finally {
      this.isLoading = false;
    }
  }
}
