import { useMemo, useState } from 'react';
import { Search, FileSpreadsheet, Eye, Pencil, Trash2, Menu, FileDown, Copy, Check, Calendar, Clock, Filter } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { exportOrdersToExcel } from '../utils/excelExport';
import { generateInvoicePdf } from '../utils/pdfExport';

export default function RecentOrders({ onView, onToggleSidebar, collapsed, onEditOrder }) {
  const { orders, deleteOrder, storeSettings, startEditOrder, recentlyUpdatedInvoice } = useBilling();
  const [query, setQuery] = useState('');
  const [payment, setPayment] = useState('All');
  
  // Persist period filter (Today, Yesterday, All) in localStorage so refresh preserves user's choice
  const [period, setPeriod] = useState(() => {
    try {
      const saved = localStorage.getItem('bk_live_orders_period');
      return saved && ['Today', 'Yesterday', 'All', 'Updated', 'Custom'].includes(saved) ? saved : 'Today';
    } catch {
      return 'Today';
    }
  });

  const handleSetPeriod = (p) => {
    setPeriod(p);
    setFrom('');
    setTo('');
    try {
      localStorage.setItem('bk_live_orders_period', p);
    } catch (e) {
      // ignore
    }
  };

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(null);

  const handleCopyPhone = (phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 1500);
  };

  const handleStartEdit = (e, order) => {
    e.stopPropagation();
    startEditOrder(order);
    onEditOrder?.(order);
  };

  const editedCount = useMemo(() => orders.filter((o) => o.isEdited).length, [orders]);

  const filtered = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const yesterdayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const yesterdayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59, 999);

    return orders.filter((o) => {
      if (payment !== 'All' && o.paymentMode !== payment) return false;
      if (query) {
        const q = query.toLowerCase();
        const inItems = o.items.some((it) => it.name.toLowerCase().includes(q));
        const inMeta =
          String(o.invoiceNo).includes(q) ||
          (o.customerName || '').toLowerCase().includes(q) ||
          (o.customerPhone || '').toLowerCase().includes(q);
        if (!inItems && !inMeta) return false;
      }

      const d = new Date(o.date);

      if (period === 'Updated') {
        if (!o.isEdited) return false;
      } else if (from || to) {
        if (from && d < new Date(from)) return false;
        if (to && d > new Date(new Date(to).setHours(23, 59, 59, 999))) return false;
      } else if (period === 'Today') {
        if (d < todayStart || d > todayEnd) return false;
      } else if (period === 'Yesterday') {
        if (d < yesterdayStart || d > yesterdayEnd) return false;
      }

      return true;
    });
  }, [orders, query, payment, period, from, to]);

  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString('en-GB');
    const timeFormatted = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return `${dateFormatted}, ${timeFormatted}`;
  };

  const handleDelete = (e, invoiceNo) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete Invoice #${invoiceNo}?`)) {
      deleteOrder(invoiceNo);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Top Controls Header */}
      <div className="px-4 sm:px-5 pt-3 sm:pt-3.5 pb-2.5 border-b border-bk-gold/30 bg-white space-y-2 shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onToggleSidebar}
              className="flex md:hidden p-2 sm:p-2.5 rounded-[10px] bg-[#282828] hover:bg-black text-white transition-all duration-200 active:scale-95 shadow-sm shrink-0 items-center justify-center border border-bk-gold/20"
              title="Toggle Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-xl sm:text-2xl font-extrabold text-bk-red">Recent Orders</h2>
          </div>
          <button
            onClick={() => exportOrdersToExcel(filtered)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-bk-gold hover:bg-bk-gold-dark text-bk-charcoal text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-xl transition shadow-sm active:scale-95 shrink-0"
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center">
          {/* Search box */}
          <div className="flex items-center gap-2 bg-bk-cream border border-bk-gold/40 rounded-xl px-3 py-1.5 flex-1 min-w-[180px]">
            <Search size={15} className="text-bk-charcoal/50 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search invoice no, item, customer..."
              className="bg-transparent text-xs sm:text-sm flex-1 outline-none font-medium text-bk-charcoal placeholder:text-gray-400"
            />
          </div>

          {/* Period Filter Rectangular Buttons (Saved in localStorage) */}
          <div className="flex items-center gap-1 bg-bk-cream p-1 rounded-xl border border-bk-gold/40 shrink-0">
            <button
              onClick={() => handleSetPeriod('Today')}
              title="Show Today's Orders"
              className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
                period === 'Today' && !from && !to
                  ? 'bg-bk-red text-white shadow-sm'
                  : 'text-bk-charcoal/70 hover:text-bk-charcoal hover:bg-white'
              }`}
            >
              <Calendar size={13} />
              <span>Today</span>
            </button>

            <button
              onClick={() => handleSetPeriod('Yesterday')}
              title="Show Yesterday's Orders"
              className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
                period === 'Yesterday' && !from && !to
                  ? 'bg-bk-red text-white shadow-sm'
                  : 'text-bk-charcoal/70 hover:text-bk-charcoal hover:bg-white'
              }`}
            >
              <Clock size={13} />
              <span>Yesterday</span>
            </button>

            <button
              onClick={() => handleSetPeriod('All')}
              title="Show All Time Orders"
              className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
                period === 'All' && !from && !to
                  ? 'bg-bk-red text-white shadow-sm'
                  : 'text-bk-charcoal/70 hover:text-bk-charcoal hover:bg-white'
              }`}
            >
              <Filter size={13} />
              <span>All</span>
            </button>

            <button
              onClick={() => handleSetPeriod('Updated')}
              title="Show Only Updated / Edited Invoices"
              className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
                period === 'Updated' && !from && !to
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-800 hover:text-amber-950 hover:bg-white'
              }`}
            >
              <Pencil size={13} />
              <span>Updated</span>
              {editedCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  period === 'Updated' ? 'bg-white text-amber-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {editedCount}
                </span>
              )}
            </button>
          </div>

          {/* Payment filter */}
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="text-xs sm:text-sm font-medium border border-bk-gold/40 rounded-xl px-3 py-1.5 bg-white outline-none focus:border-bk-red transition"
          >
            {['All', 'Cash', 'UPI', 'Card'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Date range filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setPeriod('Custom'); }}
              className="flex-1 sm:flex-none text-xs sm:text-sm font-medium border border-bk-gold/40 rounded-xl px-3 py-1.5 bg-white outline-none focus:border-bk-red transition"
            />
            <span className="text-bk-charcoal/40 text-xs font-semibold shrink-0">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setPeriod('Custom'); }}
              className="flex-1 sm:flex-none text-xs sm:text-sm font-medium border border-bk-gold/40 rounded-xl px-3 py-1.5 bg-white outline-none focus:border-bk-red transition"
            />
          </div>
        </div>

        <div className="text-xs sm:text-sm text-bk-charcoal/70 font-medium flex items-center justify-between pt-0.5">
          <div>
            {filtered.length} order{filtered.length !== 1 ? 's' : ''} · Revenue: <span className="font-extrabold text-bk-red">₹{totalRevenue.toFixed(2)}</span>
          </div>
          {(period !== 'Today' || from || to || payment !== 'All' || query) && (
            <button
              onClick={() => { handleSetPeriod('Today'); setPayment('All'); setQuery(''); setFrom(''); setTo(''); }}
              className="text-xs font-bold text-bk-red hover:underline flex items-center gap-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders List Container */}
      <div className="flex-1 overflow-hidden p-2 sm:p-3 flex flex-col min-h-0">
        {filtered.length === 0 ? (
          <p className="text-center text-bk-charcoal/50 mt-16 text-sm font-medium">No orders match your filters.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-bk-gold/30 overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full text-xs sm:text-sm min-w-[750px] relative border-separate border-spacing-0">
                <thead className="bg-bk-red text-white sticky top-0 z-20 shadow-sm">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-bold sticky top-0 bg-bk-red text-white z-20 shadow-sm border-b border-red-700">Invoice</th>
                    <th className="text-left px-4 py-2.5 font-bold sticky top-0 bg-bk-red text-white z-20 shadow-sm border-b border-red-700">Date &amp; Time</th>
                    <th className="text-left px-4 py-2.5 font-bold sticky top-0 bg-bk-red text-white z-20 shadow-sm border-b border-red-700">Customer</th>
                    <th className="text-left px-4 py-2.5 font-bold sticky top-0 bg-bk-red text-white z-20 shadow-sm border-b border-red-700">Contact No</th>
                    <th className="text-left px-4 py-2.5 font-bold sticky top-0 bg-bk-red text-white z-20 shadow-sm border-b border-red-700">Payment</th>
                    <th className="text-left px-4 py-2.5 font-bold sticky top-0 bg-bk-red text-white z-20 shadow-sm border-b border-red-700">Items</th>
                    <th className="text-right px-4 py-2.5 font-bold sticky top-0 bg-bk-red text-white z-20 shadow-sm border-b border-red-700">Total</th>
                    <th className="text-center px-4 py-2.5 font-bold sticky top-0 bg-bk-red text-white z-20 shadow-sm border-b border-red-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, idx) => {
                    const isJustUpdated = recentlyUpdatedInvoice === o.invoiceNo;
                    const isLongName = o.customerName && o.customerName.trim().length > 12;

                    return (
                      <tr
                        key={o.invoiceNo}
                        className={`border-b border-gray-100 transition-all duration-500 ${isJustUpdated
                            ? 'bg-emerald-50/90 ring-2 ring-emerald-400 font-bold shadow-md'
                            : idx % 2
                              ? 'bg-bk-cream/40'
                              : 'bg-white'
                          }`}
                      >
                        <td className="px-4 py-2.5 font-extrabold text-bk-red whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>#{o.invoiceNo}</span>
                            {isJustUpdated && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-md animate-bounce">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                Updated!
                              </span>
                            )}
                            {o.isEdited && !isJustUpdated && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                                Edited
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-bk-charcoal/80 font-medium whitespace-nowrap">{formatDateTime(o.date)}</td>
                        <td className={`px-4 py-2.5 font-bold text-bk-charcoal max-w-[130px] ${isLongName ? 'relative group/cust' : ''}`}>
                          <div className="truncate cursor-pointer">
                            {o.customerName || <span className="text-bk-charcoal/40 font-normal">—</span>}
                          </div>

                          {/* Hover Popup Box ONLY for long/truncated names */}
                          {isLongName && (
                            <div className="absolute left-4 top-full mt-1 hidden group-hover/cust:flex flex-col bg-[#282828] text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-2xl z-30 pointer-events-none whitespace-nowrap border border-bk-gold/40 animate-fadeSlideUp">
                              <span className="text-[10px] text-bk-gold font-bold uppercase tracking-wider">Customer Name</span>
                              <span className="text-sm font-extrabold text-white mt-0.5">{o.customerName}</span>
                              <div className="absolute -top-1 left-4 w-2.5 h-2.5 bg-[#282828] rotate-45 border-t border-l border-bk-gold/40" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {o.customerPhone
                            ? <span className="inline-flex items-center gap-1.5">
                              <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, color: '#2A1B1B', letterSpacing: '0.03em' }}>{o.customerPhone}</span>
                              <button
                                onClick={() => handleCopyPhone(o.customerPhone)}
                                className="p-1 rounded-md hover:bg-bk-gold/20 transition active:scale-90"
                                title="Copy number"
                              >
                                {copiedPhone === o.customerPhone
                                  ? <Check size={13} className="text-green-500" />
                                  : <Copy size={13} className="text-bk-charcoal/40 hover:text-bk-charcoal" />
                                }
                              </button>
                            </span>
                            : <span style={{ fontFamily: 'var(--font-display)', color: '#2A1B1B' }}>—</span>
                          }
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="text-[11px] font-extrabold bg-bk-gold/25 text-bk-charcoal px-2.5 py-1 rounded-full">{o.paymentMode}</span>
                        </td>
                        <td className="px-4 py-2.5 text-bk-charcoal/70 whitespace-nowrap">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                        <td className="px-4 py-2.5 text-right font-extrabold text-bk-charcoal whitespace-nowrap">₹{o.total.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onView(o)}
                              className="p-1.5 rounded-lg bg-red-50 text-bk-red hover:bg-bk-red hover:text-white transition shadow-sm active:scale-95"
                              title="View Invoice"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={(e) => handleStartEdit(e, o)}
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition shadow-sm active:scale-95"
                              title="Edit Order & Add Extra Items"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => generateInvoicePdf(o, storeSettings)}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white transition shadow-sm active:scale-95"
                              title="Save PDF"
                            >
                              <FileDown size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, o.invoiceNo)}
                              className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-600 hover:text-white transition shadow-sm active:scale-95"
                              title="Delete Order"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
