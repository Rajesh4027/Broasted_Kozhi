import { useState, useRef } from 'react';
import { Plus, Search, X, LogOut, AlertCircle, ChevronLeft, ChevronRight, ShoppingCart, Menu, Check } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import VoiceAssistant from './VoiceBilling/VoiceAssistant';
import UpdateNotification from './UpdateNotification';

const VARIANTS = ['Normal', 'Nashville', 'Korean'];

export default function ItemsGrid({ activeCategory, setActiveCategory, onLogout, onToggleSidebar, collapsed, onViewOrder }) {
  const { addToCart, categories, cartCount, cartTotal, setIsCartOpen, editingOrder, cancelEditOrder } = useBilling();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const inputRef = useRef(null);
  const catScrollRef = useRef(null);

  // Always use live categories from context
  const menuCategories = categories && categories.length > 0 ? categories : [];
  const category = menuCategories.find((c) => c.id === activeCategory) || menuCategories[0] || { name: 'Menu', items: [] };

  // When searching, show results from ALL categories
  const isSearching = query.trim().length > 0;
  const searchResults = isSearching
    ? menuCategories.flatMap((cat) =>
        cat.items
          .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
          .map((item) => ({ ...item, categoryName: cat.name }))
      )
    : [];

  const handleLogoutClick = () => {
    setShowConfirmLogout(true);
  };

  const handleConfirmLogout = () => {
    setShowConfirmLogout(false);
    setIsLoggingOut(true);
    setTimeout(() => {
      onLogout?.();
    }, 750);
  };

  const scrollCats = (dir) => {
    catScrollRef.current?.scrollBy({ left: dir * 160, behavior: 'smooth' });
  };

  // Grid layout column mode preference (3 or 4 columns)
  const [gridCols, setGridCols] = useState(() => {
    try {
      const saved = localStorage.getItem('bk_pos_grid_cols');
      return saved ? Number(saved) : 3;
    } catch {
      return 3;
    }
  });

  const handleSetGridCols = (cols) => {
    setGridCols(cols);
    try {
      localStorage.setItem('bk_pos_grid_cols', String(cols));
    } catch (e) {
      // ignore
    }
  };

  const gridClass = gridCols === 4
    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 pb-4'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4';

  return (
    <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">

      {/* ── Active Order Edit Bar Alert ── */}
      {editingOrder && (
        <div className="bg-[#282828] text-white px-4 py-2 border-b border-bk-gold/40 flex items-center justify-between text-xs shrink-0 animate-fadeSlideUp">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-extrabold text-bk-gold">Currently Editing Invoice #{editingOrder.invoiceNo}</span>
            <span className="text-gray-300 hidden sm:inline">· Adding items from menu will update this bill</span>
          </div>
          <button
            onClick={cancelEditOrder}
            className="bg-amber-500 hover:bg-amber-600 text-black text-[11px] font-black px-2.5 py-1 rounded-lg transition active:scale-95 shadow-sm"
          >
            Cancel Edit
          </button>
        </div>
      )}

      {/* ── Top Bar: Search + View Order + Logout ── */}
      <div className="px-3 sm:px-5 pt-3 sm:pt-4 pb-3 bg-white border-b border-bk-gold/30 flex items-center justify-between gap-2 sm:gap-3 shrink-0">

        {/* Left Section: Menu Toggle Button + Search Input Box */}
        <div className="flex items-center gap-2 flex-1 max-w-[65%] sm:max-w-md">
          {/* Menu Icon Button - shown ONLY in mobile view (< 768px), hidden in web view */}
          <button
            onClick={onToggleSidebar}
            className="flex md:hidden p-2 sm:p-2.5 rounded-[10px] bg-[#282828] hover:bg-black text-white transition-all duration-200 active:scale-95 shadow-sm shrink-0 items-center justify-center border border-bk-gold/20"
            title="Open Navigation Menu"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Search Input */}
          <div className="relative flex-1">
            <div
              className="relative flex items-center transition-all duration-300"
              style={{ filter: focused ? 'drop-shadow(0 4px 16px rgba(228,33,43,0.13))' : 'none' }}
            >
              <span
                className="absolute left-3.5 transition-colors duration-200"
                style={{ color: focused ? '#E4212B' : '#aaa' }}
              >
                <Search size={18} />
              </span>

              <input
                ref={inputRef}
                id="items-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search items…"
                className="w-full pl-10 pr-9 py-2 sm:py-2.5 rounded-[10px] border text-xs sm:text-sm font-medium text-bk-charcoal bg-[#fdf8f0] outline-none placeholder:text-gray-400 transition-all duration-300"
                style={{
                  borderColor: focused ? '#E4212B' : '#f0dfc8',
                  boxShadow: focused ? '0 0 0 3px rgba(228,33,43,0.10)' : 'none',
                }}
              />

              {query && (
                <button
                  onMouseDown={(e) => { e.preventDefault(); setQuery(''); inputRef.current?.focus(); }}
                  className="absolute right-3 text-gray-300 hover:text-bk-red transition"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {isSearching && (
              <p className="text-[11px] text-bk-charcoal/50 mt-1 px-1 animate-fadeSlideUp">
                {searchResults.length > 0
                  ? `${searchResults.length} item${searchResults.length !== 1 ? 's' : ''} found`
                  : 'No items found'}
              </p>
            )}
          </div>
        </div>

        {/* Top Right Action Group: Update Icon + Voice AI + View Order + Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Software Update Button */}
          <UpdateNotification />

          {/* AI Voice Assistant Button */}
          <VoiceAssistant onViewOrder={onViewOrder} />

          {/* View Order Button */}
          <button
            onClick={() => setIsCartOpen((v) => !v)}
            title="View current order details"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] text-sm font-bold shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 border ${
              cartCount > 0
                ? 'bg-bk-red hover:bg-bk-red-dark text-white border-bk-red'
                : 'bg-red-50 hover:bg-red-100 text-bk-red border-red-200'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-white text-bk-red text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-bk-red/20 shadow">
                  {cartCount}
                </span>
              )}
            </div>
            <span>View Order</span>
            {cartCount > 0 && (
              <span className="bg-white/20 text-white text-xs font-extrabold px-2 py-0.5 rounded-md border border-white/20">
                ₹{cartTotal}
              </span>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
            title="Logout from portal"
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-bk-red text-bk-red hover:text-white rounded-[10px] border border-red-200 hover:border-bk-red text-sm font-bold shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 group shrink-0"
          >
            <LogOut size={18} className="transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* ── Category Tabs Row ── */}
      {!isSearching && (
        <div className="bg-white border-b border-bk-gold/20 px-3 py-2 flex items-center gap-1 shrink-0">
          {/* Left scroll arrow */}
          <button
            onClick={() => scrollCats(-1)}
            className="p-1.5 rounded-lg text-bk-charcoal/50 hover:text-bk-red hover:bg-red-50 transition shrink-0"
            title="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Scrollable category list – hidden scrollbar */}
          <div
            ref={catScrollRef}
            className="flex gap-1.5 overflow-x-auto py-0.5 no-scrollbar flex-1"
          >
            {menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all duration-200 whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-bk-red text-white shadow-sm'
                    : 'bg-bk-cream text-bk-charcoal/70 hover:bg-bk-gold/20 border border-bk-gold/30'
                }`}
              >
                {cat.name}
                <span className="ml-1 opacity-70 text-[10px]">({cat.items.length})</span>
              </button>
            ))}
          </div>

          {/* Right scroll arrow */}
          <button
            onClick={() => scrollCats(1)}
            className="p-1.5 rounded-lg text-bk-charcoal/50 hover:text-bk-red hover:bg-red-50 transition shrink-0"
            title="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Confirmation Modal: Are you sure you want to logout? ── */}
      {showConfirmLogout && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeSlideUp"
          onClick={() => setShowConfirmLogout(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl flex flex-col items-center text-center border border-white/20 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowConfirmLogout(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-bk-charcoal hover:bg-gray-100 transition"
              title="Close"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-red-50 text-bk-red flex items-center justify-center mb-4 ring-4 ring-red-100/60">
              <LogOut size={26} />
            </div>

            <h3 className="text-xl font-extrabold text-bk-charcoal">Confirm Logout</h3>
            <p className="text-xs text-bk-charcoal/60 mt-1.5 leading-relaxed">
              Are you sure you want to log out from Broasted Kozhi POS portal?
            </p>

            <div className="flex items-center gap-3 w-full mt-6">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-bk-charcoal font-bold text-xs hover:bg-gray-100 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-bk-red hover:bg-bk-red-dark text-white font-extrabold text-xs shadow-md hover:shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <LogOut size={15} />
                <span>Yes, Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Animated Exit Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center animate-logoutZoom">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center border border-white/20">
            <div className="w-16 h-16 rounded-full bg-red-50 text-bk-red flex items-center justify-center mb-4 ring-4 ring-red-100 animate-pulse">
              <LogOut size={30} className="animate-pulse" />
            </div>
            <h3 className="text-xl font-extrabold text-bk-charcoal">Logging Out…</h3>
            <p className="text-xs text-gray-400 mt-1">Clearing admin session securely</p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-6 overflow-hidden">
              <div className="bg-bk-red h-full rounded-full animate-pulse w-full" />
            </div>
          </div>
        </div>
      )}

      {/* ── Items Grid (scrollable) ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5" style={{ minHeight: 0 }}>
        {isSearching ? (
          searchResults.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-bk-charcoal/50 uppercase tracking-widest">
                  Search Results — {searchResults.length} items
                </h2>

                {/* Grid View Mode Toggle Icons */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-bk-gold/30 shadow-sm">
                  <button
                    onClick={() => handleSetGridCols(3)}
                    title="3 Columns Product Grid View"
                    className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
                      gridCols === 3
                        ? 'bg-bk-red text-white shadow-sm'
                        : 'text-bk-charcoal/60 hover:text-bk-charcoal hover:bg-bk-cream'
                    }`}
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 20 20">
                      <rect x="2" y="3" width="4.5" height="14" rx="1" />
                      <rect x="7.75" y="3" width="4.5" height="14" rx="1" />
                      <rect x="13.5" y="3" width="4.5" height="14" rx="1" />
                    </svg>
                    <span className="hidden sm:inline">3 Cols</span>
                  </button>

                  <button
                    onClick={() => handleSetGridCols(4)}
                    title="4 Columns Product Grid View"
                    className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
                      gridCols === 4
                        ? 'bg-bk-red text-white shadow-sm'
                        : 'text-bk-charcoal/60 hover:text-bk-charcoal hover:bg-bk-cream'
                    }`}
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 20 20">
                      <rect x="1.5" y="3" width="3.25" height="14" rx="0.75" />
                      <rect x="6" y="3" width="3.25" height="14" rx="0.75" />
                      <rect x="10.5" y="3" width="3.25" height="14" rx="0.75" />
                      <rect x="15" y="3" width="3.25" height="14" rx="0.75" />
                    </svg>
                    <span className="hidden sm:inline">4 Cols</span>
                  </button>
                </div>
              </div>

              <div className={gridClass}>
                {searchResults.map((item) => (
                  <ItemCard key={item.id} item={item} onAdd={addToCart} sub={item.categoryName} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 animate-fadeSlideUp">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-bk-charcoal/40 font-medium">No items match "<span className="text-bk-red">{query}</span>"</p>
            </div>
          )
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-bk-red">{category.name}</h2>

              {/* Grid View Mode Toggle Icons (3 columns vs 4 columns) */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-bk-gold/30 shadow-sm">
                <button
                  onClick={() => handleSetGridCols(3)}
                  title="3 Columns Product View (1 row 3 columns)"
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
                    gridCols === 3
                      ? 'bg-bk-red text-white shadow-sm'
                      : 'text-bk-charcoal/60 hover:text-bk-charcoal hover:bg-bk-cream'
                  }`}
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 20 20">
                    <rect x="2" y="3" width="4.5" height="14" rx="1" />
                    <rect x="7.75" y="3" width="4.5" height="14" rx="1" />
                    <rect x="13.5" y="3" width="4.5" height="14" rx="1" />
                  </svg>
                  <span className="hidden sm:inline">3 Cols</span>
                </button>

                <button
                  onClick={() => handleSetGridCols(4)}
                  title="4 Columns Product View (1 row 4 columns)"
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
                    gridCols === 4
                      ? 'bg-bk-red text-white shadow-sm'
                      : 'text-bk-charcoal/60 hover:text-bk-charcoal hover:bg-bk-cream'
                  }`}
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 20 20">
                    <rect x="1.5" y="3" width="3.25" height="14" rx="0.75" />
                    <rect x="6" y="3" width="3.25" height="14" rx="0.75" />
                    <rect x="10.5" y="3" width="3.25" height="14" rx="0.75" />
                    <rect x="15" y="3" width="3.25" height="14" rx="0.75" />
                  </svg>
                  <span className="hidden sm:inline">4 Cols</span>
                </button>
              </div>
            </div>

            {category.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <span className="text-4xl mb-3">🍽️</span>
                <p className="text-bk-charcoal/40 font-medium">No items in this category yet.</p>
              </div>
            ) : (
              <div className={gridClass}>
                {category.items.map((item) => (
                  <ItemCard key={item.id} item={item} onAdd={addToCart} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ItemCard({ item, onAdd, sub }) {
  const hasVariants = !!item.prices;
  const [variant, setVariant] = useState(hasVariants ? 'Normal' : null);
  const [addState, setAddState] = useState('idle'); // 'idle' | 'ring' | 'tick'
  const price = hasVariants ? item.prices[variant] : item.price;
  const isOutOfStock = item.status === 'Out of Stock';

  const handleAddClick = () => {
    if (isOutOfStock || addState !== 'idle') return;
    onAdd(item, variant, price);
    setAddState('ring');

    setTimeout(() => {
      setAddState('tick');
      setTimeout(() => {
        setAddState('idle');
      }, 350);
    }, 250);
  };

  return (
    <div className={`bg-white rounded-2xl border border-bk-gold/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col justify-between group ${
      isOutOfStock ? 'opacity-70 bg-gray-50' : ''
    }`}>
      <div>
        {/* Product Image Header */}
        {item.image ? (
          <div className="w-full h-36 overflow-hidden bg-bk-cream relative">
            <img
              src={item.image}
              alt={item.name}
              loading="eager"
              decoding="async"
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                isOutOfStock ? 'grayscale' : ''
              }`}
            />
            {sub && (
              <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-widest text-white bg-bk-charcoal/80 backdrop-blur-md px-2.5 py-1 rounded-full shadow">
                {sub}
              </span>
            )}
            {isOutOfStock && (
              <span className="absolute top-2.5 right-2.5 text-[10px] font-extrabold uppercase tracking-wider text-white bg-red-600 px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                <AlertCircle size={12} /> Out of Stock
              </span>
            )}
          </div>
        ) : (
          <div className="w-full h-24 bg-bk-gold/15 flex items-center justify-center relative">
            <span className="text-xl font-extrabold text-bk-gold-dark">BK</span>
            {sub && (
              <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-widest text-white bg-bk-charcoal/80 backdrop-blur-md px-2.5 py-1 rounded-full shadow">
                {sub}
              </span>
            )}
            {isOutOfStock && (
              <span className="absolute top-2.5 right-2.5 text-[10px] font-extrabold uppercase tracking-wider text-white bg-red-600 px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                <AlertCircle size={12} /> Out of Stock
              </span>
            )}
          </div>
        )}

        <div className="p-4">
          {!item.image && sub && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-bk-gold-dark bg-bk-gold/10 px-2 py-0.5 rounded-full mb-2 inline-block">
              {sub}
            </span>
          )}
          <h3 className="font-bold text-bk-charcoal leading-snug text-base hover:text-bk-red transition-colors" title={item.name}>
            {item.name}
          </h3>

          {hasVariants && (
            <div className="flex gap-1.5 mt-2.5 flex-wrap">
              {VARIANTS.map((v) => (
                <button
                  key={v}
                  disabled={isOutOfStock}
                  onClick={() => setVariant(v)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                    variant === v
                      ? 'bg-bk-gold text-bk-charcoal border-bk-gold-dark shadow-sm'
                      : 'bg-bk-cream border-bk-gold/40 text-bk-charcoal/70 hover:border-bk-gold'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center justify-between mt-1 h-12">
        <span className="text-xl font-extrabold text-bk-red">₹{price}</span>
        
        {/* Animated Shrink-to-Ring & Tick Add Button */}
        <button
          disabled={isOutOfStock}
          onClick={handleAddClick}
          title={isOutOfStock ? 'Item is out of stock' : 'Add item to order'}
          className={`flex items-center justify-center font-bold transition-all duration-300 ease-in-out shadow-md overflow-hidden ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none px-4 py-2 rounded-xl text-sm'
              : addState === 'idle'
              ? 'bg-bk-red hover:bg-bk-red-dark text-white active:scale-95 px-4 py-2 rounded-xl text-sm min-w-[76px] h-9'
              : addState === 'ring'
              ? 'bg-bk-red text-white rounded-full w-9 h-9 p-0 min-w-[36px] shadow-lg ring-2 ring-red-200'
              : 'bg-bk-red text-white rounded-full w-9 h-9 p-0 min-w-[36px] shadow-lg scale-105'
          }`}
        >
          {isOutOfStock ? (
            'Sold Out'
          ) : addState === 'ring' ? (
            /* Progress Spinner Ring (Matching 2nd Screenshot) */
            <svg className="w-5 h-5 animate-spin text-white shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-30" cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5" />
              <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : addState === 'tick' ? (
            /* Success Tick Checkmark */
            <Check size={18} strokeWidth={3.5} className="text-white shrink-0 animate-fadeSlideUp" />
          ) : (
            /* Standard Add Button Content */
            <span className="flex items-center gap-1.5 whitespace-nowrap animate-fadeSlideUp">
              <Plus size={16} strokeWidth={2.5} /> Add
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
