export interface KategoriResponse {
    message: string;
    data?: Kategori | Kategori[];
    error?: string;
    }

export interface Kategori {
    id: number;
    nama: string;
    barang?: Barang[]; // Optional, if you want to include related barang
}

export interface Barang {
    id: number;
    nama: string;
    stok: number;
    harga: number;
    foto: string;
    deskripsi: string;
    harga_pinalti_per_jam: number;
    kategori_id: number;
    kategori?: Kategori; // Optional, if you want to include related kategori
}