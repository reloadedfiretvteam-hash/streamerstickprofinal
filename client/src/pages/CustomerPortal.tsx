import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  User,
  Lock,
  Mail,
  Package,
  Key,
  LogOut,
  Home,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";

interface Customer {
  id: string;
  username: string;
  email: string;
  fullName: string;
  status: string;
  totalOrders: number;
  createdAt: string;
}

interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  realProductName: string;
  amount: number;
  status: string;
  createdAt: string;
  generatedUsername?: string;
  generatedPassword?: string;
  existingUsername?: string;
  countryPreference?: string;
}

export default function CustomerPortal() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({ email: "", fullName: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      navigate("/customer-login");
      return;
    }
    loadCustomerData();
  }, []);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("customerToken")}`,
  });

  const loadCustomerData = async () => {
    try {
      const [profileRes, ordersRes] = await Promise.all([
        fetch("/api/customer/me", { headers: getAuthHeaders() }),
        fetch("/api/customer/orders", { headers: getAuthHeaders() }),
      ]);

      if (!profileRes.ok) {
        if (profileRes.status === 401) {
          localStorage.removeItem("customerToken");
          localStorage.removeItem("customerUsername");
          navigate("/customer-login");
          return;
        }
        throw new Error("Failed to load profile");
      }

      const profileData = await profileRes.json();
      const ordersData = await ordersRes.json();

      setCustomer(profileData.customer);
      setOrders(ordersData.orders || []);
      setProfileData({
        email: profileData.customer.email || "",
        fullName: profileData.customer.fullName || "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update profile");
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      loadCustomerData();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/customer/password", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to change password");
      }

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast({
        title: "Change Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUsername");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    navigate("/customer-login");
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const togglePasswordVisibility = (orderId: string) => {
    setShowPasswords((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-600">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-600">Failed</Badge>;
      default:
        return <Badge className="bg-gray-600">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const paidOrders = orders.filter((o) => o.status === "paid");
  const iptvCredentials = paidOrders.filter((o) => o.generatedUsername || o.existingUsername);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">My Account</h1>
            <p className="text-gray-400">Welcome back, {customer?.fullName || customer?.username}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              data-testid="button-back-store"
            >
              <Home className="h-4 w-4 mr-2" />
              Store
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-red-600 text-red-400 hover:bg-red-900/50"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="credentials" data-testid="tab-credentials">
              <Key className="h-4 w-4 mr-2" />
              IPTV Credentials
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <User className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credentials" className="mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-orange-500" />
                  Your IPTV Subscription Credentials
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Use these credentials to access your streaming service at{" "}
                  <a href="http://ky-tv.cc" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                    ky-tv.cc
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {iptvCredentials.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No IPTV credentials yet.</p>
                    <p className="text-sm mt-2">Make a purchase to get your streaming access!</p>
                    <Button
                      onClick={() => navigate("/")}
                      className="mt-4 bg-orange-500 hover:bg-orange-600"
                      data-testid="button-shop-now"
                    >
                      Shop Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {iptvCredentials.map((order) => (
                      <div key={order.id} className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">{order.realProductName}</span>
                          <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Username</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                readOnly
                                value={order.existingUsername || order.generatedUsername || ""}
                                className="bg-gray-800 border-gray-600 text-white"
                                data-testid={`input-iptv-username-${order.id}`}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => copyToClipboard(order.existingUsername || order.generatedUsername || "", `user-${order.id}`)}
                                className="text-gray-400 hover:text-white"
                                data-testid={`button-copy-username-${order.id}`}
                              >
                                {copiedField === `user-${order.id}` ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {order.generatedPassword && (
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-400">Password</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  readOnly
                                  type={showPasswords[order.id] ? "text" : "password"}
                                  value={order.generatedPassword}
                                  className="bg-gray-800 border-gray-600 text-white"
                                  data-testid={`input-iptv-password-${order.id}`}
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => togglePasswordVisibility(order.id)}
                                  className="text-gray-400 hover:text-white"
                                  data-testid={`button-toggle-password-${order.id}`}
                                >
                                  {showPasswords[order.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(order.generatedPassword!, `pass-${order.id}`)}
                                  className="text-gray-400 hover:text-white"
                                  data-testid={`button-copy-password-${order.id}`}
                                >
                                  {copiedField === `pass-${order.id}` ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {order.countryPreference && (
                          <div className="text-xs text-gray-500">Country: {order.countryPreference}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-500" />
                  Order History
                </CardTitle>
                <CardDescription className="text-gray-400">
                  View all your past and current orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders yet.</p>
                    <Button
                      onClick={() => navigate("/")}
                      className="mt-4 bg-orange-500 hover:bg-orange-600"
                      data-testid="button-browse-products"
                    >
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between"
                        data-testid={`order-row-${order.id}`}
                      >
                        <div className="space-y-1">
                          <div className="text-white font-medium">{order.realProductName}</div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(order.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatPrice(order.amount)}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-500" />
                  Profile Settings
                </CardTitle>
                <CardDescription className="text-gray-400">Update your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-email" className="text-gray-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="profile-email"
                        data-testid="input-profile-email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="pl-10 bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-fullname" className="text-gray-300">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="profile-fullname"
                        data-testid="input-profile-fullname"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="pl-10 bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={isSaving}
                    data-testid="button-save-profile"
                  >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="h-5 w-5 text-orange-500" />
                  Change Password
                </CardTitle>
                <CardDescription className="text-gray-400">Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-gray-300">
                      Current Password
                    </Label>
                    <Input
                      id="current-password"
                      data-testid="input-current-password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-gray-300">
                      New Password
                    </Label>
                    <Input
                      id="new-password"
                      data-testid="input-new-password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password" className="text-gray-300">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-new-password"
                      data-testid="input-confirm-new-password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={isSaving}
                    data-testid="button-change-password"
                  >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Username</span>
                  <span className="text-white">{customer?.username}</span>
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Status</span>
                  <Badge className={customer?.status === "active" ? "bg-green-600" : "bg-gray-600"}>
                    {customer?.status}
                  </Badge>
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Orders</span>
                  <span className="text-white">{customer?.totalOrders || 0}</span>
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white">{customer?.createdAt ? formatDate(customer.createdAt) : "N/A"}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
