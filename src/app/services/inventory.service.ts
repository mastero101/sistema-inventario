import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { InventoryItem, InventoryItemFormData } from '../models/inventory-item.model';
import { MaintenanceReport } from '../models/maintenance-report.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor() {
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

  // Exportar a Excel
  async exportInventory(filters: any): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
      if (filters.estado && filters.estado !== 'todos') params.append('estado', filters.estado);
      if (filters.departamento && filters.departamento !== 'todos') params.append('departamento', filters.departamento);

      const response = await axios.get(`${environment.apiUrl}/export/excel`, {
        params,
        responseType: 'blob'
      });

      // Crear un link para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Inventario.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
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

  // Mantenimiento
  async getMaintenanceReports(itemId: string): Promise<MaintenanceReport[]> {
    try {
      const response = await axios.get(`${environment.apiUrl}/maintenance/item/${itemId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async createMaintenanceReport(report: MaintenanceReport): Promise<MaintenanceReport> {
    try {
      // Usar JSON para el reporte
      const response = await axios.post(`${environment.apiUrl}/maintenance`, report, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async downloadMaintenancePDF(itemId: string): Promise<void> {
    try {
      const response = await axios.get(`${environment.apiUrl}/maintenance/pdf/${itemId}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Mantenimiento_${itemId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
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