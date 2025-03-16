import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';  // Add AxiosInstance import
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private axiosInstance: AxiosInstance;  // Declare the property

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: environment.apiLoginUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/login', 
        JSON.stringify({ email, password }), 
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.statusCode === 200 && response.data.content?.token) {
        this.setSession(response.data.content);
        return response.data;
      }
      throw new Error(response.data.errors?.[0] || 'Credenciales incorrectas');
    } catch (error: any) {
      throw new Error(error.response?.data?.errors?.[0] || 'Error en el servidor');
    }
  }

  private setSession(authResult: any): void {
    localStorage.setItem('authToken', authResult.token);
    localStorage.setItem('isAdmin', authResult.isAdmin);
    localStorage.setItem('userName', authResult.fullName);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userName');
  }

  getUserName(): string {
    return localStorage.getItem('userName') || '';
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}