export interface Barang {
    id : string;
    stok : number;
    foto : string;
    harga_pinalti_per_jam : number;
    deskripsi : string;
    kategori_id : number;
    harga : number;
    nama : string;
    kategori : kategori;
}

export interface kategori {
    id : number;
    nama : string;
}

export interface BarangResponse{
    message: string;
    data: Barang[];
    error?: string;
}