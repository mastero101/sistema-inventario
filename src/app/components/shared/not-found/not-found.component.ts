import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>404</h1>
    <p>Página no encontrada</p>
  `
})
export class NotFoundComponent {}
