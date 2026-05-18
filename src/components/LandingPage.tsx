'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Zap,
  ArrowRight,
  CheckCircle,
  Sparkles,
  BarChart3,
  Heart,
  Globe,
  Smartphone,
  ChevronDown,
  Play
} from 'lucide-react';
import Cookies from 'js-cookie';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const accessToken = Cookies.get('accessToken');
    const userData = Cookies.get('user');

    if (accessToken && userData) {
      router.push('/dashboard');
      return;
    }

    setIsVisible(true);
  }, [router]);

  if (!isVisible) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Recommendations',
      description: 'Get personalized product suggestions based on your preferences and behavior using advanced AI algorithms.',
      color: 'text-primary'
    },
    {
      icon: Search,
      title: 'Smart Search & Filtering',
      description: 'Find exactly what you need with our advanced search capabilities and multi-field filtering options.',
      color: 'text-secondary'
    },
    {
      icon: Star,
      title: 'Review System',
      description: 'Read authentic reviews and share your own experiences with products from real users.',
      color: 'text-accent'
    },
    {
      icon: Zap,
      title: 'Content Generation',
      description: 'Generate product descriptions, titles, and blog posts with AI assistance for content creators.',
      color: 'text-primary'
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure platform with different access levels for users, managers, and administrators.',
      color: 'text-secondary'
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Track performance, user behavior, and market trends with detailed analytics and insights.',
      color: 'text-accent'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '10,000+', icon: Users },
    { label: 'Products Listed', value: '50,000+', icon: Package },
    { label: 'Reviews Written', value: '25,000+', icon: MessageSquare },
    { label: 'AI Interactions', value: '100,000+', icon: Bot }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager',
      content: 'This platform has revolutionized how we discover and review products. The AI recommendations are spot-on!',
      avatar: 'SJ'
    },
    {
      name: 'Mike Chen',
      role: 'Tech Entrepreneur',
      content: 'The analytics and insights have helped us understand our market better than ever before.',
      avatar: 'MC'
    },
    {
      name: 'Emily Davis',
      role: 'Content Creator',
      content: 'The AI content generation feature saves me hours of work. Game-changing for creators!',
      avatar: 'ED'
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Up to 50 product searches',
        'Basic AI recommendations',
        'Read reviews',
        'Community access'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      features: [
        'Unlimited searches',
        'Advanced AI recommendations',
        'Write unlimited reviews',
        'Priority support',
        'Analytics dashboard',
        'Content generation'
      ],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      features: [
        'Everything in Pro',
        'Custom integrations',
        'Dedicated support',
        'Advanced analytics',
        'Team management',
        'White-label options'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Badge variant="secondary" className="mb-8 px-6 py-3 text-sm font-medium bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            Powered by Advanced AI Technology
          </Badge>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">
            Discover Your
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Perfect Product
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Transform your shopping experience with AI-powered recommendations,
            authentic reviews, and intelligent search. Make smarter decisions effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/register">
              <Button size="lg" className="text-lg px-10 py-5 h-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                Get Started Free
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-10 py-5 h-auto border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
              <Play className="mr-3 h-6 w-6" />
              Watch Demo
            </Button>
          </div>

          <div className="flex justify-center animate-bounce">
            <ChevronDown className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-900/50 dark:to-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white/60 dark:bg-gray-800/60 rounded-2xl backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full backdrop-blur-sm">
                    <stat.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Powerful Features for Smart Shopping
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to make informed purchasing decisions with the power of AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg hover:shadow-blue-500/25">
                <CardHeader className="pb-4">
                  <div className={`p-4 rounded-2xl w-fit ${feature.color} bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-700/90 dark:to-gray-600/70 backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose AI Product Suggester?
            </h2>
            <p className="text-xl text-muted-foreground">
              What sets us apart from the competition
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Advanced AI Technology</h3>
                  <p className="text-muted-foreground">
                    Our proprietary AI algorithms learn from millions of user interactions to provide
                    highly accurate and personalized recommendations.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Trusted Reviews</h3>
                  <p className="text-muted-foreground">
                    All reviews are verified and authentic. We use advanced detection systems to
                    prevent fake reviews and ensure quality feedback.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Globe className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Global Community</h3>
                  <p className="text-muted-foreground">
                    Join a worldwide community of smart shoppers sharing insights and
                    discovering amazing products together.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Smartphone className="h-24 w-24 text-primary mx-auto mb-4" />
                  <p className="text-lg font-semibold">Available Everywhere</p>
                  <p className="text-muted-foreground">Web, Mobile, Desktop</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Latest Insights
            </h2>
            <p className="text-xl text-muted-foreground">
              Stay updated with the latest trends and tips
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <Badge className="mb-4">AI Trends</Badge>
                <h3 className="text-xl font-semibold mb-3">The Future of AI in E-commerce</h3>
                <p className="text-muted-foreground mb-4">
                  Discover how artificial intelligence is revolutionizing online shopping
                  and what it means for consumers.
                </p>
                <Link href="/blog/ai-ecommerce-future" className="text-primary hover:underline font-medium">
                  Read More →
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <Badge className="mb-4">Shopping Tips</Badge>
                <h3 className="text-xl font-semibold mb-3">Smart Shopping Strategies</h3>
                <p className="text-muted-foreground mb-4">
                  Learn proven techniques to find the best deals and make informed
                  purchasing decisions every time.
                </p>
                <Link href="/blog/shopping-strategies" className="text-primary hover:underline font-medium">
                  Read More →
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <Badge className="mb-4">Product Reviews</Badge>
                <h3 className="text-xl font-semibold mb-3">Top Tech Gadgets of 2026</h3>
                <p className="text-muted-foreground mb-4">
                  Our comprehensive review of the most innovative technology products
                  hitting the market this year.
                </p>
                <Link href="/blog/top-tech-2026" className="text-primary hover:underline font-medium">
                  Read More →
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/blog">
              <Button variant="outline" size="lg">
                View All Articles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Sign Up</h3>
              <p className="text-muted-foreground">
                Create your account and tell us about your preferences
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-secondary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Recommendations</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your preferences and suggests perfect products
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-accent-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Discover & Review</h3>
              <p className="text-muted-foreground">
                Browse products, read reviews, and share your experiences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of satisfied users
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-foreground font-semibold">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Discover Amazing Products?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join our community of smart shoppers and start getting personalized recommendations today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}