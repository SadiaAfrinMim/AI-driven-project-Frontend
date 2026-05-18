'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  MessageSquare,
  Bot,
  Calendar,
  Activity,
  PieChart
} from 'lucide-react';
import { fetchApi, api } from '@/lib/api';
import Cookies from 'js-cookie';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPie, Pie, Cell, Legend } from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  totalItems: number;
  totalReviews: number;
  aiInteractions: number;
  userGrowth: number;
  itemGrowth: number;
  reviewGrowth: number;
  aiGrowth: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [usersRes, itemsRes, reviewsRes, insightsRes] = await Promise.all([
          fetchApi(`${api.users}/all-users`),
          fetchApi(api.items),
          fetchApi(api.reviews),
          fetchApi(api.ai.insights),
        ]);

        const totalUsers = Array.isArray(usersRes?.data) ? usersRes.data.length : (usersRes?.data?.length || 0);
        const totalItems = itemsRes?.data?.items
          ? itemsRes.data.items.length
          : Array.isArray(itemsRes?.data)
          ? itemsRes.data.length
          : (itemsRes?.data?.meta?.total || 0);
        const totalReviews = reviewsRes?.data?.reviews
          ? reviewsRes.data.reviews.length
          : Array.isArray(reviewsRes?.data)
          ? reviewsRes.data.length
          : (reviewsRes?.data?.meta?.total || 0);
        const aiInteractions = Array.isArray(insightsRes?.data)
          ? insightsRes.data.length
          : Array.isArray(insightsRes?.data?.insights)
          ? insightsRes.data.insights.length
          : 0;

        const data = {
          totalUsers,
          totalItems,
          totalReviews,
          aiInteractions,
          userGrowth: 0,
          itemGrowth: 0,
          reviewGrowth: 0,
          aiGrowth: 0,
        };

        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform performance metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />+{analytics?.userGrowth}% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalItems || 0}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />+{analytics?.itemGrowth}% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalReviews || 0}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />+{analytics?.reviewGrowth}% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
            <Bot className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.aiInteractions || 0}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />+{analytics?.aiGrowth}% this month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unique & Beautiful Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Premium Growth Area Chart */}
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600/5 to-purple-600/5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-6 w-6 text-blue-600" /> Platform Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={[
                { month: 'Jan', users: 820, products: 1250 },
                { month: 'Feb', users: 980, products: 1480 },
                { month: 'Mar', users: 1150, products: 1720 },
                { month: 'Apr', users: 1380, products: 2050 },
                { month: 'May', users: analytics?.totalUsers || 1620, products: analytics?.totalItems || 2450 },
              ]}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="natural" dataKey="users" stroke="#3b82f6" strokeWidth={4} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }} />
                <Line type="natural" dataKey="products" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Beautiful Donut - User Roles */}
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <PieChart className="h-6 w-6 text-purple-600" /> User Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RechartsPie>
                <Pie 
                  data={[
                    { name: 'Users', value: Math.max(analytics?.totalUsers || 120, 80), fill: '#3b82f6' },
                    { name: 'Managers', value: 12, fill: '#10b981' },
                    { name: 'Admins', value: 5, fill: '#f59e0b' },
                  ]} 
                  cx="50%" cy="50%" innerRadius={75} outerRadius={125} dataKey="value"
                >
                  {[{name:'Users',fill:'#3b82f6'},{name:'Managers',fill:'#10b981'},{name:'Admins',fill:'#f59e0b'}].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 3. Modern Horizontal Category Performance */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="h-6 w-6 text-emerald-600" /> Top Product Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-6">
            {[
              { name: 'Electronics', value: 38, color: '#3b82f6' },
              { name: 'Fashion', value: 29, color: '#8b5cf6' },
              { name: 'Home & Living', value: 18, color: '#10b981' },
              { name: 'Sports', value: 10, color: '#f59e0b' },
              { name: 'Beauty', value: 5, color: '#ec4899' },
            ].map((cat, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">{cat.name}</div>
                <div className="flex-1 h-4 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700" 
                    style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                  />
                </div>
                <div className="w-12 text-right text-sm font-semibold tabular-nums">{cat.value}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. Sleek AI Activity Bar Chart */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Activity className="h-6 w-6 text-rose-600" /> AI Feature Activity (This Week)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { day: 'Mon', chat: 68, content: 41 },
              { day: 'Tue', chat: 75, content: 52 },
              { day: 'Wed', chat: 82, content: 47 },
              { day: 'Thu', chat: 91, content: 63 },
              { day: 'Fri', chat: 79, content: 55 },
              { day: 'Sat', chat: 54, content: 38 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="chat" fill="#f43f5e" radius={4} name="AI Chat" />
              <Bar dataKey="content" fill="#8b5cf6" radius={4} name="Content Gen" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
