import { useMemo } from 'react';
import { TrendingUp, ShoppingBag, IndianRupee, BarChart2 } from 'lucide-react';
import { useBilling } from '../context/BillingContext';

function StatCard({ icon: Icon, label, value, sub, accent, delay }) {
  return (
    <div
      className="relative bg-white rounded-2xl p-5 shadow-sm border-l-4 overflow-hidden animate-fadeSlideUp"
      style={{ borderLeftColor: accent, animationDelay: delay }}
    >
      {/* faint bg circle */}
      <div
        className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-extrabold text-bk-charcoal leading-tight">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accent + '22' }}
        >
          <Icon size={22} style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
}

export default function StatsCards({ ordersProp, timeFilter = 'Today' }) {
  const { orders: allOrders } = useBilling();
  const ordersToUse = ordersProp !== undefined ? ordersProp : allOrders;

  const stats = useMemo(() => {
    const todayStr = new Date().toDateString();
    const totalRevenue = ordersToUse.reduce((s, o) => s + o.total, 0);
    const todayRevenue = allOrders
      .filter((o) => new Date(o.date).toDateString() === todayStr)
      .reduce((s, o) => s + o.total, 0);
    const totalOrders = ordersToUse.length;
    const avg = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, todayRevenue, totalOrders, avg };
  }, [ordersToUse, allOrders]);

  const fmt = (n) =>
    n >= 1000
      ? `₹${(n / 1000).toFixed(1)}k`
      : `₹${n.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        icon={IndianRupee}
        label={timeFilter === 'All Time' ? 'Total Revenue' : `${timeFilter} Revenue`}
        value={fmt(stats.totalRevenue)}
        sub={`${stats.totalOrders} order${stats.totalOrders !== 1 ? 's' : ''} in ${timeFilter}`}
        accent="#E4212B"
        delay="0ms"
      />
      <StatCard
        icon={TrendingUp}
        label="Today's Revenue"
        value={fmt(stats.todayRevenue)}
        sub="Resets at midnight"
        accent="#FFC72C"
        delay="60ms"
      />
      <StatCard
        icon={ShoppingBag}
        label="Filtered Orders"
        value={stats.totalOrders.toLocaleString()}
        sub={`Period: ${timeFilter}`}
        accent="#2A1B1B"
        delay="120ms"
      />
      <StatCard
        icon={BarChart2}
        label="Avg Order Value"
        value={fmt(stats.avg)}
        sub="Per transaction in period"
        accent="#7C3AED"
        delay="180ms"
      />
    </div>
  );
}
