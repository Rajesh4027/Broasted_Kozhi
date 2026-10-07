import { Menu } from 'lucide-react';
import StatsCards from './StatsCards';
import RevenueChart from './RevenueChart';
import PaymentBreakdown from './PaymentBreakdown';
import TopItemsTable from './TopItemsTable';
import RecentTransactions from './RecentTransactions';

export default function DashboardPage({ onViewOrder, onToggleSidebar, collapsed }) {
  const now = new Date();

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

        {/* KPI cards */}
        <StatsCards />

        {/* Revenue chart — full width */}
        <RevenueChart />

        {/* 2-col: Payment breakdown + Top items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PaymentBreakdown />
          <TopItemsTable />
        </div>

        {/* Recent transactions — full width */}
        <RecentTransactions onView={onViewOrder} />

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400 pb-4">
          © {now.getFullYear()} Broasted Kozhi · Theni · FSSAI 22426473000946
        </p>
      </div>
    </div>
  );
}
