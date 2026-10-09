import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Trash2, Minus, Plus, ReceiptText, X,
  ShoppingCart, ArrowRight, Pencil, Phone, User, Check, AlertCircle, ChevronDown
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';

const VARIANTS = ['Normal', 'Nashville', 'Korean'];

export default function CartPanel({ onGenerateInvoice }) {
  const {
    cart,
    updateQty,
    updateCartItemVariant,
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
    orders,
  } = useBilling();

  const [paymentMode, setPaymentMode] = useState('Cash');
  const [activeDropdown, setActiveDropdown] = useState(null); // 'phone' | 'name' | null
  const [openVariantKey, setOpenVariantKey] = useState(null); // cart item key for custom variant dropdown
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Extract unique saved customers from live & past orders
  const savedCustomers = useMemo(() => {
    const map = new Map();
    (orders || []).forEach((o) => {
      const phone = (o.customerPhone || '').toString().trim();
      const name = (o.customerName || '').toString().trim();
      if (phone || name) {
        const key = phone || name;
        if (!map.has(key) || (name && !map.get(key).name)) {
          map.set(key, { phone, name });
        }
      }
    });
    return Array.from(map.values());
  }, [orders]);

  // Look up existing registered customer for current phone number
  const existingCustomerForPhone = useMemo(() => {
    if (!customerPhone || !customerPhone.trim()) return null;
    const phone = customerPhone.trim();
    return savedCustomers.find(
      (c) => c.phone && c.phone.trim() === phone && c.name && c.name.trim() !== ''
    );
  }, [savedCustomers, customerPhone]);

  // Check if typed customerName conflicts with existing registered name for this phone number
  const isNameMismatch = useMemo(() => {
    if (!existingCustomerForPhone || !customerName || !customerName.trim()) return false;
    return (
      existingCustomerForPhone.name.trim().toLowerCase() !==
      customerName.trim().toLowerCase()
    );
  }, [existingCustomerForPhone, customerName]);

  // Check if current phone & name already match a saved customer fully
  const isFullySelectedCustomer = useMemo(() => {
    if (!customerPhone || !customerPhone.trim()) return false;
    const phone = customerPhone.trim();
    const name = (customerName || '').trim().toLowerCase();
    return savedCustomers.some(
      (c) => c.phone.trim() === phone && (c.name || '').trim().toLowerCase() === name
    );
  }, [savedCustomers, customerPhone, customerName]);

  // Filter for Phone Input — ONLY show when user starts typing & not fully selected
  const phoneFilteredCustomers = useMemo(() => {
    if (!customerPhone || !customerPhone.trim() || isFullySelectedCustomer) {
      return [];
    }
    const qPhone = customerPhone.trim().toLowerCase();
    const qName = customerName ? customerName.trim().toLowerCase() : '';

    return savedCustomers.filter((c) => {
      const phoneMatch = c.phone && c.phone.toLowerCase().includes(qPhone);
      if (!phoneMatch) return false;

      // If user already typed a customer name, only suggest if name also matches
      if (qName) {
        return c.name && c.name.toLowerCase().includes(qName);
      }
      return true;
    });
  }, [savedCustomers, customerPhone, customerName, isFullySelectedCustomer]);

  // Filter for Name Input — ONLY show when user starts typing & not fully selected
  const nameFilteredCustomers = useMemo(() => {
    if (!customerName || !customerName.trim() || isFullySelectedCustomer) {
      return [];
    }
    const qName = customerName.trim().toLowerCase();
    const qPhone = customerPhone ? customerPhone.trim() : '';

    return savedCustomers.filter((c) => {
      const nameMatch = c.name && c.name.toLowerCase().includes(qName);
      if (!nameMatch) return false;

      // If user already typed a phone number, only suggest if phone also matches
      if (qPhone) {
        return c.phone && c.phone.trim().includes(qPhone);
      }
      return true;
    });
  }, [savedCustomers, customerName, customerPhone, isFullySelectedCustomer]);

  const currentFilteredList = activeDropdown === 'phone' ? phoneFilteredCustomers : nameFilteredCustomers;

  // Keyboard navigation handler (Up/Down Arrow & Enter)
  const handleKeyDown = (e) => {
    if (!activeDropdown || currentFilteredList.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < currentFilteredList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : currentFilteredList.length - 1));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (highlightedIndex >= 0 && currentFilteredList[highlightedIndex]) {
        e.preventDefault();
        handleSelectCustomer(currentFilteredList[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setActiveDropdown(null);
      setHighlightedIndex(-1);
    }
  };

  const handleSelectCustomer = (cust) => {
    setCustomerPhone(cust.phone || '');
    setCustomerName(cust.name || '');
    setActiveDropdown(null);
    setHighlightedIndex(-1);
  };

  const handleClearCustomer = () => {
    setCustomerPhone('');
    setCustomerName('');
    setActiveDropdown(null);
    setHighlightedIndex(-1);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setHighlightedIndex(-1);
      }
    };

    const handleVariantOutside = (event) => {
      if (openVariantKey) {
        const activeContainer = document.querySelector(`[data-variant-container="${openVariantKey}"]`);
        if (!activeContainer || !activeContainer.contains(event.target)) {
          setOpenVariantKey(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('pointerdown', handleVariantOutside, true);
    document.addEventListener('mousedown', handleVariantOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('pointerdown', handleVariantOutside, true);
      document.removeEventListener('mousedown', handleVariantOutside, true);
    };
  }, [openVariantKey]);

  const handleProceed = () => {
    if (cart.length === 0 || isNameMismatch) return;
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
        <div
          className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
          onScroll={() => {
            if (openVariantKey) setOpenVariantKey(null);
          }}
        >
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-bk-gold/10 flex items-center justify-center mb-4">
                <ShoppingCart size={28} className="text-bk-gold/60" />
              </div>
              <p className="font-bold text-bk-charcoal/50 text-sm">Cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Add items from the menu</p>
            </div>
          ) : (
            cart.map((c, idx) => {
              const isVariantItem = c.variant !== null && c.variant !== undefined;
              const isPopoverOpen = openVariantKey === c.key;
              const openUpward = idx >= cart.length - 2 && idx > 0;

              return (
                <div
                  key={c.key}
                  className={`group flex items-center gap-2 bg-bk-cream rounded-xl p-3 border border-bk-gold/20 shadow-sm hover:border-bk-gold/60 hover:shadow-md transition-all duration-200 animate-fadeSlideUp relative ${
                    isPopoverOpen ? 'z-30 shadow-md ring-1 ring-bk-red/30' : 'z-10'
                  }`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-bk-charcoal leading-snug break-words">
                      {c.name}
                    </p>

                    {/* Single Line: Variant Badge + Unit Price */}
                    <div className="flex items-center gap-1.5 mt-1 whitespace-nowrap">
                      {isVariantItem ? (
                        <div
                          className="relative inline-block variant-popover-container"
                          data-variant-container={c.key}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenVariantKey(isPopoverOpen ? null : c.key)}
                            className="flex items-center justify-between gap-1 text-[11px] font-extrabold text-amber-950 bg-[#fffbf2] hover:bg-amber-100/60 border border-amber-500/60 px-2 py-0.5 rounded-full shadow-xs transition active:scale-95 whitespace-nowrap"
                            title="Click to select variant"
                          >
                            <span>{c.variant}</span>
                            <ChevronDown
                              size={11}
                              strokeWidth={2.5}
                              className={`text-amber-800 transition-transform duration-200 ${isPopoverOpen ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {/* Custom Dropdown Popover Menu (Ultra Compact) */}
                          {isPopoverOpen && (
                            <div className={`absolute left-0 w-[105px] bg-white border border-amber-500/60 rounded-xl shadow-xl z-50 overflow-hidden py-0.5 animate-fadeSlideUp divide-y divide-amber-100/50 ${
                              openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
                            }`}>
                              {VARIANTS.map((v) => {
                                const isSelected = c.variant === v;
                                return (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => {
                                      updateCartItemVariant(c.key, v);
                                      setOpenVariantKey(null);
                                    }}
                                    className={`w-full text-left px-2.5 py-1 text-[11px] transition flex items-center justify-between ${
                                      isSelected
                                        ? 'bg-amber-100/70 text-bk-red font-black'
                                        : 'text-bk-charcoal hover:bg-amber-50 hover:text-bk-red font-semibold'
                                    }`}
                                  >
                                    <span>{v}</span>
                                    {isSelected && (
                                      <Check size={12} className="text-bk-red shrink-0" strokeWidth={2.5} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : null}

                      <span className="text-[11px] text-bk-charcoal/60 font-medium whitespace-nowrap">
                        {isVariantItem ? ' · ' : ''}₹{c.unitPrice} each
                      </span>
                    </div>
                  </div>

                  {/* Pill-Shaped Quantity Controller UI (Matching 3rd Screenshot) */}
                  <div className="flex items-center bg-white rounded-full p-0.5 border border-amber-300/80 shadow-xs shrink-0">
                    <button
                      onClick={() => updateQty(c.key, c.qty - 1)}
                      className="w-7 h-7 rounded-full bg-amber-100/70 hover:bg-amber-200 text-amber-900 font-extrabold flex items-center justify-center transition active:scale-90"
                      title="Decrease quantity"
                    >
                      <Minus size={13} strokeWidth={3} />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-bk-charcoal">{c.qty}</span>
                    <button
                      onClick={() => updateQty(c.key, c.qty + 1)}
                      className="w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold flex items-center justify-center transition active:scale-90 shadow-sm"
                      title="Increase quantity"
                    >
                      <Plus size={13} strokeWidth={3} />
                    </button>
                  </div>

                  <span className="w-13 text-right text-sm font-extrabold text-bk-red shrink-0">
                    ₹{c.unitPrice * c.qty}
                  </span>

                  <button
                    onClick={() => removeFromCart(c.key)}
                    className="p-1 text-gray-300 hover:text-bk-red transition shrink-0"
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer — Payment + Proceed */}
        {cart.length > 0 && (
          <div className="border-t border-bk-gold/30 p-4 space-y-3 bg-white shrink-0">
            {/* Customer Details: Contact No (1st) & Customer Name (2nd) */}
            <div className="space-y-2 relative" ref={containerRef}>
              {/* 1. Contact No Input with Autocomplete */}
              <div className="relative">
                <div className="relative flex items-center">
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setCustomerPhone(val);
                      setActiveDropdown('phone');
                      setHighlightedIndex(-1);
                    }}
                    onFocus={() => {
                      if (customerPhone.trim() && !isFullySelectedCustomer) {
                        setActiveDropdown('phone');
                        setHighlightedIndex(-1);
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Contact No"
                    maxLength={15}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`w-full text-xs sm:text-sm border rounded-xl px-3.5 py-2.5 outline-none transition bg-bk-cream font-medium pr-8 ${
                      isNameMismatch
                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-bk-gold/40 focus:border-bk-red focus:ring-2 focus:ring-bk-red/20'
                    }`}
                  />
                  {(customerPhone || customerName) && (
                    <button
                      type="button"
                      onClick={handleClearCustomer}
                      className="absolute right-2.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200/60 transition"
                      title="Clear customer details"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Phone Dropdown List */}
                {activeDropdown === 'phone' && phoneFilteredCustomers.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-bk-gold/30 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-gray-100 animate-fadeSlideUp">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-amber-50/70 flex items-center justify-between border-b border-gray-100 sticky top-0">
                      <span>Saved Customers ({phoneFilteredCustomers.length})</span>
                      <span className="text-[9px] text-bk-red font-semibold">↑↓ Arrow & Enter to select</span>
                    </div>
                    {phoneFilteredCustomers.map((cust, idx) => {
                      const isSelected = idx === highlightedIndex;
                      return (
                        <button
                          key={`phone-${cust.phone}-${idx}`}
                          type="button"
                          onClick={() => handleSelectCustomer(cust)}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className={`w-full text-left px-3.5 py-2 flex items-center justify-between group transition ${
                            isSelected
                              ? 'bg-amber-100 border-l-4 border-bk-red text-bk-red font-bold'
                              : 'hover:bg-bk-cream'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                              isSelected ? 'bg-bk-red text-white' : 'bg-bk-gold/10 text-bk-gold'
                            }`}>
                              <Phone size={12} />
                            </div>
                            <span className={`text-xs ${isSelected ? 'font-extrabold text-bk-red' : 'font-bold text-bk-charcoal'}`}>
                              {cust.phone || 'No Phone'}
                            </span>
                          </div>
                          {cust.name ? (
                            <span className={`text-xs px-2 py-0.5 rounded-md transition ${
                              isSelected ? 'bg-bk-red text-white font-bold' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {cust.name}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">No Name</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Customer Name Input with Autocomplete */}
              <div className="relative">
                <div className="relative flex items-center">
                  <input
                    value={customerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      const capitalized = val.replace(/\b\w/g, (c) => c.toUpperCase());
                      setCustomerName(capitalized);
                      setActiveDropdown('name');
                      setHighlightedIndex(-1);
                    }}
                    onFocus={() => {
                      if (customerName.trim() && !isFullySelectedCustomer) {
                        setActiveDropdown('name');
                        setHighlightedIndex(-1);
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Customer Name"
                    autoCapitalize="words"
                    autoCorrect="off"
                    className={`w-full text-xs sm:text-sm border rounded-xl px-3.5 py-2.5 outline-none transition bg-bk-cream font-medium pr-8 ${
                      isNameMismatch
                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 ring-2 ring-red-100'
                        : 'border-bk-gold/40 focus:border-bk-red focus:ring-2 focus:ring-bk-red/20'
                    }`}
                  />
                  {(customerName || customerPhone) && (
                    <button
                      type="button"
                      onClick={handleClearCustomer}
                      className="absolute right-2.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200/60 transition"
                      title="Clear customer details"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Name Dropdown List */}
                {activeDropdown === 'name' && nameFilteredCustomers.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-bk-gold/30 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-gray-100 animate-fadeSlideUp">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-amber-50/70 flex items-center justify-between border-b border-gray-100 sticky top-0">
                      <span>Matching Customers ({nameFilteredCustomers.length})</span>
                      <span className="text-[9px] text-bk-red font-semibold">↑↓ Arrow & Enter to select</span>
                    </div>
                    {nameFilteredCustomers.map((cust, idx) => {
                      const isSelected = idx === highlightedIndex;
                      return (
                        <button
                          key={`name-${cust.name}-${idx}`}
                          type="button"
                          onClick={() => handleSelectCustomer(cust)}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className={`w-full text-left px-3.5 py-2 flex items-center justify-between group transition ${
                            isSelected
                              ? 'bg-amber-100 border-l-4 border-bk-red text-bk-red font-bold'
                              : 'hover:bg-bk-cream'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                              isSelected ? 'bg-bk-red text-white' : 'bg-bk-gold/10 text-bk-gold'
                            }`}>
                              <User size={12} />
                            </div>
                            <span className={`text-xs ${isSelected ? 'font-extrabold text-bk-red' : 'font-bold text-bk-charcoal'}`}>
                              {cust.name || 'No Name'}
                            </span>
                          </div>
                          {cust.phone ? (
                            <span className={`text-xs px-2 py-0.5 rounded-md transition ${
                              isSelected ? 'bg-bk-red text-white font-bold' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {cust.phone}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">No Phone</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Name Mismatch Warning Alert */}
              {isNameMismatch && (
                <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-2.5 font-semibold animate-fadeSlideUp">
                  <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight">
                      Phone <span className="font-bold">{customerPhone}</span> is already registered to <span className="font-bold underline">{existingCustomerForPhone.name}</span>.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCustomerName(existingCustomerForPhone.name)}
                      className="mt-1 text-[11px] text-red-700 hover:text-white bg-white hover:bg-red-600 border border-red-300 px-2 py-0.5 rounded-md font-bold transition shadow-xs flex items-center gap-1"
                    >
                      <span>Use "{existingCustomerForPhone.name}"</span>
                    </button>
                  </div>
                </div>
              )}
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
              disabled={isNameMismatch}
              className={`w-full text-white font-extrabold py-3.5 rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 ${
                isNameMismatch
                  ? 'bg-gray-400 cursor-not-allowed opacity-70'
                  : editingOrder
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-bk-red hover:bg-bk-red-dark'
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
