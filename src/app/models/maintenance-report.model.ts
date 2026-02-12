export interface MaintenanceReport {
    id?: number;
    item_id: number | string;
    fecha: string;
    tipo_mantenimiento: string;
    descripcion: string;
    tecnico: string;
    costo: number;
    notas: string;
}
