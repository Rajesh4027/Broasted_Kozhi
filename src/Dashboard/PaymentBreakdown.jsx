import { useMemo } from 'react';
import { useBilling } from '../context/BillingContext';

const PAYMENT_COLORS = {
  Cash: '#E4212B',
  UPI:  '#FFC72C',
  Card: '#7C3AED',
};

function describeArc(cx, cy, r, startAngle, endAngle) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export default function PaymentBreakdown({ ordersProp }) {
  const { orders: allOrders } = useBilling();
  const ordersToUse = ordersProp !== undefined ? ordersProp : allOrders;

  const data = useMemo(() => {
    const counts = { Cash: 0, UPI: 0, Card: 0 };
    const totals = { Cash: 0, UPI: 0, Card: 0 };
    ordersToUse.forEach((o) => {
      const mode = o.paymentMode || 'Cash';
      if (mode in counts) {
        counts[mode]++;
        totals[mode] += o.total;
      }
    });
    const totalOrders = ordersToUse.length || 1;
    return Object.keys(counts).map((key) => ({
      label: key,
      count: counts[key],
      total: totals[key],
      pct: Math.round((counts[key] / totalOrders) * 100),
      color: PAYMENT_COLORS[key],
    }));
  }, [ordersToUse]);

  // Build donut segments
  const R_OUTER = 56;
  const R_INNER = 34;
  const CX = 70;
  const CY = 70;
  let cumAngle = -90;
  const totalOrders = data.reduce((s, d) => s + d.count, 0);

  const segments = data.map((d) => {
    const sweep = (d.count / (totalOrders || 1)) * 360;
    const seg = { ...d, startAngle: cumAngle, endAngle: cumAngle + sweep - 1 };
    cumAngle += sweep;
    return seg;
  });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm animate-fadeSlideUp" style={{ animationDelay: '300ms' }}>
      <h3 className="font-bold text-bk-charcoal text-base mb-1">Payment Breakdown</h3>
      <p className="text-xs text-gray-400 mb-4">By transaction mode</p>

      <div className="flex items-center gap-6">
        {/* Donut SVG */}
        <svg width={140} height={140} viewBox="0 0 140 140" className="shrink-0">
          {totalOrders === 0 ? (
            <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="#f0e8df" strokeWidth={R_OUTER - R_INNER} />
          ) : (
            segments.map((seg) =>
              seg.count > 0 ? (
                <path
                  key={seg.label}
                  d={describeArc(CX, CY, (R_OUTER + R_INNER) / 2, seg.startAngle, seg.endAngle)}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={R_OUTER - R_INNER}
                  strokeLinecap="round"
                />
              ) : null
            )
          )}
          {/* Centre label */}
          <text x={CX} y={CY - 6} textAnchor="middle" fontSize={18} fontWeight={800} fill="#2A1B1B">
            {totalOrders}
          </text>
          <text x={CX} y={CY + 10} textAnchor="middle" fontSize={9} fill="#aaa">
            orders
          </text>
        </svg>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {data.map((d) => (
            <div key={d.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-2 text-sm font-medium text-bk-charcoal">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                  {d.label}
                </span>
                <span className="text-xs font-bold text-bk-charcoal">{d.pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${d.pct}%`, background: d.color }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {d.count} txn · ₹{d.total.toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
