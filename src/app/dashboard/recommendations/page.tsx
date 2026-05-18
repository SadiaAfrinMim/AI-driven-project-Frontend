'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Star } from 'lucide-react';
import { fetchApi, api } from '@/lib/api';
import Cookies from 'js-cookie';

interface Recommendation {
  itemId: string;
  title: string;
  reason: string;
  score: number;
  matchedTags?: string[];
  matchedCategory?: boolean;
  avgRating?: number;
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const user = Cookies.get('user');
      if (!user) return;

      const userData = JSON.parse(user);
      
      const res = await fetchApi(
        `${api.ai.recommendations}?userId=${userData.id}&context=dashboard&limit=12`
      );

      setRecommendations(res.data?.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">AI Recommendations</h1>
        <p className="text-muted-foreground mt-2">
          Personalized product suggestions based on your activity and preferences
        </p>
      </div>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {recommendations.map((item, index) => (
            <Card key={index} className="hover:shadow-2xl transition-all border-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <Badge className="bg-emerald-100 text-emerald-700 text-sm">
                    {item.score}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    {item.reason}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.matchedCategory && <Badge className="bg-blue-50 text-blue-700 text-xs">Category match</Badge>}
                    {item.matchedTags && item.matchedTags.map((t, i) => (
                      <Badge key={i} className="bg-gray-50 text-gray-700 text-xs">{t}</Badge>
                    ))}
                    {item.avgRating && item.avgRating >= 4 && (
                      <Badge className="bg-emerald-50 text-emerald-700 text-xs">Top rated</Badge>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button 
                      className="w-full" 
                      onClick={() => window.location.href = `/products/${item.itemId}`}
                    >
                      View Product
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-muted-foreground">
              No recommendations yet. Start reviewing products to get personalized suggestions!
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
