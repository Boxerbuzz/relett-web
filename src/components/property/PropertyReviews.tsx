
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  user_name: string;
  users: {
    first_name: string;
    last_name: string;
    avatar: string;
  };
}

interface PropertyReviewsProps {
  propertyId: string;
}

export function PropertyReviews({ propertyId }: PropertyReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('property_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id,
          user_name,
          users:user_id (
            first_name,
            last_name,
            avatar
          )
        `)
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data as Review[] || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to leave a review',
        variant: 'destructive'
      });
      return;
    }

    if (!newReview.comment.trim()) {
      toast({
        title: 'Comment Required',
        description: 'Please write a comment for your review',
        variant: 'destructive'
      });
      return;
    }

    // Get user's name for the review
    const { data: userData } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    const userName = userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : 'Anonymous';

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('property_reviews')
        .insert({
          property_id: propertyId,
          user_id: user.id,
          user_name: userName,
          rating: newReview.rating,
          comment: newReview.comment.trim()
        });

      if (error) throw error;

      toast({
        title: 'Review Submitted',
        description: 'Thank you for your review!'
      });

      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reviews ({reviews.length})</CardTitle>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {renderStars(Math.round(averageRating))}
                <span className="text-sm text-gray-600">
                  {averageRating.toFixed(1)} out of 5
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            variant="outline"
            size="sm"
          >
            Write Review
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showReviewForm && (
          <div className="border rounded-lg p-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              {renderStars(newReview.rating, true, (rating) =>
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Comment</label>
              <Textarea
                placeholder="Share your experience with this property..."
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={submitReview} 
                disabled={submitting}
                size="sm"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowReviewForm(false)}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">No reviews yet</div>
            <div className="text-sm">Be the first to review this property!</div>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={review.users?.avatar} />
                    <AvatarFallback>
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {review.users?.first_name && review.users?.last_name 
                          ? `${review.users.first_name} ${review.users.last_name}`
                          : review.user_name || 'Anonymous'
                        }
                      </span>
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
