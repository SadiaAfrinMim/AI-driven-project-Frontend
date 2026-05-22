'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, MessageSquare, Trash2, Edit } from 'lucide-react';
import Cookies from 'js-cookie';

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

  // Current logged-in user (strict filter for safety)
  const currentUser = (() => {
    try {
      const u = Cookies.get('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();
  const currentUserId = currentUser?.id;

  // Edit state
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchReviews = async () => {
    try {
      // Use dedicated endpoint that only returns the logged-in user's own reviews
      const data = await fetchApi(`${api.reviews}/user/my-reviews`);
      let myReviews = Array.isArray(data.data?.reviews) ? data.data.reviews : [];

      // Extra safety: client-side filter by userId (only show my reviews)
      if (currentUserId) {
        myReviews = myReviews.filter((r: Review) => r.userId === currentUserId);
      }

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

  // Final safety filter + search
  const filteredReviews = reviews
    .filter((review) => {
      // Double ensure only current user's reviews
      if (currentUserId && review.userId !== currentUserId) return false;

      const q = searchTerm.toLowerCase();
      return (
        review.comment.toLowerCase().includes(q) ||
        (review.user?.name || '').toLowerCase().includes(q) ||
        (review.item?.title || '').toLowerCase().includes(q)
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

  const openEdit = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setEditRating(5);
    setEditComment('');
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    setIsUpdating(true);
    try {
      await fetchApi(`${api.reviews}/${editingReview.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          rating: editRating,
          comment: editComment.trim(),
        }),
      });

      toast.success('Review updated successfully');
      cancelEdit();
      fetchReviews();
    } catch (error) {
      console.error('Failed to update review:', error);
      toast.error('Failed to update review');
    } finally {
      setIsUpdating(false);
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

      {/* Edit Review Form */}
      {editingReview && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Your Review</h3>
              <p className="text-sm text-gray-600">For: {editingReview.item?.title}</p>
            </div>

            <div className="space-y-4">
              {/* Rating */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors ${star <= editRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 self-center">{editRating}/5</span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Your Review</label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Update your review..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleUpdateReview} 
                  disabled={isUpdating || !editComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={cancelEdit} disabled={isUpdating}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                <Button 
                  variant="outline" 
                  className="px-3 py-1 rounded-md flex items-center" 
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(review);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button className="bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded-md flex items-center" onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteReview(review.id);
                }}>
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
