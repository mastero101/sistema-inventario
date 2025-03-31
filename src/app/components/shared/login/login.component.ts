import { Component, Output, EventEmitter } from '@angular/core';
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
  @Output() loginSuccess = new EventEmitter<void>();
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
      
      // Modify this part
      setTimeout(() => {
        this.loginSuccess.emit();  // Emit the success event
        this.router.navigate(['/dashboard']).then(() => {
          window.location.reload();
        });
      }, 500);
    } catch (error) {
      if (error instanceof Error) {
        this.handleError(error.message);
      } else {
        this.handleError('Error desconocido durante el inicio de sesión');
      }
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
