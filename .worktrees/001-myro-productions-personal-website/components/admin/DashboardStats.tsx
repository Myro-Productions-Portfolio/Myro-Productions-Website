interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function StatCard({ title, value, icon, trend, subtitle }: StatCardProps) {
  return (
    <div className="bg-carbon-lighter rounded-lg border border-carbon-light p-6 hover:border-moss-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-text-primary mb-2">{value}</p>
          {subtitle && (
            <p className="text-text-secondary text-xs">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-text-muted text-xs ml-2">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-moss-700 rounded-lg text-text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

interface DashboardStatsProps {
  stats: {
    activeClients: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    pendingPayments: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Active Clients"
        value={stats.activeClients}
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        }
      />
      <StatCard
        title="Active Subscriptions"
        value={stats.activeSubscriptions}
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        }
      />
      <StatCard
        title="Monthly Revenue"
        value={formatCurrency(stats.monthlyRevenue)}
        subtitle="Recurring revenue"
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
      <StatCard
        title="Pending Payments"
        value={stats.pendingPayments}
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
    </div>
  );
}
