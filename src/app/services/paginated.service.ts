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
      estado: (item.status?.elementValue as 'Disponible' | 'Asignado' | 'Mantenimiento' | 'Dañado') || 'Disponible',
      ubicacion: item.assignedArea?.elementValue || 'No especificado',
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
}