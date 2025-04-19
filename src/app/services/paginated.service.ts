import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';
import { InventoryItem } from '../models/inventory-item.model';

// Add API response interface
interface ElementData {
  id: number;
  elementKey: string;
  elementValue: string;
}

interface InventoryItemResponse {
  id: number;
  serialNumber: string;
  inventoryNumber: string;
  description: string;
  assignedTo: string | null;
  itemType: ElementData;
  brand: ElementData;
  model: ElementData;
  status: ElementData;
  source: ElementData;
  assignedArea: ElementData;
  assignedSubArea: ElementData;
}

interface PaginatedRequest {
  sortDirection: 'asc' | 'desc';
  sortProperty: string;
  pageIndex: number;
  pageSize: number;
  searchValue?: string;
  brandId?: number;
  modelId?: number;
  itemTypeId?: number;
  sourceId?: number;
  assignedAreaId?: number;
  assignedSubAreaId?: number;
  statusId?: number;
}

interface PaginatedResponse<T> {
  statusCode: number;
  errors: string[] | null;
  content: {
    totalPages: number;
    totalItems: number;
    items: T[];
  };
}

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

// Add after your existing interfaces
interface DynamicCategoryElement {
  id: number;
  elementKey: string;
  elementValue: string;
}

interface Category {
  id: number;
  categoryName: string;
  description: string;
  dynamicCategoryElements: DynamicCategoryElement[];
}

interface CategoryResponse {
  statusCode: number;
  errors: string[] | null;
  content: Category[];
}

interface InventoryItemDetail {
  id: number;
  serialNumber: string | null;
  inventoryNumber: string | null;
  description: string;
  assignedTo: string | null;
  itemType: ElementData | null;
  brand: ElementData | null;
  model: ElementData | null;
  source: ElementData | null;
  status: ElementData | null;
  assignedArea: ElementData | null;
  assignedSubArea: ElementData | null;
}

interface UpdateInventoryRequest {
  id: number;
  serialNumber: string;
  inventoryNumber: string;
  description: string;
  assignedTo?: string;
  numberOfCopies?: number;
  brandId: number;
  modelId: number;
  itemTypeId: number;
  sourceId: number;
  assignedAreaId: number;
  assignedSubAreaId: number;
  statusId: number;
}

@Injectable({
  providedIn: 'root'
})

