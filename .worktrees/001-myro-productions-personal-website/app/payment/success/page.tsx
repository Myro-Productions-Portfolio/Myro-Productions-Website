import { Suspense } from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

function PaymentSuccessContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Thank you for your payment. You will receive a confirmation email shortly.
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

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

export const metadata = {
  title: 'Payment Successful - Myro Productions',
  description: 'Your payment was processed successfully.',
  robots: 'noindex,nofollow',
};
