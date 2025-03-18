import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private axiosInstance: AxiosInstance;
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.axiosInstance = axios.create({
      baseURL: environment.apiLoginUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Initialize user data if in browser
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = this.getUserFromStorage();
      if (storedUser) {
        this.userSubject.next(storedUser);
      }
    }
  }

  private getUserFromStorage() {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    if (!localStorage.getItem('authToken')) return null;
    
    return {
      fullName: localStorage.getItem('userName'),
      isAdmin: localStorage.getItem('isAdmin') === 'true',
      token: localStorage.getItem('authToken')
    };
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
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem('authToken', authResult.token);
    localStorage.setItem('isAdmin', authResult.isAdmin);
    localStorage.setItem('userName', authResult.fullName);
    
    // Update userSubject with new user data
    this.userSubject.next({
      fullName: authResult.fullName,
      isAdmin: authResult.isAdmin,
      token: authResult.token
    });
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userName');
    // Reset userSubject to null
    this.userSubject.next(null);
    
    // Reload the page after logout
    window.location.reload();
  }

  getUserName(): string {
    return localStorage.getItem('userName') || '';
  }

  getCurrentUser(): any {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    // Parse the JWT token to get the user ID
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      return {
        id: payload.Id,
        fullName: localStorage.getItem('userName'),
        isAdmin: localStorage.getItem('isAdmin') === 'true',
        email: payload.Email
      };
    } catch (e) {
      console.error('Error parsing JWT token', e);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}