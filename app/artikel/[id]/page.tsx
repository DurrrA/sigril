// Remove "use client" directive to make this a Server Component

import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

// Interface for artikel comments

// (Removed unused ApiArticle interface)

interface ArtikelDetailProps {
  params: {
    id: string;
  };
}

// Helper function to format date
function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Helper function to get excerpt
function getExcerpt(content: string, maxLength = 120): string {
  if (!content) return '';
  const plainText = content.replace(/<[^>]*>?/gm, '');
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
}

// Get normal image path
const normalizeImage = (path: string | null) => {
  if (!path) return '/placeholder-image.jpg'; // Fallback for missing images
  return path.startsWith('/') || path.startsWith('http') ? path : `/${path}`;
};

export default async function ArtikelDetail({ params }: ArtikelDetailProps) {
  try {
    // Instead of using fetch, directly use Prisma to get data
    const article = await prisma.artikel.findUnique({
      where: {
        id: parseInt(params.id),
        is_deleted: false
      },
      include: {
        tags: true,
        artikel_comment: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!article) {
      notFound();
    }
    
    // Get related articles
    const relatedArticles = await prisma.artikel.findMany({
      where: {
        is_deleted: false,
        is_published: true,
        id: {
          not: parseInt(params.id)
        },
        // Optional: filter by same tag if the current article has a tag
        ...(article.id_tags ? { id_tags: article.id_tags } : {})
      },
      include: {
        tags: true
      },
      orderBy: {
        publishAt: 'desc'
      },
      take: 3
    });

    // Parse content paragraphs
    const contentParagraphs = article.konten
      .split('\n')
      .filter((p: string) => p.trim() !== "");

    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2 text-center">
          <div className="flex justify-center items-center gap-4">
            {article.tags && (
              <Badge variant="outline" className="bg-lime-100 text-lime-800">
                {article.tags.nama}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {formatDate(article.publishAt?.toString() || article.createdAt.toString())}
            </span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mt-6 mb-4">
            {article.judul}
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            {getExcerpt(article.konten, 180)}
          </p>
        </div>

        {article.foto && (
          <Image
            src={normalizeImage(article.foto)}
            alt={article.judul}
            width={800}
            height={400}
            className="rounded-xl w-full h-auto object-cover"
          />
        )}

        <div className="prose prose-neutral prose-lg max-w-none">
          {contentParagraphs.map((paragraph: string, i: number) =>
            paragraph.startsWith("### ") ? (
              <h3 key={i}>{paragraph.replace("### ", "")}</h3>
            ) : paragraph.startsWith("## ") ? (
              <h2 key={i}>{paragraph.replace("## ", "")}</h2>
            ) : (
              <p key={i}>{paragraph}</p>
            )
          )}
        </div>

        {relatedArticles.length > 0 && (
          <section className="pt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Related Articles</h2>
              <Link href="/artikel">
                <Button variant="outline" size="sm">View all Articles</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <Link key={rel.id} href={`/artikel/${rel.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-0">
                      {rel.foto && (
                        <Image
                          src={normalizeImage(rel.foto)}
                          alt={rel.judul}
                          width={400}
                          height={200}
                          className="rounded-t-lg w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4 space-y-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(rel.publishAt?.toString() || rel.createdAt.toString())}
                        </p>
                        <h3 className="font-semibold text-base">{rel.judul}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getExcerpt(rel.konten)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error rendering article:", error);
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">Error Loading Article</h2>
        <p className="mt-4">{error instanceof Error ? error.message : "An unknown error occurred"}</p>
        <Link href="/artikel">
          <Button className="mt-6">Back to Articles</Button>
        </Link>
      </div>
    );
  }
}