import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JSX } from "react";

interface ArticleDetail {
  title: string;
  date: string;
  category: string;
  content: string[];
  image: string;
  related: RelatedArticle[];
}

interface RelatedArticle {
  id: string;
  title: string;
  date: string;
  image: string;
  excerpt: string;
}

const articles: Record<string, ArticleDetail> = {
  "1": {
    title: "Best Strategy to Achieve Profitable Harvest",
    date: "October 23, 2023",
    category: "Popular Articles",
    image: "/images/harvest.jpg",
    content: [
      "Optimal strategies for achieving profitable harvests involve a comprehensive approach to farm management, selection of appropriate crop varieties, implementation of efficient practices.",
      "Achieving a profitable harvest involves a series of strategic steps that include selecting plant varieties that suit environmental conditions, efficient crop management, use of appropriate agricultural technology, choosing optimal harvest times, as well as effective marketing and distribution strategies to increase the selling value of the harvest.",
      "### 1. Selection of the Right Varieties and Seeds",
      "Selecting the right varieties and seeds is a key step in achieving a successful harvest...",
      "### 2. Efficient Crop Management",
      "Efficient plant management involves regular plant maintenance...",
      "### 3. Use of Agricultural Technology",
      "Utilization of agricultural technology involves the use of various advanced tools...",
      "### 4. Choosing the Right Harvest Time",
      "Choosing the right harvest time involves careful monitoring of crop maturity..."
    ],
    related: [
      {
        id: "2",
        title: "Achieving High Productivity from Your Own Home Garden.",
        date: "October 23, 2023",
        image: "/images/garden.jpg",
        excerpt: "A practical guide to achieving satisfactory results from plants grown in your home.",
      },
      {
        id: "3",
        title: "The Best Guide to Planting Seeds with Optimal Results.",
        date: "October 23, 2023",
        image: "/images/planting.jpg",
        excerpt: "Effective strategies and techniques to achieve healthy and productive plant growth.",
      },
      {
        id: "4",
        title: "Strategies for Caring for Your Garden More Efficiently and Productively.",
        date: "October 23, 2023",
        image: "/images/farm.jpg",
        excerpt: "An approach that improves plant performance and makes garden management easier.",
      },
    ],
  },
};

interface ArtikelDetailProps {
  params: {
    id: string;
  };
}

export default function ArtikelDetail({ params }: ArtikelDetailProps): JSX.Element {
  const article = articles[params.id];
  if (!article) return notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2  text-center">
            <div className="flex justify-center items-center gap-4">
                <Badge variant="outline" className="bg-lime-100 text-lime-800">
                    {article.category}
                </Badge>
                <span className="text-sm text-muted-foreground">{article.date}</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mt-6 mb-4">{article.title}</h1>
            <p className="text-muted-foreground text-lg mb-6">
            Optimal strategies for achieving profitable harvests involve a comprehensive approach to farm management, selection of appropriate crop varieties, implementation of efficient practices.
            </p>
        </div>

      <Image
        src={article.image}
        alt={article.title}
        width={800}
        height={400}
        className="rounded-xl w-full h-auto object-cover"
      />

      <div className="prose prose-neutral prose-lg max-w-none">
        {article.content.map((paragraph, i) =>
          paragraph.startsWith("### ") ? (
            <h3 key={i}>{paragraph.replace("### ", "")}</h3>
          ) : (
            <p key={i}>{paragraph}</p>
          )
        )}
      </div>

      <section className="pt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Related Article</h2>
          <Button variant="outline" size="sm">View all Articles</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {article.related.map((rel) => (
            <Card key={rel.id} className="h-full">
              <CardContent className="p-0">
                <Image
                  src={rel.image}
                  alt={rel.title}
                  width={400}
                  height={200}
                  className="rounded-t-lg w-full h-48 object-cover"
                />
                <div className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground">{rel.date}</p>
                  <h3 className="font-semibold text-base">{rel.title}</h3>
                  <p className="text-sm text-muted-foreground">{rel.excerpt}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
