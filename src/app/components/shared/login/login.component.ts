import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  login() {
    // Lógica de autenticación
    if (this.username === 'admin@admin.com' && this.password === 'admin') {
      localStorage.setItem('loggedIn', 'true');
      alert('Login exitoso');
      window.location.reload();
    } else {
      alert('Credenciales incorrectas');
    }
  }
}
