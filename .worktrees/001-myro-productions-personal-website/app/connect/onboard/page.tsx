'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, CheckCircle } from 'lucide-react';

export default function ConnectOnboardPage() {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Create connected account
      const createResponse = await fetch('/api/connect/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          businessName,
          type: 'express',
        }),
      });

      const createData = await createResponse.json();

      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create account');
      }

      // Step 2: Create onboarding link
      const onboardResponse = await fetch('/api/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: createData.accountId,
        }),
      });

      const onboardData = await onboardResponse.json();

      if (!onboardData.success) {
        throw new Error(onboardData.error || 'Failed to create onboarding link');
      }

      // Redirect to Stripe onboarding
      window.location.href = onboardData.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Join the Myro Productions Platform
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Start accepting payments through our platform for your bakery
            </p>
          </div>

          {success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Account Created!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Redirecting you to complete your account setup...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Business Name
                </label>
                <Input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What happens next?
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>1. We'll create your seller account</li>
                  <li>2. You'll complete your business information with Stripe</li>
                  <li>3. Connect your bank account for payouts</li>
                  <li>4. Start accepting payments through our platform!</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Platform Fee: 15%
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We charge a 15% platform fee on each transaction. This covers payment
                  processing, hosting, and platform maintenance.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                variant="primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                By clicking "Get Started", you agree to Stripe's{' '}
                <a
                  href="https://stripe.com/connect-account/legal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Connected Account Agreement
                </a>
              </p>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Questions? Email us at{' '}
            <a
              href="mailto:pmnicolasm@gmail.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              pmnicolasm@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
