export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: 'medicine' | 'material';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type: 'medicine' | 'material';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: 'medicine' | 'material';
          created_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
        };
      };
      medicines: {
        Row: {
          id: string;
          name: string;
          barcode: string | null;
          category_id: string | null;
          supplier_id: string | null;
          description: string | null;
          unit: string;
          unit_price: number;
          min_stock_level: number;
          batch_number: string | null;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          barcode?: string | null;
          category_id?: string | null;
          supplier_id?: string | null;
          description?: string | null;
          unit?: string;
          unit_price?: number;
          min_stock_level?: number;
          batch_number?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          barcode?: string | null;
          category_id?: string | null;
          supplier_id?: string | null;
          description?: string | null;
          unit?: string;
          unit_price?: number;
          min_stock_level?: number;
          batch_number?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_movements: {
        Row: {
          id: string;
          medicine_id: string;
          type: 'entry' | 'exit';
          quantity: number;
          reference: string | null;
          notes: string | null;
          movement_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          medicine_id: string;
          type: 'entry' | 'exit';
          quantity: number;
          reference?: string | null;
          notes?: string | null;
          movement_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          medicine_id?: string;
          type?: 'entry' | 'exit';
          quantity?: number;
          reference?: string | null;
          notes?: string | null;
          movement_date?: string;
          created_at?: string;
        };
      };
    };
  };
}
