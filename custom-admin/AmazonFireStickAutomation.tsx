import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Send, CheckCircle, XCircle, ExternalLink, User, MapPin, Phone, Mail, CreditCard, AlertCircle, Zap, Bot } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AmazonAIAssistant from './AmazonAIAssistant';

interface FireStickOrder {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  order_total: string;
  order_date: string;
  status: 'pending' | 'sent_to_amazon' | 'purchased' | 'shipped' | 'delivered';
  amazon_order_id?: string;
  amazon_tracking?: string;
  notes?: string;
}

interface AmazonProduct {
  asin: string;
  title: string;
  price: string;
  affiliate_url: string;
  image_url: string;
}

export default function AmazonFireStickAutomation() {
  const [orders, setOrders] = useState<FireStickOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<FireStickOrder | null>(null);
  const [amazonProducts, setAmazonProducts] = useState<AmazonProduct[]>([]);
  const [amazonAffiliateId, setAmazonAffiliateId] = useState('');
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);

  // Fire Stick ASINs (Amazon product identifiers)
  const fireStickProducts: AmazonProduct[] = [
    {
      asin: 'B08C1W5N87', // Fire TV Stick 4K
      title: 'Fire TV Stick 4K',
      price: '$49.99',
      affiliate_url: '',
      image_url: 'https://images-na.ssl-images-amazon.com/images/I/51TjJOTfslL._AC_SL1000_.jpg'
    },
    {
      asin: 'B08C1KG5LP', // Fire TV Stick (3rd Gen)
      title: 'Fire TV Stick (3rd Gen)',
      price: '$39.99',
      affiliate_url: '',
      image_url: 'https://images-na.ssl-images-amazon.com/images/I/51TjJOTfslL._AC_SL1000_.jpg'
    },
    {
      asin: 'B08F7PTF53', // Fire TV Stick Lite
      title: 'Fire TV Stick Lite',
      price: '$29.99',
      affiliate_url: '',
      image_url: 'https://images-na.ssl-images-amazon.com/images/I/51TjJOTfslL._AC_SL1000_.jpg'
    }
  ];

  useEffect(() => {
    loadOrders();
    loadAmazonSettings();
    generateAffiliateLinks();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Load orders that contain Fire Stick products
      const { data: ordersData, error } = await supabase
        .from('customer_orders')
        .select(`
          *,
          order_items:order_items (
            product_name,
            product_sku,
            quantity
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Filter for Fire Stick orders and transform data
      const fireStickOrders: FireStickOrder[] = (ordersData || [])
        .filter((order: any) => {
          // Check order_items JSONB array or separate order_items table
          const items = order.order_items || (Array.isArray(order.order_items) ? order.order_items : []);
          const orderItemsArray = Array.isArray(items) ? items : [];
          
          // Also check if product name in order itself contains fire stick
          const orderItemsJson = typeof order.order_items === 'string' 
            ? JSON.parse(order.order_items || '[]') 
            : (order.order_items || []);
          
          return orderItemsArray.some((item: any) => 
            item.product_name?.toLowerCase().includes('fire stick') ||
            item.product_name?.toLowerCase().includes('firestick') ||
            item.product_sku?.toLowerCase().includes('fire')
          ) || orderItemsJson.some((item: any) =>
            item.name?.toLowerCase().includes('fire stick') ||
            item.name?.toLowerCase().includes('firestick') ||
            item.product_name?.toLowerCase().includes('fire stick')
          ) || order.customer_name?.toLowerCase().includes('fire stick');
        })
        .map((order: any) => {
          // Parse shipping address from JSONB or use direct fields
          const shipping = typeof order.shipping_address === 'object' 
            ? order.shipping_address 
            : (order.shipping_address ? JSON.parse(order.shipping_address) : {});
          
          // Get Fire Stick item from order_items
          const items = order.order_items || [];
          const orderItemsArray = Array.isArray(items) ? items : [];
          const orderItemsJson = typeof order.order_items === 'string' 
            ? JSON.parse(order.order_items || '[]') 
            : (order.order_items || []);
          
          const fireStickItem = orderItemsArray.find((item: any) => 
            item.product_name?.toLowerCase().includes('fire stick') ||
            item.product_name?.toLowerCase().includes('firestick')
          ) || orderItemsJson.find((item: any) =>
            item.name?.toLowerCase().includes('fire stick') ||
            item.product_name?.toLowerCase().includes('fire stick')
          );

          return {
            id: order.id,
            order_id: order.order_number || order.id,
            customer_name: order.customer_name || 
              `${shipping.first_name || shipping.firstName || ''} ${shipping.last_name || shipping.lastName || ''}`.trim() ||
              order.customer_email?.split('@')[0] || 'Customer',
            customer_email: order.customer_email || '',
            customer_phone: order.customer_phone || shipping.phone || '',
            shipping_address: order.shipping_address || shipping.address || shipping.street || '',
            shipping_city: order.shipping_city || shipping.city || '',
            shipping_state: order.shipping_state || shipping.state || '',
            shipping_zip: order.shipping_zip || shipping.zip || shipping.postal_code || '',
            shipping_country: order.shipping_country || shipping.country || 'US',
            product_name: fireStickItem?.product_name || fireStickItem?.name || 'Fire TV Stick',
            product_sku: fireStickItem?.product_sku || fireStickItem?.sku || '',
            quantity: fireStickItem?.quantity || 1,
            order_total: order.total_amount || order.total || '0',
            order_date: order.created_at || new Date().toISOString(),
            status: order.amazon_status || 'pending',
            amazon_order_id: order.amazon_order_id || '',
            amazon_tracking: order.amazon_tracking || '',
            notes: order.notes || ''
          };
        });

      setOrders(fireStickOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Error loading orders. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadAmazonSettings = async () => {
    try {
      // Load Amazon affiliate ID from settings
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'amazon_affiliate_id')
        .single();

      if (data) {
        setAmazonAffiliateId(data.value || '');
      }
    } catch (error) {
      console.error('Error loading Amazon settings:', error);
    }
  };

  const generateAffiliateLinks = () => {
    // Generate Amazon affiliate links for each Fire Stick product
    const affiliateId = amazonAffiliateId || 'YOUR_AFFILIATE_ID'; // Replace with actual affiliate ID
    
    const productsWithLinks = fireStickProducts.map(product => ({
      ...product,
      affiliate_url: `https://www.amazon.com/dp/${product.asin}?tag=${affiliateId}&linkCode=ogi&th=1&psc=1`
    }));

    setAmazonProducts(productsWithLinks);
  };

  const generateAmazonCheckoutUrl = (order: FireStickOrder, product: AmazonProduct) => {
    // Create Amazon checkout URL with customer info pre-filled
    const baseUrl = `https://www.amazon.com/gp/aws/cart/add.html`;
    
    // Amazon Add to Cart URL with customer delivery info
    const params = new URLSearchParams({
      'ASIN.1': product.asin,
      'Quantity.1': order.quantity.toString(),
      'AssociateTag': amazonAffiliateId || 'YOUR_AFFILIATE_ID'
    });

    // Note: Amazon doesn't allow direct pre-filling of checkout, but we can:
    // 1. Use Add to Cart with affiliate link
    // 2. Provide customer info in a formatted way for easy copy-paste
    // 3. Use Amazon's "Buy Now" flow

    return `${baseUrl}?${params.toString()}`;
  };

  const generateCustomerInfoString = (order: FireStickOrder) => {
    // Format customer info for easy copy-paste into Amazon checkout
    return `Name: ${order.customer_name}
Email: ${order.customer_email}
Phone: ${order.customer_phone}
Address: ${order.shipping_address}
City: ${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}
Country: ${order.shipping_country}`;
  };

  const copyCustomerInfo = (order: FireStickOrder) => {
    const info = generateCustomerInfoString(order);
    navigator.clipboard.writeText(info);
    alert('Customer information copied to clipboard! Paste it into Amazon checkout.');
  };

  const sendToAmazon = async (order: FireStickOrder) => {
    if (!selectedOrder) {
      alert('Please select a Fire Stick product first');
      return;
    }

    const product = amazonProducts.find(p => 
      order.product_name.toLowerCase().includes(p.title.toLowerCase()) ||
      p.asin === 'B08C1W5N87' // Default to 4K if no match
    ) || amazonProducts[0];

    // Open Amazon with product in cart
    const amazonUrl = generateAmazonCheckoutUrl(order, product);
    window.open(amazonUrl, '_blank');

    // Update order status
    try {
      await supabase
        .from('customer_orders')
        .update({
          amazon_status: 'sent_to_amazon',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      // Reload orders
      await loadOrders();
      
      alert(`Amazon page opened! Customer info is ready to copy.`);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const markAsPurchased = async (order: FireStickOrder, amazonOrderId: string) => {
    try {
      await supabase
        .from('customer_orders')
        .update({
          amazon_status: 'purchased',
          amazon_order_id: amazonOrderId,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      await loadOrders();
      alert('Order marked as purchased!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'sent_to_amazon': return 'bg-blue-500';
      case 'purchased': return 'bg-green-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'sent_to_amazon': return 'Sent to Amazon';
      case 'purchased': return 'Purchased';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Zap className="w-8 h-8 text-orange-500" />
            Amazon Fire Stick Automation
          </h1>
          <p className="text-gray-400">
            Automatically process Fire Stick orders and send to Amazon with customer delivery info pre-filled
          </p>
        </div>

        {/* AI Assistant & Settings */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* AI Assistant */}
          <AmazonAIAssistant />

          {/* Amazon Settings */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Amazon Affiliate Settings
            </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Amazon Affiliate ID (Tag)</label>
              <input
                type="text"
                value={amazonAffiliateId}
                onChange={(e) => setAmazonAffiliateId(e.target.value)}
                placeholder="your-affiliate-id-20"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Get this from Amazon Associates. Format: yourname-20
              </p>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  // Save affiliate ID
                  supabase.from('site_settings').upsert({
                    key: 'amazon_affiliate_id',
                    value: amazonAffiliateId
                  }).then(() => {
                    generateAffiliateLinks();
                    alert('Affiliate ID saved!');
                  });
                }}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition-colors"
              >
                Save Affiliate ID
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Fire Stick Orders ({orders.length})
            </h2>
            <button
              onClick={loadOrders}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No Fire Stick orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-gray-700 rounded-lg p-6 border-2 ${
                    selectedOrder?.id === order.id ? 'border-orange-500' : 'border-gray-600'
                  } transition-all`}
                >
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Order Info */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{order.product_name}</h3>
                          <p className="text-sm text-gray-400">Order #{order.order_id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{order.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{order.customer_email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{order.customer_phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                          <span className="text-xs">
                            {order.shipping_address}, {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Product Selection */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Select Fire Stick Product</label>
                      <select
                        value={selectedOrder?.id === order.id ? 'selected' : ''}
                        onChange={(e) => {
                          if (e.target.value === 'select') {
                            setSelectedOrder(order);
                          }
                        }}
                        className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg border border-gray-500 focus:border-orange-500 focus:outline-none mb-4"
                      >
                        <option value="">-- Select Product --</option>
                        {amazonProducts.map((product) => (
                          <option key={product.asin} value={product.asin}>
                            {product.title} - {product.price}
                          </option>
                        ))}
                      </select>

                      {selectedOrder?.id === order.id && (
                        <div className="bg-gray-600 rounded-lg p-4 mb-4">
                          <p className="text-xs text-gray-300 mb-2">Customer Info (Click to Copy):</p>
                          <button
                            onClick={() => copyCustomerInfo(order)}
                            className="w-full text-left p-3 bg-gray-500 hover:bg-gray-400 rounded text-xs font-mono whitespace-pre-line transition-colors"
                          >
                            {generateCustomerInfoString(order)}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          sendToAmazon(order);
                        }}
                        disabled={order.status === 'purchased' || order.status === 'shipped' || order.status === 'delivered'}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                        Send to Amazon
                      </button>

                      <button
                        onClick={() => copyCustomerInfo(order)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Copy Customer Info
                      </button>

                      {order.status === 'sent_to_amazon' && (
                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                          <label className="block text-xs font-semibold mb-2">Amazon Order ID:</label>
                          <input
                            type="text"
                            placeholder="Enter Amazon order ID"
                            className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm mb-2"
                            onBlur={(e) => {
                              if (e.target.value) {
                                markAsPurchased(order, e.target.value);
                              }
                            }}
                          />
                        </div>
                      )}

                      {order.amazon_order_id && (
                        <div className="text-xs text-gray-400">
                          Amazon ID: {order.amazon_order_id}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-500/20 border border-blue-500/50 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            How It Works
          </h3>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>Set up your Amazon Associates affiliate ID above</li>
            <li>When a customer orders a Fire Stick, it appears in this list</li>
            <li>Click "Send to Amazon" - it opens Amazon with the product in cart</li>
            <li>Click "Copy Customer Info" to copy delivery details</li>
            <li>Paste customer info into Amazon checkout delivery section</li>
            <li>Complete the purchase on Amazon</li>
            <li>Enter the Amazon order ID to track the purchase</li>
          </ol>
          <div className="mt-4 p-4 bg-yellow-500/20 rounded-lg">
            <p className="text-sm font-semibold">💡 Pro Tip:</p>
            <p className="text-xs mt-1">
              Amazon doesn't allow direct API purchases, but this workflow makes it as fast as possible. 
              The customer info is formatted for easy copy-paste into Amazon's checkout form.
              </p>
            </div>
          </div>
          </div>
        </div>
    </div>
  );
}

