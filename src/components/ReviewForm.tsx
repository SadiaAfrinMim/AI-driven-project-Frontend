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
  const [hasGeneratedAI, setHasGeneratedAI] = useState(!!existingReview);
  const [showSubmitPreview, setShowSubmitPreview] = useState(false);

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
        setHasGeneratedAI(true);
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
        setShowSubmitPreview(false);
        onReviewSubmitted();
      }
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      toast.error(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isNewReview && !hasGeneratedAI) {
      toast.error('Please generate an AI review first by clicking the Generate button');
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    if (isNewReview) {
      // Click submit shows the AI review preview first
      setShowSubmitPreview(true);
      return;
    }

    // Direct submit for edits
    submitReview(rating, comment);
  };

  const handleConfirmSubmit = () => {
    submitReview(rating, comment);
  };

  const handleCancelPreview = () => {
    setShowSubmitPreview(false);
  };

  // Pure AI generation - only when user explicitly clicks Generate
  const handleAIGenerate = async () => {
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
      setShowSubmitPreview(false); // hide any old preview

      toast.success('AI generated review! You can edit it if needed.');
    } catch (error: any) {
      console.error('AI review generation failed:', error);
      toast.error('AI generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Load existing review data (NO auto generate for new reviews)
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
      setHasGeneratedAI(true);
    }
  }, [existingReview]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isNewReview ? 'Write a Review with AI' : 'Edit Your Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* SUBMIT PREVIEW: shown when user clicks Submit on a new AI review */}
        {showSubmitPreview && isNewReview && (
          <div className="mb-6 rounded-xl border-2 border-sky-300 bg-sky-50 p-5">
            <div className="flex items-center gap-2 mb-3 text-sky-700 font-semibold">
              <Star className="h-5 w-5" /> AI Review Preview — This will be submitted
            </div>
            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-5 h-5 ${s <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{rating} stars</span>
            </div>
            <div className="bg-white border border-sky-200 rounded-lg p-4 text-[15px] leading-relaxed text-sky-800 whitespace-pre-wrap">
              {comment}
            </div>
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={handleConfirmSubmit} 
                disabled={isSubmitting}
                className="flex-1 bg-sky-600 hover:bg-sky-700"
              >
                {isSubmitting ? 'Posting...' : '✓ Confirm & Submit AI Review'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancelPreview}
                disabled={isSubmitting}
              >
                Edit
              </Button>
            </div>
            <p className="text-[11px] text-sky-600 mt-2 text-center">AI wrote this based on your rating. You can edit before confirming.</p>
          </div>
        )}

        {/* Normal form (hidden while preview is shown for new reviews) */}
        {!(showSubmitPreview && isNewReview) && (
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

            {/* AI Generate Section - ONLY for new reviews */}
            {isNewReview && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    AI Review
                  </label>
                  {hasGeneratedAI && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAIGenerate}
                      disabled={isGenerating}
                      className="border-blue-200 hover:bg-blue-50 text-blue-600"
                    >
                      {isGenerating ? '🤖 Generating...' : '🔄 Regenerate with AI'}
                    </Button>
                  )}
                </div>

                {!hasGeneratedAI ? (
                  <div className="border border-dashed border-sky-300 rounded-xl p-6 text-center bg-sky-50/50">
                    <p className="text-sky-600 mb-4 text-sm">Let AI write a natural review based on your rating.</p>
                    <Button
                      type="button"
                      onClick={handleAIGenerate}
                      disabled={isGenerating}
                      className="bg-sky-600 hover:bg-sky-700 px-8"
                    >
                      {isGenerating ? 'Generating AI Review...' : '✨ Generate AI Review'}
                    </Button>
                    <p className="text-[11px] text-muted-foreground mt-3">You must generate before you can submit.</p>
                  </div>
                ) : (
                  <Textarea
                    placeholder="AI generated review will appear here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="resize-none border-sky-200 focus:border-sky-400"
                    required
                  />
                )}
              </div>
            )}

            {/* For editing existing reviews - normal textarea */}
            {!isNewReview && (
              <div>
                <label className="block text-sm font-medium mb-2">Your Review</label>
                <Textarea
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="resize-none"
                  required
                />
              </div>
            )}

            {/* Submit button - blocked until AI generated for new reviews */}
            <Button 
              type="submit" 
              disabled={isSubmitting || !comment.trim() || (isNewReview && !hasGeneratedAI)} 
              className="w-full"
            >
              {isSubmitting 
                ? (existingReview ? 'Updating...' : 'Submitting...') 
                : (existingReview ? 'Update Review' : 'Submit Review')}
            </Button>

            {isNewReview && !hasGeneratedAI && (
              <p className="text-center text-xs text-muted-foreground -mt-2">
                Generate AI review first to enable submission
              </p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
