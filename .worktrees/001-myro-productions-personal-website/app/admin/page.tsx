/**
 * Admin Dashboard Page
 *
 * Main dashboard overview with statistics and recent activity
 */

import { redirect } from 'next/navigation';
import { verifySessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import DashboardStats from '@/components/admin/DashboardStats';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';

async function getDashboardData() {
  // Fetch all data in parallel
  const [
    activeClientsCount,
    activeSubscriptionsCount,
    monthlyRevenue,
    pendingPaymentsCount,
    recentPayments,
    upcomingRenewals,
  ] = await Promise.all([
    // Active clients count
    prisma.client.count({
      where: { status: 'ACTIVE' },
    }),

    // Active subscriptions count
    prisma.subscription.count({
      where: { status: 'ACTIVE' },
    }),

    // Calculate monthly recurring revenue from active subscriptions
    prisma.subscription.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { amount_cents: true },
    }),

    // Pending payments count
    prisma.payment.count({
      where: {
        status: {
          in: ['PENDING', 'PROCESSING'],
        },
      },
    }),

    // Recent payments (last 5)
    prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        paid_at: 'desc',
      },
      take: 5,
    }),

    // Upcoming subscription renewals (next 7 days)
    prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        current_period_end: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        current_period_end: 'asc',
      },
      take: 5,
    }),
  ]);

  return {
    stats: {
      activeClients: activeClientsCount,
      activeSubscriptions: activeSubscriptionsCount,
      monthlyRevenue: monthlyRevenue._sum.amount_cents || 0,
      pendingPayments: pendingPaymentsCount,
    },
    recentPayments,
    upcomingRenewals,
  };
}

export default async function AdminDashboardPage() {
  // Verify authentication (layout already checks, but double-check)
  const user = await verifySessionFromCookies();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch dashboard data
  const { stats, recentPayments, upcomingRenewals } = await getDashboardData();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(new Date(date));
  };

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-2">
          Welcome back, {user.name}. Here is an overview of your business.
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-carbon-lighter rounded-lg border border-carbon-light p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Recent Payments
            </h2>
          </div>

          {recentPayments.length === 0 ? (
            <p className="text-text-secondary text-sm">No recent payments</p>
          ) : (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start justify-between p-4 bg-carbon rounded-lg border border-carbon-light hover:border-moss-700 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-text-primary font-medium">
                      {payment.client.name}
                    </p>
                    <p className="text-text-secondary text-sm">
                      {payment.payment_type.replace('_', ' ')}
                    </p>
                    <p className="text-text-muted text-xs mt-1">
                      {payment.paid_at ? formatDate(payment.paid_at) : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-500 font-semibold">
                      {formatCurrency(payment.amount_cents)}
                    </p>
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-500 mt-1">
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-carbon-lighter rounded-lg border border-carbon-light p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-accent" />
              Upcoming Renewals
            </h2>
            <span className="text-text-muted text-sm">Next 7 days</span>
          </div>

          {upcomingRenewals.length === 0 ? (
            <p className="text-text-secondary text-sm">
              No renewals in the next 7 days
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingRenewals.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-start justify-between p-4 bg-carbon rounded-lg border border-carbon-light hover:border-moss-700 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-text-primary font-medium">
                      {subscription.client.name}
                    </p>
                    <p className="text-text-secondary text-sm">
                      {subscription.product_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-text-muted text-xs mt-1">
                      {subscription.client.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-primary font-semibold">
                      {formatCurrency(subscription.amount_cents)}
                    </p>
                    <p className="text-text-muted text-xs mt-1">
                      Renews {formatDateShort(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-carbon-lighter rounded-lg border border-carbon-light p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-accent" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/clients"
            className="p-4 bg-carbon rounded-lg border border-carbon-light hover:border-moss-700 hover:bg-carbon-light transition-all text-center group"
          >
            <svg
              className="w-8 h-8 mx-auto mb-2 text-text-secondary group-hover:text-accent transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            <p className="text-text-primary font-medium">Add New Client</p>
            <p className="text-text-secondary text-xs mt-1">
              Create a new client profile
            </p>
          </a>

          <a
            href="/admin/projects"
            className="p-4 bg-carbon rounded-lg border border-carbon-light hover:border-moss-700 hover:bg-carbon-light transition-all text-center group"
          >
            <svg
              className="w-8 h-8 mx-auto mb-2 text-text-secondary group-hover:text-accent transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <p className="text-text-primary font-medium">New Project</p>
            <p className="text-text-secondary text-xs mt-1">
              Start a new project
            </p>
          </a>

          <a
            href="/admin/payments"
            className="p-4 bg-carbon rounded-lg border border-carbon-light hover:border-moss-700 hover:bg-carbon-light transition-all text-center group"
          >
            <svg
              className="w-8 h-8 mx-auto mb-2 text-text-secondary group-hover:text-accent transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-text-primary font-medium">View Payments</p>
            <p className="text-text-secondary text-xs mt-1">
              Review payment history
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
