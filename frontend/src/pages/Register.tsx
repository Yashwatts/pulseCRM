import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
          <p className="text-muted-foreground mt-2">Start your journey with PulseCRM AI</p>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign up</CardTitle>
            <CardDescription>Enter your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && <div className="p-3 text-sm text-rose-500 bg-rose-50 dark:bg-rose-950/50 rounded-md border border-rose-200 dark:border-rose-900">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create Account
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-indigo-600 hover:underline font-medium">Log in</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
