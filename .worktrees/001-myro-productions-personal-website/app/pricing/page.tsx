'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { PaymentButton } from '@/components/stripe/PaymentButton';

const pricingPlans = {
  oneTime: [
    {
      name: 'Event Consultation',
      price: '$150',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_CONSULTATION || '',
      description: 'One-on-one consultation for your event needs',
      features: [
        '1-hour video call',
        'Equipment recommendations',
        'Technical planning',
        'Budget estimation',
        'Timeline planning',
      ],
    },
    {
      name: 'Event Deposit',
      price: '$500',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_EVENT_DEPOSIT || '',
      description: 'Secure your event date',
      features: [
        'Reserve equipment',
        'Lock in pricing',
        'Priority scheduling',
        'Planning assistance',
        'Applied to final invoice',
      ],
    },
  ],
  subscriptions: [
    {
      name: 'Website Hosting',
      price: '$29',
      period: '/month',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_MONTHLY_HOSTING || '',
      description: 'Professional website hosting and maintenance',
      features: [
        'Fast, reliable hosting',
        '99.9% uptime guarantee',
        'SSL certificate included',
        'Monthly backups',
        'Basic SEO optimization',
      ],
      popular: true,
    },
    {
      name: 'Premium Support',
      price: '$99',
      period: '/month',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_PREMIUM_SUPPORT || '',
      description: 'Comprehensive website support and updates',
      features: [
        'Everything in Website Hosting',
        'Weekly content updates',
        'Priority support',
        'Advanced SEO',
        'Performance monitoring',
        'Monthly analytics reports',
      ],
    },
  ],
};

export default function PricingPage() {
  const [paymentType, setPaymentType] = useState<'one-time' | 'subscription'>('subscription');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState('');

  const handleSelectPlan = (priceId: string) => {
    setSelectedPriceId(priceId);
    setShowEmailForm(true);
  };

  const currentPlans = paymentType === 'one-time' ? pricingPlans.oneTime : pricingPlans.subscriptions;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Choose the perfect plan for your needs
          </p>

          {/* Toggle between one-time and subscriptions */}
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 p-1 bg-white dark:bg-gray-800">
            <button
              onClick={() => setPaymentType('subscription')}
              className={`px-6 py-2 rounded-md transition-colors ${
                paymentType === 'subscription'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Subscriptions
            </button>
            <button
              onClick={() => setPaymentType('one-time')}
              className={`px-6 py-2 rounded-md transition-colors ${
                paymentType === 'one-time'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              One-Time Payments
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {currentPlans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden ${
                'popular' in plan && plan.popular ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {'popular' in plan && plan.popular && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}

              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  {'period' in plan && (
                    <span className="text-gray-600 dark:text-gray-400">
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.priceId ? (
                  <button
                    onClick={() => handleSelectPlan(plan.priceId)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Get Started
                  </button>
                ) : (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-3">
                    Configure Stripe product ID to enable
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Email collection modal */}
        {showEmailForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Complete Your Purchase
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEmailForm(false);
                    setCustomerEmail('');
                    setCustomerName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>

                <PaymentButton
                  priceId={selectedPriceId}
                  customerEmail={customerEmail}
                  customerName={customerName}
                  paymentType={paymentType}
                  buttonText="Proceed to Payment"
                  className="flex-1"
                  onError={(error) => alert(error)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
