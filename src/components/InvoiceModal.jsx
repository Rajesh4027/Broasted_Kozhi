import { useState, useEffect, useRef } from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import logo2 from '../assets/Logo/Logo_2.png';

const CLOSE_AFTER = 20; // seconds

export default function InvoiceModal({ order, onClose }) {
  const { storeSettings } = useBilling();

  const [isClosing, setIsClosing] = useState(false);
  const [countdown, setCountdown] = useState(CLOSE_AFTER);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printDone, setPrintDone] = useState(false);

  const countRef = useRef(CLOSE_AFTER);
  const timerRef = useRef(null);

  if (!order) return null;

  const dateObj = new Date(order.date);
  const dateStr = dateObj.toLocaleDateString('en-GB');
  const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const addressLines = (storeSettings?.address || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const curr = storeSettings?.currencySymbol || '₹';

  const triggerClose = () => {
    clearInterval(timerRef.current);
    setIsClosing(true);
    setTimeout(() => onClose(), 700);
  };

  // ── Start countdown immediately when modal opens ──
  useEffect(() => {
    countRef.current = CLOSE_AFTER;
    timerRef.current = setInterval(() => {
      countRef.current -= 1;
      setCountdown(countRef.current);
      if (countRef.current <= 0) {
        clearInterval(timerRef.current);
        triggerClose();
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      // close invoice preview right after print dialog is dismissed
      triggerClose();
    }, 900);
  };

  // Countdown ring values
  const R = 18;
  const circ = 2 * Math.PI * R;
  const progress = (countdown / CLOSE_AFTER) * circ;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] print:hidden"
        style={{
          transition: 'opacity 0.5s ease',
          opacity: isClosing ? 0 : 1,
        }}
        onClick={triggerClose}
      />

      {/* ── Slide-in Panel ── */}
      <aside
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white border-l border-bk-gold/30 shadow-2xl print:static print:w-full print:border-none print:shadow-none"
        style={{
          width: '420px',
          maxWidth: '100vw',
          transition: isClosing
            ? 'transform 0.65s cubic-bezier(0.4,0,0.6,1), opacity 0.65s ease'
            : 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
          transform: isClosing ? 'translateX(100%) scale(0.96)' : 'translateX(0) scale(1)',
          opacity: isClosing ? 0 : 1,
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-bk-gold/30 bg-white shrink-0 print:hidden">
          <h3 className="font-extrabold text-bk-red text-base">Invoice Preview</h3>
          <button
            onClick={triggerClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-bk-charcoal hover:bg-gray-100 transition"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Invoice Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div id="invoice-print-area" className="p-6">
            <div className="flex flex-col items-center text-center mb-3">
              <div className="flex justify-center w-full text-center mb-2">
                <img src={logo2} alt={storeSettings?.storeName || 'Broasted Kozhi'} className="h-20 w-auto object-contain mx-auto" />
              </div>
              {addressLines.map((line, idx) => (
                <p key={idx} className="text-xs leading-snug text-bk-charcoal/80 text-center">{line}</p>
              ))}
              {storeSettings?.phone && (
                <p className="text-xs leading-snug text-bk-charcoal/90 font-bold mt-1 text-center">
                  Phone: {storeSettings.phone}
                </p>
              )}
            </div>

            <div className="border-t border-dashed border-bk-charcoal/30 my-2" />
            <p className="text-center font-bold text-base mb-1">{storeSettings?.billTitle || 'Bill of Supply'}</p>

            <div className="flex justify-between text-[13px] text-bk-charcoal/80 mb-1">
              <div>
                <span className="font-extrabold text-bk-charcoal">{order.paymentMode}</span>
                {order.customerName && <div className="font-semibold text-bk-charcoal/90">Customer: {order.customerName}</div>}
                {order.customerPhone && <div className="font-medium text-bk-charcoal/75">Phone: {order.customerPhone}</div>}
              </div>
              <span className="text-right">
                Date: {dateStr}<br />
                Time: {timeStr}<br />
                Invoice no: #{order.invoiceNo}
              </span>
            </div>

            <div className="border-t border-dashed border-bk-charcoal/30 my-2" />

            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left border-b border-bk-charcoal/30">
                  <th className="py-1 font-bold" style={{ width: '44%' }}>Item</th>
                  <th className="py-1 font-bold text-center" style={{ width: '12%' }}>Qty</th>
                  <th className="py-1 font-bold text-right" style={{ width: '21%' }}>Price</th>
                  <th className="py-1 font-bold text-right" style={{ width: '23%' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.key} className="border-b border-dashed border-bk-charcoal/15">
                    <td className="py-1 pr-1">{it.name}{it.variant ? ` (${it.variant})` : ''}</td>
                    <td className="py-1 text-center">{it.qty}</td>
                    <td className="py-1 text-right">{it.unitPrice.toFixed(2)}</td>
                    <td className="py-1 text-right">{(it.unitPrice * it.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-bk-charcoal/30 my-2" />
            <div className="flex justify-between text-[13px]">
              <span>Subtotal</span>
              <span>{curr}{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-bk-red mt-1">
              <span>Total</span>
              <span>{curr}{order.total.toFixed(2)}</span>
            </div>
            <div className="border-t border-dashed border-bk-charcoal/30 my-3" />
            <p className="text-center text-xs font-bold">Terms &amp; Conditions</p>
            <p className="text-center text-xs text-bk-charcoal/70">
              {storeSettings?.footerNote || 'Thank you for doing business with us.'}
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-col items-center gap-3 p-4 border-t border-bk-gold/30 bg-white shrink-0 print:hidden">

          {/* Countdown ring — always visible */}
          <div className="flex items-center gap-2">
            <svg width="44" height="44" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="22" cy="22" r={R} fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle
                cx="22" cy="22" r={R}
                fill="none"
                stroke={countdown <= 5 ? '#E4212B' : '#2A1B1B'}
                strokeWidth="3"
                strokeDasharray={circ}
                strokeDashoffset={circ - progress}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              />
              <text
                x="22" y="22"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="11"
                fontWeight="800"
                fill={countdown <= 5 ? '#E4212B' : '#2A1B1B'}
                transform="rotate(90, 22, 22)"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {countdown}
              </text>
            </svg>
            <span className="text-xs font-medium text-bk-charcoal/60">
              Closing in{' '}
              <strong className={countdown <= 5 ? 'text-bk-red' : 'text-bk-charcoal'}>
                {countdown}s
              </strong>
            </span>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className={`w-full flex items-center justify-center gap-2 text-sm font-extrabold py-3.5 rounded-2xl shadow-lg transition-all duration-300 active:scale-95 relative overflow-hidden ${
              printDone
                ? 'bg-green-500 text-white'
                : 'bg-bk-charcoal hover:bg-black text-white'
            }`}
            style={{ transform: isPrinting ? 'scale(0.97)' : 'scale(1)' }}
          >
            {/* Shimmer on printing */}
            {isPrinting && (
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
                  animation: 'shimmerSweep 0.85s ease-in-out infinite',
                }}
              />
            )}

            {printDone ? (
              <>
                <CheckCircle2 size={18} className="animate-bounceIn" />
                Sent to Printer!
              </>
            ) : (
              <>
                <Printer size={18} className={isPrinting ? 'animate-printerBounce' : ''} />
                {isPrinting ? 'Printing…' : 'Print'}
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes shimmerSweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes printerBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          30%       { transform: translateY(-4px) scale(1.1); }
          60%       { transform: translateY(2px) scale(0.95); }
        }
        @keyframes bounceIn {
          0%   { transform: scale(0.4); opacity: 0; }
          70%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-printerBounce { animation: printerBounce 0.5s ease-in-out infinite; }
        .animate-bounceIn      { animation: bounceIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>
    </>
  );
}
