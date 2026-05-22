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
  Target,
  Users
} from 'lucide-react';
import { fetchApi, api } from '@/lib/api';
import Cookies from 'js-cookie';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface MyItem {
  id: string;
  title: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  category: string;
  rating?: number;
  reviewCount?: number;
  isAIContent?: boolean;
}

interface AnalyticsData {
  totalUsers?: number;
  totalProducts: number;
  approved: number;
  pending: number;
  rejected: number;
  aiGeneratedCount: number;
  totalReviews?: number;
  averageRating?: number;
  items: MyItem[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const userStr = Cookies.get('user');

  useEffect(() => {
    let role = '';
    try {
      if (userStr) role = JSON.parse(userStr).role;
    } catch {}

    const isAdminUser = role === 'ADMIN';
    setIsAdmin(isAdminUser);

    const fetchData = async () => {
      try {
        let items: MyItem[] = [];
        let totalUsers = 0;

        if (isAdminUser) {
          const [itemsRes, usersRes] = await Promise.all([
            fetchApi(`${api.items}?includeAll=true&limit=500`),
            fetchApi(api.usersAll),
          ]);
          items = itemsRes?.data?.items || itemsRes?.items || [];
          totalUsers = Array.isArray(usersRes?.data) ? usersRes.data.length : 0;
        } else {
          const res = await fetchApi(`${api.items}/my-items?limit=500`);
          items = res?.data?.items || res?.items || [];
        }


        const approved = items.filter(i => i.status === 'APPROVED').length;
        const pending = items.filter(i => i.status === 'PENDING').length;
        const rejected = items.filter(i => i.status === 'REJECTED').length;
        const aiCount = items.filter(i => !!i.isAIContent).length;

        const rated = items.filter(i => (i.rating || 0) > 0);
        const avgRating = rated.length > 0
          ? rated.reduce((sum, i) => sum + (i.rating || 0), 0) / rated.length
          : 0;

        const totalReviews = items.reduce((sum, i) => sum + (i.reviewCount || 0), 0);

        setData({
          totalUsers: isAdminUser ? totalUsers : undefined,
          totalProducts: items.length,
          approved,
          pending,
          rejected,
          aiGeneratedCount: aiCount,
          totalReviews,
          averageRating: Math.round(avgRating * 10) / 10,
          items,
        });
      } catch (e) {
        console.error('Analytics fetch error:', e);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userStr]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 text-center text-red-500 bg-white min-h-[60vh]">
        Failed to load analytics data
      </div>
    );
  }
  const approvalRate = data.totalProducts > 0 
    ? Math.round((data.approved / data.totalProducts) * 100) 
    : 0;

  const aiAdoption = data.totalProducts > 0 
    ? Math.round((data.aiGeneratedCount / data.totalProducts) * 100) 
    : 0;

  // Status data for Pie
  const statusData = [
    { name: 'Approved', value: data.approved, fill: '#10b981' },
    { name: 'Pending', value: data.pending, fill: '#f59e0b' },
    { name: 'Rejected', value: data.rejected, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  // Category data for Bar
  const categoryData = Object.entries(
    data.items.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {isAdmin ? "Platform Analytics" : "My Analytics"}
              </h1>
              <p className="text-gray-500 mt-1 text-lg">
                {isAdmin 
                  ? "Real-time overview of the entire platform" 
                  : "Performance of your product listings"}
              </p>
            </div>
            <Badge 
              className={`px-4 py-1 text-sm font-medium ${isAdmin 
                ? 'bg-red-100 text-red-700 border-red-200' 
                : 'bg-sky-100 text-sky-700 border-sky-200'}`}
            >
              {isAdmin ? 'ADMIN' : 'MANAGER'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">

        {/* KPI Cards - Modern Style */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {isAdmin && data.totalUsers !== undefined && (
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Total Users</p>
                    <p className="text-4xl font-bold text-gray-900 mt-1">{data.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-2xl">
                    <Users className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Total Products</p>
                  <p className="text-4xl font-bold text-gray-900 mt-1">{data.totalProducts}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <Package className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Pending</p>
                  <p className="text-4xl font-bold text-amber-600 mt-1">{data.pending}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <Clock className="h-7 w-7 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Approved</p>
                  <p className="text-4xl font-bold text-emerald-600 mt-1">{data.approved}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <CheckCircle className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">AI Generated</p>
                  <p className="text-4xl font-bold text-violet-600 mt-1">{data.aiGeneratedCount}</p>
                </div>
                <div className="p-3 bg-violet-50 rounded-2xl">
                  <Bot className="h-7 w-7 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Approval Rate</p>
                  <p className="text-4xl font-bold text-sky-600 mt-1">{approvalRate}%</p>
                </div>
                <div className="p-3 bg-sky-50 rounded-2xl">
                  <TrendingUp className="h-7 w-7 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Modern & Clean */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Pie Chart */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <Target className="h-5 w-5 text-gray-600" />
                Approval Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={40} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-400">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Category Bar Chart */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                Top Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-400">No category data</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Adoption Highlight */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">AI Adoption</p>
              <p className="text-5xl font-bold text-violet-600 mt-2">{aiAdoption}%</p>
              <p className="text-gray-600 mt-1">
                {data.aiGeneratedCount} of {data.totalProducts} listings created using AI
              </p>
            </div>
            <div className="p-5 bg-violet-50 rounded-2xl">
              <Bot className="h-14 w-14 text-violet-500" />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}


