'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api, fetchApi } from '@/lib/api';
import { MapPin, Package, Sparkles, Star, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Client-side pagination (we fetch a batch once, then paginate locally)
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);

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
        // Fetch a larger batch for client-side pagination
        const res = await fetchApi(
          `${api.ai.recommendations}?userId=${userData.id}&context=public&limit=60`
        );

        const recs: Recommendation[] = res.data?.recommendations || [];
        setRecommendations(recs);
        setCurrentPage(1); // reset when new data loads
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

  const totalRecommendations = recommendations.length;
  const totalPages = Math.max(1, Math.ceil(totalRecommendations / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecommendations = recommendations.slice(startIndex, startIndex + itemsPerPage);

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
          <div className="p-3 rounded-2xl bg-sky-600 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">AI Recommendations</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Personalized product suggestions based on your reviews, interests, and browsing patterns
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card className="border-0 bg-sky-50 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Suggestions</p>
              <p className="text-2xl font-bold">{totalRecommendations}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-sky-50 shadow-sm">
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

        <Card className="border-0 bg-sky-100 shadow-sm">
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
        <>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedRecommendations.map((item) => (
            <Card
              key={item.itemId}
              className="group flex flex-col h-full overflow-hidden border border-gray-200 hover:border-sky-300 hover:shadow-xl transition-all bg-white rounded-2xl"
            >
              <div className="relative h-48 bg-gray-100 flex-shrink-0 overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-sky-100">
                    <Package className="h-10 w-10 text-gray-400" />
                  </div>
                )}

                <Badge className="absolute top-2 right-2 text-[10px] bg-emerald-600 text-white">
                  {item.score}% Match
                </Badge>
              </div>

              <CardContent className="p-4 flex flex-col flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.category && <Badge variant="secondary" className="text-[10px] bg-white/90 backdrop-blur border">{item.category}</Badge>}
                  {item.matchedCategory && <Badge className="text-[10px] bg-sky-100 text-sky-700">Category Match</Badge>}
                  {(item.avgRating || 0) >= 4 && (
                    <Badge className="text-[10px] bg-emerald-100 text-emerald-700">Top Rated</Badge>
                  )}
                </div>

                <h3 className="font-semibold text-[15px] leading-snug text-gray-900 line-clamp-2 group-hover:text-sky-600 transition-colors">
                  {item.title}
                </h3>

                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="line-clamp-2">{item.reason}</span>
                </p>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2 min-h-[32px]">
                  {item.description || 'A strong recommendation based on your recent activity and preferences.'}
                </p>

                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-2xl font-bold text-sky-600 tracking-tighter">
                      {typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : '—'}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-700">
                    {typeof item.avgRating === 'number' ? `${item.avgRating.toFixed(1)} / 5` : 'New'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                  {item.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{item.location}</span>
                    </div>
                  )}
                  {typeof item.reviewCount === 'number' && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      <span>{item.reviewCount} reviews</span>
                    </div>
                  )}
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3 min-h-[20px]">
                    {item.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-2">
                  <Link href={`/products/${item.itemId}`}>
                    <Button className="w-full" size="sm">View Product</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Professional Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{startIndex + 1}</span> - <span className="font-medium text-foreground">{Math.min(startIndex + itemsPerPage, totalRecommendations)}</span> of <span className="font-medium text-foreground">{totalRecommendations}</span> recommendations
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="min-w-[36px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </> 
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
