'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { fetchApi, api } from '@/lib/api';
import { toast } from 'sonner';

interface ReviewFormProps {
  itemId: string;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ itemId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Please provide a rating between 1 and 5');
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchApi(api.reviews, {
        method: 'POST',
        body: JSON.stringify({
          itemId,
          rating,
          comment: comment.trim(),
        }),
      });

      toast.success('Review submitted successfully!');
      setComment('');
      setRating(5);
      onReviewSubmitted();
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      toast.error(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetchApi(api.ai.generateReview, {
        method: 'POST',
        body: JSON.stringify({ productName: 'this product', rating }),
      });
      setComment(res.data.comment);
      toast.success('AI review generated! You can edit it before posting.');
    } catch {
      toast.error('Failed to generate AI review');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
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
                  onClick={() => setRating(star)}
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

          {/* Comment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Your Review</label>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={useAI} 
                  onChange={(e) => setUseAI(e.target.checked)} 
                  id="ai-generate" 
                />
                <label htmlFor="ai-generate" className="text-sm cursor-pointer">Generate with AI</label>
              </div>
            </div>

            {useAI && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAIGenerate} 
                disabled={isGenerating}
                className="w-full mb-3"
              >
                {isGenerating ? 'Generating with AI...' : '✨ Generate AI Review'}
              </Button>
            )}

            <Textarea
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting || !comment.trim()} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
