'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

  return (
    <div className="min-h-screen overflow-hidden bg-sky-50">
      <section className="relative border-b border-border/60">
        <div className="absolute inset-0 opacity-50 bg-sky-100/30" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div className="space-y-8">
            <Badge className="rounded-full bg-primary/10 px-4 py-2 text-primary shadow-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              AI concierge for product discovery
            </Badge>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Find products that actually fit your life.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Search less, choose better. Describe what you want, set a budget, and let the AI sort through products, reviews, and relevance for you.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg" className="h-12 rounded-full px-7 text-base shadow-lg shadow-primary/20">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="h-12 rounded-full px-7 text-base bg-white/70">
                  Explore Marketplace
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: WandSparkles, title: 'Instant matching', text: 'Turns a simple prompt into ranked suggestions.' },
                { icon: ShieldCheck, title: 'Review-aware', text: 'Balances price, fit, freshness, and buyer feedback.' },
                { icon: HeartHandshake, title: 'Made to trust', text: 'Clear reasons for every recommendation you see.' },
              ].map((item) => (
                <Card key={item.title} className="border-white/70 bg-white/70 shadow-sm backdrop-blur">
                  <CardContent className="p-5">
                    <item.icon className="mb-4 h-6 w-6 text-primary" />
                    <h3 className="mb-2 font-semibold">{item.title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-white/80 bg-white/85 shadow-2xl shadow-black/5 backdrop-blur-xl">
            <CardContent className="p-6 sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">AI Concierge</p>
                  <h2 className="mt-2 text-2xl font-bold">Build my recommendations</h2>
                </div>
                <div className="rounded-2xl bg-secondary/20 p-3 text-secondary">
                  <Bot className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="What are you looking for?"
                  className="h-12 rounded-2xl bg-white"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    placeholder="Budget in USD"
                    type="number"
                    className="h-12 rounded-2xl bg-white"
                  />
                  <Input
                    value={vibe}
                    onChange={(event) => setVibe(event.target.value)}
                    placeholder="Vibe: minimal, cozy, premium"
                    className="h-12 rounded-2xl bg-white"
                  />
                </div>

                <Select value={category} onValueChange={(value) => setCategory(value || 'Electronics')}>
                  <SelectTrigger className="h-12 w-full rounded-2xl bg-white px-4">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                 <Button 
                   onClick={() => void runConcierge()} 
                   disabled={loading || (!query.trim() && !category)} 
                   className="h-12 w-full rounded-2xl text-base blur-0"
                 >
                   {loading ? 'Thinking...' : 'Generate Suggestions'}
                 </Button>
              </div>

              {/* AI Recommendations only appear after user clicks Generate with a query */}
              {suggestions.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Suggested for you</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {suggestions.length} results
                    </p>
                  </div>

                  <div className="space-y-3">
                    {suggestions.slice(0, 3).map((item) => (
                      <div key={item.itemId} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                        <div className="mb-2 flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold">{item.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                          </div>
                          <Badge variant="outline" className="rounded-full">
                            {item.score}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-primary">${item.price.toFixed(2)}</span>
                          <span className="text-muted-foreground">{item.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Placeholder message when no suggestions yet */}
              {!loading && suggestions.length === 0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Select a category (or type a description) and click <span className="font-medium">"Generate Suggestions"</span> to get AI recommendations.
                </div>
              )}
            </CardContent>
          </Card>
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
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="h-full overflow-hidden border-white/70 bg-white/75 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-[4/3] bg-muted">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-sky-100">
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
