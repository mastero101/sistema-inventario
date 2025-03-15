import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiLoginUrl}/login`;

  constructor() {
    axios.defaults.baseURL = environment.apiUrl;
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const response = await axios.post(this.apiUrl, { email, password });
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
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}