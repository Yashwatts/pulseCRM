import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, BarChart2, TrendingUp, CheckCircle2, DollarSign, Target, MousePointerClick, Inbox } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, ComposedChart, Cell
} from 'recharts';

export default function Analytics() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id');
  const [selectedCampaign, setSelectedCampaign] = useState(initialId || 'all');

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/campaigns').then((res) => res.data),
  });

  const { data: allAnalytics, isLoading } = useQuery({
    queryKey: ['analytics_all'],
    queryFn: () => api.get('/analytics').then((res) => res.data),
    refetchInterval: 5000,
  });

  // Calculate Aggregated Metrics
  const aggregated = useMemo(() => {
    if (!allAnalytics) return null;
    let dataToProcess = allAnalytics;
    
    if (selectedCampaign !== 'all') {
      dataToProcess = allAnalytics.filter((a: any) => a.campaignId?._id === selectedCampaign || a.campaignId === selectedCampaign);
    }

    const totals = dataToProcess.reduce((acc: any, curr: any) => {
      acc.totalSent += curr.totalSent || 0;
      acc.successfulDeliveries += curr.successfulDeliveries || 0;
      acc.failedDeliveries += curr.failedDeliveries || 0;
      acc.opened += curr.opened || 0;
      acc.clicked += curr.clicked || 0;
      acc.converted += curr.converted || 0;
      return acc;
    }, { totalSent: 0, successfulDeliveries: 0, failedDeliveries: 0, opened: 0, clicked: 0, converted: 0 });

    // Mock Revenue Impact: Conversions * $85 AOV
    totals.revenueImpact = totals.converted * 85;
    return totals;
  }, [allAnalytics, selectedCampaign]);

  // Funnel Chart Data
  const funnelData = useMemo(() => {
    if (!aggregated) return [];
    return [
      { stage: 'Sent', count: aggregated.totalSent, fill: '#8b5cf6' },
      { stage: 'Delivered', count: aggregated.successfulDeliveries, fill: '#6366f1' },
      { stage: 'Opened', count: aggregated.opened, fill: '#0ea5e9' },
      { stage: 'Clicked', count: aggregated.clicked, fill: '#10b981' },
      { stage: 'Converted', count: aggregated.converted, fill: '#f59e0b' },
    ];
  }, [aggregated]);

  // Campaign Comparison Data
  const comparisonData = useMemo(() => {
    if (!allAnalytics) return [];
    return allAnalytics.slice(0, 5).map((a: any) => ({
      name: a.campaignId?.name?.substring(0, 15) || 'Unknown',
      Delivered: a.successfulDeliveries || 0,
      Opened: a.opened || 0,
      Converted: a.converted || 0,
    }));
  }, [allAnalytics]);

  const deliveryRate = aggregated?.totalSent > 0 ? ((aggregated.successfulDeliveries / aggregated.totalSent) * 100).toFixed(1) : 0;
  const openRate = aggregated?.successfulDeliveries > 0 ? ((aggregated.opened / aggregated.successfulDeliveries) * 100).toFixed(1) : 0;
  const ctr = aggregated?.opened > 0 ? ((aggregated.clicked / aggregated.opened) * 100).toFixed(1) : 0;
  const conversionRate = aggregated?.clicked > 0 ? ((aggregated.converted / aggregated.clicked) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart2 className="w-8 h-8 text-indigo-500" />
            Performance Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Measure campaign success, track funnels, and uncover ROI.</p>
        </div>
        <select 
          className="p-2 border rounded-md bg-background text-sm min-w-[250px] shadow-sm focus:ring-2 focus:ring-indigo-500"
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
        >
          <option value="all">Global (All Campaigns)</option>
          {campaigns?.map((camp: any) => (
            <option key={camp._id} value={camp._id}>{camp.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Aggregating telemetry...</p>
        </div>
      ) : (
        <>
          {/* Top KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-emerald-500/20 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Revenue Impact</p>
                    <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${aggregated?.revenueImpact.toLocaleString() || 0}
                    </h3>
                  </div>
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
                </div>
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12.5% from last month</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Delivery Rate</p>
                    <h3 className="text-3xl font-bold">{deliveryRate}%</h3>
                  </div>
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg"><CheckCircle2 className="w-5 h-5 text-indigo-600" /></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{aggregated?.successfulDeliveries} delivered successfully</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Click-Through (CTR)</p>
                    <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400">{ctr}%</h3>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><MousePointerClick className="w-5 h-5 text-blue-600" /></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">From {aggregated?.opened} opens</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Conversion Rate</p>
                    <h3 className="text-3xl font-bold text-amber-600 dark:text-amber-400">{conversionRate}%</h3>
                  </div>
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg"><Target className="w-5 h-5 text-amber-600" /></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{aggregated?.converted} final conversions</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Funnel Chart */}
            <Card className="shadow-sm col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Engagement Funnel</CardTitle>
                <CardDescription>Observe drop-off at each stage of the customer journey.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(val) => `${val}`} />
                      <YAxis dataKey="stage" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Comparison */}
            <Card className="shadow-sm col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Top Campaigns Comparison</CardTitle>
                <CardDescription>Volume and engagement across recent initiatives.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={comparisonData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} angle={-15} textAnchor="end" />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                      <Bar dataKey="Delivered" barSize={20} fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Opened" barSize={20} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="Converted" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* AI Insights Panel */}
          <Card className="border-indigo-500/30 shadow-lg relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent z-0" />
             <CardHeader className="relative z-10 border-b bg-muted/20">
               <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                 <Sparkles className="w-5 h-5" />
                 Pulse Copilot Insights
               </CardTitle>
               <CardDescription>Automated performance analysis based on real-time webhook telemetry.</CardDescription>
             </CardHeader>
             <CardContent className="relative z-10 pt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><Inbox className="w-4 h-4 text-emerald-500"/> Delivery Health</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your delivery rate is exceptional at {deliveryRate}%. The Channel Service simulation indicates negligible bounce rates, meaning your segment criteria is highly accurate.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><MousePointerClick className="w-4 h-4 text-blue-500"/> Engagement</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      With a {ctr}% CTR, your AI-generated CTA is resonating well. Consider A/B testing emojis in the Subject Line to push the Open Rate ({openRate}%) even higher.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><Target className="w-4 h-4 text-amber-500"/> Bottom Line</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You've driven ${aggregated?.revenueImpact.toLocaleString()} in simulated revenue. The {conversionRate}% conversion rate from clicks indicates the landing page offer matches the campaign promise perfectly.
                    </p>
                  </div>
                </div>
             </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
