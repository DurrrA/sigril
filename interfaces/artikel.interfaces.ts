export interface Tag {
    nama: string;
    id: number;
}

export interface ArtikelComment {
    id: number;
    id_artikel: number;
    id_user: number;
    komen_teks: string;
}

export interface Artikel {
    id: number;
    judul: string;
    konten: string;
    foto: string;
    id_tags: number;
    createdAt: string;
    is_deleted: boolean;
    is_published: boolean;
    publishAt: string;
    updatedAt: string | null;
    tags: Tag;
    artikel_comment: ArtikelComment[];
}

export interface ArtikelResponse {
    message: string;
    data: Artikel;
}