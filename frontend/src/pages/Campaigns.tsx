import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, Loader2, Sparkles, CheckCircle2, ChevronRight, 
  ChevronLeft, Settings2, PenTool, Eye, Mail, MessageSquare, Smartphone, Target, HandHeart, Zap
} from 'lucide-react';

export default function Campaigns() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [name, setName] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [channel, setChannel] = useState<'Email' | 'SMS' | 'WhatsApp'>('Email');
  
  // Step 2 State (AI Prompt Inputs)
  const [goal, setGoal] = useState('Win-back');
  const [offer, setOffer] = useState('');
  const [tone, setTone] = useState('Urgent');

  // Step 3 State (AI Outputs / Editor)
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [cta, setCta] = useState('');
  const [emojis, setEmojis] = useState<string[]>([]);
  
  const { data: segments } = useQuery({
    queryKey: ['segments'],
    queryFn: () => api.get('/segments').then((res) => res.data),
  });

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/campaigns').then((res) => res.data),
  });

  const generateMessageMutation = useMutation({
    mutationFn: () => api.post('/campaigns/generate-message', { segmentId, goal, offer, tone, channel }).then(res => res.data),
    onSuccess: (data) => {
      setSubject(data.subject || '');
      setMessage(data.message || '');
      setCta(data.cta || '');
      setEmojis(data.emojis || []);
      setStep(3);
    }
  });

  const createAndLaunchMutation = useMutation({
    mutationFn: async () => {
      const fullMessage = `${message}\n\n[${cta}]`;
      const draft = await api.post('/campaigns', { name, segmentId, channel, subject, messageTemplate: fullMessage }).then(res => res.data);
      await api.post(`/campaigns/${draft._id}/launch`);
      return draft;
    },
    onSuccess: () => {
      setStep(5);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + ' ' + emoji);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 relative">
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -z-10" />
      {[
        { num: 1, label: 'Setup', icon: Settings2 },
        { num: 2, label: 'AI Strategy', icon: Sparkles },
        { num: 3, label: 'Editor', icon: PenTool },
        { num: 4, label: 'Preview', icon: Eye },
        { num: 5, label: 'Launch', icon: Send },
      ].map((s) => (
        <div key={s.num} className="flex flex-col items-center gap-2 bg-background px-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
            step === s.num ? 'border-indigo-600 bg-indigo-600 text-white' : 
            step > s.num ? 'border-emerald-500 bg-emerald-500 text-white' : 
            'border-muted text-muted-foreground bg-background'
          }`}>
            {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
          </div>
          <span className={`text-xs font-medium ${step === s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Send className="w-8 h-8 text-indigo-500" />
          Campaign Builder
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Design and launch automated campaigns across multiple channels.</p>
      </div>

      {renderStepIndicator()}

      {/* Step 1: Setup */}
      {step === 1 && (
        <Card className="border-muted shadow-sm animate-in slide-in-from-right-4">
          <CardHeader>
            <CardTitle>1. Campaign Setup</CardTitle>
            <CardDescription>Name your campaign and choose your audience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Name</label>
              <Input 
                placeholder="e.g., Q3 VIP Reactivation" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience Segment</label>
              <select 
                className="w-full p-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-indigo-500"
                value={segmentId}
                onChange={(e) => setSegmentId(e.target.value)}
              >
                <option value="">Select a segment...</option>
                {segments?.map((seg: any) => (
                  <option key={seg._id} value={seg._id}>{seg.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Channel</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'Email', icon: Mail, desc: 'Long-form content' },
                  { id: 'SMS', icon: Smartphone, desc: 'High open rates' },
                  { id: 'WhatsApp', icon: MessageSquare, desc: 'Interactive media' }
                ].map((c) => (
                  <div 
                    key={c.id}
                    onClick={() => setChannel(c.id as any)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
                      channel === c.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'hover:border-indigo-400 hover:bg-muted/50'
                    }`}
                  >
                    <c.icon className={`w-6 h-6 ${channel === c.id ? 'text-indigo-600' : 'text-muted-foreground'}`} />
                    <span className="font-semibold text-sm">{c.id}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} disabled={!name || !segmentId || !channel} className="bg-slate-900 hover:bg-slate-800 text-white">
                Next: AI Strategy <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: AI Generation Form */}
      {step === 2 && (
        <Card className="border-indigo-500/20 shadow-lg animate-in slide-in-from-right-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 z-0" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              2. Copilot Strategy
            </CardTitle>
            <CardDescription>Configure the campaign parameters. Gemini AI will handle the copywriting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2"><Target className="w-4 h-4 text-indigo-500"/> Campaign Goal</label>
                <select 
                  className="w-full p-2.5 border rounded-md bg-background/80 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                >
                  <option value="Win-back">Win-back Inactive Customers</option>
                  <option value="Upsell">Upsell / Cross-sell</option>
                  <option value="Newsletter">Weekly Newsletter</option>
                  <option value="Product Launch">New Product Launch</option>
                  <option value="Event Invitation">Event Invitation</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500"/> Voice & Tone</label>
                <select 
                  className="w-full p-2.5 border rounded-md bg-background/80 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="Urgent">Urgent & FOMO</option>
                  <option value="Professional">Professional & Trustworthy</option>
                  <option value="Playful">Playful & Witty</option>
                  <option value="Empathetic">Empathetic & Warm</option>
                  <option value="Direct">Direct & Concise</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2"><HandHeart className="w-4 h-4 text-emerald-500"/> The Offer (Optional)</label>
              <Input 
                className="bg-background/80 py-6"
                placeholder="e.g., 20% OFF sitewide with code VIP20" 
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Leave blank if this isn't a promotional campaign.</p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
              <Button 
                onClick={() => generateMessageMutation.mutate()} 
                disabled={generateMessageMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
              >
                {generateMessageMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate Content
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Editor */}
      {step === 3 && (
        <Card className="border-muted shadow-sm animate-in slide-in-from-right-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-indigo-500" />
              3. Refine & Edit
            </CardTitle>
            <CardDescription>Review the AI-generated copy. You can edit any field manually.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            
            {/* Subject Line (Only really necessary for Email, but good to have) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject Line</label>
              <Input 
                className="font-medium text-indigo-900 dark:text-indigo-200"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Message Body</label>
                {emojis.length > 0 && (
                  <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-md">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">AI Emojis:</span>
                    {emojis.map((emoji, idx) => (
                      <button key={idx} onClick={() => insertEmoji(emoji)} className="text-lg hover:scale-125 transition-transform" type="button">
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <textarea
                className="w-full min-h-[160px] p-4 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y leading-relaxed"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Supported variables: {'{firstName}'}, {'{lastName}'}</p>
            </div>

            {/* Call to Action */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Call To Action (CTA)</label>
              <Input 
                className="font-bold text-center"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
              />
            </div>

            <div className="flex justify-between pt-6 border-t mt-6">
              <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="w-4 h-4 mr-2" /> Back to Generator</Button>
              <Button onClick={() => setStep(4)} disabled={!message} className="bg-slate-900 hover:bg-slate-800 text-white px-8">
                Next: Preview <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Preview */}
      {step === 4 && (
        <Card className="border-muted shadow-sm animate-in slide-in-from-right-4">
          <CardHeader>
            <CardTitle>4. Device Preview</CardTitle>
            <CardDescription>See exactly how this will appear to your segment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="flex justify-center bg-muted/30 p-8 rounded-xl border border-dashed relative overflow-hidden">
              <div className="absolute top-4 right-4"><Badge variant="outline" className="bg-background">{channel} Preview</Badge></div>
              
              {(channel === 'SMS' || channel === 'WhatsApp') ? (
                <div className="w-[300px] h-[550px] bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] border-[10px] border-slate-800 dark:border-slate-700 relative overflow-hidden shadow-2xl flex flex-col">
                   <div className="bg-slate-200/50 dark:bg-slate-800/50 h-16 w-full flex flex-col items-center justify-center border-b dark:border-slate-700/50 backdrop-blur-md">
                     <span className="font-semibold text-sm">PulseCRM Brand</span>
                     <span className="text-[10px] text-muted-foreground">{channel}</span>
                   </div>
                   <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-950 flex flex-col justify-end space-y-2">
                     <div className="flex justify-center"><span className="text-[10px] text-muted-foreground">Today 10:42 AM</span></div>
                     
                     <div className={`p-3.5 rounded-2xl rounded-bl-none max-w-[90%] text-[13px] leading-relaxed shadow-sm ${channel === 'WhatsApp' ? 'bg-[#dcf8c6] text-slate-900 dark:bg-[#056162] dark:text-[#e9edef]' : 'bg-blue-500 text-white'}`}>
                       {message.replace('{firstName}', 'Alice')}
                     </div>
                     
                     {cta && (
                       <div className="flex justify-start">
                         <div className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[13px] font-bold py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-300">
                           {cta}
                         </div>
                       </div>
                     )}
                   </div>
                </div>
              ) : (
                <div className="w-full max-w-2xl bg-white dark:bg-slate-950 rounded-lg border shadow-lg overflow-hidden">
                   <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b dark:border-slate-800 flex flex-col gap-1">
                     <span className="text-xs text-muted-foreground">From: brand@pulsecrm.ai</span>
                     <span className="text-sm font-semibold flex items-center gap-2">
                       Subject: <span className="font-normal text-foreground">{subject}</span>
                     </span>
                   </div>
                   <div className="p-8 text-sm whitespace-pre-wrap leading-relaxed">
                      {message.replace('{firstName}', 'Alice')}
                   </div>
                   {cta && (
                     <div className="px-8 pb-8 flex justify-center">
                       <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-8 py-6 text-lg shadow-md">
                         {cta}
                       </Button>
                     </div>
                   )}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(3)}><ChevronLeft className="w-4 h-4 mr-2" /> Back to Editor</Button>
              <Button 
                onClick={() => createAndLaunchMutation.mutate()} 
                disabled={createAndLaunchMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 px-8"
              >
                {createAndLaunchMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Confirm & Launch
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Launched */}
      {step === 5 && (
        <Card className="border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-lg animate-in zoom-in-95 duration-300">
          <CardContent className="py-12 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-emerald-800 dark:text-emerald-400">Campaign Airborne!</h2>
            <p className="text-emerald-700/80 dark:text-emerald-200/80 max-w-md">
              "{name}" is currently being dispatched. Delivery webhooks will start arriving shortly.
            </p>
            <div className="flex gap-4 mt-6 pt-4">
              <Button onClick={() => { setStep(1); setName(''); setOffer(''); setSubject(''); setMessage(''); setCta(''); }} variant="outline" className="border-emerald-200 hover:bg-emerald-100 dark:border-emerald-800 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                Create Another
              </Button>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <a href="/analytics">Track Performance</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
