'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { fetchApi, api } from '@/lib/api';
import { toast } from 'sonner';

interface ReviewFormProps {
  itemId: string;
  productName?: string;
  onReviewSubmitted: () => void;
  existingReview?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
}

export function ReviewForm({ itemId, productName, onReviewSubmitted, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedAI, setHasGeneratedAI] = useState(false);

  const isNewReview = !existingReview;

  const submitReview = async (finalRating: number, finalComment: string) => {
    if (!finalComment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }
    if (finalComment.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }
    if (finalRating < 1 || finalRating > 5) {
      toast.error('Please provide a rating between 1 and 5');
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        await fetchApi(`${api.reviews}/${existingReview.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ rating: finalRating, comment: finalComment.trim() }),
        });
        toast.success('Review updated successfully!');
        setHasGeneratedAI(false);
        onReviewSubmitted();
      } else {
        await fetchApi(api.reviews, {
          method: 'POST',
          body: JSON.stringify({ itemId, rating: finalRating, comment: finalComment.trim() }),
        });
        toast.success('Review submitted successfully!');
        setComment('');
        setRating(5);
        setHasGeneratedAI(false);
        onReviewSubmitted();
      }
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      toast.error(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReview(rating, comment);
  };

  // Pure AI generation - no default/local comments ever
  const handleAIGenerate = async (autoSubmitAfter = false) => {
    setIsGenerating(true);
    try {
      const nameToUse = productName || 'this product';
      const res = await fetchApi(api.ai.generateReview, {
        method: 'POST',
        body: JSON.stringify({ productName: nameToUse, rating }),
      });

      const aiComment = res.data.comment;
      setComment(aiComment);
      setHasGeneratedAI(true);

      toast.success('AI generated review!');

      if (autoSubmitAfter && isNewReview) {
        setTimeout(() => {
          submitReview(rating, aiComment);
        }, 400);
      }
    } catch (error: any) {
      console.error('AI review generation failed:', error);
      toast.error('AI generation failed. Please try again or write manually.');
      // NO default comment is ever inserted
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate AI review on mount for NEW reviews (no default text)
  useEffect(() => {
    if (isNewReview) {
      const timer = setTimeout(() => {
        handleAIGenerate(true); // generate + auto submit
      }, 280);
      return () => clearTimeout(timer);
    } else if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, [existingReview]);

  // Regenerate when user changes rating (new review only)
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    if (isNewReview && !isGenerating) {
      setTimeout(() => handleAIGenerate(true), 120);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isNewReview ? 'Write a Review (AI Generated)' : 'Edit Your Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {rating} out of 5 stars
            </p>
          </div>

          {/* Comment - Always AI for new reviews */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                {isNewReview ? 'AI Generated Review' : 'Your Review'}
              </label>
              {isNewReview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIGenerate(false)}
                  disabled={isGenerating}
                  className="border-blue-200 hover:bg-blue-50 text-blue-600"
                >
                  {isGenerating ? '🤖 Generating...' : '🔄 Regenerate with AI'}
                </Button>
              )}
            </div>

            <Textarea
              placeholder={isNewReview ? "AI is generating your review..." : "Share your experience with this product..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting || !comment.trim()} className="w-full">
            {isSubmitting 
              ? (existingReview ? 'Updating...' : 'Submitting...') 
              : (existingReview ? 'Update Review' : 'Submit Review')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
