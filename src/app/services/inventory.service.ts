import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { InventoryItem, InventoryItemFormData } from '../models/inventory-item.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor() 
  {
    // Configuración global de Axios
    axios.defaults.baseURL = environment.apiUrl;
    axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';
    axios.defaults.headers.common['Accept'] = 'application/json';
  }

  // Obtener todos los elementos
  async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      const response: AxiosResponse<InventoryItem[]> = await axios.get(this.apiUrl);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Obtener un elemento por ID
  async getInventoryItem(id: string): Promise<InventoryItem> {
    try {
      const response: AxiosResponse<InventoryItem> = await axios.get(`${this.apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Crear nuevo elemento
  async createInventoryItem(itemData: InventoryItemFormData): Promise<InventoryItem> {
    try {
      const formData = this.createFormData(itemData);
      const response: AxiosResponse<InventoryItem> = await axios.post(this.apiUrl, formData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Actualizar elemento
  async updateInventoryItem(id: string, itemData: InventoryItemFormData): Promise<InventoryItem> {
    try {
      const formData = this.createFormData(itemData);
      const response: AxiosResponse<InventoryItem> = await axios.put(`${this.apiUrl}/${id}`, formData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Eliminar elemento
  async deleteInventoryItem(id: string): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}/${id}`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Búsqueda avanzada
  async searchInventory(
    searchTerm?: string,
    estado?: string,
    departamento?: string,
    fechaDesde?: string,
    fechaHasta?: string
  ): Promise<InventoryItem[]> {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (estado) params.append('estado', estado);
      if (departamento) params.append('departamento', departamento);
      if (fechaDesde) params.append('fechaDesde', fechaDesde);
      if (fechaHasta) params.append('fechaHasta', fechaHasta);

      const response: AxiosResponse<InventoryItem[]> = await axios.get(`${this.apiUrl}/search`, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Métodos auxiliares
  private createFormData(itemData: InventoryItemFormData): FormData {
    const formData = new FormData();
    Object.entries(itemData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return formData;
  }

  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      console.error('Error en la solicitud:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.error('Error inesperado:', error);
    }
  }

}