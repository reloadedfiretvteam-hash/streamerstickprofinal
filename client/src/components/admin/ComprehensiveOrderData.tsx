import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp,
  Package,
  Gift,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
  Download,
  Mail,
  Filter
} from 'lucide-react';

interface OrderData {
  id: string;
  type: 'paid' | 'free-trial';
  customerEmail: string;
  customerName: string | null;
  productName: string;
  amount: number;
  status: string;
  createdAt: string;
  credentialsSent: boolean;
  generatedUsername: string | null;
  isRenewal: boolean;
  expiresAt?: string | null;
}

interface OrderStatistics {
  totalOrders: number;
  paidOrders: number;
  freeTrials: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  totalRevenue: number;
  conversionRate: number;
  pendingCredentials: number;
}

export default function ComprehensiveOrderData() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [stats, setStats] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'paid' | 'free-trial'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'completed' | 'failed'>('all');

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ComprehensiveOrderData.tsx:67',message:'Fetching order data',timestamp:Date.now(),sessionId:'debug-session',runId:'order-debug',hypothesisId:'L'})}).catch(()=>{});
      }
      // #endregion
      
      const { apiCall } = await import('@/lib/api');
      const token = localStorage.getItem('custom_admin_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await apiCall('/api/admin/customers/orders-comprehensive', {
        headers,
      });
      
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ComprehensiveOrderData.tsx:81',message:'Order API response',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'order-debug',hypothesisId:'M'})}).catch(()=>{});
      }
      // #endregion
      
      if (!response.ok) {
        const errorText = await response.text();
        // #region agent log
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ComprehensiveOrderData.tsx:88',message:'Order API error',data:{status:response.status,error:errorText},timestamp:Date.now(),sessionId:'debug-session',runId:'order-debug',hypothesisId:'N'})}).catch(()=>{});
        }
        // #endregion
        console.error('Failed to fetch orders:', response.status, errorText);
        return;
      }
      
      const result = await response.json();
      
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ComprehensiveOrderData.tsx:97',message:'Order data parsed',data:{hasData:!!result.data,ordersCount:result.data?.orders?.length||0,hasStats:!!result.data?.statistics},timestamp:Date.now(),sessionId:'debug-session',runId:'order-debug',hypothesisId:'O'})}).catch(()=>{});
      }
      // #endregion
      
      if (result.data) {
        setOrders(result.data.orders || []);
        setStats(result.data.statistics || null);
      } else {
        console.warn('No data in order response:', result);
      }
    } catch (error: any) {
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ComprehensiveOrderData.tsx:108',message:'Order fetch exception',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'order-debug',hypothesisId:'P'})}).catch(()=>{});
      }
      // #endregion
      console.error('Error fetching order data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.generatedUsername && order.generatedUsername.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || order.type === filterType;
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Order Data</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive view of all orders including free trials
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrderData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                <span>{stats.paidOrders} paid</span>
                <span>•</span>
                <span>{stats.freeTrials} trials</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.revenueThisMonth)} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Trials to paid conversion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Package className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ordersThisMonth}</div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                <span>{stats.ordersToday} today</span>
                <span>•</span>
                <span>{stats.ordersThisWeek} this week</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, product, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="paid">Paid Orders</option>
                <option value="free-trial">Free Trials</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credentials</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Badge variant={order.type === 'paid' ? 'default' : 'secondary'}>
                          {order.type === 'paid' ? (
                            <>
                              <DollarSign className="h-3 w-3 mr-1" />
                              Paid
                            </>
                          ) : (
                            <>
                              <Gift className="h-3 w-3 mr-1" />
                              Free Trial
                            </>
                          )}
                        </Badge>
                        {order.isRenewal && (
                          <Badge variant="outline" className="ml-1">Renewal</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customerName || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                          {order.generatedUsername && (
                            <div className="text-xs text-muted-foreground mt-1">
                              User: {order.generatedUsername}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.productName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {order.amount > 0 ? formatCurrency(order.amount) : (
                            <Badge variant="outline">FREE</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === 'paid' || order.status === 'completed'
                              ? 'default'
                              : order.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {order.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {order.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.credentialsSent ? (
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sent
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(order.createdAt)}</div>
                        {order.expiresAt && (
                          <div className="text-xs text-muted-foreground">
                            Expires: {formatDate(order.expiresAt)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
