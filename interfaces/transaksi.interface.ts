export interface TransactionResponse {
    message: string;
    data: Transaction;
  }
  
  // Basic transaction fields that exist in database schema
  // Make sure your interface includes items
export interface Transaction {
    id: number;
    id_user: number;
    total_pembayaran: number;
    tanggal_transaksi: string;
    bukti_pembayaran: string;
    status: string;
    user: User;
    
    // Add these fields with proper types
    start_date?: string;
    end_date?: string;
    payment_method?: string;
    kode_transaksi?: string;
    items?: Array<{
      id: number;
      name: string;
      quantity: number;
      price: number;
      subtotal: number;
    }>;
  }
  
  export interface User {
    id: number;
    username: string;
    password: string;
    no_telp: string;
    alamat: string;
    is_blacklisted: boolean;
    role_id: number;
    email: string;
    remember_token: string | null;
    avatar: string;
    createdAt: string;
    date_of_birth: string | null;
    full_name: string;
    provider: string;
    provider_id: string | null;
    updatedAt: string | null;
  }