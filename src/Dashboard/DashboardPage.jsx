import { useState, useMemo } from 'react';
import { Menu, Calendar, Filter, Sparkles, TrendingUp, X } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import StatsCards from './StatsCards';
import RevenueChart from './RevenueChart';
import PaymentBreakdown from './PaymentBreakdown';
import TopItemsTable from './TopItemsTable';
import RecentTransactions from './RecentTransactions';

export default function DashboardPage({ onViewOrder, onToggleSidebar, collapsed }) {
  const now = new Date();
  const { orders } = useBilling();

  // Analytics Filter States — Defaulting to 'Today'
  const [timeFilter, setTimeFilter] = useState('Today'); // 'Today' | 'Week' | 'Month' | 'All Time' | 'Custom'
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // Reset filter back to default (Today)
  const handleResetFilter = () => {
    setTimeFilter('Today');
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  // Filter orders dynamically based on selected date filter
  const filteredOrders = useMemo(() => {
    const currentDate = new Date();

    if (timeFilter === 'Today') {
      const todayStr = currentDate.toDateString();
      return orders.filter((o) => new Date(o.date).toDateString() === todayStr);
    }

    if (timeFilter === 'Week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      return orders.filter((o) => new Date(o.date) >= weekAgo);
    }

    if (timeFilter === 'Month') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      monthAgo.setHours(0, 0, 0, 0);
      return orders.filter((o) => new Date(o.date) >= monthAgo);
    }

    if (timeFilter === 'Custom') {
      const start = startDate ? new Date(startDate) : new Date(0);
      start.setHours(0, 0, 0, 0);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      return orders.filter((o) => {
        const d = new Date(o.date);
        return d >= start && d <= end;
      });
    }

    // All Time
    return orders;
  }, [orders, timeFilter, startDate, endDate]);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#f7f0e8]">
      {/* ── Top Header Bar ── */}
      <div className="bg-white px-4 py-3 sm:py-4 border-b border-bk-gold/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex md:hidden p-2 sm:p-2.5 rounded-[10px] bg-[#282828] hover:bg-black text-white transition-all duration-200 active:scale-95 shadow-sm shrink-0 items-center justify-center border border-bk-gold/20"
            title="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg sm:text-xl font-extrabold text-bk-charcoal">Analytics &amp; Sales Dashboard</h1>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 p-4 md:p-6 space-y-6 max-w-screen-2xl w-full mx-auto">

        {/* ── Analytics Time & Range Filter Bar ── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-bk-gold/30 flex flex-wrap items-center justify-between gap-3 animate-fadeSlideUp">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bk-red/10 flex items-center justify-center text-bk-red shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs font-extrabold text-bk-charcoal uppercase tracking-wider flex items-center gap-1.5">
                Analytics Period Filter
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </p>
              <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
                <span>Active View: <strong className="text-bk-red font-extrabold">{timeFilter === 'Custom' ? `${startDate} to ${endDate}` : timeFilter}</strong> ({filteredOrders.length} orders found)</span>
              </p>
            </div>
          </div>

          {/* Filter Preset Buttons + Reset Filter Button */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['Today', 'Week', 'Month', 'All Time', 'Custom'].map((filter) => {
              const isActive = timeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 active:scale-95 ${
                    isActive
                      ? 'bg-bk-red text-white shadow-md shadow-bk-red/20 ring-2 ring-bk-red/30'
                      : 'bg-bk-cream text-bk-charcoal/80 hover:bg-bk-gold/20 hover:text-bk-charcoal border border-bk-gold/30'
                  }`}
                >
                  {filter === 'Custom' && <Calendar size={13} />}
                  {filter === 'Today' ? 'Today (Default)' : filter === 'Custom' ? 'Custom Range' : filter}
                </button>
              );
            })}

            {/* Cancel / Reset Filter Button (✕) */}
            {timeFilter !== 'Today' && (
              <button
                onClick={handleResetFilter}
                className="px-3 py-2 rounded-xl text-xs font-extrabold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 transition-all duration-200 flex items-center gap-1 shadow-xs active:scale-95 animate-fadeSlideUp"
                title="Reset filter to Today"
              >
                <X size={14} />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          {/* Custom Date Range Picker */}
          {timeFilter === 'Custom' && (
            <div className="w-full pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4 animate-fadeSlideUp">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">From Date:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs font-bold border border-bk-gold/40 bg-bk-cream px-3.5 py-2 rounded-xl outline-none focus:border-bk-red focus:ring-2 focus:ring-bk-red/20 transition text-bk-charcoal shadow-inner"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">To Date:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs font-bold border border-bk-gold/40 bg-bk-cream px-3.5 py-2 rounded-xl outline-none focus:border-bk-red focus:ring-2 focus:ring-bk-red/20 transition text-bk-charcoal shadow-inner"
                />
              </div>
            </div>
          )}
        </div>

        {/* KPI cards */}
        <StatsCards ordersProp={filteredOrders} timeFilter={timeFilter} />

        {/* Revenue chart — full width */}
        <RevenueChart ordersProp={filteredOrders} timeFilter={timeFilter} />

        {/* 2-col: Payment breakdown + Top items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PaymentBreakdown ordersProp={filteredOrders} />
          <TopItemsTable ordersProp={filteredOrders} />
        </div>

        {/* Recent transactions — full width */}
        <RecentTransactions onView={onViewOrder} ordersProp={filteredOrders} />

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400 pb-4">
          © {now.getFullYear()} Broasted Kozhi · Theni · FSSAI 22426473000946
        </p>
      </div>
    </div>
  );
}
