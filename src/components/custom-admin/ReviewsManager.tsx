import { useState, useEffect } from 'react';
import { Star, MessageStripe, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Review {
  id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  review_title: string;
  review_text: string;
  product_name: string;
  status: string;
  verified_purchase: boolean;
  featured: boolean;
  created_at: string;
}

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    try {
      let query = supabase
        .from('customer_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_reviews')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      loadReviews();
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const rejectReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_reviews')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      loadReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('customer_reviews')
        .update({ featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadReviews();
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Customer Reviews</h1>
          <p className="text-gray-400">Manage and moderate customer feedback</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            <span className="text-3xl font-bold text-white">{avgRating}</span>
          </div>
          <p className="text-sm text-gray-400">{reviews.length} total reviews</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'pending'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'approved'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Check className="w-4 h-4 inline mr-2" />
          Approved
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'rejected'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <X className="w-4 h-4 inline mr-2" />
          Rejected
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Reviews
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        {loading ? (
          <p className="text-gray-400">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageStripe className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`bg-gray-700 rounded-lg p-6 border-2 ${
                  review.featured ? 'border-yellow-500' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-bold text-lg">{review.customer_name}</h3>
                      {review.verified_purchase && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                      {review.featured && (
                        <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{review.customer_email}</p>
                    {renderStars(review.rating)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    review.status === 'approved' ? 'bg-green-500 text-white' :
                    review.status === 'rejected' ? 'bg-red-500 text-white' :
                    'bg-orange-500 text-white'
                  }`}>
                    {review.status}
                  </span>
                </div>

                <div className="bg-gray-800 rounded p-4 mb-4">
                  <div className="text-sm text-gray-400 mb-2">
                    Review for: <span className="text-orange-400 font-semibold">{review.product_name}</span>
                  </div>
                  <h4 className="text-white font-bold mb-2">{review.review_title}</h4>
                  <p className="text-gray-300">{review.review_text}</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleString()}
                  </p>

                  <div className="flex gap-2">
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => approveReview(review.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => rejectReview(review.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {review.status === 'approved' && (
                      <button
                        onClick={() => toggleFeatured(review.id, review.featured)}
                        className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                          review.featured
                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                            : 'bg-yellow-500 text-black hover:bg-yellow-600'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                        {review.featured ? 'Unfeature' : 'Feature'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
