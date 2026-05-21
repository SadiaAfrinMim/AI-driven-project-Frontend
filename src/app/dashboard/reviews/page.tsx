'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, MessageSquare, User, Package, Trash2 } from 'lucide-react';

import { fetchApi, api } from '@/lib/api';
import { toast } from 'sonner';

interface Review {
  id: string;
  comment: string;
  rating: number;
  userId: string;
  itemId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  item?: {
    id: string;
    title: string;
    category: string;
  };
}

function getInitials(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function timeAgo(dateStr: string) {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReviews = async () => {
    try {
      // Use dedicated endpoint that only returns the logged-in user's own reviews
      const data = await fetchApi(`${api.reviews}/user/my-reviews`);
      const myReviews = Array.isArray(data.data?.reviews) ? data.data.reviews : [];
      setReviews(myReviews);
    } catch (error) {
      console.error('Failed to fetch my reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter((review) => {
    const q = searchTerm.toLowerCase();
    return (
      review.comment.toLowerCase().includes(q) ||
      review.user?.name.toLowerCase().includes(q) ||
      review.item?.title.toLowerCase().includes(q)
    );
  });

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await fetchApi(`${api.reviews}/${reviewId}`, {
        method: 'DELETE',
      });
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-1">View and manage your own reviews</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredReviews.map((review) => (
          <Card 
            key={review.id} 
            className="transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            onClick={() => {
              if (review.item?.id) {
                // Redirect to item details page
                window.location.href = `/dashboard/items/${review.item.id}`;
              }
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-none">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                      {getInitials(review.user?.name)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{review.user?.name || 'Anonymous'}</span>
                      <span className="text-xs text-gray-500">· {review.user?.email}</span>
                    </div>
                    <div className="mt-1 flex items-center space-x-3">
                      <div className="flex items-center text-sm text-gray-600 space-x-1">
                        <div className="flex items-center">{renderStars(review.rating)}</div>
                        <span className="text-xs text-gray-500">{review.rating}/5</span>
                      </div>
                      <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {review.item && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-800">{review.item.title}</div>
                      <Badge variant="secondary" className="mt-1 text-xs">{review.item.category}</Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 text-sm leading-relaxed max-h-24 overflow-hidden">{review.comment}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end space-x-2">
                <Button className="bg-transparent text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-md" onClick={() => { 
                  navigator.clipboard?.writeText(review.comment); 
                  toast.success('Review copied'); 
                }}>
                  Copy
                </Button>
                <Button className="bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded-md flex items-center" onClick={() => handleDeleteReview(review.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No reviews found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
