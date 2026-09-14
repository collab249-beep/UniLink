import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Authenticated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const adminEmail = email.trim().toLowerCase();
    if (adminEmail !== 'hello@unilink.network') {
      toast.error('Enter the authorized administrator email first');
      return;
    }
    setResetting(true);
    try {
      const response = await fetch('/api/admin/bootstrap', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: adminEmail }),
      });
      if (!response.ok) throw new Error('Administrator setup failed');
      await sendPasswordResetEmail(auth, adminEmail);
      toast.success('Password setup email sent');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send setup email');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">UniLink Safety</h1>
          <p className="text-sm text-muted-foreground text-center">Authorized administrators only</p>
        </div>
        
        <div className="bg-card border rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Administrator Email</label>
              <Input 
                type="email" 
                placeholder="hello@unilink.network"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={resetting}
              onClick={handleReset}
            >
              {resetting ? 'Sending email...' : 'Set or reset password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}