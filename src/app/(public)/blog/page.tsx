'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Calendar,
  User,
  ArrowRight,
  Clock,
  Tag,
  BookOpen,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const featuredPost = {
    id: 1,
    title: 'The Future of AI-Powered Product Recommendations',
    excerpt: 'Explore how artificial intelligence is revolutionizing the way consumers discover and purchase products in the digital marketplace.',
    author: 'Sarah Johnson',
    date: '2024-01-15',
    readTime: '5 min read',
    category: 'AI Technology',
    image: '/api/placeholder/600/300',
    featured: true
  };

  const blogPosts = [
    {
      id: 2,
      title: 'Building Trust Through Transparent AI',
      excerpt: 'How explainable AI algorithms are creating more trustworthy product recommendation systems.',
      author: 'Mike Chen',
      date: '2024-01-12',
      readTime: '4 min read',
      category: 'Trust & Ethics',
      tags: ['AI Ethics', 'Transparency', 'Trust']
    },
    {
      id: 3,
      title: 'Machine Learning in E-commerce: A Deep Dive',
      excerpt: 'Understanding the algorithms behind personalized shopping experiences and their impact on conversion rates.',
      author: 'Emily Davis',
      date: '2024-01-10',
      readTime: '7 min read',
      category: 'E-commerce',
      tags: ['Machine Learning', 'E-commerce', 'Personalization']
    },
    {
      id: 4,
      title: 'The Psychology of Product Discovery',
      excerpt: 'Exploring how human behavior influences product recommendations and shopping decisions.',
      author: 'Dr. Alex Rivera',
      date: '2024-01-08',
      readTime: '6 min read',
      category: 'User Experience',
      tags: ['Psychology', 'UX', 'Behavior']
    },
    {
      id: 5,
      title: 'Scaling AI Systems: Challenges and Solutions',
      excerpt: 'Lessons learned from building and maintaining large-scale AI recommendation systems.',
      author: 'Sarah Johnson',
      date: '2024-01-05',
      readTime: '8 min read',
      category: 'Engineering',
      tags: ['Scalability', 'Engineering', 'Performance']
    },
    {
      id: 6,
      title: 'The Rise of Voice Commerce and AI',
      excerpt: 'How voice assistants and AI are changing the future of online shopping experiences.',
      author: 'Mike Chen',
      date: '2024-01-03',
      readTime: '5 min read',
      category: 'Innovation',
      tags: ['Voice Commerce', 'Innovation', 'Future Tech']
    }
  ];

  const categories = [
    { name: 'AI Technology', count: 12, icon: Zap },
    { name: 'E-commerce', count: 8, icon: TrendingUp },
    { name: 'User Experience', count: 6, icon: User },
    { name: 'Engineering', count: 5, icon: BookOpen }
  ];

  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-sky-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              Our Blog
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Insights & Innovation
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Stay updated with the latest trends in AI, machine learning, and the future of
              intelligent product recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                All Posts
              </Button>
              <Button variant="ghost" size="sm">
                Latest
              </Button>
              <Button variant="ghost" size="sm">
                Popular
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Featured Post */}
              <Card className="mb-8 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <div className="bg-sky-100 dark:bg-sky-900 h-48 md:h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                  <div className="md:w-1/2 p-6">
                    <Badge variant="secondary" className="mb-2">Featured</Badge>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {featuredPost.author}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {featuredPost.readTime}
                        </div>
                      </div>
                      <Button size="sm">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Blog Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(post.date).toLocaleDateString()}
                        </div>
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <span>By {post.author}</span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Read
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Categories */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center">
                        <category.icon className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Newsletter Signup */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Stay Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get the latest insights on AI and product recommendations delivered to your inbox.
                  </p>
                  <div className="space-y-2">
                    <Input placeholder="Enter your email" />
                    <Button className="w-full" size="sm">
                      Subscribe
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popular Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['AI', 'Machine Learning', 'E-commerce', 'UX', 'Technology', 'Innovation', 'Data Science'].map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}