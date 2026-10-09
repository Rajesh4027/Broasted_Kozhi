import { Clock } from 'lucide-react';
import { useBilling } from '../context/BillingContext';

const MODE_STYLE = {
  Cash: 'bg-green-100 text-green-700',
  UPI: 'bg-yellow-100 text-yellow-700',
  Card: 'bg-purple-100 text-purple-700',
};

export default function RecentTransactions({ onView, ordersProp }) {
  const { orders: allOrders } = useBilling();
  const ordersToUse = ordersProp !== undefined ? ordersProp : allOrders;
  const recent = ordersToUse.slice(0, 5);

  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm animate-fadeSlideUp"
      style={{ animationDelay: '420ms' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} className="text-bk-charcoal/60" />
        <h3 className="font-bold text-bk-charcoal text-base">Recent Transactions</h3>
      </div>

      {recent.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">No transactions yet.</p>
      ) : (
        <div className="divide-y divide-bk-cream">
          {recent.map((o) => (
            <div
              key={o.invoiceNo}
              className="flex items-center justify-between py-3 gap-3 hover:bg-bk-cream/40 -mx-2 px-2 rounded-lg cursor-pointer transition"
              onClick={() => onView && onView(o)}
            >
              {/* Left */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-bk-red">#{o.invoiceNo}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${MODE_STYLE[o.paymentMode] || 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {o.paymentMode}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">
                  {o.customerName || 'Walk-in'}{o.customerPhone ? ` (${o.customerPhone})` : ''} ·{' '}
                  {new Date(o.date).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>
              </div>

              {/* Right */}
              <div className="text-right shrink-0">
                <p className="text-base font-extrabold text-bk-charcoal">
                  ₹{o.total.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-400">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
