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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async login() {
    this.isLoading = true;
    this.errorMessage = null;
    
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/inventory']);
    } catch (error: any) {
      this.handleError(error.message);
    } finally {
      this.isLoading = false;
    }
  }

  private handleError(errorMessage: string): void {
    this.errorMessage = errorMessage;
    setTimeout(() => this.errorMessage = null, 5000);
  }
}
