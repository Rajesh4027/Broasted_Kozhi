import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Store,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  SlidersHorizontal,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Drumstick,
  Bird,
  Sandwich,
  ScrollText,
  Zap,
  CupSoda,
  Wine
} from 'lucide-react';
import { useBilling } from '../../context/BillingContext';
import logo2 from '../../assets/Logo/Logo_2.png';

const CATEGORY_ICONS = {
  'bk-starters': <Flame size={14} className="shrink-0" />,
  'fried-chicken': <Drumstick size={14} className="shrink-0" />,
  'special-fried-bird': <Bird size={14} className="shrink-0" />,
  'burgers': <Sandwich size={14} className="shrink-0" />,
  'wraps': <ScrollText size={14} className="shrink-0" />,
  'loaded-fries': <Zap size={14} className="shrink-0" />,
  'momos': <UtensilsCrossed size={14} className="shrink-0" />,
  'milkshakes': <CupSoda size={14} className="shrink-0" />,
  'mocktails': <Wine size={14} className="shrink-0" />,
};

export default function Sidebar({
  collapsed,
  onToggle,
  activeView,
  setActiveView,
  activeCategory,
  setActiveCategory
}) {
  const { categories } = useBilling();
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard (Analytics)', icon: TrendingUp },
    { id: 'billing', label: 'Billing & POS', icon: Store, hasSub: true },
    { id: 'orders', label: 'Live Orders', icon: ShoppingBag },
    { id: 'menu', label: 'Menu & Inventory', icon: UtensilsCrossed },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
  ];

  const handleNavClick = (id) => {
    setActiveView(id);
    if (id === 'billing') {
      setCategoriesExpanded(true);
    }
    // On mobile view, automatically hide sidebar drawer after selecting any tab
    if (isMobile || window.innerWidth < 768) {
      onToggle?.();
    }
  };

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    // On mobile view, automatically hide sidebar drawer after selecting any category
    if (isMobile || window.innerWidth < 768) {
      onToggle?.();
    }
  };

  const liveCategories = categories && categories.length > 0 ? categories : [];

  // Determine if full layout text is visible
  const showTextLabels = isMobile ? !collapsed : !collapsed;

  return (
    <>
      {/* Mobile Dark Backdrop Overlay with Blur */}
      {isMobile && !collapsed && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-fadeSlideUp cursor-pointer"
          title="Click to close sidebar"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`h-screen bg-[#282828] text-[#e0e0e0] flex flex-col transition-all duration-300 select-none border-r border-[#383838] z-50 ${
          isMobile
            ? `fixed inset-y-0 left-0 w-[260px] shadow-2xl ${
                collapsed ? '-translate-x-full pointer-events-none' : 'translate-x-0'
              }`
            : `relative shrink-0 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-[#383838] shrink-0 px-3 flex items-center justify-between">
          {!collapsed ? (
            /* ── Expanded State ── */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={logo2}
                  alt="BK Logo"
                  className="h-10 w-auto object-contain rounded-md shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-extrabold text-white tracking-wide text-sm leading-tight whitespace-nowrap">
                    Broasted Kozhi
                  </span>
                  <span className="text-[10px] text-bk-gold font-medium tracking-wider uppercase whitespace-nowrap">
                    POS &amp; Admin
                  </span>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#363636] transition-all duration-200 shrink-0"
                title="Minimize Sidebar"
              >
                <ChevronLeft size={22} />
              </button>
            </div>
          ) : (
            /* ── Collapsed State ── */
            <div className="w-full h-full p-1.5 flex items-center justify-center">
              <button
                onClick={onToggle}
                className="w-full h-full flex items-center justify-center relative group transition-all duration-300"
                title="Expand Sidebar"
              >
                {/* Default: Logo_2.png centered */}
                <img
                  src={logo2}
                  alt="BK Logo"
                  className="h-10 w-auto object-contain rounded-md transition-all duration-300 group-hover:scale-0 group-hover:opacity-0"
                />
                {/* Hover: White Circle Badge with Black ChevronRight Arrow */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-white text-black shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <ChevronRight size={20} className="stroke-[3] text-black ml-0.5" />
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Navigation List — scrollable */}
        <div className="flex-1 overflow-y-auto py-3 space-y-0.5 min-h-0">
          {NAV_ITEMS.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeView === item.id;
            const showSub = showTextLabels && item.id === 'billing' && isActive && categoriesExpanded;

            return (
              <div key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-3 py-3 px-4 text-sm font-medium transition-all duration-200 border-l-[4px] ${
                    isActive
                      ? 'bg-[#333333] text-white border-bk-red font-semibold'
                      : 'border-transparent text-[#b0b0b0] hover:text-white hover:bg-[#2e2e2e]'
                  } ${!showTextLabels ? 'justify-center px-0' : ''}`}
                >
                  <IconComponent
                    size={20}
                    className={`shrink-0 ${
                      isActive ? 'text-bk-gold' : 'text-gray-400'
                    }`}
                  />

                  {showTextLabels && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {showTextLabels && item.hasSub && isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoriesExpanded((v) => !v);
                      }}
                      className="p-1 text-gray-400 hover:text-white shrink-0"
                    >
                      {categoriesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  )}
                </button>

                {/* Sub-categories for Billing view */}
                {showSub && liveCategories.length > 0 && (
                  <div className="bg-[#202020]/70 border-y border-[#333333]/50 animate-fadeSlideUp">
                    <p className="text-[10px] uppercase font-bold text-bk-gold/80 tracking-widest pt-2 pb-1 px-4 ml-5">
                      Menu Categories
                    </p>
                    <div
                      className="max-h-[240px] overflow-y-auto pl-9 pr-3 pb-2 space-y-0.5"
                      style={{ scrollbarWidth: 'thin', scrollbarColor: '#E4212B #333' }}
                    >
                      {liveCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                            activeCategory === cat.id
                              ? 'bg-bk-red text-white font-bold shadow'
                              : 'text-[#a0a0a0] hover:text-white hover:bg-[#333333]'
                          }`}
                        >
                          {CATEGORY_ICONS[cat.id] ?? <Drumstick size={14} className="shrink-0" />}
                          <span className="truncate">{cat.name}</span>
                          <span className="ml-auto text-[10px] opacity-50 shrink-0">{cat.items.length}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer System Info */}
        {showTextLabels && (
          <div className="p-3 border-t border-[#383838] bg-[#222222] text-[11px] text-gray-400 flex items-center justify-between shrink-0">
            <span className="font-semibold text-gray-300">BK POS v1.0</span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
        )}
      </aside>
    </>
  );
}
