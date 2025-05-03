"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Artikel } from "@/interfaces/artikel.interfaces"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export default function Page() {
  // Add state for articles, loading state, and error state
  const [articles, setArticles] = useState<Artikel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Use useEffect for client-side data fetching
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/artikel')
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const result = await response.json()
        setArticles(result.data || [])
      } catch (err) {
        console.error('Error fetching articles:', err)
        setError('Failed to load articles')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [])

  // Get the most recent 5 articles for the table
  const recentArticles = articles.slice(0, 5)

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  {/* Add your dashboard content here */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-3">Dashboard Overview</h2>
                    <p>Welcome to your admin dashboard.</p>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Artikel Terbaru</h2>
                  <div className="overflow-auto rounded-lg border">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-[#3528AB] text-white [&_th]:text-white">
                        <TableRow>
                          <TableHead>Judul</TableHead>
                          <TableHead>Tag</TableHead>
                          <TableHead>Tanggal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-5 w-5 animate-spin text-[#3528AB] mr-2" />
                                <span>Memuat artikel...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-red-500">
                              {error}
                            </TableCell>
                          </TableRow>
                        ) : recentArticles.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                              Tidak ada artikel tersedia
                            </TableCell>
                          </TableRow>
                        ) : (
                          recentArticles.map((article) => (
                            <TableRow key={article.id}>
                              <TableCell className="font-medium truncate max-w-[180px]">
                                {article.judul}
                              </TableCell>
                              <TableCell>{article.tags?.nama || 'Tanpa Tag'}</TableCell>
                              <TableCell>
                                {format(new Date(article.publishAt), 'dd MMM yyyy', { locale: id })}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}