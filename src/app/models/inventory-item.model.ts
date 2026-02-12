export interface InventoryItem {
  id?: string;
  tipo: string;
  marca: string;
  modelo: string;
  serial: string;
  source: string;
  description: string;
  inventoryNumber: string;
  estado: 'Disponible' | 'Asignado' | 'Mantenimiento' | 'Dañado';
  asignadoA?: string;
  assignedSubArea?: string;
  ubicacion: string;
  fechaRegistro: string; // ISO 8601 format (YYYY-MM-DD)
  ultimoMantenimiento?: string; // ISO 8601 format (YYYY-MM-DD)
  departamento?: 'TI' | 'Ventas' | 'Contabilidad' | 'RRHH' | 'Operaciones';
  imagen?: string;
  createdAt?: string; // ISO 8601 format
  updatedAt?: string; // ISO 8601 format
}

export interface InventoryItemFormData {
  tipo: string;
  marca: string;
  modelo: string;
  serial: string;
  inventoryNumber?: string;
  source?: string;
  description?: string;
  estado: 'Disponible' | 'Asignado' | 'Mantenimiento' | 'Dañado';
  asignadoA?: string;
  assignedSubArea?: string;
  ubicacion: string;
  fechaRegistro: string;
  ultimoMantenimiento?: string;
  departamento?: 'TI' | 'Ventas' | 'Contabilidad' | 'RRHH' | 'Operaciones';
  imagen?: File | string; // Acepta archivos y URLs
}
