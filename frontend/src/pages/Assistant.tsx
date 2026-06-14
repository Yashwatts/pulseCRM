import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, Sparkles, Loader2, RefreshCcw, TrendingUp, Users, Target } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Hi there! I am your PulseCRM AI Copilot. I have full access to your business analytics. How can I help you grow today?'
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: (history: any[]) => api.post('/assistant/chat', { history }).then(res => res.data),
    onSuccess: (data) => {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: data.response }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: 'Oops! I had trouble connecting to the brain. Please try again.' }]);
    }
  });

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const updatedMessages = [...messages, newMsg];
    
    setMessages(updatedMessages);
    setInput('');

    // Format history for the backend
    const historyPayload = updatedMessages.map(m => ({ role: m.role, content: m.content }));
    chatMutation.mutate(historyPayload);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const quickActions = [
    { icon: TrendingUp, text: 'Summarize my recent revenue' },
    { icon: Users, text: 'Suggest a Win-back audience' },
    { icon: Target, text: 'Give me 3 campaign ideas' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500 max-w-5xl mx-auto border rounded-xl shadow-sm bg-background overflow-hidden relative">
      
      {/* Header */}
      <div className="h-16 border-b flex items-center justify-between px-6 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">Pulse Copilot</h1>
            <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMessages([messages[0]])} className="text-muted-foreground h-8 text-xs">
          <RefreshCcw className="w-3 h-3 mr-2" /> Clear Context
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
              msg.role === 'user' ? 'bg-slate-900 dark:bg-slate-100' : 'bg-indigo-600'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white dark:text-slate-900" /> : <Bot className="w-4 h-4 text-white" />}
            </div>

            {/* Bubble */}
            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-slate-100 dark:bg-slate-800 text-foreground rounded-tr-sm' 
                : 'bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-foreground rounded-tl-sm'
            }`}>
              {/* Basic Markdown rendering for bold text */}
              {msg.content.split('\n').map((line, i) => (
                <span key={i}>
                  {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                  <br/>
                </span>
              ))}
            </div>

          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-sm bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              <span className="text-sm text-muted-foreground animate-pulse">Copilot is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (only show if chat is emptyish) */}
      {messages.length === 1 && (
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, i) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm" 
                className="text-xs rounded-full bg-background border-dashed hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                onClick={() => handleSend(action.text)}
              >
                <action.icon className="w-3 h-3 mr-2 text-muted-foreground" />
                {action.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-background border-t">
        <div className="relative flex items-center max-w-4xl mx-auto">
          <Input 
            className="w-full pr-12 pl-4 py-6 bg-muted/30 border-muted-foreground/20 rounded-xl shadow-inner focus-visible:ring-indigo-500 text-sm"
            placeholder="Ask about your analytics, segment advice, or campaign ideas..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={chatMutation.isPending}
          />
          <Button 
            size="icon" 
            className="absolute right-2 h-9 w-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || chatMutation.isPending}
          >
            {chatMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" /> Pulse AI can make mistakes. Consider verifying critical analytics.
          </span>
        </div>
      </div>

    </div>
  );
}
