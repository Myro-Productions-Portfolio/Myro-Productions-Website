/**
 * Admin Dashboard Statistics API Route
 *
 * GET /api/admin/dashboard/stats - Get dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromCookies } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/dashboard/stats
 *
 * Get comprehensive dashboard statistics for admin overview
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const admin = await requireAuthFromCookies();
    if (admin instanceof NextResponse) return admin;

    // Get current date and calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // CLIENT STATISTICS
    const totalClients = await prisma.client.count();
    const activeClients = await prisma.client.count({
      where: { status: 'ACTIVE' },
    });
    const newClientsThisMonth = await prisma.client.count({
      where: {
        created_at: { gte: startOfMonth },
      },
    });

    // SUBSCRIPTION STATISTICS
    const totalSubscriptions = await prisma.subscription.count();
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE' },
    });
    const trialingSubscriptions = await prisma.subscription.count({
      where: { status: 'TRIALING' },
    });
    const pastDueSubscriptions = await prisma.subscription.count({
      where: { status: 'PAST_DUE' },
    });

    // Monthly recurring revenue (MRR) from active subscriptions
    const mrrData = await prisma.subscription.aggregate({
      where: {
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      _sum: {
        amount_cents: true,
      },
    });
    const monthlyRecurringRevenue = mrrData._sum.amount_cents || 0;

    // PROJECT STATISTICS
    const totalProjects = await prisma.project.count();
    const activeProjects = await prisma.project.count({
      where: { status: 'IN_PROGRESS' },
    });
    const completedProjects = await prisma.project.count({
      where: { status: 'COMPLETED' },
    });
    const planningProjects = await prisma.project.count({
      where: { status: 'PLANNING' },
    });

    // PAYMENT STATISTICS
    // This month's revenue
    const thisMonthRevenue = await prisma.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        paid_at: { gte: startOfMonth },
      },
      _sum: {
        amount_cents: true,
      },
      _count: true,
    });

    // Last month's revenue
    const lastMonthRevenue = await prisma.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        paid_at: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
      _sum: {
        amount_cents: true,
      },
      _count: true,
    });

    // Total revenue (all time)
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
      },
      _sum: {
        amount_cents: true,
      },
      _count: true,
    });

    // Pending payments
    const pendingPayments = await prisma.payment.aggregate({
      where: {
        status: { in: ['PENDING', 'PROCESSING'] },
      },
      _sum: {
        amount_cents: true,
      },
      _count: true,
    });

    // Failed payments this month
    const failedPaymentsThisMonth = await prisma.payment.count({
      where: {
        status: 'FAILED',
        created_at: { gte: startOfMonth },
      },
    });

    // RECENT ACTIVITY
    const recentClients = await prisma.client.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });

    const recentPayments = await prisma.payment.findMany({
      take: 10,
      where: {
        status: 'SUCCEEDED',
      },
      orderBy: { paid_at: 'desc' },
      select: {
        id: true,
        amount_cents: true,
        currency: true,
        payment_type: true,
        paid_at: true,
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const recentProjects = await prisma.project.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        created_at: true,
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // TOP CLIENTS BY REVENUE
    const topClients = await prisma.payment.groupBy({
      by: ['client_id'],
      where: {
        status: 'SUCCEEDED',
      },
      _sum: {
        amount_cents: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          amount_cents: 'desc',
        },
      },
      take: 5,
    });

    // Fetch client details for top clients
    const topClientsWithDetails = await Promise.all(
      topClients.map(async (tc) => {
        const client = await prisma.client.findUnique({
          where: { id: tc.client_id },
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        });

        return {
          client,
          total_revenue_cents: tc._sum.amount_cents || 0,
          payment_count: tc._count,
        };
      })
    );

    // Calculate revenue growth percentage
    const lastMonthTotal = lastMonthRevenue._sum.amount_cents || 0;
    const thisMonthTotal = thisMonthRevenue._sum.amount_cents || 0;
    const revenueGrowth = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

    // Return comprehensive statistics
    return NextResponse.json({
      success: true,
      data: {
        clients: {
          total: totalClients,
          active: activeClients,
          new_this_month: newClientsThisMonth,
          recent: recentClients,
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          trialing: trialingSubscriptions,
          past_due: pastDueSubscriptions,
          monthly_recurring_revenue_cents: monthlyRecurringRevenue,
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          planning: planningProjects,
          recent: recentProjects,
        },
        payments: {
          total_revenue_cents: totalRevenue._sum.amount_cents || 0,
          total_payments: totalRevenue._count,
          this_month: {
            revenue_cents: thisMonthTotal,
            count: thisMonthRevenue._count,
          },
          last_month: {
            revenue_cents: lastMonthTotal,
            count: lastMonthRevenue._count,
          },
          revenue_growth_percentage: Number(revenueGrowth.toFixed(2)),
          pending: {
            amount_cents: pendingPayments._sum.amount_cents || 0,
            count: pendingPayments._count,
          },
          failed_this_month: failedPaymentsThisMonth,
          recent: recentPayments,
        },
        top_clients: topClientsWithDetails,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
