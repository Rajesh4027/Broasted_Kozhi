import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { useBilling } from '../context/BillingContext';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function TopItemsTable({ ordersProp }) {
  const { orders: allOrders } = useBilling();
  const ordersToUse = ordersProp !== undefined ? ordersProp : allOrders;

  const topItems = useMemo(() => {
    const map = {};
    ordersToUse.forEach((o) => {
      (o.items || []).forEach((it) => {
        const k = it.name;
        if (!map[k]) map[k] = { name: it.name, qty: 0, revenue: 0 };
        map[k].qty += it.qty;
        map[k].revenue += it.unitPrice * it.qty;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);
  }, [ordersToUse]);

  const maxQty = topItems[0]?.qty || 1;

  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm animate-fadeSlideUp"
      style={{ animationDelay: '360ms' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} className="text-bk-gold" />
        <h3 className="font-bold text-bk-charcoal text-base">Top Selling Items</h3>
      </div>

      {topItems.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {topItems.map((item, idx) => (
            <div key={item.name} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base leading-none shrink-0">
                    {MEDAL[idx] || <span className="w-5 h-5 text-xs text-gray-400 font-bold inline-flex items-center justify-center">#{idx + 1}</span>}
                  </span>
                  <span className="text-sm font-medium text-bk-charcoal truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400">{item.qty} sold</span>
                  <span className="text-sm font-bold text-bk-red">
                    ₹{item.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-bk-cream rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(item.qty / maxQty) * 100}%`,
                    background: idx === 0 ? '#E4212B' : idx === 1 ? '#FFC72C' : '#2A1B1B',
                    opacity: idx > 2 ? 0.55 : 1,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
