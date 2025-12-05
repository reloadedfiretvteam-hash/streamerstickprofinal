import { useState } from "react";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Settings, 
  Plus, 
  Search,
  UploadCloud,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("products");
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-card flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-bold text-xl tracking-tight">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">v2.4.0</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-white/5">
            <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
          </Button>
          <Button variant="secondary" className="w-full justify-start">
            <Package className="w-4 h-4 mr-3" /> Products
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-white/5">
            <FileText className="w-4 h-4 mr-3" /> Blog Posts
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-white/5">
            <Settings className="w-4 h-4 mr-3" /> Settings
          </Button>
        </nav>

        <div className="p-4 border-t border-white/10">
           <Button variant="outline" className="w-full" onClick={() => setLocation("/")}>
             View Live Site
           </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-white/10 bg-card flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products, orders..." className="pl-10 bg-background/50 border-white/10" />
          </div>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-bold">
               A
             </div>
          </div>
        </header>

        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Products</h2>
              <p className="text-muted-foreground">Manage your inventory and pricing.</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </div>

          <Tabs defaultValue="real" className="space-y-6">
            <TabsList className="bg-card border border-white/10">
              <TabsTrigger value="real">Real Products</TabsTrigger>
              <TabsTrigger value="shadow">Shadow Products</TabsTrigger>
            </TabsList>

            <TabsContent value="real">
              <Card className="bg-card border-white/10">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Linked Shadow</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { name: "Fire Stick HD", price: 140, cat: "Hardware", stock: 45, shadow: "Web Design Basic" },
                        { name: "Fire Stick 4K", price: 150, cat: "Hardware", stock: 32, shadow: "Web Design Pro" },
                        { name: "Fire Stick 4K Max", price: 160, cat: "Hardware", stock: 18, shadow: "Web Design Enterprise" },
                        { name: "IPTV Monthly", price: 15, cat: "Subscription", stock: "∞", shadow: "SEO Basic" },
                      ].map((item, i) => (
                        <TableRow key={i} className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>${item.price}</TableCell>
                          <TableCell><Badge variant="outline" className="border-white/20">{item.cat}</Badge></TableCell>
                          <TableCell>{item.stock}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{item.shadow}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shadow">
              <Card className="bg-card border-white/10">
                <CardHeader>
                  <CardTitle>Shadow Mapping</CardTitle>
                  <CardDescription>
                    These are the products Stripe sees. Ensure prices match exactly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead>Shadow Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {[
                        { name: "Web Design Basic", price: 140, desc: "5 Page Static Site" },
                        { name: "Web Design Pro", price: 150, desc: "CMS Integration" },
                        { name: "Web Design Enterprise", price: 160, desc: "Custom App Dev" },
                        { name: "SEO Basic", price: 15, desc: "Monthly Report" },
                      ].map((item, i) => (
                        <TableRow key={i} className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>${item.price}</TableCell>
                          <TableCell className="text-muted-foreground">{item.desc}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
