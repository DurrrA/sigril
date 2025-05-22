"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useEffect } from "react"
import { Loader2, Package, Users, CreditCard, Calendar, ChevronRight } from "lucide-react"
import { Artikel } from "@/interfaces/artikel.interfaces"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import dynamic from 'next/dynamic'
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Dynamic import for the map component (to avoid SSR issues with Leaflet)
const OrdersMap = dynamic(() => import("@/components/OrderMaps"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#3528AB]" />
        <p className="mt-2 text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeRentals: number;
  recentOrders: Array<{
    id: number;
    username: string;
    date: string;
    status: string;
    amount: number;
  }>;
}

export default function Page() {
  // Add state for articles, stats, and loading states
  const [articles, setArticles] = useState<Artikel[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeRentals: 0,
    recentOrders: []
  })
  const [isLoadingArticles, setIsLoadingArticles] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoadingArticles(true)
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
        setIsLoadingArticles(false)
      }
    }

    fetchArticles()
  }, [])

  useEffect(() => {
  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      
      // Make a real API call instead of using mock data
      const response = await fetch('/api/transaksi/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // You could set an error state here if you want to display it
    } finally {
      setIsLoadingStats(false);
    }
  };
  
  fetchStats();
}, []);
  
  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true)
        
        // In a real app, you'd have an API endpoint for dashboard stats
        // This is a placeholder that would be replaced with actual API call
        // const response = await fetch('/api/admin/dashboard-stats')
        // const data = await response.json()
        
        // Simulating data for now - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 800))
        
        setStats({
          totalUsers: 42,
          totalOrders: 128,
          totalRevenue: 24500000,
          activeRentals: 17,
          recentOrders: [
            { id: 235, username: "alfianz", date: "2025-05-13", status: "completed", amount: 450000 },
            { id: 234, username: "dianp", date: "2025-05-12", status: "active", amount: 350000 },
            { id: 233, username: "rahmanf", date: "2025-05-11", status: "active", amount: 125000 },
            { id: 232, username: "mariak", date: "2025-05-10", status: "pending", amount: 275000 },
          ]
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setIsLoadingStats(false)
      }
    }
    
    fetchStats()
  }, [])

  // Get the most recent 5 articles
  const recentArticles = articles.slice(0, 5)

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 ml-2">
              {/* Stats Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                          Registered users
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Orders
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                          Completed orders
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                          Total revenue
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Rentals
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{stats.activeRentals}</div>
                        <p className="text-xs text-muted-foreground">
                          Currently active
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Order Map */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xl font-semibold">Order Locations</CardTitle>
                      <Link href="/admin/orders-map">
                        <Button variant="ghost" size="sm" className="gap-1 text-[#3528AB]">
                          <span>View Full Map</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-[600px]">
                        <OrdersMap height="500px"/>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Recent Orders */}
                  <Card className="mt-4">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xl font-semibold">Recent Orders</CardTitle>
                      <Link href="/admin/penyewaan">
                        <Button variant="ghost" size="sm" className="gap-1 text-[#3528AB]">
                          <span>View All</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-auto max-h-[320px]">
                        <Table>
                          <TableHeader className="sticky top-0 bg-white z-10">
                            <TableRow>
                              <TableHead>Order</TableHead>
                              <TableHead>Customer</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {isLoadingStats ? (
                              <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                  <div className="flex justify-center items-center">
                                    <Loader2 className="h-5 w-5 animate-spin text-[#3528AB] mr-2" />
                                    <span>Loading orders...</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : stats.recentOrders.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                  No orders available
                                </TableCell>
                              </TableRow>
                            ) : (
                              stats.recentOrders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-slate-50">
                                  {/* Row content */}
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}