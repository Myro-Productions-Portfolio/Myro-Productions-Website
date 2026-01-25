import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function OnboardRefreshPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Onboarding Link Expired
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your onboarding link has expired or encountered an error. Please contact support
            to receive a new onboarding link.
          </p>

          <div className="space-y-3">
            <Link href="/#contact" className="block">
              <Button variant="primary" className="w-full">
                Contact Support
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Return to Homepage
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Email us at{' '}
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

export const metadata = {
  title: 'Onboarding Refresh - Myro Productions Platform',
  description: 'Refresh your onboarding link.',
  robots: 'noindex,nofollow',
};
