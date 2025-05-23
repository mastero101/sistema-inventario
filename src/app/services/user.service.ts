import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';

interface User {
  id: number;
  fullName: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
}

interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: environment.apiLoginUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }
    });

    // Add request interceptor for JWT
    this.axiosInstance.interceptors.request.use(config => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await this.axiosInstance.get('/api/users');
      return response.data.content;
    } catch (error: any) {
      throw new Error(error.response?.data?.errors?.[0]?.message || 'Error fetching users');
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await this.axiosInstance.post('/api/users', userData);
      if (response.data.statusCode === 200) {
        return response.data.content;
      }
      throw new Error(response.data.errors?.[0]?.message || 'Error creating user');
    } catch (error: any) {
      throw new Error(error.response?.data?.errors?.[0]?.message || 'Error creating user');
    }
  }

  async toggleUserActive(userId: number): Promise<boolean> {
    try {
      const response = await this.axiosInstance.patch(`/api/users/${userId}/toggle-active`);
      if (response.data.statusCode === 200) {
        return response.data.content;
      }
      throw new Error(response.data.errors?.[0]?.message || 'Error updating user status');
    } catch (error: any) {
      throw new Error(error.response?.data?.errors?.[0]?.message || 'Error updating user status');
    }
  }

  async toggleUserAdmin(userId: number): Promise<boolean> {
    try {
      const response = await this.axiosInstance.patch(`/api/users/${userId}/toggle-admin`);
      if (response.data.statusCode === 200) {
        return response.data.content;
      }
      throw new Error(response.data.errors?.[0]?.message || 'Error updating admin status');
    } catch (error: any) {
      throw new Error(error.response?.data?.errors?.[0]?.message || 'Error updating admin status');
    }
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      const response = await this.axiosInstance.delete(`/api/users/${userId}`);
      if (response.data.statusCode === 200) {
        return response.data.content;
      }
      throw new Error(response.data.errors?.[0]?.message || 'Error deleting user');
    } catch (error: any) {
      throw new Error(error.response?.data?.errors?.[0]?.message || 'Error deleting user');
    }
  }

  async getUserProfile(userId: number): Promise<any> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${environment.apiLoginUrl}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.content;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      throw new Error(error.response?.data?.errors?.[0]?.message || 'Failed to fetch user profile');
    }
  }

  async updateProfileImage(imageFile: File): Promise<any> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }
  
      const formData = new FormData();
      formData.append('imageFile', imageFile);
  
      const response = await axios.post(
        `${environment.apiLoginUrl}/api/users/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile image:', error);
      throw new Error(error.response?.data?.errors?.[0]?.message || 'Failed to update profile image');
    }
  }

  async deleteProfileImage(): Promise<any> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.delete(
        `${environment.apiLoginUrl}/api/users/update-profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error deleting profile image:', error);
      throw new Error(error.response?.data?.errors?.[0]?.message || 'Failed to delete profile image');
    }
  }
}