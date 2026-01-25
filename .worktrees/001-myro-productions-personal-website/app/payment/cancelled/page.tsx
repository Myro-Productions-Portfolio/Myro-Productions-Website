import { XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Cancelled
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your payment was cancelled. No charges were made to your account.
          </p>

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button variant="primary" className="w-full">
                Return to Homepage
              </Button>
            </Link>

            <Link href="/#contact" className="block">
              <Button variant="outline" className="w-full">
                Contact Us
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Questions? Email us at{' '}
            <a
              href="mailto:hello@myroproductions.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              hello@myroproductions.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Payment Cancelled - Myro Productions',
  description: 'Your payment was cancelled.',
  robots: 'noindex,nofollow',
};
