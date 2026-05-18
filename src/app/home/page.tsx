'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Search,
  Star,
  Users,
  Package,
  MessageSquare,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  profileImage?: string;
  bio?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const accessToken = Cookies.get('accessToken');
    const userData = Cookies.get('user');

    if (!accessToken || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(parsedUser);
    } catch {
      router.push('/login');
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Recommendations',
      description: 'Get personalized product suggestions based on your preferences and behavior.',
      color: 'text-blue-600'
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find exactly what you need with our advanced search and filtering capabilities.',
      color: 'text-green-600'
    },
    {
      icon: Star,
      title: 'Review System',
      description: 'Read authentic reviews and share your own experiences with products.',
      color: 'text-yellow-600'
    },
    {
      icon: Zap,
      title: 'Content Generation',
      description: 'Generate product descriptions, titles, and blog posts with AI assistance.',
      color: 'text-purple-600'
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure platform with different access levels for users, managers, and admins.',
      color: 'text-red-600'
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Track performance, user behavior, and market trends with detailed analytics.',
      color: 'text-indigo-600'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '10,000+', icon: Users },
    { label: 'Products Listed', value: '50,000+', icon: Package },
    { label: 'Reviews Written', value: '25,000+', icon: MessageSquare },
    { label: 'AI Interactions', value: '100,000+', icon: Bot }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-full shadow-lg">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">Welcome back, {user.name}!</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {user.role}
              </Badge>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover Your Next
            <span className="text-blue-600 block">Favorite Product</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered product recommendations, authentic reviews, and smart search.
            Find exactly what you need with the help of artificial intelligence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-3">
                <Package className="mr-2 h-5 w-5" />
                Browse Products
              </Button>
            </Link>
            <Link href="/dashboard/ai">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                <Bot className="mr-2 h-5 w-5" />
                Try AI Assistant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <stat.icon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Smart Shopping
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to make informed purchasing decisions with the power of AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className={`p-3 rounded-lg w-fit ${feature.color} bg-gray-50`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <p className="text-gray-600">Jump into your favorite features</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Browse Products</h3>
                    <p className="text-sm text-gray-600">Explore our product catalog</p>
                  </div>
                </div>
                <Link href="/dashboard/items" className="w-full mt-4">
                  <Button className="w-full">View Products</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Bot className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                    <p className="text-sm text-gray-600">Get AI-powered help</p>
                  </div>
                </div>
                <Link href="/dashboard/ai" className="w-full mt-4">
                  <Button className="w-full" variant="outline">Open AI Chat</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Read Reviews</h3>
                    <p className="text-sm text-gray-600">See what others think</p>
                  </div>
                </div>
                <Link href="/dashboard/reviews" className="w-full mt-4">
                  <Button className="w-full" variant="outline">View Reviews</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}