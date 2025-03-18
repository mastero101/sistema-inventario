import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  userProfile: any = null;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  defaultProfileImage = 'assets/default-profile.jpg';
  showSuccessModal = false; // Add this property

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      this.isLoading = true;
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        this.errorMessage = 'No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.';
        return;
      }
      
      this.userProfile = await this.userService.getUserProfile(currentUser.id);
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0] as File;
    
    // Check if file is jpg/jpeg
    if (file && !file.type.includes('jpeg')) {
      this.errorMessage = 'Solo se permiten imágenes en formato JPG/JPEG';
      return;
    }
    
    this.selectedFile = file;
    
    // Create preview
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async uploadImage() {
    if (!this.selectedFile) {
      this.errorMessage = 'Por favor seleccione una imagen para subir';
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;
      
      await this.userService.updateProfileImage(this.selectedFile);
      
      // Reload user profile to get updated image URL
      await this.loadUserProfile();
      
      this.successMessage = 'Imagen de perfil actualizada correctamente';
      this.selectedFile = null;
      this.previewUrl = null;
      this.showSuccessModal = true; // Show success modal
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && imgElement.src) {
      imgElement.src = this.defaultProfileImage;
    }
  }

  async deleteImage() {
    try {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;
      
      await this.userService.deleteProfileImage();
      await this.loadUserProfile();
      
      this.successMessage = 'Imagen de perfil eliminada correctamente';
      this.showSuccessModal = true;
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  cancelUpload() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.errorMessage = null;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
}
