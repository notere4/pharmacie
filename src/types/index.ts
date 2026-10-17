export interface Category {
  id: string;
  name: string;
  description: string | null;
  type: "medicine" | "material";
  created_at: string;
}

export interface StockBatch {
  id: string;
  expiration_date: string;
  quantity: number;
  location: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  etage: string | null;
  note: string | null;
  created_at: string;
}

export interface Medicine {
  id: string;
  name: string;
  barcode: string | null;
  category_id: string | null;
  supplier_id: string | null;
  description: string | null;
  unit: string;
  unit_price?: number;
  current_stock: number;
  min_stock_level: number;
  batch_number: string | null;
  location: string | null;
  stocks?: StockBatch[];
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  medicine_id: string;
  service?: Service | null;
  type: "entry" | "exit";
  quantity: number;
  unit_price?: number | null;
  reference: string | null;
  notes: string | null;
  movement_date: string;
  created_at: string;
}

export interface InvoiceItem {
  id?: string;
  delivery_note_id?: string;
  delivery_note_number?: string;
  medicine_id: string;
  medicine?: Medicine | null;
  quantity: number;
  unit_price: number;
  line_total?: number;
  lot?: string | null;
  expiration_date?: string | null;
}

export interface Invoice {
  id: string;
  number?: string;
  date?: string;
  supplier_id: string;
  supplier?: Supplier | null;
  status?: string;
  date_start?: string;
  date_end?: string;
  notes?: string | null;
  items?: InvoiceItem[];
  total_value?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MedicineWithDetails extends Medicine {
  category?: Category;
  supplier?: Supplier;
}

export interface DashboardStats {
  totalMedicines: number;
  lowStockCount: number;
  expiringCount: number;
  totalValue: number;
}

export type ExpirationStatus = "expired" | "critical" | "warning" | "good";
