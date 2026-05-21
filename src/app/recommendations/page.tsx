'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, fetchApi } from '@/lib/api';
import { MapPin, Package, Sparkles, Star, TrendingUp } from 'lucide-react';

interface Recommendation {
  itemId: string;
  title: string;
  reason: string;
  score: number;
  matchedTags?: string[];
  matchedCategory?: boolean;
  avgRating?: number;
  image?: string | null;
  description?: string;
  price?: number;
  category?: string;
  location?: string;
  reviewCount?: number;
  tags?: string[];
}

export default function PublicRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = Cookies.get('user');
        if (!user) {
          setRecommendations([]);
          setError('Please log in to see personalized recommendations.');
          return;
        }

        const userData = JSON.parse(user);
        const res = await fetchApi(
          `${api.ai.recommendations}?userId=${userData.id}&context=public&limit=12`
        );

        const recs: Recommendation[] = res.data?.recommendations || [];
        setRecommendations(recs);
      } catch (fetchError) {
        console.error('Failed to fetch recommendations:', fetchError);
        setRecommendations([]);
        setError('Could not load recommendations right now.');
      } finally {
        setLoading(false);
      }
    };

    void fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">AI Recommendations</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Personalized product suggestions based on your reviews, interests, and browsing patterns
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Suggestions</p>
              <p className="text-2xl font-bold">{recommendations.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Match</p>
              <p className="text-2xl font-bold">{recommendations[0]?.score ?? 0}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-sky-50 to-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Rated Picks</p>
              <p className="text-2xl font-bold">
                {recommendations.filter((item) => (item.avgRating || 0) >= 4).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">{error}</CardContent>
        </Card>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {recommendations.map((item) => (
            <Card
              key={item.itemId}
              className="overflow-hidden border-0 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-amber-100 via-stone-50 to-sky-100">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                <Badge className="absolute right-4 top-4 bg-emerald-600 text-white">
                  {item.score}% Match
                </Badge>
              </div>

              <CardHeader className="space-y-3 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {item.category && <Badge variant="outline">{item.category}</Badge>}
                  {item.matchedCategory && <Badge className="bg-sky-100 text-sky-700">Category Match</Badge>}
                  {(item.avgRating || 0) >= 4 && (
                    <Badge className="bg-emerald-100 text-emerald-700">Top Rated</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <CardTitle className="line-clamp-2 text-xl">{item.title}</CardTitle>
                  <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item.reason}</span>
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {item.description || 'A strong recommendation based on your recent activity and preferences.'}
                </p>

                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-muted/40 p-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-semibold text-primary">
                      {typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : 'Not listed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rating</p>
                    <p className="font-semibold">
                      {typeof item.avgRating === 'number' ? `${item.avgRating.toFixed(1)} / 5` : 'New item'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {item.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{item.location}</span>
                    </div>
                  )}
                  {typeof item.reviewCount === 'number' && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>{item.reviewCount} reviews</span>
                    </div>
                  )}
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Link href={`/products/${item.itemId}`}>
                  <Button className="w-full">View Product</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              No recommendations yet. Add reviews or browse more products to help the AI learn your preferences.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
