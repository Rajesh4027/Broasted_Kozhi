import { useState, useMemo } from 'react';
import {
  Sparkles,
  Users,
  Award,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  Phone,
  CreditCard,
  X,
  Eye,
  ChevronRight,
  UtensilsCrossed,
  Flame,
  AlertCircle,
  Menu,
  Download,
  Calendar,
  CheckCircle2,
  Zap,
  PlusCircle
} from 'lucide-react';
import { useBilling } from '../../context/BillingContext';
import { exportOrdersToExcel } from '../../utils/excelExport';

export default function InsightsPage({ onViewOrder, onToggleSidebar, collapsed }) {
  const { orders, categories } = useBilling();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('today'); // 'today' | 'week' | 'month' | 'all' | 'custom'
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [activeTab, setActiveTab] = useState('customers'); // 'customers' | 'dishes' | 'habits'
  const [customerFilter, setCustomerFilter] = useState('all'); // 'all' | 'vip' | 'regular' | 'new' | 'dormant'
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const now = new Date();

  // Reset filter back to default (Today)
  const handleResetTimeframe = () => {
    setSelectedTimeframe('today');
    const todayStr = new Date().toISOString().split('T')[0];
    setStartDate(todayStr);
    setEndDate(todayStr);
  };

  // ── 1. Filter Orders by Timeframe ──
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!o.date) return true;
      const oDate = new Date(o.date);
      if (selectedTimeframe === 'today') {
        return (
          oDate.getDate() === now.getDate() &&
          oDate.getMonth() === now.getMonth() &&
          oDate.getFullYear() === now.getFullYear()
        );
      }
      if (selectedTimeframe === 'week') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        return oDate >= sevenDaysAgo;
      }
      if (selectedTimeframe === 'month') {
        return (
          oDate.getMonth() === now.getMonth() &&
          oDate.getFullYear() === now.getFullYear()
        );
      }
      if (selectedTimeframe === 'custom') {
        const start = startDate ? new Date(startDate) : new Date(0);
        start.setHours(0, 0, 0, 0);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);
        return oDate >= start && oDate <= end;
      }
      return true;
    });
  }, [orders, selectedTimeframe, startDate, endDate, now]);

  // ── 2. Aggregate Customer Analytics ──
  const customerAnalytics = useMemo(() => {
    const customerMap = {};

    filteredOrders.forEach((o) => {
      // Key by phone or name, fallback to Guest
      const phoneKey = (o.customerPhone || '').trim();
      const nameKey = (o.customerName || '').trim();
      const key = phoneKey || (nameKey ? `name_${nameKey.toLowerCase()}` : 'Walk-in Guest');

      if (!customerMap[key]) {
        customerMap[key] = {
          key,
          name: nameKey || (phoneKey ? `Customer (${phoneKey})` : 'Walk-in Guest'),
          phone: phoneKey || 'N/A',
          totalSpent: 0,
          totalOrders: 0,
          ordersList: [],
          itemCounts: {},
          paymentModes: { Cash: 0, UPI: 0, Card: 0 },
          firstOrderDate: o.date,
          lastOrderDate: o.date,
        };
      }

      const c = customerMap[key];
      c.totalSpent += Number(o.total) || 0;
      c.totalOrders += 1;
      c.ordersList.push(o);

      if (o.date) {
        if (!c.firstOrderDate || new Date(o.date) < new Date(c.firstOrderDate)) {
          c.firstOrderDate = o.date;
        }
        if (!c.lastOrderDate || new Date(o.date) > new Date(c.lastOrderDate)) {
          c.lastOrderDate = o.date;
        }
      }

      if (o.paymentMode && c.paymentModes[o.paymentMode] !== undefined) {
        c.paymentModes[o.paymentMode] += 1;
      }

      (o.items || []).forEach((it) => {
        const itemKey = it.name;
        c.itemCounts[itemKey] = (c.itemCounts[itemKey] || 0) + (it.qty || 1);
      });
    });

    const customersList = Object.values(customerMap).map((c) => {
      const avgOrderValue = Math.round(c.totalSpent / c.totalOrders);

      // Determine favorite item
      let favItem = 'N/A';
      let maxQty = 0;
      Object.entries(c.itemCounts).forEach(([name, qty]) => {
        if (qty > maxQty) {
          maxQty = qty;
          favItem = name;
        }
      });

      // Calculate days since last order
      const daysSinceLast = c.lastOrderDate
        ? Math.floor((now.getTime() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Determine Loyalty Tier
      let tier = 'New';
      if (c.totalOrders >= 5) {
        tier = 'VIP';
      } else if (c.totalOrders >= 2) {
        tier = 'Regular';
      }

      if (daysSinceLast > 14 && c.totalOrders >= 2) {
        tier = 'Dormant';
      }

      return {
        ...c,
        avgOrderValue,
        favItem,
        daysSinceLast,
        tier,
      };
    });

    // Sort by total spent descending
    customersList.sort((a, b) => b.totalSpent - a.totalSpent);

    const totalCustomers = customersList.length;
    const repeatCustomers = customersList.filter((c) => c.totalOrders >= 2).length;
    const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;
    const topCustomer = customersList[0] || null;
    const avgCLV = totalCustomers > 0 ? Math.round(customersList.reduce((acc, c) => acc + c.totalSpent, 0) / totalCustomers) : 0;

    return {
      list: customersList,
      totalCustomers,
      repeatCustomers,
      repeatRate,
      topCustomer,
      avgCLV,
    };
  }, [filteredOrders, now]);

  // Filter Customer List by Search & Tab
  const displayedCustomers = useMemo(() => {
    return customerAnalytics.list.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.favItem.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (customerFilter === 'vip') return c.tier === 'VIP';
      if (customerFilter === 'regular') return c.tier === 'Regular';
      if (customerFilter === 'new') return c.tier === 'New';
      if (customerFilter === 'dormant') return c.tier === 'Dormant';

      return true;
    });
  }, [customerAnalytics.list, searchQuery, customerFilter]);

  // ── 3. Aggregate Dish Analytics (Most vs Least Ordered) ──
  const dishAnalytics = useMemo(() => {
    const itemSalesMap = {};

    // First collect all menu items from categories
    categories.forEach((cat) => {
      (cat.items || []).forEach((it) => {
        itemSalesMap[it.name] = {
          id: it.id,
          name: it.name,
          categoryName: cat.name,
          price: it.price || 0,
          qtySold: 0,
          totalRevenue: 0,
          ordersCount: 0,
          status: it.status || 'Available',
        };
      });
    });

    // Aggregate sales from filtered orders
    filteredOrders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const name = it.name;
        if (!itemSalesMap[name]) {
          itemSalesMap[name] = {
            id: name,
            name: name,
            categoryName: 'General',
            price: it.unitPrice || 0,
            qtySold: 0,
            totalRevenue: 0,
            ordersCount: 0,
            status: 'Available',
          };
        }
        itemSalesMap[name].qtySold += (it.qty || 1);
        itemSalesMap[name].totalRevenue += (it.unitPrice * (it.qty || 1));
        itemSalesMap[name].ordersCount += 1;
      });
    });

    const allDishes = Object.values(itemSalesMap);

    // Sort for Bestsellers (descending)
    const bestsellers = [...allDishes].sort((a, b) => b.qtySold - a.qtySold);

    // Sort for Least Ordered (ascending)
    const leastOrdered = [...allDishes].sort((a, b) => a.qtySold - b.qtySold);

    // Category distribution
    const categoryTotals = {};
    allDishes.forEach((d) => {
      const cat = d.categoryName;
      if (!categoryTotals[cat]) categoryTotals[cat] = { name: cat, revenue: 0, qty: 0 };
      categoryTotals[cat].revenue += d.totalRevenue;
      categoryTotals[cat].qty += d.qtySold;
    });

    const categoriesList = Object.values(categoryTotals).sort((a, b) => b.revenue - a.revenue);

    return {
      bestsellers: bestsellers.slice(0, 8),
      leastOrdered: leastOrdered.slice(0, 8),
      categoriesList,
      totalDishesCount: allDishes.length,
    };
  }, [categories, filteredOrders]);

  // ── 4. Order Time Habits & Payment Distribution ──
  const habitAnalytics = useMemo(() => {
    const timeSlots = {
      lunch: { label: 'Lunch Rush (12 PM - 4 PM)', count: 0, revenue: 0 },
      evening: { label: 'Evening Snacks (4 PM - 7 PM)', count: 0, revenue: 0 },
      dinner: { label: 'Dinner Rush (7 PM - 11 PM)', count: 0, revenue: 0 },
      other: { label: 'Other Off-Peak Hours', count: 0, revenue: 0 },
    };

    const paymentModes = { Cash: 0, UPI: 0, Card: 0 };

    filteredOrders.forEach((o) => {
      const mode = o.paymentMode || 'Cash';
      if (paymentModes[mode] !== undefined) {
        paymentModes[mode] += 1;
      }

      if (o.date) {
        const hour = new Date(o.date).getHours();
        const rev = Number(o.total) || 0;

        if (hour >= 12 && hour < 16) {
          timeSlots.lunch.count += 1;
          timeSlots.lunch.revenue += rev;
        } else if (hour >= 16 && hour < 19) {
          timeSlots.evening.count += 1;
          timeSlots.evening.revenue += rev;
        } else if (hour >= 19 && hour < 23) {
          timeSlots.dinner.count += 1;
          timeSlots.dinner.revenue += rev;
        } else {
          timeSlots.other.count += 1;
          timeSlots.other.revenue += rev;
        }
      }
    });

    return {
      timeSlots: Object.values(timeSlots),
      paymentModes,
      totalOrdersCount: filteredOrders.length,
    };
  }, [filteredOrders]);

  const handleExport = () => {
    exportOrdersToExcel(filteredOrders, `Insights_Customer_Report_${selectedTimeframe}.xlsx`);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#f8f5f0]">
      {/* ── Top Header ── */}
      <div className="bg-white px-4 py-3.5 border-b border-bk-gold/20 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex md:hidden p-2 rounded-lg bg-[#282828] text-white hover:bg-black transition active:scale-95 shrink-0"
            title="Toggle Navigation Menu"
          >
            <Menu size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-bk-charcoal tracking-tight">Customer &amp; Sales Insights</h1>
              <span className="bg-gradient-to-r from-amber-500 to-bk-gold text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles size={11} className="fill-black" /> Customer Intelligence
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Deep customer analytics, repeat customer tracking &amp; dish performance insights</p>
          </div>
        </div>

        {/* Time Filter Pills & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-[#efede6] p-1 rounded-xl gap-1">
            {[
              { id: 'today', label: 'Today (Default)' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'all', label: 'All Time' },
              { id: 'custom', label: 'Custom Range' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setSelectedTimeframe(tf.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  selectedTimeframe === tf.id
                    ? 'bg-bk-red text-white shadow'
                    : 'text-gray-600 hover:text-bk-charcoal hover:bg-white/60'
                }`}
              >
                {tf.id === 'custom' && <Calendar size={13} />}
                {tf.label}
              </button>
            ))}
          </div>

          {/* Single Cancel / Reset Filter Button (✕) */}
          {selectedTimeframe !== 'today' && (
            <button
              onClick={handleResetTimeframe}
              className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 transition flex items-center gap-1 shadow-xs active:scale-95 animate-fadeSlideUp"
              title="Reset filter to Today"
            >
              <X size={14} />
              <span>Reset Filter</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#282828] hover:bg-black text-white text-xs font-bold rounded-xl transition shadow active:scale-95 ml-auto sm:ml-0"
            title="Export Excel Report"
          >
            <Download size={14} className="text-bk-gold" />
            <span className="hidden sm:inline">Export Insights</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker Bar for Insights */}
      {selectedTimeframe === 'custom' && (
        <div className="bg-amber-50/80 border-b border-bk-gold/20 px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-bk-charcoal animate-fadeSlideUp">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-bk-red">
              <Calendar size={15} />
              <span className="uppercase tracking-wider font-black">Date Range Filter:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-bold">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-bk-gold/40 rounded-xl px-3 py-1.5 bg-white outline-none focus:border-bk-red focus:ring-2 focus:ring-bk-red/20 text-xs font-bold text-bk-charcoal shadow-inner"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-bold">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-bk-gold/40 rounded-xl px-3 py-1.5 bg-white outline-none focus:border-bk-red focus:ring-2 focus:ring-bk-red/20 text-xs font-bold text-bk-charcoal shadow-inner"
              />
            </div>
          </div>

          <span className="text-xs text-bk-red font-black bg-bk-red/10 px-2.5 py-1 rounded-full">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
          </span>
        </div>
      )}

      {/* ── Main Container ── */}
      <div className="flex-1 p-4 md:p-6 space-y-6 max-w-screen-2xl w-full mx-auto">

        {/* KPI Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Unique Customers */}
          <div className="bg-white rounded-2xl p-4 border border-bk-gold/20 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Stored Customers</span>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-bk-charcoal">{customerAnalytics.totalCustomers}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                <TrendingUp size={12} /> {customerAnalytics.repeatRate}% Repeat
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Unique customer profiles recorded</p>
          </div>

          {/* Card 2: Repeat Loyalty Rate */}
          <div className="bg-white rounded-2xl p-4 border border-bk-gold/20 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Repeat Loyalty Rate</span>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Award size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-bk-charcoal">{customerAnalytics.repeatRate}%</span>
              <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                {customerAnalytics.repeatCustomers} Frequent Diners
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Customers with 2+ orders</p>
          </div>

          {/* Card 3: Top Customer CLV */}
          <div className="bg-white rounded-2xl p-4 border border-bk-gold/20 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Top Customer Value</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-bk-red">
                ₹{customerAnalytics.topCustomer ? customerAnalytics.topCustomer.totalSpent.toLocaleString('en-IN') : '0'}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-bk-charcoal truncate mt-1">
              👑 {customerAnalytics.topCustomer ? customerAnalytics.topCustomer.name : 'No orders yet'}
            </p>
          </div>

          {/* Card 4: Least Ordered Dish Warning */}
          <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Slow-Moving Dish Alert</span>
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <AlertCircle size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-base font-extrabold text-bk-charcoal truncate max-w-[180px]">
                {dishAnalytics.leastOrdered[0]?.name || 'None'}
              </span>
            </div>
            <p className="text-[11px] text-rose-500 font-semibold mt-1">
              Only {dishAnalytics.leastOrdered[0]?.qtySold || 0} ordered · Action Recommended
            </p>
          </div>
        </div>

        {/* ── Main Tab Navigation Bar ── */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-bk-gold/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'customers'
                  ? 'bg-[#282828] text-bk-gold shadow-md'
                  : 'text-gray-600 hover:bg-bk-cream hover:text-bk-charcoal'
              }`}
            >
              <Users size={16} />
              <span>Customer Intelligence ({displayedCustomers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('dishes')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'dishes'
                  ? 'bg-[#282828] text-bk-gold shadow-md'
                  : 'text-gray-600 hover:bg-bk-cream hover:text-bk-charcoal'
              }`}
            >
              <UtensilsCrossed size={16} />
              <span>Dish Performance &amp; Slow-Movers</span>
            </button>

            <button
              onClick={() => setActiveTab('habits')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'habits'
                  ? 'bg-[#282828] text-bk-gold shadow-md'
                  : 'text-gray-600 hover:bg-bk-cream hover:text-bk-charcoal'
              }`}
            >
              <Clock size={16} />
              <span>Ordering Habits &amp; Peak Times</span>
            </button>
          </div>

          {/* Search bar inside Customer tab */}
          {activeTab === 'customers' && (
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, phone, dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#f5f2eb] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-bk-red text-bk-charcoal placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── TAB 1: CUSTOMER DIRECTORY & LOYALTY ── */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            {/* Loyalty Tier Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Customers', count: customerAnalytics.totalCustomers },
                { id: 'vip', label: '👑 VIP Champions (5+ orders)', count: customerAnalytics.list.filter((c) => c.tier === 'VIP').length },
                { id: 'regular', label: '🔁 Regular Diners (2-4 orders)', count: customerAnalytics.list.filter((c) => c.tier === 'Regular').length },
                { id: 'new', label: '🆕 New Guests (1 order)', count: customerAnalytics.list.filter((c) => c.tier === 'New').length },
                { id: 'dormant', label: '⚠️ Inactive / At Risk (>14 days)', count: customerAnalytics.list.filter((c) => c.tier === 'Dormant').length },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCustomerFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                    customerFilter === f.id
                      ? 'bg-bk-red text-white shadow'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-bk-cream'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${customerFilter === f.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Customers Table Card */}
            <div className="bg-white rounded-2xl border border-bk-gold/20 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#282828] text-white text-[11px] uppercase tracking-wider font-extrabold border-b border-gray-800">
                      <th className="py-3.5 px-4">Customer Name &amp; Contact</th>
                      <th className="py-3.5 px-4">Loyalty Tier</th>
                      <th className="py-3.5 px-4 text-center">Total Orders</th>
                      <th className="py-3.5 px-4 text-right">Total Lifetime Value</th>
                      <th className="py-3.5 px-4 text-right">Avg Order Spend</th>
                      <th className="py-3.5 px-4">Favorite Dish</th>
                      <th className="py-3.5 px-4">Last Visit</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-bk-charcoal font-medium">
                    {displayedCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400">
                          <Users size={32} className="mx-auto mb-2 opacity-40" />
                          <p className="font-semibold text-sm">No matching customer profiles found</p>
                          <p className="text-xs text-gray-400">Try adjusting your search query or timeframe filter.</p>
                        </td>
                      </tr>
                    ) : (
                      displayedCustomers.map((cust, idx) => (
                        <tr
                          key={cust.key}
                          className={`hover:bg-amber-50/50 transition-colors ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-[#faf8f4]'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                cust.tier === 'VIP' ? 'bg-gradient-to-br from-amber-400 to-bk-gold text-black shadow-sm' :
                                cust.tier === 'Regular' ? 'bg-purple-100 text-purple-700' :
                                cust.tier === 'Dormant' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {cust.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-bk-charcoal truncate">{cust.name}</p>
                                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                  <Phone size={10} /> {cust.phone}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {cust.tier === 'VIP' && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1 w-fit shadow-xs">
                                👑 VIP Champion
                              </span>
                            )}
                            {cust.tier === 'Regular' && (
                              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-200 flex items-center gap-1 w-fit">
                                🔁 Regular Diner
                              </span>
                            )}
                            {cust.tier === 'New' && (
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-200 flex items-center gap-1 w-fit">
                                🆕 New Guest
                              </span>
                            )}
                            {cust.tier === 'Dormant' && (
                              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1 w-fit">
                                ⚠️ Inactive (&gt;14 days)
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="font-black text-sm text-bk-charcoal bg-gray-100 px-2.5 py-0.5 rounded-md">
                              {cust.totalOrders}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right font-black text-bk-red text-sm whitespace-nowrap">
                            ₹{cust.totalSpent.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3.5 px-4 text-right font-bold text-gray-700 whitespace-nowrap">
                            ₹{cust.avgOrderValue.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3.5 px-4 truncate max-w-[160px] text-gray-700 font-semibold">
                            🍗 {cust.favItem}
                          </td>

                          <td className="py-3.5 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                            {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => setSelectedCustomer(cust)}
                              className="px-3 py-1.5 bg-[#282828] hover:bg-bk-red text-white text-[11px] font-extrabold rounded-lg transition-colors flex items-center gap-1 mx-auto shadow-xs active:scale-95"
                            >
                              <Eye size={12} /> View Full Analysis
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: DISH PERFORMANCE & SLOW-MOVING DISHES ── */}
        {activeTab === 'dishes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Bestsellers Box */}
            <div className="bg-white rounded-2xl p-5 border border-bk-gold/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Flame size={20} className="text-bk-red" />
                  <h3 className="font-extrabold text-bk-charcoal text-base">Top Bestselling Dishes</h3>
                </div>
                <span className="text-xs font-bold text-gray-400">By Sales Volume</span>
              </div>

              <div className="space-y-3">
                {dishAnalytics.bestsellers.map((item, idx) => {
                  const maxQty = dishAnalytics.bestsellers[0]?.qtySold || 1;
                  const pct = Math.round((item.qtySold / maxQty) * 100);

                  return (
                    <div key={item.id} className="group p-2.5 rounded-xl hover:bg-amber-50/50 transition">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                            idx === 0 ? 'bg-amber-400 text-black' : idx === 1 ? 'bg-slate-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-bk-charcoal truncate text-xs sm:text-sm">{item.name}</span>
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded hidden sm:inline">{item.categoryName}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-extrabold text-gray-600">{item.qtySold} sold</span>
                          <span className="text-xs font-black text-bk-red">₹{item.totalRevenue.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: idx === 0 ? 'linear-gradient(90deg, #E4212B, #FFC72C)' : '#2A1B1B',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Least Ordered / Slow-Moving Dishes Box */}
            <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingDown size={20} className="text-rose-600" />
                  <h3 className="font-extrabold text-bk-charcoal text-base">Least Ordered / Slow-Moving Dishes</h3>
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Action Needed</span>
              </div>

              <div className="space-y-3">
                {dishAnalytics.leastOrdered.map((item, idx) => (
                  <div key={item.id} className="p-3 rounded-xl border border-rose-100 bg-rose-50/30 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-bk-charcoal text-xs sm:text-sm truncate">{item.name}</span>
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full shrink-0">
                          {item.qtySold === 0 ? '⚠️ 0 Sales' : `Only ${item.qtySold} Sold`}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Category: {item.categoryName} · Price: ₹{item.price}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg inline-block">
                        💡 Suggest Promo / Discount
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Revenue Distribution Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-bk-gold/20 shadow-sm space-y-4">
              <h3 className="font-extrabold text-bk-charcoal text-base flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-bk-gold" /> Category Revenue Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {dishAnalytics.categoriesList.map((cat) => (
                  <div key={cat.name} className="p-3.5 bg-[#f7f4ed] rounded-xl border border-gray-200 flex flex-col justify-between">
                    <span className="text-xs font-extrabold text-bk-charcoal">{cat.name}</span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-base font-black text-bk-red">₹{cat.revenue.toLocaleString('en-IN')}</span>
                      <span className="text-xs font-bold text-gray-500">{cat.qty} items sold</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: ORDERING HABITS & PEAK TIMES ── */}
        {activeTab === 'habits' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Peak Hours Breakdown Card */}
            <div className="bg-white rounded-2xl p-5 border border-bk-gold/20 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Clock size={20} className="text-bk-gold" />
                <h3 className="font-extrabold text-bk-charcoal text-base">Peak Order Time Distribution</h3>
              </div>

              <div className="space-y-4">
                {habitAnalytics.timeSlots.map((slot) => {
                  const pct = habitAnalytics.totalOrdersCount > 0
                    ? Math.round((slot.count / habitAnalytics.totalOrdersCount) * 100)
                    : 0;

                  return (
                    <div key={slot.label} className="p-3 bg-[#faf7f2] rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs sm:text-sm text-bk-charcoal">{slot.label}</span>
                        <span className="text-xs font-black text-bk-red">{slot.count} Orders ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden my-2">
                        <div className="h-full bg-bk-red rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[11px] text-gray-500 text-right">Total Revenue: ₹{slot.revenue.toLocaleString('en-IN')}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Method Preferences Card */}
            <div className="bg-white rounded-2xl p-5 border border-bk-gold/20 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <CreditCard size={20} className="text-emerald-600" />
                <h3 className="font-extrabold text-bk-charcoal text-base">Customer Payment Method Preferences</h3>
              </div>

              <div className="space-y-4 pt-2">
                {Object.entries(habitAnalytics.paymentModes).map(([mode, count]) => {
                  const pct = habitAnalytics.totalOrdersCount > 0
                    ? Math.round((count / habitAnalytics.totalOrdersCount) * 100)
                    : 0;

                  return (
                    <div key={mode} className="p-3 bg-[#faf7f2] rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs sm:text-sm text-bk-charcoal">
                          {mode === 'UPI' ? '📲 Google Pay / PhonePe (UPI)' : mode === 'Cash' ? '💵 Cash Payment' : '💳 Credit / Debit Card'}
                        </span>
                        <span className="text-xs font-black text-bk-charcoal">{count} transactions ({pct}%)</span>
                      </div>
                      <div className="h-2 shadow-xs bg-gray-200 rounded-full overflow-hidden my-2">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: mode === 'UPI' ? '#10B981' : mode === 'Cash' ? '#F59E0B' : '#3B82F6'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ── CUSTOMER ANALYSIS DEEP-DIVE MODAL / DRAWER ── */}
      {selectedCustomer && (
        <div
          onClick={() => setSelectedCustomer(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex justify-end transition-opacity duration-300 ease-in-out animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md md:max-w-lg bg-white h-full flex flex-col shadow-2xl overflow-y-auto cursor-default animate-slideLeft transition-all duration-300"
          >
            {/* Drawer Mobile Top Handle / Close indicator bar */}
            <div className="sm:hidden bg-[#282828] pt-2 pb-1 flex justify-center border-b border-gray-800">
              <div className="w-12 h-1.5 bg-gray-500 rounded-full" />
            </div>

            {/* Drawer Header */}
            <div className="bg-[#282828] text-white p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-400 to-bk-gold text-black font-black flex items-center justify-center text-base sm:text-lg shadow shrink-0">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-white truncate">{selectedCustomer.name}</h2>
                  <p className="text-xs text-bk-gold flex items-center gap-1 font-semibold">
                    <Phone size={11} /> {selectedCustomer.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white hover:bg-bk-red transition-all duration-200 shrink-0 ml-2 active:scale-95 shadow-sm"
                title="Close Analysis (or click outside)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 sm:p-5 space-y-5 flex-1 overflow-y-auto bg-[#faf8f4]">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] uppercase font-extrabold text-gray-400">Total Spent (CLV)</span>
                  <p className="text-lg sm:text-xl font-black text-bk-red mt-1">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] uppercase font-extrabold text-gray-400">Total Visits</span>
                  <p className="text-lg sm:text-xl font-black text-bk-charcoal mt-1">{selectedCustomer.totalOrders} Order(s)</p>
                </div>
                <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] uppercase font-extrabold text-gray-400">Avg Spend / Bill</span>
                  <p className="text-sm sm:text-base font-extrabold text-gray-800 mt-1">₹{selectedCustomer.avgOrderValue}</p>
                </div>
                <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] uppercase font-extrabold text-gray-400">Loyalty Status</span>
                  <p className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded w-fit mt-1 border border-amber-300">
                    {selectedCustomer.tier}
                  </p>
                </div>
              </div>

              {/* Favorite Items Breakdown */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2.5">
                <h4 className="font-extrabold text-xs text-bk-charcoal uppercase tracking-wider flex items-center gap-1.5">
                  <UtensilsCrossed size={14} className="text-bk-gold" /> Most Ordered Dishes
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {Object.entries(selectedCustomer.itemCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([itemName, count]) => (
                      <div key={itemName} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 last:border-none">
                        <span className="font-bold text-gray-800 truncate max-w-[200px]">{itemName}</span>
                        <span className="font-black text-bk-red bg-red-50 px-2 py-0.5 rounded-md text-[11px] shrink-0">{count} times</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Complete Order History Timeline */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-bk-charcoal uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={14} className="text-bk-gold" /> Order History Timeline ({selectedCustomer.ordersList.length})
                </h4>

                <div className="space-y-2.5">
                  {selectedCustomer.ordersList.map((ord) => (
                    <div key={ord.invoiceNo} className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-bk-red">Invoice #{ord.invoiceNo}</span>
                        <span className="text-gray-400 font-medium text-[11px]">
                          {new Date(ord.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1 bg-[#fbf9f4] p-2 rounded-lg">
                        {(ord.items || []).map((it, i) => (
                          <div key={i} className="flex justify-between items-center text-[11px]">
                            <span className="font-medium text-bk-charcoal">{it.qty}x {it.name}</span>
                            <span className="font-semibold text-gray-700">₹{it.unitPrice * it.qty}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1.5 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-gray-600 font-extrabold bg-gray-100 px-2 py-0.5 rounded">
                          Paid via {ord.paymentMode}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-bk-charcoal">₹{ord.total}</span>
                          <button
                            onClick={() => onViewOrder(ord)}
                            className="p-1.5 bg-gray-100 hover:bg-bk-red hover:text-white rounded-lg text-gray-500 transition active:scale-95"
                            title="View Invoice details"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
