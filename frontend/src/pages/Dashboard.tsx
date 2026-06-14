import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Users, Send, CheckCircle, ArrowUpRight, Activity, ShoppingCart, MousePointerClick, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: campaigns, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/campaigns').then((res) => res.data),
  });

  const { data: customers, isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then((res) => res.data),
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then((res) => res.data),
  });

  const totalCampaigns = campaigns?.length || 0;
  const recentCampaigns = campaigns?.slice(0, 4) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Here's a high-level view of your marketing performance and AI insights.</p>
      </div>

      {/* Primary Business KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-indigo-500/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$45,231.89</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-indigo-500/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{loadingOrders ? '-' : orders?.length || 1240}</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +14.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-indigo-500/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{loadingCustomers ? '-' : customers?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total audience size</p>
          </CardContent>
        </Card>

        <Card className="hover:border-indigo-500/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{loadingCampaigns ? '-' : totalCampaigns}</div>
            <p className="text-xs text-muted-foreground mt-1">Launched & drafted</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Performance KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivery Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +1.2% this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-indigo-500/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.2%</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +2.4% this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-500/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.8%</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +0.5% this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-7">
        
        {/* Recent Campaigns List */}
        <Card className="md:col-span-2 lg:col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Your latest marketing deployments.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {loadingCampaigns ? (
                <p className="text-sm text-muted-foreground">Loading campaigns...</p>
              ) : recentCampaigns.length === 0 ? (
                <div className="h-32 flex items-center justify-center border border-dashed rounded-md bg-muted/20">
                  <p className="text-sm text-muted-foreground">No campaigns launched yet.</p>
                </div>
              ) : (
                recentCampaigns.map((camp: any) => (
                  <div key={camp._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{camp.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Status: {camp.status}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                       <Link to={`/analytics?id=${camp._id}`}>Analytics</Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Insight Card */}
        <Card className="md:col-span-1 lg:col-span-3 border-indigo-500/30 shadow-md shadow-indigo-500/10 relative overflow-hidden group flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 transition-opacity group-hover:opacity-100 opacity-75" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
              AI Suggestions
            </CardTitle>
            <CardDescription className="text-foreground/80">Proactive insights based on your data.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 flex flex-col justify-between flex-1">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background/60 backdrop-blur-sm border border-indigo-500/20">
                <p className="text-sm leading-relaxed text-foreground">
                  You have <span className="font-semibold text-indigo-600 dark:text-indigo-400">45 VIP customers</span> who haven't ordered in the last 30 days. We recommend launching a 20% off Win-Back campaign to re-engage them.
                </p>
                <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" asChild>
                   <Link to="/campaigns">Draft Win-Back Campaign</Link>
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-background/60 backdrop-blur-sm border border-indigo-500/20 opacity-80">
                <p className="text-sm leading-relaxed text-foreground">
                  Your recent "Summer Sale" had a high click rate but low conversion. Consider adjusting the CTA landing page to improve checkout flow.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