export class PaginatedService {
  private axiosInstance: AxiosInstance;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.axiosInstance = axios.create({
      baseURL: 'https://demo-inventory-api.azurewebsites.net',  // Update the baseURL
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain'
      }
    });

    this.axiosInstance.interceptors.request.use(config => {
      if (isPlatformBrowser(this.platformId)) {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });
  }

  async getPaginatedData<T>(
    endpoint: string,
    params: Partial<PaginatedRequest> = {}
  ): Promise<PaginatedResponse<T>> {
    try {
      const defaultParams: PaginatedRequest = {
        sortDirection: 'asc',
        sortProperty: 'string',
        pageIndex: 0,
        pageSize: 10,
        searchValue: '',
        brandId: 0,
        modelId: 0,
        itemTypeId: 0,
        sourceId: 0,
        assignedAreaId: 0,
        assignedSubAreaId: 0,
        statusId: 0,
        ...params
      };

      // Ensure endpoint starts with /api
      const fullEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
      const response = await this.axiosInstance.post(fullEndpoint, defaultParams);
      
      console.log('Request URL:', `${environment.apiUrl}${endpoint}`);
      console.log('Request Params:', defaultParams);
      console.log('API Response:', {
        status: response.status,
        statusCode: response.data.statusCode,
        totalItems: response.data.content.totalItems,
        totalPages: response.data.content.totalPages,
        items: response.data.content.items
      });
      
      if (response.data.statusCode === 200) {
        return response.data;
      }
      
      throw new Error(response.data.errors?.[0] || 'Error fetching paginated data');
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errors?.[0] || 'Error fetching paginated data');
    }
  }

  // Add mapping method
  // Fix mapping method to match InventoryItem types
  private mapInventoryResponse(item: InventoryItemResponse): InventoryItem {
    return {
      id: item.id.toString(),
      tipo: item.itemType?.elementValue || 'No especificado',
      marca: item.brand?.elementValue || 'No especificado',
      modelo: item.model?.elementValue || 'No especificado',
      serial: item.serialNumber || '',
      description: item.description || '',
      source: item.source?.elementValue || 'No especificado',
      inventoryNumber: item.inventoryNumber || '',
      estado: (item.status?.elementValue as 'Disponible' | 'Asignado' | 'Mantenimiento' | 'Dañado') || 'Disponible',
      ubicacion: item.assignedArea?.elementValue || 'No especificado',
      assignedSubArea: item.assignedSubArea?.elementValue || 'No especificado',
      departamento: this.mapDepartamento(item.assignedSubArea?.elementValue || ''),
      asignadoA: item.assignedTo || '',
      fechaRegistro: new Date().toISOString().split('T')[0],
      ultimoMantenimiento: undefined
    };
  }

  private mapDepartamento(value: string): 'TI' | 'Ventas' | 'Contabilidad' | 'RRHH' | 'Operaciones' | undefined {
    if (!value) return undefined;
    
    const departamentos = {
      'TI': 'TI',
      'Ventas': 'Ventas',
      'Contabilidad': 'Contabilidad',
      'RRHH': 'RRHH',
      'Operaciones': 'Operaciones'
    } as const;

    return departamentos[value as keyof typeof departamentos];
  }

  // Add specific method for inventory items
  async getPaginatedInventory(
    params: Partial<PaginatedRequest> = {}
  ): Promise<PaginatedResponse<InventoryItem>> {
    const response = await this.getPaginatedData<InventoryItemResponse>('/api/inventory/get-paginated', params);
    
    return {
      ...response,
      content: {
        ...response.content,
        items: response.content.items.map(item => this.mapInventoryResponse(item))
      }
    };
  }

  async deleteInventoryItem(id: string | number): Promise<boolean> {
    try {
      const response = await this.axiosInstance.delete(`/api/inventory/${id}`);
      
      console.log('Delete Response:', {
        status: response.status,
        statusCode: response.data.statusCode,
        content: response.data.content
      });
      
      if (response.data.statusCode === 200) {
        return response.data.content;
      }
      
      throw new Error(response.data.errors?.[0] || 'Error deleting inventory item');
    } catch (error: any) {
      console.error('Delete Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errors?.[0] || 'Error deleting inventory item');
    }
  }

  async exportToExcel(params: Partial<PaginatedRequest> = {}): Promise<Blob> {
    try {
      const defaultParams: PaginatedRequest = {
        sortDirection: 'asc',
        sortProperty: 'string',
        pageIndex: 1000,
        pageSize: 1000,
        searchValue: '',
        brandId: 0,
        modelId: 0,
        itemTypeId: 0,
        sourceId: 0,
        assignedAreaId: 0,
        assignedSubAreaId: 0,
        statusId: 0,
        ...params
      };

      const response = await this.axiosInstance.post('/api/inventory/ExportToExcel', 
        defaultParams,
        { responseType: 'blob' }  // Important: Set response type to blob
      );

      return new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    } catch (error: any) {
      console.error('Export Error:', error.response?.data || error.message);
      throw new Error('Error exporting to Excel');
    }
  }

  // Helper method to trigger file download
  private downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Convenience method to export and download
  async downloadExcel(params: Partial<PaginatedRequest> = {}): Promise<void> {
    try {
      const blob = await this.exportToExcel(params);
      this.downloadFile(blob, 'inventory-report.xlsx');
    } catch (error) {
      throw error;
    }
  }

  // Add new method to create inventory item
  async createInventoryItem(item: CreateInventoryRequest): Promise<boolean> {
    try {
      // Validate required IDs
      if (!item.brandId || !item.modelId || !item.itemTypeId || 
          !item.sourceId || !item.assignedAreaId || 
          !item.assignedSubAreaId || !item.statusId) {
        throw new Error('Todos los campos de ID son requeridos y deben ser mayores a 0');
      }
  
      // Ensure required fields are not empty
      if (!item.serialNumber?.trim() || !item.inventoryNumber?.trim()) {
        throw new Error('Número de serie e inventario son requeridos');
      }
  
      // Set default values if not provided
      const requestData: CreateInventoryRequest = {
        ...item,
        numberOfCopies: item.numberOfCopies || 1,
        description: item.description || '',
        assignedTo: item.assignedTo || ''
      };
  
      // Add console.log to see the request data
      console.log('Request Data being sent to backend:', requestData);
  
      const response = await this.axiosInstance.post('/api/inventory', requestData);
      
      console.log('Create Response:', {
        status: response.status,
        statusCode: response.data.statusCode,
        content: response.data.content
      });
      
      if (response.data.statusCode === 200) {
        return response.data.content;
      }
      
      throw new Error(response.data.errors?.[0] || 'Error creating inventory item');
    } catch (error: any) {
      console.error('Create Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errors?.[0] || 'Error creating inventory item');
    }
  }

  // Add new method to get categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.axiosInstance.get<CategoryResponse>('/api/categories');
      
      if (response.data.statusCode === 200) {
        // Filter out categories with empty elements and duplicates
        const uniqueCategories = response.data.content.filter(
          (category, index, self) =>
            category.dynamicCategoryElements.length > 0 &&
            index === self.findIndex(c => c.categoryName === category.categoryName)
        );
        return uniqueCategories;
      }
      
      throw new Error(response.data.errors?.[0] || 'Error fetching categories');
    } catch (error: any) {
      console.error('Categories Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errors?.[0] || 'Error fetching categories');
    }
  }

  // Helper method to get elements by category name
  async getCategoryElements(categoryName: string): Promise<DynamicCategoryElement[]> {
    try {
      const categories = await this.getCategories();
      const category = categories.find(c => c.categoryName.toLowerCase() === categoryName.toLowerCase());
      return category?.dynamicCategoryElements || [];
    } catch (error) {
      console.error(`Error fetching ${categoryName} elements:`, error);
      return [];
    }
  }

  // Add this new method
  async getInventoryItemById(id: number | string): Promise<InventoryItem> {
    try {
      const response = await this.axiosInstance.get<{
        statusCode: number;
        errors: string[] | null;
        content: InventoryItemDetail;
      }>(`/api/inventory/${id}`);

      if (response.data.statusCode === 200) {
        const detail = response.data.content;
        // Map the detailed response to our InventoryItem model
        return this.mapInventoryResponse({
          id: detail.id,
          serialNumber: detail.serialNumber || '',
          inventoryNumber: detail.inventoryNumber || '',
          description: detail.description,
          assignedTo: detail.assignedTo,
          itemType: detail.itemType || { id: 0, elementKey: '', elementValue: 'No especificado' },
          brand: detail.brand || { id: 0, elementKey: '', elementValue: 'No especificado' },
          model: detail.model || { id: 0, elementKey: '', elementValue: 'No especificado' },
          status: detail.status || { id: 0, elementKey: '', elementValue: 'Disponible' },
          source: detail.source || { id: 0, elementKey: '', elementValue: 'No especificado' },
          assignedArea: detail.assignedArea || { id: 0, elementKey: '', elementValue: 'No especificado' },
          assignedSubArea: detail.assignedSubArea || { id: 0, elementKey: '', elementValue: '' }
        });
      }

      throw new Error(response.data.errors?.[0] || 'Error fetching inventory item details');
    } catch (error: any) {
      console.error('Get Item Detail Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errors?.[0] || 'Error fetching inventory item details');
    }
  }

  async updateInventoryItem(item: UpdateInventoryRequest): Promise<boolean> {
    try {
      // Validate required fields
      if (!item.id || !item.serialNumber?.trim() || !item.inventoryNumber?.trim()) {
        throw new Error('ID, número de serie e inventario son requeridos');
      }

      // Validate required IDs
      if (!item.brandId || !item.modelId || !item.itemTypeId || 
          !item.sourceId || !item.assignedAreaId || 
          !item.assignedSubAreaId || !item.statusId) {
        throw new Error('Todos los campos de ID son requeridos y deben ser mayores a 0');
      }

      // Prepare request data with all required fields
      const requestData = {
        id: item.id,
        serialNumber: item.serialNumber.trim(),
        inventoryNumber: item.inventoryNumber.trim(),
        description: item.description || '',
        assignedTo: item.assignedTo || '',
        numberOfCopies: 1, // Add missing field with default value
        brandId: item.brandId,
        modelId: item.modelId,
        itemTypeId: item.itemTypeId,
        sourceId: item.sourceId,
        assignedAreaId: item.assignedAreaId,
        assignedSubAreaId: item.assignedSubAreaId,
        statusId: item.statusId
      };

      console.log('Update Request Data:', requestData);

      const response = await this.axiosInstance.put('/api/inventory', requestData);
      
      console.log('Update Response:', {
        status: response.status,
        statusCode: response.data.statusCode,
        content: response.data.content
      });
      
      if (response.data.statusCode === 200) {
        return true;
      }
      
      throw new Error(response.data.errors?.[0] || 'Error updating inventory item');
    } catch (error: any) {
      console.error('Update Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errors?.[0] || 'Error updating inventory item');
    }
  }
}