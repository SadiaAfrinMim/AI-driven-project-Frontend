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
  // Start with AI ON by default for new reviews so it auto-generates relevant reviews.
  const [useAI, setUseAI] = useState(!existingReview);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedAI, setHasGeneratedAI] = useState(false);

  // Core submit logic (used both manually and for AI auto-submit)
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

  // Smart local generation (used only on explicit button click if real AI fails)
  const generateSmartLocalReview = (name: string, r: number): string => {
    const n = name || 'this product';
    if (r >= 5) return `Absolutely love the ${n}! Premium quality, works flawlessly, and excellent value. Highly recommended.`;
    if (r === 4) return `Very satisfied with the ${n}. Great build and performance. Only small wish was one extra feature, but still a solid buy.`;
    if (r === 3) return `The ${n} is decent for the price. Does the job well enough, though it could be improved in a couple of areas.`;
    if (r === 2) return `Not impressed with the ${n}. Quality feels below expectations and had some issues from the start.`;
    return `Disappointed with the ${n}. Did not perform as described and feels low quality. Would not recommend.`;
  };

  // AI generates the review AND auto-submits it when "AI mode" is on.
  // Manual button always just suggests (no auto submit, allows overwrite for regeneration).
  const handleAIGenerate = async (autoSubmit = false, allowOverwrite = false) => {
    // If user already wrote a long review manually, don't overwrite silently (except explicit regenerate)
    if (!allowOverwrite && comment.trim().length > 35) {
      toast.info('You already wrote something. Use the Regenerate button if you want AI to rewrite it.');
      return;
    }

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

      toast.success('AI generated a relevant review!');

      // === FULL AI AUTOMATION ===
      // Only auto-submit when explicitly requested (from checkbox enable or rating change in AI mode).
      // Manual "Generate with AI" button (autoSubmit=false) will never auto-post.
      if (autoSubmit && !existingReview) {
        // Small delay so the textarea visibly updates before submit
        setTimeout(() => {
          submitReview(rating, aiComment);
        }, 450);
      }
    } catch (error: any) {
      console.error('AI review generation failed:', error);
      const localComment = generateSmartLocalReview(productName || 'this product', rating);
      setComment(localComment);
      setHasGeneratedAI(true);
      toast.info('AI temporarily unavailable — used smart relevant suggestion.');

      // Still auto-submit the fallback only if explicitly requested (not for manual generate button)
      if (autoSubmit && !existingReview) {
        setTimeout(() => {
          submitReview(rating, localComment);
        }, 450);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    setHasGeneratedAI(false);
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, [existingReview]);

  // No complex useEffect needed — we trigger AI generation directly from user actions (rating click + checkbox)
  // This is much more reliable for "AI automated relevant review generation".

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
                  onClick={() => {
                    setRating(star);
                    // === AI AUTOMATED ===
                    // When "Let AI write a relevant review for me" is checked,
                    // automatically generate a fresh, relevant AI review for the new rating.
                    if (useAI && !existingReview && !isGenerating) {
                      // Use setTimeout so the rating state has updated before generation
                      setTimeout(() => {
                        handleAIGenerate(true);   // true = auto-submit after AI generates
                      }, 50);
                    }
                  }}
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
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUseAI(checked);

                    // === AI AUTOMATED ===
                    // As soon as user enables "Let AI write a relevant review for me",
                    // we automatically generate a high-quality, rating-specific review.
                    if (checked && !existingReview) {
                      setTimeout(() => handleAIGenerate(true), 80);   // auto-create + submit
                    }
                  }} 
                  id="ai-generate" 
                />
                <label htmlFor="ai-generate" className="text-sm cursor-pointer text-blue-600 font-medium">
                  ✨ Let AI write a relevant review for me (auto on rating change)
                </label>
              </div>
            </div>

              {useAI && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleAIGenerate(true)} 
                  disabled={isGenerating}
                  className="w-full mb-3 border-blue-200 hover:bg-blue-50"
                >
                  {isGenerating 
                    ? '🤖 AI is writing + posting your review...' 
                    : hasGeneratedAI 
                      ? '🔄 Get a different AI review (auto posts)' 
                      : '✨ AI writes & posts review automatically'
                  }
                </Button>
              )}

            {/* Always-available "AI Comment Generate" button (pure suggestion, no auto-post) */}
            <div className="flex justify-end -mt-1 mb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAIGenerate(false, true)}
                disabled={isGenerating}
                className="text-xs border-blue-200 hover:bg-blue-50 text-blue-600"
              >
                {isGenerating ? '🤖 AI generating...' : '✨ AI দিয়ে কমেন্ট জেনারেট করুন'}
              </Button>
            </div>

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
            {isSubmitting 
              ? (existingReview ? 'Updating...' : 'Submitting...') 
              : useAI && hasGeneratedAI && !existingReview
                ? 'AI already posted the review ✓'
                : (existingReview ? 'Update Review' : 'Submit Review')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
