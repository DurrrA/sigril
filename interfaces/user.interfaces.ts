
export interface UserResponse{
    message: string;
    data: User[];
    error?: string;
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
    avatar: string | null;
    createdAt: string;
    date_of_birth: string | null;
    full_name: string | null;
    provider: string | null;
    provider_id: string | null;
    updatedAt: string | null;
    role: Role;
    transaksi: Transaction[];
    keranjang: CartItem[];
    penalti: Penalty[];
    review: Review[];
    sewa_req: RentalRequest[];
}

export interface Role {
    id: number;
    role_name: string;
    deskripsi: string;
}

export interface Transaction {
    id: number;
    id_user: number;
    total_pembayaran: number;
    tanggal_transaksi: string;
    bukti_pembayaran: string | null;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CartItem {
    id: number;
    id_user: number;
    id_barang: number;
    quantity: number;
    createdAt?: string;
    updatedAt?: string;
    barang?: Product;
}
  
export interface Penalty {
    id: number;
    id_user: number;
    id_barang: number;
    total_bayar: number;
    createdAt?: string;
    updatedAt?: string;
    barang?: Product; 
}
  
  
export interface Review {
    id: number;
    id_user: number;
    id_barang: number;
    rating: number;
    komentar: string;
    createdAt: string;
    updatedAt?: string;
    barang?: Product; 
}
  
export interface RentalRequest {
    id: number;
    id_user: number;
    start_date: string;
    end_date: string;
    status: string;
    dikembalikan_pada: string | null;
    createdAt?: string;
    updatedAt?: string;
    sewa_items?: RentalItem[]; 
}
  
export interface RentalItem {
    id_sewa_req: number;
    id_barang: number;
    jumlah: number;
    harga_total: number;
    barang?: Product;
}
  
export interface Product {
    category: string;
    category: string;
    category: string;
    id: number;
    nama: string;
    harga: number;
    stok: number;
    deskripsi: string;
    foto: string;
    id_kategori: number;
    harga_pinalti_per_jam: number;
    is_deleted: boolean;
    createdAt?: string;
    updatedAt?: string;
    kategori?: Category; 
}
  
export interface Category {
    id: number;
    nama: string;
    deskripsi: string;
    createdAt?: string;
    updatedAt?: string;
}
