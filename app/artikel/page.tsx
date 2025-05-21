"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ArticleSummary {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  tag?: string;
}

// Helper function to get excerpt
function getExcerpt(content: string, maxLength = 120): string {
  if (!content) return '';
  const plainText = content.replace(/<[^>]*>?/gm, '');
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
}

// Format date
function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Normalize image path
const normalizeImage = (path: string | null) => {
  if (!path) return '/placeholder-image.jpg';
  return path.startsWith('/') || path.startsWith('http') ? path : `/${path}`;
};

export default function ArtikelPage() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        const response = await fetch('/api/artikel');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch articles: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error('Invalid response format');
        }
        
        // Define the expected API article type
        type ApiArticle = {
          id: number;
          judul: string;
          konten: string;
          publishAt?: string;
          createdAt: string;
          foto: string | null;
          is_published: boolean;
          is_deleted: boolean;
          tags?: { nama: string };
        };

        // Map API response to expected format
        const formattedArticles = (result.data as ApiArticle[])
          .filter((article) => article.is_published && !article.is_deleted)
          .map((article) => ({
            id: article.id,
            title: article.judul,
            excerpt: getExcerpt(article.konten, 120),
            date: formatDate(article.publishAt || article.createdAt),
            image: normalizeImage(article.foto),
            tag: article.tags?.nama
          }));
        
        setArticles(formattedArticles);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Memuat artikel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 text-center">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Artikel Terbaru</h1>
      
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Belum ada artikel tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 space-y-3">
                <Image
                  src={article.image}
                  alt={article.title}
                  width={400}
                  height={200}
                  className="rounded-lg object-cover w-full h-40"
                />
                <div>
                  {article.tag && (
                    <span className="inline-block bg-lime-100 text-lime-800 text-xs px-2 py-1 rounded mb-2">
                      {article.tag}
                    </span>
                  )}
                  <h2 className="text-lg font-semibold">{article.title}</h2>
                  <p className="text-muted-foreground text-xs mb-1">{article.date}</p>
                  <p className="text-sm mb-3">{article.excerpt}</p>
                  <Link href={`/artikel/${article.id}`}>
                    <Button size="sm" className="bg-[#3528AB] hover:bg-[#3528AB]/90 text-white">Selengkapnya</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}