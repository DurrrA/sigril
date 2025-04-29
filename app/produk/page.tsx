import React from 'react';
import ProductCarousel from '../components/ProductCarousel';
import { BarangResponse } from '@/interfaces/barang.interfaces';

async function getBarang(): Promise<BarangResponse> {
    try {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/barang`, {
            cache: 'no-store',
        });
        if (!res.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.error(error);
        return { message: "Error fetching data", data: [] };
    }
}

export default async function ProdukPage() {
    const response = await getBarang();
    const barangList = response.data || [];

    const groupedByCategory = barangList.reduce((result, item) => {
        const categoryName = item.kategori.nama;

        let categoryGroup = result.find(group => group.category === categoryName);
        if (!categoryGroup) {
            categoryGroup = { category: categoryName, products: [] };
            result.push(categoryGroup);
        }

        categoryGroup.products.push(item);
        
        return result;
    }, [] as Array<{category: string, products: typeof barangList}>);
    
    return (
        <div className="min-h-screen bg-gray-100 p-10">
            <h1 className="text-4xl font-bold text-center mb-10">Produk Kami</h1>
            {groupedByCategory.map(({ category, products }) => (
                <div key={category} className="mt-10 px-6 mx-20">
                    {products.length > 0 ? (
                        <ProductCarousel 
                            category={category} 
                            products={products.map(barang => ({
                                id: barang.id ,
                                image: barang.foto.startsWith('/') ? barang.foto : `/${barang.foto}`,
                                name: barang.nama ,
                                price: `Rp ${barang.harga.toLocaleString('id-ID')}`,
                                description: barang.deskripsi
                            }))} 
                        />
                        ) : (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{category}</h2>
                            <p className="text-gray-500">Tidak ada barang untuk kategori ini.</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}