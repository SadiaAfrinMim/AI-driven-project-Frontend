'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Bot,
  BarChart3,
  Award,
  Target
} from 'lucide-react';
import { fetchApi, api } from '@/lib/api';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

interface MyItem {
  id: string;
  title: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  category: string;
  rating?: number;
  reviewCount?: number;
  isAIContent?: boolean;
  createdAt: string;
}

interface ManagerAnalytics {
  totalProducts: number;
  approved: number;
  pending: number;
  rejected: number;
  averageRating: number;
  totalReviewsReceived: number;
  aiGeneratedCount: number;
  items: MyItem[];
}

export default function ManagerAnalyticsPage() {
  const [analytics, setAnalytics] = useState<ManagerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagerAnalytics = async () => {
      try {
        // Fetch only the current manager's items
        const itemsRes = await fetchApi(`${api.items}/my-items?limit=200`);

        const myItems: MyItem[] = itemsRes?.data?.items || itemsRes?.items || [];

        const approved = myItems.filter(i => i.status === 'APPROVED').length;
        const pending = myItems.filter(i => i.status === 'PENDING').length;
        const rejected = myItems.filter(i => i.status === 'REJECTED').length;

        const aiGeneratedCount = myItems.filter(i => i.isAIContent).length;

        const itemsWithRating = myItems.filter(i => i.rating && i.rating > 0);
        const averageRating = itemsWithRating.length > 0
          ? itemsWithRating.reduce((sum, i) => sum + (i.rating || 0), 0) / itemsWithRating.length
          : 0;

        const totalReviewsReceived = myItems.reduce((sum, i) => sum + (i.reviewCount || 0), 0);

        setAnalytics({
          totalProducts: myItems.length,
          approved,
          pending,
          rejected,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviewsReceived,
          aiGeneratedCount,
          items: myItems,
        });
      } catch (error) {
        console.error('Failed to fetch manager analytics:', error);
        setAnalytics({
          totalProducts: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          averageRating: 0,
          totalReviewsReceived: 0,
          aiGeneratedCount: 0,
          items: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchManagerAnalytics();
  }, []);

  // Category distribution
  const categoryData = analytics?.items
    ? Object.entries(
        analytics.items.reduce((acc: Record<string, number>, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
    : [];

  // Status pie data
  const statusData = analytics
    ? [
        { name: 'Approved', value: analytics.approved, fill: '#10b981' },
        { name: 'Pending', value: analytics.pending, fill: '#f59e0b' },
        { name: 'Rejected', value: analytics.rejected, fill: '#ef4444' },
      ].filter(d => d.value > 0)
    : [];

  // Top performing products (by rating + reviews)
  const topProducts = analytics?.items
    ? [...analytics.items]
        .filter(i => i.status === 'APPROVED' && (i.rating || 0) > 0)
        .sort((a, b) => {
          const scoreA = (a.rating || 0) * 10 + (a.reviewCount || 0);
          const scoreB = (b.rating || 0) * 10 + (b.reviewCount || 0);
          return scoreB - scoreA;
        })
        .slice(0, 5)
    : [];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Beautiful Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Manager Analytics</h1>
              <p className="text-blue-100 mt-1 text-lg">Track the performance of your product listings</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <Target className="h-64 w-64" />
        </div>
      </div>

      {/* Eye-Catching KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">My Products</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">{analytics?.totalProducts || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-4xl font-bold text-emerald-600 mt-1">{analytics?.approved || 0}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                <p className="text-4xl font-bold text-amber-600 mt-1">{analytics?.pending || 0}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-2xl">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-4xl font-bold text-red-600 mt-1">{analytics?.rejected || 0}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-2xl">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Rating</p>
                <p className="text-4xl font-bold text-yellow-600 mt-1 flex items-baseline">
                  {analytics?.averageRating || 0}
                  <span className="text-lg ml-1">/5</span>
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-2xl">
                <Star className="h-8 w-8 text-yellow-600 fill-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Reviews Received</p>
                <p className="text-4xl font-bold text-purple-600 mt-1">{analytics?.totalReviewsReceived || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-2xl">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Visual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown - Donut Chart */}
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-6 w-6 text-emerald-600" />
              Approval Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={130}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={50} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No products yet. Start posting items!
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Content Usage */}
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bot className="h-6 w-6 text-purple-600" />
              AI Content Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="flex flex-col items-center justify-center h-[260px]">
              <div className="text-7xl font-bold text-purple-600">
                {analytics?.aiGeneratedCount || 0}
              </div>
              <p className="text-lg text-gray-600 mt-2">Products created with AI</p>
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  <Bot className="h-4 w-4" />
                  {analytics?.totalProducts ? Math.round(((analytics.aiGeneratedCount / analytics.totalProducts) * 100) || 0) : 0}% of your listings used AI
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Your Products by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-6">
          {categoryData.length > 0 ? (
            <div className="space-y-4">
              {categoryData.map((cat, index) => {
                const percentage = Math.round((cat.value / (analytics?.totalProducts || 1)) * 100);
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-40 text-sm font-semibold text-gray-700 truncate">{cat.name}</div>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                        style={{
                          width: `${percentage}%`,
                          background: `linear-gradient(to right, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 2) % COLORS.length]})`
                        }}
                      >
                        <span className="text-[10px] font-bold text-white drop-shadow">{percentage}%</span>
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-bold text-gray-700 tabular-nums">
                      {cat.value} items
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No category data available yet.</div>
          )}
        </CardContent>
      </Card>

      {/* Top Performing Products */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-6 w-6 text-orange-600" />
            Your Top Performing Products
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {topProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topProducts.map((product, idx) => (
                <div key={idx} className="group p-4 rounded-xl border hover:border-orange-300 transition-all bg-white shadow-sm hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {product.title}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="ml-1 font-bold text-gray-800">{product.rating?.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-gray-500">({product.reviewCount || 0} reviews)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-gray-400 mb-2">
                <Award className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-600">Your approved products with good ratings will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tip Footer */}
      <div className="text-center text-sm text-gray-500 bg-white/70 py-4 rounded-xl border">
        Pro tip: Use the <span className="font-semibold text-purple-600">AI Assistant</span> to generate high-quality titles and descriptions to increase approval chances and ratings.
      </div>
    </div>
  );
}
