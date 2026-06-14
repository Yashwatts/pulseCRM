import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Sparkles, Save, Loader2, Wrench, X, CheckCircle2, ChevronRight, 
  TrendingUp, Users, DollarSign, Activity, Settings, Plus, Trash2, Calendar
} from 'lucide-react';

type Rule = { field: string; operator: string; value: string };

export default function Segments() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  
  // Builder State
  const [prompt, setPrompt] = useState('');
  const [manualRules, setManualRules] = useState<Rule[]>([{ field: 'totalSpent', operator: 'greaterThan', value: '100' }]);
  
  // Save Dialog State
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [segmentName, setSegmentName] = useState('');
  const [segmentDesc, setSegmentDesc] = useState('');

  const { data: segments, isLoading: loadingSegments } = useQuery({
    queryKey: ['segments'],
    queryFn: () => api.get('/segments').then((res) => res.data),
  });

  const previewMutation = useMutation({
    mutationFn: (payload: { prompt?: string, manualRules?: Rule[] }) => 
      api.post('/segments/preview', payload).then(res => res.data),
    onSuccess: (data) => {
      // If AI mode was used, sync the manual rules with what the AI generated
      if (mode === 'ai' && data.rules) {
        setManualRules(data.rules);
      }
    }
  });

  const saveMutation = useMutation({
    mutationFn: () => api.post('/segments', { 
      name: segmentName, 
      description: segmentDesc, 
      rules: manualRules,
      aiInterpretation: previewMutation.data?.aiInterpretation,
      recommendations: previewMutation.data?.recommendations
    }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      setIsSaveDialogOpen(false);
      setSegmentName('');
      setSegmentDesc('');
      setPrompt('');
      previewMutation.reset();
    }
  });

  const handlePreview = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mode === 'ai') {
      if (!prompt) return;
      previewMutation.mutate({ prompt });
    } else {
      previewMutation.mutate({ manualRules });
    }
  };

  const updateRule = (index: number, key: keyof Rule, val: string) => {
    const newRules = [...manualRules];
    newRules[index][key] = val;
    setManualRules(newRules);
  };

  const removeRule = (index: number) => {
    setManualRules(manualRules.filter((_, i) => i !== index));
  };

  const previewData = previewMutation.data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-8 h-8 text-indigo-500" />
            Audience Segments
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Build, analyze, and save hyper-targeted customer segments.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Builder Interface */}
        <div className="lg:col-span-5 space-y-6 sticky top-6">
          <Card className="border-muted shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex border-b bg-muted/20">
              <button 
                className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 transition-colors ${mode === 'ai' ? 'bg-background border-b-2 border-indigo-500 text-indigo-600' : 'text-muted-foreground hover:bg-muted/50'}`}
                onClick={() => setMode('ai')}
              >
                <Sparkles className="w-4 h-4" />
                AI Builder
              </button>
              <button 
                className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 transition-colors ${mode === 'manual' ? 'bg-background border-b-2 border-indigo-500 text-indigo-600' : 'text-muted-foreground hover:bg-muted/50'}`}
                onClick={() => setMode('manual')}
              >
                <Wrench className="w-4 h-4" />
                Manual Builder
              </button>
            </div>

            <CardContent className="p-6 flex-1 flex flex-col">
              {mode === 'ai' ? (
                <form onSubmit={handlePreview} className="flex flex-col h-full space-y-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block text-foreground">Describe your target audience</label>
                    <textarea
                      className="w-full min-h-[160px] p-4 rounded-md border bg-muted/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none placeholder:text-muted-foreground/60 leading-relaxed"
                      placeholder="e.g. Find customers who spent more than $5000 but haven't purchased in 45 days."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!prompt || previewMutation.isPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                    size="lg"
                  >
                    {previewMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Generate Segment
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col h-full space-y-4">
                  <div className="flex-1 space-y-3">
                    <label className="text-sm font-medium block text-foreground">Match customers where:</label>
                    {manualRules.map((rule, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-muted/20 p-2 rounded-md border">
                        <select 
                          className="flex-1 bg-background border rounded-sm text-xs p-2"
                          value={rule.field}
                          onChange={(e) => updateRule(idx, 'field', e.target.value)}
                        >
                          <option value="totalSpent">Lifetime Value</option>
                          <option value="lastPurchaseDays">Days Since Last Purchase</option>
                          <option value="email">Email</option>
                        </select>
                        <select 
                          className="flex-1 bg-background border rounded-sm text-xs p-2"
                          value={rule.operator}
                          onChange={(e) => updateRule(idx, 'operator', e.target.value)}
                        >
                          <option value="greaterThan">Greater Than</option>
                          <option value="lessThan">Less Than</option>
                          <option value="equals">Equals</option>
                          <option value="contains">Contains</option>
                        </select>
                        <Input 
                          className="flex-1 h-8 text-xs" 
                          placeholder="Value" 
                          value={rule.value} 
                          onChange={(e) => updateRule(idx, 'value', e.target.value)}
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-500 shrink-0" onClick={() => removeRule(idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => setManualRules([...manualRules, { field: 'totalSpent', operator: 'greaterThan', value: '' }])}>
                      <Plus className="w-4 h-4 mr-2" /> Add Rule
                    </Button>
                  </div>
                  <Button 
                    onClick={() => handlePreview()}
                    disabled={previewMutation.isPending || manualRules.length === 0}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                    size="lg"
                  >
                    {previewMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
                    Preview Audience
                  </Button>
                </div>
              )}

              {/* AI Interpretation Panel */}
              {previewData?.aiInterpretation && mode === 'ai' && (
                <div className="mt-6 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 animate-in slide-in-from-bottom-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-800 dark:text-indigo-400 mb-2 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    AI Interpretation
                  </h4>
                  <p className="text-sm text-indigo-900/80 dark:text-indigo-200 leading-relaxed">
                    {previewData.aiInterpretation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Segments Sidebar */}
          <Card className="border-muted shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Saved Segments</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {loadingSegments ? (
                    <p className="text-xs text-muted-foreground">Loading...</p>
                  ) : segments?.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No segments saved.</p>
                  ) : (
                    segments?.map((seg: any) => (
                      <div key={seg._id} className="p-3 border rounded-md hover:bg-muted/50 transition-colors group relative flex flex-col justify-between min-h-[80px]">
                        <div>
                          <p className="font-medium text-sm text-foreground pr-6 truncate">{seg.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{seg.description}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button variant="secondary" size="sm" className="h-6 text-[10px] px-2 flex-1">View</Button>
                           <Button variant="secondary" size="sm" className="h-6 text-[10px] px-2 flex-1">Edit</Button>
                           <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950">
                             <Trash2 className="w-3 h-3" />
                           </Button>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Audience Preview & Insights */}
        <div className="lg:col-span-7 space-y-6">
          {previewData ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              
              {/* Audience Insights Dashboard */}
              <div className="grid grid-cols-3 gap-4">
                 <Card className="bg-muted/20 border-dashed">
                   <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                     <Users className="h-5 w-5 text-indigo-500 mb-2" />
                     <div className="text-2xl font-bold">{previewData.totalMatches}</div>
                     <p className="text-xs text-muted-foreground uppercase mt-1">Audience Size</p>
                   </CardContent>
                 </Card>
                 <Card className="bg-muted/20 border-dashed">
                   <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                     <DollarSign className="h-5 w-5 text-emerald-500 mb-2" />
                     <div className="text-2xl font-bold">${Math.round(previewData.insights?.avgSpend || 0).toLocaleString()}</div>
                     <p className="text-xs text-muted-foreground uppercase mt-1">Avg Spend</p>
                   </CardContent>
                 </Card>
                 <Card className="bg-muted/20 border-dashed">
                   <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                     <TrendingUp className="h-5 w-5 text-amber-500 mb-2" />
                     <div className="text-2xl font-bold">${Math.round(previewData.insights?.potentialRevenue || 0).toLocaleString()}</div>
                     <p className="text-xs text-muted-foreground uppercase mt-1">Total Potential</p>
                   </CardContent>
                 </Card>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between bg-card border rounded-lg p-3 shadow-sm">
                 <div className="text-sm font-medium px-2 flex items-center">
                   <Activity className="w-4 h-4 mr-2 text-emerald-500" />
                   Previewing {previewData.customers.length} of {previewData.totalMatches} matches
                 </div>
                 <Button onClick={() => setIsSaveDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                   <Save className="w-4 h-4 mr-2" />
                   Save Segment
                 </Button>
              </div>

              {/* Live Data Preview */}
              <Card className="border-muted shadow-sm overflow-hidden">
                <div className="overflow-auto max-h-[400px]">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0">
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">LTV</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.customers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                            No customers match these rules.
                          </TableCell>
                        </TableRow>
                      ) : (
                        previewData.customers.map((c: any) => (
                          <TableRow key={c._id}>
                            <TableCell className="font-medium text-sm">{c.firstName} {c.lastName}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{c.email}</TableCell>
                            <TableCell className="text-right font-medium">${c.totalSpent.toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* AI Recommendations */}
              {previewData.recommendations && (
                <Card className="border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
                  <CardContent className="p-6 relative z-10">
                    <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center mb-4">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Copilot Strategy Recommendation
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Campaign Type</p>
                        <p className="text-sm font-medium mt-1">{previewData.recommendations.campaignType}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Best Channel</p>
                        <Badge variant="outline" className="mt-1 border-emerald-200 text-emerald-700">{previewData.recommendations.channel}</Badge>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Optimal Offer</p>
                        <p className="text-sm font-medium mt-1 text-emerald-600">{previewData.recommendations.discount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Confidence</p>
                        <p className="text-sm font-bold mt-1">{previewData.recommendations.confidenceScore}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No Audience Generated</h3>
              <p className="text-sm max-w-sm">Use the AI or Manual builder on the left to define your segment rules. A live data preview and AI insights will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Modal Overlay */}
      {isSaveDialogOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Save Segment</CardTitle>
              <CardDescription>Store this audience to use in future campaigns.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Segment Name</label>
                <Input 
                  placeholder="e.g., VIP Churn Risk Q2" 
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  className="w-full p-2 text-sm border rounded-md min-h-[80px]"
                  placeholder="Brief context about this audience..."
                  value={segmentDesc}
                  onChange={(e) => setSegmentDesc(e.target.value)}
                />
              </div>
              <div className="bg-muted/30 p-3 rounded-md border text-sm flex justify-between items-center">
                <span className="text-muted-foreground">Estimated Size</span>
                <span className="font-bold text-foreground">{previewData?.totalMatches} customers</span>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={() => saveMutation.mutate()}
                  disabled={!segmentName || saveMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Confirm & Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
