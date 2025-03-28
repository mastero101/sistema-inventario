import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryPaginatedComponent } from './inventory-paginated.component';

describe('InventoryPaginatedComponent', () => {
  let component: InventoryPaginatedComponent;
  let fixture: ComponentFixture<InventoryPaginatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryPaginatedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InventoryPaginatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
