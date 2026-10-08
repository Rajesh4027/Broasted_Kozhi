import { useState } from 'react';
import {
  Trash2, Minus, Plus, ReceiptText, X,
  ShoppingCart, ArrowRight, Pencil,
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';

export default function CartPanel({ onGenerateInvoice }) {
  const {
    cart,
    updateQty,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    editingOrder,
    cancelEditOrder,
  } = useBilling();
  const [paymentMode, setPaymentMode] = useState('Cash');

  const handleProceed = () => {
    if (cart.length === 0) return;
    onGenerateInvoice({ paymentMode, customerName, customerPhone });
    setCustomerName('');
    setCustomerPhone('');
    setIsCartOpen(false);
  };

  return (
    <>
      {/* ── Backdrop ── */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* ── Slide-in Cart Panel ── */}
      <aside
        className={`fixed top-0 right-0 h-full z-50 flex flex-col bg-white border-l border-bk-gold/30 shadow-2xl transition-all duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
        style={{ width: '380px' }}
      >
        {/* Panel Header */}
        <div className="px-5 py-4 border-b border-bk-gold/30 flex items-center justify-between bg-white shrink-0">
          <h3 className="font-extrabold text-bk-charcoal flex items-center gap-2 text-base">
            <ReceiptText size={20} className="text-bk-red" />
            {editingOrder ? `Editing Invoice #${editingOrder.invoiceNo}` : 'Current Order'}
            <span className="text-xs bg-bk-gold/20 text-bk-gold-dark font-bold px-2 py-0.5 rounded-full">
              {cartCount}
            </span>
          </h3>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-bk-red/70 hover:text-bk-red px-2 py-1 rounded hover:bg-red-50 transition"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xl text-gray-400 hover:text-bk-charcoal hover:bg-gray-100 transition"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Editing Alert Banner */}
        {editingOrder && (
          <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 flex items-center justify-between text-xs text-amber-900 font-extrabold shrink-0 animate-fadeSlideUp">
            <span className="flex items-center gap-1.5">
              <Pencil size={14} className="text-amber-700" />
              Editing Active Order #{editingOrder.invoiceNo}
            </span>
            <button
              onClick={cancelEditOrder}
              className="text-[10px] bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-0.5 rounded font-bold transition"
            >
              Cancel Edit
            </button>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-bk-gold/10 flex items-center justify-center mb-4">
                <ShoppingCart size={28} className="text-bk-gold/60" />
              </div>
              <p className="font-bold text-bk-charcoal/50 text-sm">Cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Add items from the menu</p>
            </div>
          ) : (
            cart.map((c, idx) => (
              <div
                key={c.key}
                className="group flex items-center gap-2 bg-bk-cream rounded-xl p-3 border border-bk-gold/20 shadow-sm hover:border-bk-gold/60 hover:shadow-md transition-all duration-200 animate-fadeSlideUp"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-bk-charcoal leading-snug break-words">
                    {c.name}
                  </p>
                  <p className="text-[11px] text-bk-charcoal/60 mt-0.5">
                    {c.variant ? `${c.variant} · ` : ''}₹{c.unitPrice} each
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-bk-gold/40 shrink-0">
                  <button
                    onClick={() => updateQty(c.key, c.qty - 1)}
                    className="w-6 h-6 rounded-md text-bk-charcoal flex items-center justify-center hover:bg-bk-gold/30 active:scale-90 transition"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-5 text-center text-xs font-extrabold">{c.qty}</span>
                  <button
                    onClick={() => updateQty(c.key, c.qty + 1)}
                    className="w-6 h-6 rounded-md text-bk-charcoal flex items-center justify-center hover:bg-bk-gold/30 active:scale-90 transition"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <span className="w-14 text-right text-sm font-extrabold text-bk-red shrink-0">
                  ₹{c.unitPrice * c.qty}
                </span>

                <button
                  onClick={() => removeFromCart(c.key)}
                  className="p-1 text-gray-300 hover:text-bk-red transition shrink-0"
                  title="Remove"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer — Payment + Proceed */}
        {cart.length > 0 && (
          <div className="border-t border-bk-gold/30 p-4 space-y-3 bg-white shrink-0">
            {/* Customer Details: Name & Phone */}
            <div className="space-y-2">
              <input
                value={customerName}
                onChange={(e) => {
                  const val = e.target.value;
                  const capitalized = val.replace(/\b\w/g, (c) => c.toUpperCase());
                  setCustomerName(capitalized);
                }}
                placeholder="Customer Name"
                autoCapitalize="words"
                autoCorrect="off"
                className="w-full text-xs sm:text-sm border border-bk-gold/40 rounded-xl px-3.5 py-2.5 outline-none focus:border-bk-red focus:ring-2 focus:ring-bk-red/20 transition bg-bk-cream font-medium"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Contact No"
                maxLength={15}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full text-xs sm:text-sm border border-bk-gold/40 rounded-xl px-3.5 py-2.5 outline-none focus:border-bk-red focus:ring-2 focus:ring-bk-red/20 transition bg-bk-cream font-medium"
              />
            </div>

            {/* Payment mode */}
            <div className="flex gap-2">
              {['Cash', 'UPI', 'Card'].map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMode(m)}
                  className={`flex-1 text-xs font-bold py-2 rounded-xl border transition ${
                    paymentMode === m
                      ? 'bg-bk-charcoal text-white border-bk-charcoal shadow-sm'
                      : 'border-bk-gold/40 text-bk-charcoal/70 hover:border-bk-charcoal bg-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Totals */}
            <div className="flex items-center justify-between text-xs text-bk-charcoal/70 pt-1">
              <span>Subtotal ({cartCount} items)</span>
              <span className="font-semibold text-bk-charcoal">₹{cartTotal}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-extrabold text-bk-red border-t border-dashed border-gray-200 pt-2">
              <span>Total Amount</span>
              <span>₹{cartTotal}</span>
            </div>

            {/* Proceed to Bill button */}
            <button
              onClick={handleProceed}
              className={`w-full text-white font-extrabold py-3.5 rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 ${
                editingOrder ? 'bg-amber-600 hover:bg-amber-700' : 'bg-bk-red hover:bg-bk-red-dark'
              }`}
            >
              {editingOrder ? `Update & Save Bill (#${editingOrder.invoiceNo})` : 'Proceed to Bill'}
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
