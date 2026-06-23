'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

import {
  ArrowRight,
  Bot,
  Compass,
  HeartHandshake,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  WandSparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import Image from 'next/image';


type Suggestion = {
  itemId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  image: string | null;
  avgRating: number;
  reviewCount: number;
  tags: string[];
  score: number;
  reason: string;
};

type ProductCard = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  images: string[];
  createdAt?: string;
};

// Exact same categories as used in /products page and Add Item form (hubahu)
const categories = [
    'Electronics',
    'Fashion',
    'Home & Living',
    'Beauty',
    'Sports & Outdoors',
    'Books',
    'Toys & Games',
    'Health & Wellness',
    'Automotive',
    'Food & Grocery',
];

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState('150');
  const [category, setCategory] = useState('');
  const [vibe, setVibe] = useState('premium');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductCard[]>([]);
  
  // Two new relevant quick-pick sections based on selected category
  const [topRatedInCategory, setTopRatedInCategory] = useState<ProductCard[]>([]);
  const [newInCategory, setNewInCategory] = useState<ProductCard[]>([]);
  const [allTopRatedProducts, setAllTopRatedProducts] = useState<ProductCard[]>([]);
  // All products top rated (not category-specific)

  const runConcierge = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          budget: Number(budget) || undefined,
          category,
          vibe,
          tags: [vibe, category],
          limit: 6,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      let aiSuggestions = data.suggestions || [];

       // Fallback: If AI returns nothing (e.g. no strong title match in category),
       // show the relevant category products we already loaded as recommendations.
       if (aiSuggestions.length === 0 && (topRatedInCategory.length > 0 || newInCategory.length > 0)) {
         const combined = [...topRatedInCategory, ...newInCategory]
           .slice(0, 6)
           .map(p => ({
             itemId: p.id,
             title: p.title,
             description: p.description?.slice(0, 120) || '',
             price: p.price,
             category: p.category,
             location: p.location || '',
             image: p.images?.[0] || null,
             avgRating: p.rating || 0,
             reviewCount: p.reviewCount || 0,
             tags: [],
             // Fallback score for category-based recommendations (not AI-generated)
             score: 82,
             reason: `Popular in ${p.category} category`,
           }));
         aiSuggestions = combined;
       }

      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error(error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

   const loadFeaturedProducts = async () => {
     try {
       const response = await fetchApi(`${api.items}/approved?limit=4`);
       setFeaturedProducts(response.data?.items || []);
     } catch (error) {
       console.error('Failed to load featured products', error);
       // Provide mock data when backend is unavailable
       setFeaturedProducts([
         {
           id: 'featured-1',
           title: 'Featured Product 1',
           description: 'This is a featured product for demonstration',
           price: 39.99,
           category: 'Electronics',
           location: 'Dhaka, Bangladesh',
           rating: 4.6,
           reviewCount: 156,
           images: ['https://via.placeholder.com/300'],
           createdAt: new Date().toISOString()
         },
         {
           id: 'featured-2',
           title: 'Featured Product 2',
           description: 'Another featured product for demonstration',
           price: 59.99,
           category: 'Fashion',
           location: 'Chittagong, Bangladesh',
           rating: 4.3,
           reviewCount: 89,
           images: ['https://via.placeholder.com/300'],
           createdAt: new Date().toISOString()
         }
       ]);
     }
   };

    // Load all top rated products (not category-specific) for the hero section
    const loadAllTopRatedProducts = async () => {
      try {
        const res = await fetchApi(`${api.items}/approved?sortBy=rating&sortOrder=desc&limit=6`);
        setAllTopRatedProducts(res.data?.items || []);
      } catch (error) {
        console.error('Failed to load all top rated products', error);
        // Provide mock data when backend is unavailable
        setAllTopRatedProducts([
          {
            id: 'all-top-1',
            title: 'Premium Wireless Headphones',
            description: 'High-fidelity wireless headphones with noise cancellation and 30-hour battery life',
            price: 129.99,
            category: 'Electronics',
            location: 'Dhaka, Bangladesh',
            rating: 4.9,
            reviewCount: 342,
            images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyNjY2OXwwfDF8c2VhcmNofDF8fGhlYWRwaG9uZXxlbnwwfHx8fDE2NTc1NjQ2MDQ&ixlib=rb-1.2.1&q=80&w=400'],
            createdAt: new Date(Date.now() - 86400000 * 15).toISOString() // 15 days ago
          },
          {
            id: 'all-top-2',
            title: 'Organic Cotton Bedding Set',
            description: 'Luxury 4-piece organic cotton bedding set with deep pockets',
            price: 89.99,
            category: 'Home & Living',
            location: 'Sylhet, Bangladesh',
            rating: 4.8,
            reviewCount: 187,
            images: ['https://images.unsplash.com/photo-1586375303573-__g0GfFhu5ToE?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyNjY2OXwwfDF8c2VhcmNofDF8fGJlZHJlc3xlbnwwfHx8fDE2NTc1NjQ2MDQ&ixlib=rb-1.2.1&q=80&w=400'],
            createdAt: new Date(Date.now() - 86400000 * 10).toISOString() // 10 days ago
          },
          {
            id: 'all-top-3',
            title: 'Professional DSLR Camera',
            description: '24.1MP DSLR camera with 4K video recording and wireless connectivity',
            price: 599.99,
            category: 'Electronics',
            location: 'Chittagong, Bangladesh',
            rating: 4.7,
            reviewCount: 98,
            images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyNjY2OXwwfDF8c2VhcmNofDF8fGNlcmFtZXJ8ZW58MHx8fHwxNjU3NTY0NjA0&ixlib=rb-1.2.1&q=80&w=400'],
            createdAt: new Date(Date.now() - 86400000 * 8).toISOString() // 8 days ago
          }
        ]);
      }
    };

    // Load two relevant quick sections based on current category selection
    const loadCategoryQuickPicks = async (cat: string) => {
      if (!cat) return;

      try {
        // Top Rated in this category
        const topRatedRes = await fetchApi(
          `${api.items}/approved?category=${encodeURIComponent(cat)}&sortBy=rating&sortOrder=desc&limit=4`
        );
        setTopRatedInCategory(topRatedRes.data?.items || []);
      } catch (error) {
        console.error('Failed to load category quick picks', error);
        // Provide more varied mock data when backend is unavailable
        const mockTopRated = [
          {
            id: 'mock-top-1',
            title: `Premium ${cat} Product`,
            description: `High-quality ${cat.toLowerCase()} product with excellent ratings and reviews`,
            price: 79.99,
            category: cat,
            location: 'Dhaka, Bangladesh',
            rating: 4.8,
            reviewCount: 156,
            images: ['https://via.placeholder.com/300'],
            createdAt: new Date(Date.now() - 86400000 * 12).toISOString() // 12 days ago
          },
          {
            id: 'mock-top-2',
            title: `Professional ${cat} Solution`,
            description: `Professional-grade ${cat.toLowerCase()} solution for demanding users`,
            price: 129.99,
            category: cat,
            location: 'Chittagong, Bangladesh',
            rating: 4.6,
            reviewCount: 89,
            images: ['https://via.placeholder.com/300'],
            createdAt: new Date(Date.now() - 86400000 * 8).toISOString() // 8 days ago
          }
        ];
        setTopRatedInCategory(mockTopRated);
      }

      try {
        // New Arrivals in this category
        const newRes = await fetchApi(
          `${api.items}/approved?category=${encodeURIComponent(cat)}&sortBy=createdAt&sortOrder=desc&limit=4`
        );
        setNewInCategory(newRes.data?.items || []);
      } catch (error) {
        console.error('Failed to load category quick picks', error);
        // Provide more varied mock data when backend is unavailable
        const mockNewArrivals = [
          {
            id: 'mock-new-1',
            title: `Latest ${cat} Innovation`,
            description: `Recently launched innovative ${cat.toLowerCase()} product`,
            price: 99.99,
            category: cat,
            location: 'Sylhet, Bangladesh',
            rating: 4.5,
            reviewCount: 45,
            images: ['https://via.placeholder.com/300'],
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
          },
          {
            id: 'mock-new-2',
            title: `New ${cat} Essential`,
            description: `Essential new ${cat.toLowerCase()} item for modern lifestyles`,
            price: 49.99,
            category: cat,
            location: 'Barisal, Bangladesh',
            rating: 4.3,
            reviewCount: 32,
            images: ['https://via.placeholder.com/300'],
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString() // 1 day ago
          }
        ];
        setNewInCategory(mockNewArrivals);
      }
    };

   useEffect(() => {
     // Only load featured products on initial page load.
     // AI recommendations should ONLY show after user clicks "Generate Suggestions" with a query.
     loadFeaturedProducts();
     // Load all top rated products (not category-specific) for the hero section
     loadAllTopRatedProducts();
   }, []);

  // Whenever the category dropdown changes, load the two relevant sections
  useEffect(() => {
    if (category) {
      loadCategoryQuickPicks(category);
    }
  }, [category]);
  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.215, 0.610, 0.355, 1.000] }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 } // একটির পর আরেকটি এলিমেন্ট আসবে
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-sky-50">
 <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-b from-neutral-50/50 to-white py-20 lg:py-32">
      {/* Fine Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_20%,#000_80%,transparent_100%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Content Area (Staggered Animation) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Clean Capsule Pill */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-800 shadow-sm border border-neutral-200/60">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Engine Active
          </motion.div>

          {/* Bold Typography */}
          <motion.div variants={fadeInUp} className="space-y-5">
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl leading-[1.1]">
              Find products that <span className="text-sky-600 font-black">actually fit</span> your life.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              Search less, choose better. Describe what you want, set a budget, and let the AI sort through products, reviews, and relevance for you.
            </p>
          </motion.div>

          {/* Sleek Squared-Rounded Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/register">
              <Button size="lg" className="h-11 rounded-xl px-7 bg-neutral-900 text-white hover:bg-neutral-800 shadow-md shadow-neutral-950/10 text-sm font-semibold tracking-wide transition-transform active:scale-98">
                Start Free
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="ghost" className="h-11 rounded-xl px-7 text-neutral-600 hover:bg-neutral-100 border border-transparent hover:border-neutral-200/50 text-sm font-medium">
                Explore Marketplace
                <ArrowRight className="ml-2 h-4 w-4 text-neutral-400" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Side: Media Compartment (Scale & Fade-in Animation) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full aspect-video lg:aspect-[4/3] rounded-2xl border border-gray-200/80 bg-white p-2 shadow-2xl shadow-neutral-200/80 group"
        >
          {/* Background Glowing Effect */}
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr from-sky-400/20 to-purple-400/10 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-50 border border-gray-100">
            <video 
              src="/watermarked_preview.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

      </div>
    </section>

{/* New Section - Feature Cards moved here */}
<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
  <div className="mb-10 text-center">
    <Badge className="mb-4 rounded-full bg-primary/10 px-4 py-2 text-primary">
      <Sparkles className="mr-2 h-4 w-4" />
      Why Choose Us
    </Badge>
    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
      Smarter product discovery, powered by AI
    </h2>
    <p className="mt-3 text-muted-foreground">
      Three simple reasons why our AI concierge helps you find better products
    </p>
  </div>

  <div className="grid gap-6 sm:grid-cols-3">
    {[
      { 
        icon: WandSparkles, 
        title: 'Instant matching', 
        text: 'Turns a simple prompt into ranked suggestions.',
        color: 'from-purple-500 to-pink-400'
      },
      { 
        icon: ShieldCheck, 
        title: 'Review-aware', 
        text: 'Balances price, fit, freshness, and buyer feedback.',
        color: 'from-blue-500 to-cyan-400'
      },
      { 
        icon: HeartHandshake, 
        title: 'Made to trust', 
        text: 'Clear reasons for every recommendation you see.',
        color: 'from-green-500 to-emerald-400'
      },
    ].map((item) => (
      <Card key={item.title} className="border-border/50 bg-white/80 shadow-sm transition-all hover:shadow-lg hover:shadow-primary/5">
        <CardContent className="p-6 text-center">
          <div className={cn(
            "mx-auto mb-4 inline-flex rounded-2xl bg-gradient-to-br p-3 text-white",
            item.color
          )}>
            <item.icon className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
          <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
        </CardContent>
      </Card>
    ))}
  </div>
</section>

   

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">How it helps</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">A smarter product recommendation workflow</h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-primary">
            Browse all products
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: Search, title: 'Intent-based search', text: 'Use natural language instead of rigid filters to describe what you need.' },
            { icon: Compass, title: 'Reasoned ranking', text: 'Every suggestion includes a clear explanation, not just a random list.' },
            { icon: Package, title: 'Marketplace ready', text: 'Browse real approved items with pricing, categories, and seller context.' },
            { icon: Star, title: 'Review signals', text: 'High-rated and fresh items naturally move up when they match your needs.' },
          ].map((feature) => (
            <Card key={feature.title} className="border-white/60 bg-white/70 shadow-sm">
              <CardContent className="p-6">
                <feature.icon className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{feature.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

     <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
  <div className="mb-8 flex items-end justify-between gap-4">
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">Live catalog</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Featured marketplace picks</h2>
    </div>
    <Badge variant="outline" className="rounded-full bg-white/70 px-4 py-2">
      Approved products only
    </Badge>
  </div>

 <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
  {featuredProducts.map((product) => (
    /* 🎯 এখানে পরিবর্তন করা হয়েছে: টোকেন না থাকলে সরাসরি লগইন পেজে পাঠাবে */
    <Link 
      key={product.id} 
      href={
        typeof window !== 'undefined' && document.cookie.includes('accessToken')
          ? `/products/${product.id}`
          : `/login?callbackUrl=/products/${product.id}`
      }
    >
      <Card className="h-full py-0 overflow-hidden border-white/70 bg-white/75 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
        
        {/* FIX: Absolute positioning inside a relative aspect-ratio box ensures uniform sizes */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]} 
              alt={product.title} 
              height={300}
              width={400}
              className="absolute inset-0 h-full w-full object-cover" 
            />
          ) : (
            <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-sky-100">
              <Package className="h-10 w-10 text-primary/70" />
            </div>
          )}
        </div>

        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="secondary" className="rounded-full">{product.category}</Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="mr-1 h-4 w-4 fill-current text-primary" />
              {Number(product.rating || 0).toFixed(1)}
            </div>
          </div>
          <div>
            <h3 className="line-clamp-2 text-lg font-semibold">{product.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">${Number(product.price).toFixed(2)}</span>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-4 w-4" />
              {product.location}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  ))}
</div>
</section>
    </div>
  );
}
