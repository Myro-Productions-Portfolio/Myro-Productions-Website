import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function OnboardCompletePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Onboarding Complete!
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your account has been successfully set up. You can now start accepting payments
            through the Myro Productions platform.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Next Steps:
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <li>• We'll contact you to set up your product listings</li>
              <li>• You'll receive payment details and payout schedule</li>
              <li>• Access your Stripe Dashboard to manage your account</li>
              <li>• Start receiving orders through our platform!</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button variant="primary" className="w-full">
                Return to Homepage
              </Button>
            </Link>

            <Link href="/#contact" className="block">
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Need help? Email us at{' '}
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
  title: 'Onboarding Complete - Myro Productions Platform',
  description: 'Your seller account has been successfully created.',
  robots: 'noindex,nofollow',
};
