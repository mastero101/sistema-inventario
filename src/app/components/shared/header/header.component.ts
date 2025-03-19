import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';  // Add this import
import { Component, ViewChild, ElementRef, PLATFORM_ID, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LoginComponent } from '../../shared/login/login.component';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  currentUser: any = null;
  isUserMenuOpen = false;
  isLoggedIn = false;
  isSearchOpen = false;
  defaultProfileImage = 'assets/default-profile.jpg';
  userName: string = 'Invitado';
  // Remove the isAdmin property since we're using a getter
  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(async (user) => {
      if (user && user.token) {
        this.isLoggedIn = true;
        this.userName = user.fullName;
        try {
          const userProfile = await this.userService.getUserProfile(user.id);
          this.currentUser = {
            ...user,
            ...userProfile,
            isAdmin: user.isAdmin // Ensure we use the parsed boolean value
          };
        } catch (error) {
          console.error('Error loading user profile:', error);
          this.currentUser = {
            ...user,
            isAdmin: user.isAdmin // Ensure we use the parsed boolean value
          };
        }
      } else {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.userName = 'Invitado';
      }
    });
  }

  // Keep the getter for isAdmin
  get isAdmin(): boolean {
    return this.currentUser?.isAdmin || false;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = this.defaultProfileImage;
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      });
    }
  }

  ngAfterViewInit() {
    this.document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.isUserMenuOpen = false;
      }
    });
  }

  async logout() {
    try {
      await this.authService.logout();
      this.isLoggedIn = false;
      this.currentUser = null;
      this.isUserMenuOpen = false;
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}
