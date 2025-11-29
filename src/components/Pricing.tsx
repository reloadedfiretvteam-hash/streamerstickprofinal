import { Check, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, PricingPlan } from '../lib/supabase';

interface PricingProps {
  onSelectPlan: (planId: string, amount: number) => void;
}

export default function Pricing({ onSelectPlan }: PricingProps) {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (!error && data) {
      setPlans(data as PricingPlan[]);
    }
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getBillingLabel = (period: string) => {
    const labels: Record<string, string> = {
      month: '/month',
      quarter: '/3 months',
      year: '/year',
    };
    return labels[period] || '';
  };

  if (loading) {
    return (
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">Loading plans...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            All plans include our complete channel lineup. Save more with longer subscriptions.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <span className="font-semibold">✓ 7-Day Money-Back Guarantee</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 ${
                plan.is_popular ? 'ring-4 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg flex items-center gap-2">
                  <Star className="w-4 h-4 fill-current" />
                  Most Popular
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                  <span className="text-gray-600">{getBillingLabel(plan.billing_period)}</span>
                </div>

                <button
                  onClick={() => onSelectPlan(plan.id, plan.price)}
                  className={`w-full py-4 rounded-xl font-semibold transition-all transform hover:scale-105 mb-6 ${
                    plan.is_popular
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  Get Started Now
                </button>

                <div className="space-y-4">
                  {plan.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans are backed by our 36-hour free trial. No questions asked.
          </p>
        </div>
      </div>
    </section>
  );
}
