import { useState, useEffect } from 'react';
import { Eye, Save, X, Mail, History, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  tracking_number: string;
  notes: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderStatusHistory {
  id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  notes: string;
  created_at: string;
}

interface OrderNotification {
  id: string;
  notification_type: string;
  recipient_email: string;
  recipient_type: string;
  status: string;
  created_at: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderStatusHistory[]>([]);
  const [orderNotifications, setOrderNotifications] = useState<OrderNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders_full')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  };

  const loadOrderItems = async (orderId: string) => {
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (data) setOrderItems(data);
  };

  const loadOrderHistory = async (orderId: string) => {
    const { data } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (data) setOrderHistory(data);
  };

  const loadOrderNotifications = async (orderId: string) => {
    const { data } = await supabase
      .from('order_notifications')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (data) setOrderNotifications(data);
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    await Promise.all([
      loadOrderItems(order.id),
      loadOrderHistory(order.id),
      loadOrderNotifications(order.id)
    ]);

    setEmailSubject(`Order Update - ${order.order_number}`);
    setEmailBody(`Dear Customer,\n\nYour order ${order.order_number} has been updated.\n\nCurrent Status: ${order.order_status}\n\nThank you for your order!\n\nBest regards,\nInferno TV Team`);
  };

  const handleUpdateOrder = async (orderId: string, updates: Partial<Order>) => {
    const { error } = await supabase
      .from('orders_full')
      .update(updates)
      .eq('id', orderId);

    if (!error) {
      alert('Order updated successfully!');
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updates });
        await loadOrderHistory(orderId);
      }
      setEditingOrder(null);
    } else {
      alert('Error updating order: ' + error.message);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedOrder || !emailSubject.trim() || !emailBody.trim()) {
      alert('Please fill in subject and message');
      return;
    }

    setSendingEmail(true);
    try {
      const { error } = await supabase.rpc('create_order_notification', {
        p_order_id: selectedOrder.id,
        p_notification_type: 'manual_update',
        p_recipient_email: selectedOrder.customer_email,
        p_recipient_type: 'customer',
        p_subject: emailSubject,
        p_body: emailBody
      });

      if (error) throw error;

      alert('Email notification queued successfully!');
      setShowEmailForm(false);
      await loadOrderNotifications(selectedOrder.id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert('Error sending email: ' + errorMessage);
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      processing: 'bg-blue-500/20 text-blue-400',
      shipped: 'bg-cyan-500/20 text-cyan-400',
      delivered: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
      paid: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
      refunded: 'bg-orange-500/20 text-orange-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) {
    return <div className="p-8 text-white">Loading orders...</div>;
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Order Management</h1>
          <div className="text-sm text-gray-400">
            Total Orders: {orders.length}
          </div>
        </div>

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-xl p-8 max-w-4xl w-full my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Order #{selectedOrder.order_number}</h2>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setOrderItems([]);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-orange-400">Customer Information</h3>
                  <div>
                    <div className="text-sm text-gray-400">Name</div>
                    <div className="font-semibold">{selectedOrder.customer_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Email</div>
                    <div className="font-semibold">{selectedOrder.customer_email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Phone</div>
                    <div className="font-semibold">{selectedOrder.customer_phone || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Shipping Address</div>
                    <div className="font-semibold">{selectedOrder.shipping_address || 'N/A'}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-400">Order Details</h3>
                  <div>
                    <div className="text-sm text-gray-400">Total Amount</div>
                    <div className="font-semibold text-green-400 text-2xl">
                      ${selectedOrder.total_amount.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Payment Method</div>
                    <div className="font-semibold">{selectedOrder.payment_method || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Payment Status</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.payment_status)}`}>
                      {selectedOrder.payment_status}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Order Status</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.order_status)}`}>
                      {selectedOrder.order_status}
                    </span>
                  </div>
                  {selectedOrder.tracking_number && (
                    <div>
                      <div className="text-sm text-gray-400">Tracking Number</div>
                      <div className="font-semibold">{selectedOrder.tracking_number}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left">Product</th>
                        <th className="px-4 py-3 text-left">Quantity</th>
                        <th className="px-4 py-3 text-left">Unit Price</th>
                        <th className="px-4 py-3 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item) => (
                        <tr key={item.id} className="border-t border-gray-800">
                          <td className="px-4 py-3">{item.product_name}</td>
                          <td className="px-4 py-3">{item.quantity}</td>
                          <td className="px-4 py-3">${item.unit_price.toFixed(2)}</td>
                          <td className="px-4 py-3 font-semibold">${item.total_price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Update Order</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Order Status</label>
                    <select
                      value={editingOrder?.order_status || selectedOrder.order_status}
                      onChange={(e) => setEditingOrder({ ...selectedOrder, order_status: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Payment Status</label>
                    <select
                      value={editingOrder?.payment_status || selectedOrder.payment_status}
                      onChange={(e) => setEditingOrder({ ...selectedOrder, payment_status: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Tracking Number</label>
                    <input
                      type="text"
                      value={editingOrder?.tracking_number || selectedOrder.tracking_number || ''}
                      onChange={(e) => setEditingOrder({ ...selectedOrder, tracking_number: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter tracking number"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <textarea
                      value={editingOrder?.notes || selectedOrder.notes || ''}
                      onChange={(e) => setEditingOrder({ ...selectedOrder, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Add notes..."
                    />
                  </div>
                </div>

                <button
                  onClick={() => editingOrder && handleUpdateOrder(selectedOrder.id, editingOrder)}
                  disabled={!editingOrder}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>

              <div className="mb-6 border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-400" />
                    Email Customer
                  </h3>
                  <button
                    onClick={() => setShowEmailForm(!showEmailForm)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-semibold transition"
                  >
                    {showEmailForm ? 'Hide' : 'Compose Email'}
                  </button>
                </div>

                {showEmailForm && (
                  <div className="bg-gray-900 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">To: {selectedOrder.customer_email}</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Email subject"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Message</label>
                      <textarea
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Email message..."
                      />
                    </div>
                    <button
                      onClick={handleSendEmail}
                      disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Mail className="w-5 h-5" />
                      {sendingEmail ? 'Sending...' : 'Send Email'}
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-6 border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-green-400" />
                  Order History
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {orderHistory.length > 0 ? (
                    orderHistory.map((history) => (
                      <div key={history.id} className="bg-gray-900 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">
                            {history.old_status ? `${history.old_status} → ${history.new_status}` : history.new_status}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(history.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{history.notes}</p>
                        <p className="text-xs text-gray-500 mt-1">Changed by: {history.changed_by}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No history available</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-400" />
                  Notifications Sent
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {orderNotifications.length > 0 ? (
                    orderNotifications.map((notification) => (
                      <div key={notification.id} className="bg-gray-900 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm capitalize">{notification.notification_type.replace('_', ' ')}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            notification.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                            notification.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {notification.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">To: {notification.recipient_email} ({notification.recipient_type})</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No notifications sent yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Order #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Order Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-4 font-semibold">{order.order_number}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold">{order.customer_name}</div>
                        <div className="text-sm text-gray-400">{order.customer_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-400">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
