export interface Equipment {
  id?: string;
  type: 'COMPUTER' | 'PRINTER' | 'SCANNER' | 'NETWORK' | 'PERIPHERAL';
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  warranty: number; // meses
  department: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
  assignedTo?: string;
  specifications: {
    processor?: string;
    ram?: string;
    storage?: string;
    operatingSystem?: string;
    [key: string]: any;
  };
  lastMaintenance?: Date;
  notes?: string;
} 