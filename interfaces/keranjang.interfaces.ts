import { Kategori } from './kategori.interfaces';

// Single cart item response
export interface KeranjangResponse {
  message: string;
  data?: Keranjang | Keranjang[];
  error?: string;
}

// Collection of cart items response
export interface KeranjangCollectionResponse {
  message: string;
  data?: Keranjang[];
  error?: string;
}

// Cart item model matching your Prisma schema
export interface Keranjang {
  id: number;
  id_user: number;
  id_barang: number;
  jumlah: number;
  subtotal: number;
  barang?: Barang;
}

// Barang model matching your Prisma schema
export interface Barang {
  id: number;
  nama: string;
  stok: number;
  harga: number;
  foto: string;
  deskripsi: string;
  harga_pinalti_per_jam: number;
  kategori_id: number;
  kategori?: Kategori;
}

// Cart item for frontend display
export interface KeranjangItemView {
  id: string;
  image: string;
  name: string;
  price: number;
  initialQuantity: number;
  barangId: number;
  stock?: number;
}

// Cart item data for checkout
export interface CheckoutItem {
  barangId: number;
  quantity: number;
  name?: string;
  price?: number;
  subtotal?: number;
}