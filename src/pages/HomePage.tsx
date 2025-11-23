import { useEffect, useState } from 'react';
import { Tv, Zap, Shield, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('square_products')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (data && !error) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
      <nav className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tv className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">StreamStick Pro</span>
            </div>
            <a
              href="https://secure.streamstickpro.com"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              AI Tools & Services
            </a>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          AI-Powered Web Solutions
        </h1>
        <p className="text-xl md:text-2xl text-blue-200 mb-12 max-w-3xl mx-auto">
          Transform your digital presence with intelligent tools for web design, SEO optimization, and content automation
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 hover:bg-white/10 transition">
            <Zap className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Instant Activation</h3>
            <p className="text-blue-200">
              Start using powerful AI tools immediately. No technical setup required.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 hover:bg-white/10 transition">
            <Shield className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Expert Support</h3>
            <p className="text-blue-200">
              24/7 technical assistance and guidance to maximize your results.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 hover:bg-white/10 transition">
            <Star className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">AI-Powered Quality</h3>
            <p className="text-blue-200">
              Advanced algorithms deliver professional results automatically.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Our AI Tool Suites
        </h2>
        {loading ? (
          <div className="text-center text-blue-300 text-xl">Loading services...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-blue-400 hover:scale-105 transition-all"
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-white">{product.name}</h3>
                    <span className="text-2xl font-bold text-blue-400">${product.price}</span>
                  </div>
                  <p className="text-blue-200 text-sm mb-4 leading-relaxed">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-xs font-semibold uppercase">
                      {product.category}
                    </span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="bg-black/50 backdrop-blur-md border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center text-blue-300">
            <p className="mb-2">&copy; 2025 StreamStick Pro. All rights reserved.</p>
            <p className="text-sm">Professional streaming services and technical support</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
