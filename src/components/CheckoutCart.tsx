import { useState, useEffect } from 'react';
import { X, Plus, Minus, Copy, Check, DollarSign, Wallet, ShoppingBag, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import OrderConfirmation from './OrderConfirmation';
import LegalDisclaimer from './LegalDisclaimer';
import SquarePaymentForm from './SquarePaymentForm';
import ValidatedImage from './ValidatedImage';
import { showToast } from './ToastProvider';

// Fallback image for cart items
const FALLBACK_CART_IMAGE = 'https://images.pexels.com/photos/5474028/pexels-photo-5474028.jpeg?auto=compress&cs=tinysrgb&w=200';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart?: () => void;
}

interface OrderDataType {
  orderNumber: string;
  purchaseCode: string;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
  total: number;
  paymentMethod: 'cashapp' | 'bitcoin' | 'square';
  customerEmail: string;
  btcAmount: string | null;
  btcAddress: string | null;
  cashAppTag: string | null;
}

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export default function CheckoutCart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onClearCart }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<'cashapp' | 'bitcoin' | 'square'>('cashapp');
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  // Customer form fields - ALL REQUIRED
  const [customerName, setCustomerName] = useState('');
  const [username, setUsername] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [processing, setProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderData, setOrderData] = useState<OrderDataType | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Payment gateway details
  const CASH_APP_TAG = '$starevan11';
  const BITCOIN_ADDRESS = 'bc1q448jm49ypzwsrrk75c974uqla28k0kmnx6w95r';
  const SHOP_OWNER_EMAIL = 'reloadedfiretvteam@gmail.com';
  const SERVICE_PORTAL_URL = 'http://ky-tv.cc';

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const btcAmount = btcPrice > 0 ? (total / btcPrice).toFixed(8) : '0.00000000';

  // Fetch live Bitcoin price
  useEffect(() => {
    fetchBitcoinPrice();
    const interval = setInterval(fetchBitcoinPrice, 30000);
    return () => clearInterval(interval);
  }, [total]);

  const fetchBitcoinPrice = async () => {
    try {
      const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
      const data = await response.json();
      const usdRate = parseFloat(data.data.rates.USD);
      setBtcPrice(usdRate);
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      setBtcPrice(95000);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopiedField(field);
    setTimeout(() => {
      setCopied(false);
      setCopiedField('');
    }, 2000);
  };

  const generatePurchaseCode = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc('generate_purchase_code');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating purchase code:', error);
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 7).toUpperCase();
      return `PC-${timestamp}-${random}`;
    }
  };

  // Generate 8–9 character username/password using customer name + random letters/numbers
  const generateCredential = (baseName: string): string => {
    const cleaned = (baseName || 'user')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
    const prefix = cleaned.slice(0, 4) || 'user';
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const length = 8 + Math.floor(Math.random() * 2); // 8 or 9
    let suffix = '';
    while ((prefix + suffix).length < length) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return (prefix + suffix).slice(0, length);
  };

  const sendCustomerEmail = async (purchaseCode: string, orderNumber: string, orderItems: OrderItem[]) => {
    const itemsList = orderItems.map(item =>
      `- ${item.product_name} x${item.quantity} = $${item.total_price.toFixed(2)}`
    ).join('\n');

    let paymentInstructions = '';

    if (paymentMethod === 'cashapp') {
      paymentInstructions = `
CASH APP PAYMENT INSTRUCTIONS:

1. Open your Cash App
2. Copy and paste our Cash App tag: ${CASH_APP_TAG}
3. Enter the amount: $${total.toFixed(2)}
4. In the "What's it for" field, paste your unique purchase code: ${purchaseCode}
5. Complete the payment

IMPORTANT: Your purchase code links your payment to your order. Make sure to include it in the payment note.

If needed, you can also email a payment screenshot to ${SHOP_OWNER_EMAIL} with your purchase code.

📺 Need help? Watch this tutorial: https://www.youtube.com/watch?v=fDjDH_WAvYI
`;
    } else {
      paymentInstructions = `
BITCOIN PAYMENT INSTRUCTIONS:

1. Bitcoin Amount to Send: ${btcAmount} BTC
2. Bitcoin Address: ${BITCOIN_ADDRESS}
3. Current BTC Price: $${btcPrice.toLocaleString()}

IMPORTANT STEPS:
- Copy the Bitcoin address and exact amount shown above
- Send your Bitcoin payment to the address
- After sending, EMAIL a screenshot of your payment confirmation to ${SHOP_OWNER_EMAIL}
- Include your unique purchase code in the email: ${purchaseCode}

Your purchase code is essential for tracking your order and linking your payment.

📺 Need help with Bitcoin?
- Cash App Tutorial: https://www.youtube.com/watch?v=fDjDH_WAvYI
- Coinbase Tutorial: https://www.youtube.com/watch?v=Vhspj-KHYWs
`;
    }

    const emailBody = `
Thank you for your order!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order Number: ${orderNumber}
🔑 UNIQUE PURCHASE CODE: ${purchaseCode}

Customer: ${customerName}
Username: ${username}
Email: ${customerEmail}
Phone: ${customerPhone}
Address: ${customerAddress}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS ORDERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${itemsList}

TOTAL: $${total.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${paymentInstructions}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for choosing Inferno TV!
We'll process your order as soon as we receive your payment confirmation.

Need Support? Email: ${SHOP_OWNER_EMAIL}
`;

    await supabase.from('email_logs').insert({
      recipient: customerEmail,
      template_key: 'order_confirmation',
      subject: `Order Confirmation - ${orderNumber} - Purchase Code: ${purchaseCode}`,
      body: emailBody,
      status: 'pending'
    });

    return emailBody;
  };

  const sendShopOwnerEmail = async (purchaseCode: string, orderNumber: string, orderItems: OrderItem[]) => {
    const itemsList = orderItems.map(item =>
      `- ${item.product_name} x${item.quantity} = $${item.total_price.toFixed(2)}`
    ).join('\n');

    const emailBody = `
NEW ORDER RECEIVED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order Number: ${orderNumber}
🔑 Purchase Code: ${purchaseCode}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${customerName}
Username: ${username}
Email: ${customerEmail}
Phone: ${customerPhone}
Address: ${customerAddress}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS ORDERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${itemsList}

TOTAL: $${total.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT METHOD: ${paymentMethod.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${paymentMethod === 'cashapp' ?
  `Customer should send $${total.toFixed(2)} to ${CASH_APP_TAG} with purchase code ${purchaseCode} in the note.` :
  `Customer should send ${btcAmount} BTC to ${BITCOIN_ADDRESS} and email screenshot with purchase code ${purchaseCode}.`
}

Customer has been sent complete payment instructions including their unique purchase code.
`;

    await supabase.from('email_logs').insert({
      recipient: SHOP_OWNER_EMAIL,
      template_key: 'shop_notification',
      subject: `🛒 NEW ORDER: ${orderNumber} - Code: ${purchaseCode}`,
      body: emailBody,
      status: 'pending'
    });
  };

  // Log portal + credentials emails for customer and shop owner
  const logCredentialsEmails = async (orderNumber: string, isFirestickOrder: boolean) => {
    const portalUsername = generateCredential(customerName || username || 'user');
    const portalPassword = generateCredential(customerEmail || customerName || 'pass');

    const baseLines = [
      `Portal URL: ${SERVICE_PORTAL_URL}`,
      `Username: ${portalUsername}`,
      `Password: ${portalPassword}`,
      ``,
      `Please keep this information safe. You and the shop owner both receive this email so your account can be set up on the service side.`
    ];

    const tutorialLines = isFirestickOrder
      ? [
          ``,
          `Fire Stick Setup Tutorial:`,
          `YouTube: https://youtu.be/sO2Id0bXHIY?si=1FBAbzYvUViIpepS`
        ]
      : [];

    const customerBody = [
      `Thank you for your purchase from Inferno TV!`,
      ``,
      `Here is your permanent streaming portal access:`,
      ...baseLines,
      ...tutorialLines
    ].join('\n');

    const ownerBody = [
      `NEW CUSTOMER PORTAL CREDENTIALS`,
      ``,
      `Order Number: ${orderNumber}`,
      `Customer: ${customerName}`,
      `Email: ${customerEmail}`,
      ``,
      ...baseLines,
      ...tutorialLines,
      ``,
      `Use these credentials to configure their access on ${SERVICE_PORTAL_URL}.`
    ].join('\n');

    // Customer credentials email
    await supabase.from('email_logs').insert({
      recipient: customerEmail,
      template_key: 'service_credentials',
      subject: `Your Streaming Portal Access - Order ${orderNumber}`,
      body: customerBody,
      status: 'pending'
    });

    // Shop owner copy
    await supabase.from('email_logs').insert({
      recipient: SHOP_OWNER_EMAIL,
      template_key: 'service_credentials_owner_copy',
      subject: `NEW PORTAL CREDENTIALS - ${orderNumber}`,
      body: ownerBody,
      status: 'pending'
    });
  };

  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = {};

    switch (field) {
      case 'name':
        if (!value.trim()) errors.name = 'Full name is required';
        else if (value.trim().length < 2) errors.name = 'Name must be at least 2 characters';
        break;
      case 'username':
        if (!value.trim()) errors.username = 'Username is required';
        else if (value.trim().length < 3) errors.username = 'Username must be at least 3 characters';
        break;
      case 'email':
        if (!value.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Invalid email format';
        break;
      case 'phone':
        if (!value.trim()) errors.phone = 'Phone number is required';
        else if (!/^\+?[\d\s\-()]{10,}$/.test(value)) errors.phone = 'Invalid phone number';
        break;
      case 'address':
        if (!value.trim()) errors.address = 'Shipping address is required';
        else if (value.trim().length < 10) errors.address = 'Please enter complete address';
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      ...errors,
      [field]: errors[field] || ''
    }));
  };

  const validateAllFields = () => {
    const errors: Record<string, string> = {};

    if (!customerName.trim()) errors.name = 'Full name is required';
    if (!username.trim()) errors.username = 'Username is required';
    if (!customerEmail.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) errors.email = 'Invalid email format';
    if (!customerPhone.trim()) errors.phone = 'Phone number is required';
    if (!customerAddress.trim()) errors.address = 'Shipping address is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompleteOrder = async () => {
    if (items.length === 0) {
      showToast.warning('Your cart is empty');
      return;
    }

    if (!validateAllFields()) {
      showToast.error('Please fill in all required fields correctly');
      return;
    }

    setProcessing(true);

    try {
      // Generate unique purchase code
      const purchaseCode = await generatePurchaseCode();
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const orderItems = items.map(item => ({
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const isFirestickOrder = items.some(item =>
        item.name.toLowerCase().includes('fire stick') ||
        item.name.toLowerCase().includes('firestick') ||
        item.name.toLowerCase().includes('fire tv')
      );

      // Create order in database with purchase code
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          purchase_code: purchaseCode,
          customer_name: customerName,
          username: username,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          shipping_address: customerAddress,
          payment_method: paymentMethod,
          payment_status: 'pending',
          order_status: 'pending',
          subtotal: total,
          tax: 0,
          total: total,
          items: orderItems,
          notes: `Payment method: ${paymentMethod}, Purchase Code: ${purchaseCode}`
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create purchase code record
      await supabase.from('purchase_codes').insert({
        code: purchaseCode,
        order_id: order.id,
        used: false
      });

      // Send customer order confirmation email
      await sendCustomerEmail(purchaseCode, orderNumber, orderItems);

      // Send shop owner order notification email
      await sendShopOwnerEmail(purchaseCode, orderNumber, orderItems);

      // Log streaming portal credentials emails for both customer and owner
      await logCredentialsEmails(orderNumber, isFirestickOrder);

      // Capture customer email
      await supabase.from('email_captures').upsert({
        email: customerEmail,
        source: 'checkout'
      }, { onConflict: 'email' });

      // Set order data for confirmation
      setOrderData({
        orderNumber,
        purchaseCode,
        items: orderItems,
        total,
        paymentMethod,
        customerEmail,
        btcAmount: paymentMethod === 'bitcoin' ? btcAmount : null,
        btcAddress: paymentMethod === 'bitcoin' ? BITCOIN_ADDRESS : null,
        cashAppTag: paymentMethod === 'cashapp' ? CASH_APP_TAG : null
      });

      setShowConfirmation(true);
      showToast.success('Order placed successfully!');
      console.log('Order created successfully with purchase code:', purchaseCode);
    } catch (error: unknown) {
      console.error('Error creating order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unable to process order. Please try again or contact support.';
      showToast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 bottom-0 w-full sm:max-w-xl md:max-w-2xl bg-gray-900 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-800 bg-gray-900">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Your Cart ({items.length})</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div key={item.productId} className="bg-gray-800 rounded-lg p-4 flex gap-4">
                    {item.image && (
                      <ValidatedImage
                        src={item.image}
                        fallbackSrc={FALLBACK_CART_IMAGE}
                        alt={item.name}
                        className="w-20 h-20 object-contain rounded"
                        minBytes={1000}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2 text-sm">{item.name}</h3>
                      <p className="text-orange-400 font-bold text-lg">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))} className="p-1 hover:bg-gray-700 rounded">
                          <Minus className="w-4 h-4 text-gray-400" />
                        </button>
                        <span className="text-white w-8 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)} className="p-1 hover:bg-gray-700 rounded">
                          <Plus className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => onRemoveItem(item.productId)} className="ml-auto text-red-400 hover:text-red-300 text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span className="text-orange-400">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setPaymentMethod('square')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'square'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-white text-sm font-semibold">Card</div>
                    <div className="text-gray-400 text-xs">Via Square</div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('cashapp')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'cashapp'
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-white text-sm font-semibold">Cash App</div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('bitcoin')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'bitcoin'
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <Wallet className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <div className="text-white text-sm font-semibold">Bitcoin</div>
                  </button>
                </div>
              </div>

              {/* Payment Gateway Display */}
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                {paymentMethod === 'square' && (
                  <div>
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      Credit/Debit Card Payment
                    </h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Secure payment processing powered by Square
                    </p>
                    <SquarePaymentForm 
                      amount={total}
                      onSubmit={async (_token: string) => {
                        // Handle Square payment - token is used by the payment form internally
                        await handleCompleteOrder();
                      }}
                    />
                  </div>
                )}

                {paymentMethod === 'cashapp' && (
                  <div>
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      Cash App Payment Gateway
                    </h4>

                    <div className="mb-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                      <div className="text-gray-400 text-sm mb-2">Send payment to:</div>
                      <div className="text-green-400 text-2xl font-bold mb-3">{CASH_APP_TAG}</div>
                      <div className="text-white text-lg mb-1">Amount: ${total.toFixed(2)}</div>
                      <button
                        onClick={() => copyToClipboard(CASH_APP_TAG, 'cashtag')}
                        className="w-full py-3 bg-green-500 hover:bg-green-600 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold mt-3"
                      >
                        {copied && copiedField === 'cashtag' ? (
                          <><Check className="w-5 h-5" /><span>Copied Cash App Tag!</span></>
                        ) : (
                          <><Copy className="w-5 h-5" /><span>Copy Cash App Tag</span></>
                        )}
                      </button>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                      <h5 className="text-blue-400 font-semibold mb-2">📋 Instructions:</h5>
                      <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                        <li>Copy our Cash App tag above and paste it into your Cash App payment screen</li>
                        <li>Enter the amount: ${total.toFixed(2)}</li>
                        <li>In the "What's it for" field, paste your unique purchase code (you'll receive this after clicking Purchase)</li>
                        <li>Complete the payment</li>
                        <li>You'll receive your purchase code and order details via email</li>
                      </ol>
                      <p className="text-gray-400 text-xs mt-3">
                        💡 Your unique purchase code links your payment to your order. You can also email a screenshot to {SHOP_OWNER_EMAIL} if needed.
                      </p>
                    </div>

                    <a
                      href="https://www.youtube.com/watch?v=fDjDH_WAvYI"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-xl p-4 hover:border-green-400 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-green-500 rounded-full p-2">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold">How to Purchase Bitcoin on Cash App</div>
                          <div className="text-green-400 text-xs">Step-by-Step Video Guide</div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">Learn how to buy and send Bitcoin using Cash App</p>
                    </a>
                  </div>
                )}

                {paymentMethod === 'bitcoin' && (
                  <div>
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-orange-400" />
                      Bitcoin Payment Gateway
                    </h4>

                    <div className="mb-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                      <div className="text-gray-400 text-sm mb-2">Bitcoin Amount to Send:</div>
                      <div className="text-orange-400 text-2xl font-bold mb-1">{btcAmount} BTC</div>
                      <div className="text-gray-500 text-sm mb-3">
                        ≈ ${total.toFixed(2)} USD (Live Price: ${btcPrice.toLocaleString()})
                      </div>
                      <button
                        onClick={() => copyToClipboard(btcAmount, 'btcamount')}
                        className="w-full py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                      >
                        {copied && copiedField === 'btcamount' ? (
                          <><Check className="w-4 h-4" /><span>Copied!</span></>
                        ) : (
                          <><Copy className="w-4 h-4" /><span>Copy Price</span></>
                        )}
                      </button>
                    </div>

                    <div className="mb-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                      <div className="text-gray-400 text-sm mb-2">Bitcoin Wallet Address:</div>
                      <div className="font-mono text-xs text-white break-all mb-3">{BITCOIN_ADDRESS}</div>
                      <button
                        onClick={() => copyToClipboard(BITCOIN_ADDRESS, 'btcaddress')}
                        className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                      >
                        {copied && copiedField === 'btcaddress' ? (
                          <><Check className="w-5 h-5" /><span>Copied Address!</span></>
                        ) : (
                          <><Copy className="w-5 h-5" /><span>Copy Wallet Address</span></>
                        )}
                      </button>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                      <h5 className="text-blue-400 font-semibold mb-2">📋 Instructions:</h5>
                      <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                        <li>Copy the Bitcoin wallet address and exact Bitcoin price above</li>
                        <li>Send your BTC payment to the address</li>
                        <li>After payment, email a screenshot along with your unique purchase code to {SHOP_OWNER_EMAIL}</li>
                        <li>Your unique code (received after Purchase) links your payment to your order</li>
                      </ol>
                      <p className="text-red-400 text-xs mt-3 font-semibold">
                        ⚠️ IMPORTANT: You must email your Bitcoin payment screenshot with your purchase code for order tracking!
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href="https://www.youtube.com/watch?v=fDjDH_WAvYI"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-lg p-3 hover:border-green-400 transition-all"
                      >
                        <div className="bg-green-500 rounded-full p-2 w-fit mx-auto mb-2">
                          <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-white font-bold text-xs text-center mb-1">Cash App Tutorial</div>
                        <div className="text-green-400 text-xs text-center">Buy BTC Guide</div>
                      </a>

                      <a
                        href="https://www.youtube.com/watch?v=Vhspj-KHYWs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 rounded-lg p-3 hover:border-blue-400 transition-all"
                      >
                        <div className="bg-blue-500 rounded-full p-2 w-fit mx-auto mb-2">
                          <Wallet className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-white font-bold text-xs text-center mb-1">Coinbase Tutorial</div>
                        <div className="text-blue-400 text-xs text-center">Buy BTC Guide</div>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Information Form */}
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Your Information (All Fields Required)</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        validateField('name', e.target.value);
                      }}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        validationErrors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                      required
                    />
                    {validationErrors.name && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Username *</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        validateField('username', e.target.value);
                      }}
                      placeholder="johndoe123"
                      className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        validationErrors.username ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                      required
                    />
                    {validationErrors.username && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Email Address *</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        validateField('email', e.target.value);
                      }}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        validationErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                      required
                    />
                    {validationErrors.email && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Phone Number *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        validateField('phone', e.target.value);
                      }}
                      placeholder="(555) 123-4567"
                      className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        validationErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                      required
                    />
                    {validationErrors.phone && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Shipping Address *</label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => {
                        setCustomerAddress(e.target.value);
                        validateField('address', e.target.value);
                      }}
                      placeholder="123 Main Street, City, State, ZIP"
                      className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        validationErrors.address ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                      required
                    />
                    {validationErrors.address && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Disclaimer - Before Purchase */}
              <div className="mb-6">
                <LegalDisclaimer variant="checkout" />
              </div>

              {/* Purchase Button */}
              <button
                onClick={handleCompleteOrder}
                disabled={processing}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 mb-8"
              >
                {processing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Purchase - ${total.toFixed(2)}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {showConfirmation && orderData && (
        <OrderConfirmation
          {...orderData}
          onClose={() => {
            setShowConfirmation(false);
            setCustomerName('');
            setUsername('');
            setCustomerEmail('');
            setCustomerPhone('');
            setCustomerAddress('');
            if (onClearCart) onClearCart();
            onClose();
          }}
        />
      )}
    </div>
  );
}
