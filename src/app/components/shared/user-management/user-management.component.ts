import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';

export interface User {
  id: number;
  name: string;
  password: string;
  showPassword?: boolean; // Agregar la propiedad showPassword
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [FormsModule, CommonModule, NgFor, NgIf],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  users: User[] = [
    { id: 1, name: 'Usuario 1', password: '1', showPassword: false },
    { id: 2, name: 'Usuario 2', password: '2', showPassword: false },
    { id: 3, name: 'Usuario 3', password: '3', showPassword: false }
  ];
  isEditModalOpen = false;
  selectedUser: User | null = null;
  showPassword = false; // Propiedad para controlar la visibilidad de la contraseña

  // Nuevas propiedades para agregar un usuario
  newUserName: string = '';
  newUserPassword: string = '';

  openEditModal(user: User) {
    this.selectedUser = { ...user }; // Clonamos el usuario para editar
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedUser = null;
  }

  saveUser() {
    if (this.selectedUser) {
      const index = this.users.findIndex(user => user.id === this.selectedUser!.id);
      if (index !== -1) {
        this.users[index] = this.selectedUser; // Guardamos los cambios
      }
      this.closeEditModal();
    }
  }

  deleteUser(userId: number) {
    this.users = this.users.filter(user => user.id !== userId);
  }

  toggleUserPasswordVisibility(user: User) {
    user.showPassword = !user.showPassword; // Alternar la visibilidad de la contraseña del usuario
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword; // Alternar la visibilidad de la contraseña en el modal
  }

  // Método para agregar un nuevo usuario
  addUser() {
    if (this.newUserName && this.newUserPassword) {
      const newUser: User = {
        id: this.users.length + 1, // Generar un nuevo ID
        name: this.newUserName,
        password: this.newUserPassword,
        showPassword: false
      };
      this.users.push(newUser); // Agregar el nuevo usuario a la lista
      this.newUserName = ''; // Limpiar el campo de nombre
      this.newUserPassword = ''; // Limpiar el campo de contraseña
    }
  }
}
