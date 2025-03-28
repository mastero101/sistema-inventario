import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { PaginatedService } from '../../../services/paginated.service';
import { InventoryItem } from '../../../models/inventory-item.model';

@Component({
  selector: 'app-inventory-paginated',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-paginated.component.html',
  styleUrls: ['./inventory-paginated.component.scss']
})
export class InventoryPaginatedComponent implements OnInit {
  isLoading: boolean = false;
  errorMessage: string | null = null;
  inventoryItems: InventoryItem[] = [];
  totalItems: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;

  constructor(
    private paginatedService: PaginatedService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadPaginatedInventory();
  }

  async loadPaginatedInventory(): Promise<void> {
    this.isLoading = true;
    try {
      if (isPlatformBrowser(this.platformId)) {
        // Use getPaginatedInventory instead of getPaginatedData
        const paginatedResponse = await this.paginatedService.getPaginatedInventory({
          pageIndex: this.currentPage,
          pageSize: this.pageSize,
          sortDirection: 'asc',
          sortProperty: 'string'
        });

        this.inventoryItems = paginatedResponse.content.items;
        this.totalItems = paginatedResponse.content.totalItems;
        this.totalPages = paginatedResponse.content.totalPages;
        
        console.log('Mapped inventory items:', this.inventoryItems);
      }
    } catch (error) {
      this.errorMessage = 'Error al cargar el inventario: ' + (error as Error).message;
      console.error('Error loading inventory:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPaginatedInventory();
  }
}
