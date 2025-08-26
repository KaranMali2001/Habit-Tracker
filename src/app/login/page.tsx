'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'techkaran5599@gmail.com', 
          password: 'Karan@5599' 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Instant login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 transition-colors px-4 sm:px-0">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 p-6 sm:p-8 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-neutral-100">Sign In</h2>
          <p className="mt-2 text-center text-sm text-neutral-400">Track your bootcamp progress</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <Label htmlFor="email" className="text-neutral-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 bg-neutral-700 border-neutral-600 text-neutral-100 focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-neutral-200">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 bg-neutral-700 border-neutral-600 text-neutral-100 focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
            />
          </div>

          {error && <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-600/40 rounded p-2">{error}</div>}

          <Button type="submit" disabled={loading} className="w-full bg-rose-500 hover:bg-rose-600 text-white">
            {loading ? (
              <div className="flex items-center space-x-2">
                <Spinner size="sm" />
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-neutral-800 text-neutral-400">or</span>
            </div>
          </div>

          <Button 
            type="button" 
            onClick={handleInstantLogin} 
            disabled={loading} 
            variant="outline" 
            className="w-full border-green-400/60 text-green-400 hover:bg-green-400/10 hover:border-green-400"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Spinner size="sm" />
                <span>Logging In...</span>
              </div>
            ) : (
              '🚀 Instant Login (Demo)'
            )}
          </Button>

          <div className="text-center">
            <Link href="/register" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
