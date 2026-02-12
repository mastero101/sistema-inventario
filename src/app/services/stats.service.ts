import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';

export interface GeneralStats {
    total: number;
    porEstado: { [key: string]: number };
    porDepartamento: { [key: string]: number };
    porTipo: { [key: string]: number };
    necesitanMantenimiento: number;
}

export interface RecentChange {
    id: number;
    tipo: string;
    marca: string;
    modelo: string;
    estado: string;
    fechaRegistro: string;
}

@Injectable({
    providedIn: 'root'
})
export class StatsService {
    private apiUrl = `${environment.apiUrl}/stats`;

    constructor() { }

    async getGeneralStats(): Promise<GeneralStats> {
        try {
            const response = await axios.get(`${this.apiUrl}/general`);
            return response.data;
        } catch (error) {
            console.error('Error fetching general stats:', error);
            throw error;
        }
    }

    async getRecentChanges(): Promise<RecentChange[]> {
        try {
            const response = await axios.get(`${this.apiUrl}/recent`);
            return response.data;
        } catch (error) {
            console.error('Error fetching recent changes:', error);
            throw error;
        }
    }
}
