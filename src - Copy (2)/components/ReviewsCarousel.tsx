import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  customer_name: string;
  customer_image: string;
  rating: number;
  review_text: string;
  review_type: string;
  product_type: string;
  location: string;
  verified_purchase: boolean;
}

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .eq('featured', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (data) setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(nextReview, 5000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  if (loading || reviews.length === 0) {
    return null;
  }

  // Show 3 reviews at a time on desktop, 1 on mobile
  const getVisibleReviews = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % reviews.length;
      visible.push(reviews[index]);
    }
    return visible;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real reviews from real customers. Join over 2,700 satisfied customers worldwide!
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Desktop: 3 reviews side by side */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {getVisibleReviews().map((review) => (
              <div
                key={review.id}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:scale-105"
              >
                {/* Customer Info */}
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={review.customer_image}
                    alt={review.customer_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">
                      {review.customer_name}
                    </h3>
                    <p className="text-gray-400 text-sm">{review.location}</p>
                  </div>
                  {review.verified_purchase && (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                </div>

                {/* Rating */}
                <div className="mb-4">{renderStars(review.rating)}</div>

                {/* Review Text */}
                <p className="text-gray-300 leading-relaxed mb-4">
                  {review.review_text}
                </p>

                {/* Product Type Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      review.product_type === 'iptv'
                        ? 'bg-blue-500/20 text-blue-400'
                        : review.product_type === 'firestick'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}
                  >
                    {review.product_type === 'iptv'
                      ? 'IPTV Subscription'
                      : review.product_type === 'firestick'
                      ? 'Fire Stick'
                      : 'Bundle Purchase'}
                  </span>
                  {review.verified_purchase && (
                    <span className="text-xs text-green-400">Verified Purchase</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: 1 review at a time */}
          <div className="md:hidden">
            {reviews[currentIndex] && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={reviews[currentIndex].customer_image}
                    alt={reviews[currentIndex].customer_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">
                      {reviews[currentIndex].customer_name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {reviews[currentIndex].location}
                    </p>
                  </div>
                  {reviews[currentIndex].verified_purchase && (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                </div>

                <div className="mb-4">{renderStars(reviews[currentIndex].rating)}</div>

                <p className="text-gray-300 leading-relaxed mb-4">
                  {reviews[currentIndex].review_text}
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      reviews[currentIndex].product_type === 'iptv'
                        ? 'bg-blue-500/20 text-blue-400'
                        : reviews[currentIndex].product_type === 'firestick'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}
                  >
                    {reviews[currentIndex].product_type === 'iptv'
                      ? 'IPTV Subscription'
                      : reviews[currentIndex].product_type === 'firestick'
                      ? 'Fire Stick'
                      : 'Bundle Purchase'}
                  </span>
                  {reviews[currentIndex].verified_purchase && (
                    <span className="text-xs text-green-400">Verified Purchase</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevReview}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-all z-10"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextReview}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-all z-10"
            aria-label="Next review"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-orange-500 w-8'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-orange-500">2,700+</div>
            <div className="text-gray-400 text-sm mt-1">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-500">4.8/5</div>
            <div className="text-gray-400 text-sm mt-1">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-500">98%</div>
            <div className="text-gray-400 text-sm mt-1">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-500">24/7</div>
            <div className="text-gray-400 text-sm mt-1">Customer Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}
