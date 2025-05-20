import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { JSX } from "react";

interface ArticleSummary {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
}

const articles: ArticleSummary[] = [
  {
    id: "1",
    title: "Tips Merawat Alat Grill Setelah Disewa",
    excerpt: "Pelajari cara merawat alat grill agar tetap awet meskipun sering digunakan oleh penyewa berbeda...",
    date: "2025-05-10",
    image: "/images/artikel1.jpg",
  },
  {
    id: "2",
    title: "Jenis-Jenis Alat Grill dan Kegunaannya",
    excerpt: "Kenali berbagai jenis alat grill yang bisa Anda sewa sesuai kebutuhan acara Anda...",
    date: "2025-05-15",
    image: "/images/artikel2.jpg",
  },
];

export default function ArtikelPage(): JSX.Element {
  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Artikel Terbaru</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
}
