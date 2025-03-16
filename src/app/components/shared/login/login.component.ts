import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  userName: string = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    // Initialize userName from localStorage
    this.userName = this.authService.getUserName();
  }

  async login() {
    if (!this.email || !this.password) return;
    
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    
    try {
      const response = await this.authService.login(this.email, this.password);
      this.userName = response.content.fullName;
      this.successMessage = '¡Inicio de sesión exitoso!';
      
      // Add delay before navigation
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
    } catch (error: any) {
      this.handleError(error.message);
    } finally {
      this.isLoading = false;
    }
  }

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }

  private handleError(errorMessage: string): void {
    this.errorMessage = errorMessage;
    setTimeout(() => this.errorMessage = null, 5000);
  }
}
