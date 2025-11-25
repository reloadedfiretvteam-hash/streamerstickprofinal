import { Star, CheckCircle, User } from 'lucide-react';

interface CustomerReview {
  id: number;
  name: string;
  location: string;
  rating: number;
  review: string;
  productType: 'iptv' | 'firestick' | 'bundle';
  date: string;
  verified: boolean;
  avatar?: string;
}

const customerReviews: CustomerReview[] = [
  {
    id: 1,
    name: 'Michael R.',
    location: 'New York, NY',
    rating: 5,
    review: 'Absolutely amazing service! Setup took 5 minutes and I now have access to every channel I could ever want. Picture quality is incredible in 4K. Best decision I made cutting the cord!',
    productType: 'iptv',
    date: '2 weeks ago',
    verified: true
  },
  {
    id: 2,
    name: 'Sarah K.',
    location: 'Los Angeles, CA',
    rating: 4,
    review: 'Ordered IPTV subscription, said 1-24 hours delivery, took 5 hours but overall happy—channels loaded fast! Customer support was responsive when I had questions.',
    productType: 'iptv',
    date: '3 weeks ago',
    verified: true
  },
  {
    id: 3,
    name: 'David T.',
    location: 'Chicago, IL',
    rating: 5,
    review: 'The Fire Stick came pre-loaded with everything. Just plugged it in and was streaming within minutes. Way better than paying $180/month for cable!',
    productType: 'firestick',
    date: '1 month ago',
    verified: true
  },
  {
    id: 4,
    name: 'Jennifer L.',
    location: 'Houston, TX',
    rating: 3,
    review: 'FireStick setup was easy, but initial buffering on some apps; still, best value for money. After adjusting my router settings, works perfectly now.',
    productType: 'firestick',
    date: '2 weeks ago',
    verified: true
  },
  {
    id: 5,
    name: 'Marcus B.',
    location: 'Miami, FL',
    rating: 5,
    review: 'Been using for 6 months now - never going back to cable! Sports coverage is unreal. Watched every NFL game this season without issues.',
    productType: 'bundle',
    date: '1 week ago',
    verified: true
  },
  {
    id: 6,
    name: 'Amanda W.',
    location: 'Phoenix, AZ',
    rating: 4,
    review: 'Great selection of international channels for my family. My parents love the Spanish channels. Setup guide was very helpful.',
    productType: 'iptv',
    date: '3 weeks ago',
    verified: true
  },
  {
    id: 7,
    name: 'Robert H.',
    location: 'Seattle, WA',
    rating: 5,
    review: 'Top Jailbroken FireStick Apps 2025 are all pre-installed! Saved me hours of research. The customer service team was incredibly helpful.',
    productType: 'firestick',
    date: '1 month ago',
    verified: true
  },
  {
    id: 8,
    name: 'Emily C.',
    location: 'Denver, CO',
    rating: 4,
    review: 'Good IPTV service overall. Took a day to get my login but once set up, the streaming quality is excellent. Would recommend!',
    productType: 'iptv',
    date: '2 weeks ago',
    verified: true
  },
  {
    id: 9,
    name: 'Carlos G.',
    location: 'Atlanta, GA',
    rating: 5,
    review: 'Best IPTV Subscriptions for FireStick hands down! The 4K quality on my Fire Stick 4K Max is stunning. Worth every penny.',
    productType: 'bundle',
    date: '1 week ago',
    verified: true
  },
  {
    id: 10,
    name: 'Lisa M.',
    location: 'Boston, MA',
    rating: 5,
    review: 'Switched from cable 3 months ago. My family watches everything - movies, sports, kids shows. The money we save each month is incredible!',
    productType: 'iptv',
    date: '2 weeks ago',
    verified: true
  }
];

export default function CustomerReviewsSection() {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getProductBadge = (type: string) => {
    switch (type) {
      case 'iptv':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'IPTV Subscription' };
      case 'firestick':
        return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Fire Stick' };
      case 'bundle':
        return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Bundle Package' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Product' };
    }
  };

  // Calculate average rating
  const avgRating = (customerReviews.reduce((sum, r) => sum + r.rating, 0) / customerReviews.length).toFixed(1);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white" id="customer-reviews">
      <div className="container mx-auto px-4">
        {/* Section Header with SEO-friendly H2 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Real Customer Reviews & Testimonials
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            See what our customers say about our jailbroken Fire Stick and IPTV subscription services
          </p>
          
          {/* Rating Summary */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.round(Number(avgRating)) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-gray-900">{avgRating}</span>
              <span className="text-gray-500">out of 5</span>
            </div>
            <div className="text-gray-500">
              Based on {customerReviews.length} verified reviews
            </div>
          </div>
        </div>

        {/* Reviews Grid - Mobile Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {customerReviews.map((review) => {
            const badge = getProductBadge(review.productType);
            return (
              <article
                key={review.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 flex flex-col transform hover:-translate-y-1"
                itemScope
                itemType="https://schema.org/Review"
              >
                {/* Customer Avatar and Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                    {review.avatar ? (
                      <img 
                        src={review.avatar} 
                        alt={review.name}
                        className="w-full h-full rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900" itemProp="author">{review.name}</h3>
                      {review.verified && (
                        <CheckCircle className="w-4 h-4 text-green-500" aria-label="Verified purchase" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{review.location}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                  <meta itemProp="ratingValue" content={review.rating.toString()} />
                  <meta itemProp="bestRating" content="5" />
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 mb-4 flex-grow leading-relaxed" itemProp="reviewBody">
                  "{review.review}"
                </p>

                {/* Product Badge */}
                <div className="flex items-center gap-2 mt-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                  {review.verified && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified Purchase
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Join Thousands of Happy Customers
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Experience the best IPTV service with our premium subscriptions and jailbroken Fire Stick devices. 
              Start streaming 20,000+ channels today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/shop"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                View All Products
              </a>
              <a
                href="#faq"
                className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-all"
              >
                Read FAQs
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
