import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';

interface User {
  id: number;
  fullName: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  newUser = {
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  };

  constructor(private userService: UserService) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      this.isLoading = true;
      this.users = await this.userService.getUsers();
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async addUser() {
    try {
      this.isLoading = true;
      this.errorMessage = null;
      
      const createdUser = await this.userService.createUser(this.newUser);
      this.users.push(createdUser);
      
      // Reset form
      this.newUser = {
        fullName: '',
        email: '',
        password: '',
        passwordConfirmation: ''
      };
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async toggleUserActive(user: User) {
    try {
      this.isLoading = true;
      const result = await this.userService.toggleUserActive(user.id);
      // Update user status and refresh the list
      user.isActive = !user.isActive;
      await this.loadUsers(); // Refresh the entire list
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async toggleUserAdmin(user: User) {
      try {
        this.isLoading = true;
        const result = await this.userService.toggleUserAdmin(user.id);
        user.isAdmin = !user.isAdmin;
        await this.loadUsers(); // Refresh the list
      } catch (error: any) {
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
      }
    }

  showConfirmModal = false;
  selectedUserForAdmin: User | null = null;

  openConfirmAdminModal(user: User) {
    this.selectedUserForAdmin = user;
    this.showConfirmModal = true;
  }

  async confirmToggleAdmin() {
    if (this.selectedUserForAdmin) {
      await this.toggleUserAdmin(this.selectedUserForAdmin);
      this.showConfirmModal = false;
      this.selectedUserForAdmin = null;
    }
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.selectedUserForAdmin = null;
  }

  showDeleteModal = false;
  selectedUserForDelete: User | null = null;

  openDeleteModal(user: User) {
    this.selectedUserForDelete = user;
    this.showDeleteModal = true;
  }

  deleteErrorMessage: string | null = null;

  async confirmDelete() {
    if (this.selectedUserForDelete) {
      try {
        this.isLoading = true;
        this.deleteErrorMessage = null;
        await this.userService.deleteUser(this.selectedUserForDelete.id);
        await this.loadUsers();
        this.showDeleteModal = false;
        this.selectedUserForDelete = null;
      } catch (error: any) {
        if (this.selectedUserForDelete?.isActive) {
          this.deleteErrorMessage = 'No es posible eliminar un usuario Activo. Debe Desactivarlo primero.';
        } else {
          this.deleteErrorMessage = error.message;
        }
      } finally {
        this.isLoading = false;
      }
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedUserForDelete = null;
    this.deleteErrorMessage = null;
  }
}
