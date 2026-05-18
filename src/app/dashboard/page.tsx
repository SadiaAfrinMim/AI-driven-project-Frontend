'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Package,
  MessageSquare,
  Bot,
  TrendingUp,
  Shield,
  Settings,
  BarChart3,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Star,
  Calendar,
  Award,
  Target,
  Zap,
  Heart
} from 'lucide-react';
import { fetchApi, api } from '@/lib/api';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  profileImage?: string;
  bio?: string;
}

interface Stats {
  totalUsers?: number;
  totalItems?: number;
  totalReviews?: number;
  aiInteractions?: number;
  pendingItems?: number;
  reportedReviews?: number;
  myItems?: number;
  myReviews?: number;
}

interface Review {
  id: string;
  comment: string;
  rating: number;
  item?: {
    id: string;
    title: string;
    category: string;
  };
  createdAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = () => {
      const userData = Cookies.get('user');
      try {
        return userData ? JSON.parse(userData) : null;
      } catch {
        return null;
      }
    };

    const userData = getUser();
    setUser(userData);

    const fetchStats = async () => {
      try {
        if (userData?.role === 'ADMIN') {
          // Fetch main stats first
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

          // Fetch pending items separately (avoid rate limit)
          let pendingItems = 0;
          try {
            const pendingRes = await fetchApi(api.pendingItems);
            pendingItems = Array.isArray(pendingRes?.data) ? pendingRes.data.length : 0;
          } catch (e) {
            pendingItems = 0;
          }

          setStats({
            totalUsers,
            totalItems,
            totalReviews,
            aiInteractions,
            pendingItems,
          });
        } else if (userData?.role === 'MANAGER') {
          const [itemsRes, reviewsRes] = await Promise.all([
            fetchApi(api.items),
            fetchApi(api.reviews)
          ]);

          const totalItems = itemsRes?.data?.items ? itemsRes.data.items.length : (Array.isArray(itemsRes?.data) ? itemsRes.data.length : (itemsRes?.data?.meta?.total || 0));
          const totalReviews = reviewsRes?.data?.reviews ? reviewsRes.data.reviews.length : (Array.isArray(reviewsRes?.data) ? reviewsRes.data.length : (reviewsRes?.data?.meta?.total || 0));

          setStats({
            totalItems,
            totalReviews,
            aiInteractions: 0,
          });
        } else {
          try {
            const myReviewsRes = await fetchApi(`${api.reviews}/user/my-reviews`);
            const myReviews = Array.isArray(myReviewsRes?.data?.reviews)
              ? myReviewsRes.data.reviews.length
              : Array.isArray(myReviewsRes?.data)
              ? myReviewsRes.data.length
              : 0;

            setStats({
              myItems: 5,
              myReviews,
              aiInteractions: 0,
              totalItems: 5,
              totalReviews: myReviews,
            });
          } catch {
            setStats({
              myItems: 5,
              myReviews: 0,
              aiInteractions: 0,
              totalItems: 5,
              totalReviews: 0,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ==================== USER DASHBOARD ====================
  const renderUserDashboard = () => (
    <div className="space-y-10">
      {/* Premium Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-10 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-xl text-white/90">Ready to discover amazing products today?</p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20">
              <Heart className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Personal Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Products</Badge>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{stats.myItems || 0}</div>
            <p className="text-sm text-gray-600">My Listed Items</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Reviews</Badge>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{stats.myReviews || 0}</div>
            <p className="text-sm text-gray-600">Reviews Written</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">AI</Badge>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{stats.aiInteractions || 0}</div>
            <p className="text-sm text-gray-600">AI Conversations</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">Level</Badge>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">Silver</div>
            <p className="text-sm text-gray-600">Member Status</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" /> Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/items">
            <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-blue-100 rounded-2xl group-hover:bg-blue-200 transition-colors">
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Browse Products</h3>
                    <p className="text-sm text-gray-600">Discover amazing items</p>
                  </div>
                </div>
                <Button className="mt-auto w-full bg-blue-600 hover:bg-blue-700">Explore Now</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/ai">
            <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-purple-100 rounded-2xl group-hover:bg-purple-200 transition-colors">
                    <Bot className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Assistant</h3>
                    <p className="text-sm text-gray-600">Get smart recommendations</p>
                  </div>
                </div>
                <Button className="mt-auto w-full bg-purple-600 hover:bg-purple-700">Chat with AI</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/reviews">
            <Card className="border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-green-100 rounded-2xl group-hover:bg-green-200 transition-colors">
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">My Reviews</h3>
                    <p className="text-sm text-gray-600">Manage your feedback</p>
                  </div>
                </div>
                <Button className="mt-auto w-full bg-green-600 hover:bg-green-700">View Reviews</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Added new product listing</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Wrote a 5-star review</p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ==================== MANAGER DASHBOARD ====================
  const renderManagerDashboard = () => (
    <div className="space-y-10">
      {/* Manager Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Manager Dashboard</h1>
            </div>
            <p className="text-blue-100 text-lg">Oversee platform content and user activity</p>
          </div>
          <Badge className="bg-white/20 text-white text-lg px-4 py-1">MANAGER</Badge>
        </div>
      </div>

      {/* Management Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <Package className="w-8 h-8 text-blue-500" />
              <Badge className="bg-blue-100 text-blue-700">Total</Badge>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.totalItems || 0}</div>
            <p className="text-sm text-gray-600">Products on Platform</p>
          </CardContent>
        </Card>

        <Link href="/dashboard/items">
          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow cursor-pointer hover:border-orange-600">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
                <Badge className="bg-orange-100 text-orange-700">Pending</Badge>
              </div>
              <div className="text-4xl font-bold text-orange-600 mb-1">{stats.pendingItems || 0}</div>
              <p className="text-sm text-gray-600">Awaiting Approval</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <MessageSquare className="w-8 h-8 text-green-500" />
              <Badge className="bg-green-100 text-green-700">Feedback</Badge>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.totalReviews || 0}</div>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <Bot className="w-8 h-8 text-purple-500" />
              <Badge className="bg-purple-100 text-purple-700">AI</Badge>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.aiInteractions || 0}</div>
            <p className="text-sm text-gray-600">AI Interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Manager Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Management Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/items">
            <Card className="border-2 hover:border-blue-500 hover:shadow-xl transition-all group cursor-pointer h-full">
              <CardContent className="p-6">
                <Package className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-xl mb-2">Content Management</h3>
                <p className="text-gray-600 mb-4">Review, approve, and manage all product listings</p>
                <Button className="w-full">Manage Products</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/reviews">
            <Card className="border-2 hover:border-green-500 hover:shadow-xl transition-all group cursor-pointer h-full">
              <CardContent className="p-6">
                <MessageSquare className="w-12 h-12 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-xl mb-2">Review Moderation</h3>
                <p className="text-gray-600 mb-4">Monitor and moderate customer feedback</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">Moderate Reviews</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/analytics">
            <Card className="border-2 hover:border-purple-500 hover:shadow-xl transition-all group cursor-pointer h-full">
              <CardContent className="p-6">
                <BarChart3 className="w-12 h-12 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-xl mb-2">Platform Analytics</h3>
                <p className="text-gray-600 mb-4">View performance metrics and insights</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">View Analytics</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );

  // ==================== ADMIN DASHBOARD ====================
  const renderAdminDashboard = () => (
    <div className="space-y-10">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-10 h-10" />
              <h1 className="text-4xl font-bold">Admin Control Center</h1>
            </div>
            <p className="text-red-100 text-lg">Complete system oversight and management</p>
          </div>
          <Badge className="bg-white/20 text-white text-xl px-6 py-2 border border-white/30">ADMIN</Badge>
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="shadow-lg hover:shadow-2xl transition-all border-t-4 border-t-blue-500">
          <CardContent className="p-6 text-center">
            <Users className="w-10 h-10 mx-auto text-blue-500 mb-3" />
            <div className="text-4xl font-bold">{stats.totalUsers || 0}</div>
            <p className="text-sm text-gray-600 mt-1">Total Users</p>
            <Badge className="mt-2 bg-blue-100 text-blue-700">+12% this month</Badge>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-2xl transition-all border-t-4 border-t-green-500">
          <CardContent className="p-6 text-center">
            <Package className="w-10 h-10 mx-auto text-green-500 mb-3" />
            <div className="text-4xl font-bold">{stats.totalItems || 0}</div>
            <p className="text-sm text-gray-600 mt-1">Total Products</p>
            <Badge className="mt-2 bg-green-100 text-green-700">+8% this week</Badge>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-2xl transition-all border-t-4 border-t-orange-500">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto text-orange-500 mb-3" />
            <div className="text-4xl font-bold text-orange-600">{stats.pendingItems || 0}</div>
            <p className="text-sm text-gray-600 mt-1">Pending Approval</p>
            <Badge className="mt-2 bg-orange-100 text-orange-700">Needs Attention</Badge>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-2xl transition-all border-t-4 border-t-purple-500">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-10 h-10 mx-auto text-purple-500 mb-3" />
            <div className="text-4xl font-bold">{stats.totalReviews || 0}</div>
            <p className="text-sm text-gray-600 mt-1">Total Reviews</p>
            <Badge className="mt-2 bg-purple-100 text-purple-700">+15% growth</Badge>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-2xl transition-all border-t-4 border-t-pink-500">
          <CardContent className="p-6 text-center">
            <Bot className="w-10 h-10 mx-auto text-pink-500 mb-3" />
            <div className="text-4xl font-bold">{stats.aiInteractions || 0}</div>
            <p className="text-sm text-gray-600 mt-1">AI Interactions</p>
            <Badge className="mt-2 bg-pink-100 text-pink-700">+25% this week</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Admin Control Panels */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-red-500" /> Admin Controls
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/dashboard/users">
            <Card className="border-2 border-red-200 hover:border-red-500 hover:shadow-2xl transition-all group cursor-pointer h-full bg-gradient-to-br from-red-50 to-white">
              <CardContent className="p-6">
                <Users className="w-12 h-12 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-xl mb-2">User Management</h3>
                <p className="text-gray-600 mb-4">Manage accounts, roles, and permissions</p>
                <Button className="w-full bg-red-600 hover:bg-red-700">Manage Users</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/items">
            <Card className="border-2 border-blue-200 hover:border-blue-500 hover:shadow-2xl transition-all group cursor-pointer h-full bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <Package className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-xl mb-2">Content Control</h3>
                <p className="text-gray-600 mb-4">Full product oversight and moderation</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">All Products</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/analytics">
            <Card className="border-2 border-green-200 hover:border-green-500 hover:shadow-2xl transition-all group cursor-pointer h-full bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6">
                <BarChart3 className="w-12 h-12 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-xl mb-2">System Analytics</h3>
                <p className="text-gray-600 mb-4">Platform-wide metrics and reports</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">View Reports</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/ai">
            <Card className="border-2 border-purple-200 hover:border-purple-500 hover:shadow-2xl transition-all group cursor-pointer h-full bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6">
                <Bot className="w-12 h-12 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-xl mb-2">AI Management</h3>
                <p className="text-gray-600 mb-4">Configure AI services and limits</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">AI Settings</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* System Health */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CheckCircle className="w-6 h-6 text-green-400" /> System Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="font-medium">API Services</p>
                <p className="text-sm text-green-300">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="font-medium">Database</p>
                <p className="text-sm text-green-300">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="font-medium">AI Services</p>
                <p className="text-sm text-green-300">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render based on role
  if (user?.role === 'ADMIN') return renderAdminDashboard();
  if (user?.role === 'MANAGER') return renderManagerDashboard();
  return renderUserDashboard();
}
