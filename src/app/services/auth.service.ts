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
    
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    const tokenPayload = this.parseJwt(token);
    return {
      fullName: tokenPayload.Email?.split('@')[0] || 'Usuario', // Use email as fallback name
      isAdmin: tokenPayload.IsAdmin,
      token: token,
      id: tokenPayload.Id
    };
  }

  private setSession(authResult: any): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Only store the token
    localStorage.setItem('authToken', authResult.token);
    
    const tokenPayload = this.parseJwt(authResult.token);
    
    // Update userSubject with data from token
    this.userSubject.next({
      fullName: tokenPayload.FullName,
      isAdmin: tokenPayload.IsAdmin || false,
      token: authResult.token,
      id: tokenPayload.Id,
      email: tokenPayload.Email
    });
  }

  // Add helper method to parse JWT
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      return {
        ...payload,
        IsAdmin: payload.IsAdmin?.toLowerCase() === 'true' // Convert string to boolean
      };
    } catch (e) {
      console.error('Error parsing JWT token:', e);
      return {};
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/api/login', 
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
      throw new Error(response.data.errors?.[0]?.message || 'Credenciales incorrectas');
    } catch (error: any) {
      throw new Error(error.response?.data?.errors?.[0]?.message || 'Error en el servidor');
    }
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