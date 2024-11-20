import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { LoginComponent } from '../../shared/login/login.component';

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements AfterViewInit {
  private document = inject(DOCUMENT);
  @ViewChild('searchInput') searchInput!: ElementRef;
  
  isUserMenuOpen = false;
  isNotificationsOpen = false;
  isSearchOpen = false;
  notificationsCount = 3;
  isLoggedIn: boolean = false;
  
  notifications: Notification[] = [
    {
      id: 1,
      message: 'Nueva solicitud de equipo pendiente de aprobación',
      time: 'Hace 5 minutos',
      read: false
    },
    {
      id: 2,
      message: 'El inventario de laptops está bajo',
      time: 'Hace 2 horas',
      read: false
    },
    {
      id: 3,
      message: 'Mantenimiento programado para mañana',
      time: 'Hace 1 día',
      read: true
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) this.isUserMenuOpen = false;
  }

  markAsRead(notification: Notification) {
    notification.read = true;
    this.notificationsCount = this.notifications.filter(n => !n.read).length;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      // Esperar a que el DOM se actualice
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      });
    }
  }

  ngAfterViewInit() {
    // Cerrar menús al hacer clic fuera
    this.document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.isUserMenuOpen = false;
        this.isNotificationsOpen = false;
      }
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('loggedIn');
      this.isLoggedIn = false;
      window.location.reload();
    }
  }
}
