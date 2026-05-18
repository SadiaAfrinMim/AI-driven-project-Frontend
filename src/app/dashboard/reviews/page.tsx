'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, MessageSquare, User, Package } from 'lucide-react';

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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReviews = async () => {
    try {
      const data = await fetchApi(api.reviews);
      setReviews(Array.isArray(data.data?.reviews) ? data.data.reviews : []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(review =>
    review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.item?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
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
            <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
            <p className="text-gray-600 mt-2">Manage customer reviews and feedback</p>
          </div>
        </div>

        {/* Search */}
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

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Rating and Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600 ml-2">
                        {review.rating}/5
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Comment */}
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>

                  {/* User and Item Info */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                     <div className="flex items-center space-x-4">
                       {review.user && (
                         <div className="flex items-center space-x-2">
                           <User className="w-4 h-4 text-gray-400" />
                           <span className="text-sm text-gray-600">
                             {review.user.name}
                           </span>
                         </div>
                       )}

                       {review.item && (
                         <div className="flex items-center space-x-2">
                           <Package className="w-4 h-4 text-gray-400" />
                           <span className="text-sm text-gray-600">
                             {review.item.title}
                           </span>
                           <Badge variant="secondary" className="text-xs">
                             {review.item.category}
                           </Badge>
                         </div>
                       )}
                     </div>
                   </div>
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