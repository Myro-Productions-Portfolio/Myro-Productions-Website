'use client';

/**
 * Admin Login Page
 *
 * Provides a secure login form for admin users to access the dashboard
 */

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Redirect to admin dashboard or return URL
      const redirectTo = searchParams.get('redirect') || '/admin';
      router.push(redirectTo);
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-carbon px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Myro Productions
          </h1>
          <p className="text-text-secondary">Admin Dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-carbon-lighter rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div
                className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg"
                role="alert"
              >
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@myroproductions.com"
              required
              autoComplete="email"
              disabled={isLoading}
            />

            {/* Password Input */}
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-text-secondary text-sm mt-6">
          This is a secure area for authorized personnel only.
        </p>
      </div>
    </div>
  );
}
