import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';

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
}