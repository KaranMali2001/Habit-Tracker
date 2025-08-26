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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">Sign In</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">Track your bootcamp progress</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          {error && <div className="text-red-600 dark:text-red-400 text-sm text-center">{error}</div>}

          <Button type="submit" disabled={loading} className="w-full">
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
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
            </div>
          </div>

          <Button 
            type="button" 
            onClick={handleInstantLogin} 
            disabled={loading} 
            variant="outline" 
            className="w-full border-green-500 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
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
            <Link href="/register" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
