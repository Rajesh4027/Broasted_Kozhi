import { useMemo } from 'react';
import { useBilling } from '../context/BillingContext';

function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      key: d.toDateString(),
      revenue: 0,
      orders: 0,
    });
  }
  return days;
}

export default function RevenueChart({ ordersProp, timeFilter = 'Today' }) {
  const { orders: allOrders } = useBilling();
  const ordersToUse = ordersProp !== undefined ? ordersProp : allOrders;

  const days = useMemo(() => {
    if (timeFilter === 'Today') {
      const slots = [];
      for (let h = 9; h <= 22; h += 2) {
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        const ampm = h >= 12 ? 'PM' : 'AM';
        slots.push({
          label: `${hour12}${ampm}`,
          hourStart: h,
          hourEnd: h + 2,
          key: `hour-${h}`,
          revenue: 0,
          orders: 0,
        });
      }
      ordersToUse.forEach((o) => {
        const d = new Date(o.date);
        const hr = d.getHours();
        const slot = slots.find((s) => hr >= s.hourStart && hr < s.hourEnd);
        if (slot) {
          slot.revenue += o.total;
          slot.orders += 1;
        }
      });
      return slots;
    }

    const slots = getLastNDays(7);
    ordersToUse.forEach((o) => {
      const key = new Date(o.date).toDateString();
      const slot = slots.find((s) => s.key === key);
      if (slot) {
        slot.revenue += o.total;
        slot.orders += 1;
      }
    });
    return slots;
  }, [ordersToUse, timeFilter]);

  const maxRev = Math.max(...days.map((d) => d.revenue), 1);

  // SVG dimensions
  const W = 600;
  const H = 180;
  const PAD_L = 52;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 48;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const barW = (chartW / days.length) * 0.55;
  const gap = chartW / days.length;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: PAD_T + chartH * (1 - t),
    label: t === 0 ? '₹0.00' : `₹${(maxRev * t).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
  }));

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm animate-fadeSlideUp" style={{ animationDelay: '240ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-bk-charcoal text-base">
            Revenue — {timeFilter === 'Today' ? "Today's Hourly Sales" : timeFilter}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {timeFilter === 'Today' ? 'Hourly distribution for today' : 'Sales overview for period'}
          </p>
        </div>
        <span className="text-xs bg-bk-red/10 text-bk-red font-semibold px-3 py-1 rounded-full">
          ₹{days.reduce((s, d) => s + d.revenue, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: 280, maxHeight: 200 }}
        >
          {/* Y-axis grid lines + labels */}
          {yTicks.map((t) => (
            <g key={t.y}>
              <line
                x1={PAD_L} y1={t.y}
                x2={W - PAD_R} y2={t.y}
                stroke="#f0e8df" strokeWidth={1}
              />
              <text x={PAD_L - 6} y={t.y + 4} textAnchor="end" fontSize={9} fill="#aaa">
                {t.label}
              </text>
            </g>
          ))}

          {/* Bars */}
          {days.map((d, i) => {
            const barH = (d.revenue / maxRev) * chartH;
            const x = PAD_L + i * gap + (gap - barW) / 2;
            const y = PAD_T + chartH - barH;
            const isToday = i === days.length - 1;

            return (
              <g key={d.key}>
                {/* Bar background */}
                <rect
                  x={x} y={PAD_T}
                  width={barW} height={chartH}
                  rx={6} fill="#FFF8EE"
                />
                {/* Bar value */}
                {barH > 0 && (
                  <rect
                    x={x} y={y}
                    width={barW} height={barH}
                    rx={6}
                    fill={isToday ? '#E4212B' : '#FFC72C'}
                  />
                )}
                {/* X-axis label */}
                <text
                  x={x + barW / 2}
                  y={H - 6}
                  textAnchor="middle"
                  fontSize={9}
                  fill={isToday ? '#E4212B' : '#888'}
                  fontWeight={isToday ? 700 : 400}
                >
                  {d.label}
                </text>
                {/* Value on top */}
                {d.revenue > 0 && (
                  <text
                    x={x + barW / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fontSize={8}
                    fill={isToday ? '#E4212B' : '#FFC72C'}
                    fontWeight={700}
                  >
                    ₹{d.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </text>
                )}
              </g>
            );
          })}

          {/* X-axis line */}
          <line
            x1={PAD_L} y1={PAD_T + chartH}
            x2={W - PAD_R} y2={PAD_T + chartH}
            stroke="#e5d9cf" strokeWidth={1.5}
          />
        </svg>
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-bk-gold inline-block" /> Previous days
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-bk-red inline-block" /> Today
        </span>
      </div>
    </div>
  );
}
