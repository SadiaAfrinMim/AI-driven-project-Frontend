'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
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
};

const categories = ['electronics', 'fashion', 'home', 'beauty', 'books', 'fitness'];

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState('A sleek product for work and travel');
  const [budget, setBudget] = useState('150');
  const [category, setCategory] = useState('electronics');
  const [vibe, setVibe] = useState('premium');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductCard[]>([]);

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
      setSuggestions(data.suggestions || []);
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
      setFeaturedProducts([]);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([runConcierge(), loadFeaturedProducts()]);
    };

    void loadInitialData();
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(246,189,96,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(69,123,157,0.16),_transparent_28%),linear-gradient(180deg,_rgba(255,251,245,1),_rgba(247,245,239,1))]">
      <section className="relative border-b border-border/60">
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(29,53,87,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(29,53,87,0.04)_1px,transparent_1px)] [background-size:40px_40px]" />
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

                <Select value={category} onValueChange={(value) => setCategory(value || 'electronics')}>
                  <SelectTrigger className="h-12 w-full rounded-2xl bg-white px-4">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={() => void runConcierge()} disabled={loading} className="h-12 w-full rounded-2xl text-base">
                  {loading ? 'Thinking...' : 'Generate Suggestions'}
                </Button>
              </div>

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

                  {!loading && suggestions.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      Add a query and budget to generate AI-powered recommendations.
                    </div>
                  )}
                </div>
              </div>
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
                    <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,_rgba(246,189,96,0.15),_rgba(69,123,157,0.12))]">
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
