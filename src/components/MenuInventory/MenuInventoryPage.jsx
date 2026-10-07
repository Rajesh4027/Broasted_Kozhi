import { useState, useRef } from 'react';
import { useBilling } from '../../context/BillingContext';
import {
  UtensilsCrossed,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  X,
  Upload,
  Image as ImageIcon,
  Tag,
  FolderCog,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  TrendingUp,
  Menu,
} from 'lucide-react';

/* ─── ROW HEIGHT constant — used to cap the visible area at 5 rows ─── */
const ROW_HEIGHT_PX = 72; // matches the actual rendered row height (py-4 + image = ~72px)
const VISIBLE_ROWS = 5;
const TABLE_BODY_MAX_H = ROW_HEIGHT_PX * VISIBLE_ROWS; // 360px

export default function MenuInventoryPage({ onToggleSidebar, collapsed }) {
  const {
    categories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemStatus,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useBilling();

  const categoryScrollRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Modal states
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState(null);

  // Item form
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    isVariantPrice: false,
    price: '',
    priceNormal: '',
    priceNashville: '',
    priceKorean: '',
    image: '',
    status: 'Available',
  });
  const [deleteConfirmItemId, setDeleteConfirmItemId] = useState(null);

  const menuCategories = categories && categories.length > 0 ? categories : [];

  const allItems = menuCategories.flatMap((c) =>
    c.items.map((item) => ({ ...item, categoryName: c.name, categoryId: c.id }))
  );

  const inStockCount = allItems.filter((i) => (i.status || 'Available') === 'Available').length;
  const outOfStockCount = allItems.length - inStockCount;

  const filteredItems = allItems.filter((item) => {
    const matchesCat = selectedCat === 'all' || item.categoryId === selectedCat;
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  /* ─── Handlers ─── */
  const handleOpenCreateItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      categoryId: selectedCat !== 'all' ? selectedCat : (menuCategories[0]?.id || ''),
      isVariantPrice: false,
      price: '99',
      priceNormal: '99',
      priceNashville: '119',
      priceKorean: '119',
      image: '',
      status: 'Available',
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item) => {
    setEditingItem(item);
    const hasVariants = !!item.prices;
    setFormData({
      name: item.name || '',
      categoryId: item.categoryId || menuCategories[0]?.id || '',
      isVariantPrice: hasVariants,
      price: item.price ? String(item.price) : '99',
      priceNormal: item.prices?.Normal ? String(item.prices.Normal) : '99',
      priceNashville: item.prices?.Nashville ? String(item.prices.Nashville) : '119',
      priceKorean: item.prices?.Korean ? String(item.prices.Korean) : '119',
      image: item.image || '',
      status: item.status || 'Available',
    });
    setIsItemModalOpen(true);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const createdId = addCategory(newCatName);
    if (createdId) setSelectedCat(createdId);
    setNewCatName('');
  };

  const handleRenameCategory = (catId) => {
    if (!editingCatName.trim()) return;
    updateCategory(catId, editingCatName);
    setEditingCatId(null);
    setEditingCatName('');
  };

  const handleDeleteCategory = (catId) => {
    deleteCategory(catId);
    if (selectedCat === catId) setSelectedCat('all');
    setConfirmDeleteCatId(null);
  };

  const handleSubmitItem = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const priceObj = formData.isVariantPrice
      ? {
        Normal: Number(formData.priceNormal) || 0,
        Nashville: Number(formData.priceNashville) || 0,
        Korean: Number(formData.priceKorean) || 0,
      }
      : null;

    const payload = {
      name: formData.name.trim(),
      image: formData.image.trim(),
      status: formData.status,
      ...(formData.isVariantPrice
        ? { prices: priceObj, price: undefined }
        : { price: Number(formData.price) || 0, prices: undefined }),
    };

    if (editingItem) {
      updateMenuItem(editingItem.id, payload, formData.categoryId);
    } else {
      addMenuItem(formData.categoryId, { id: `custom-${Date.now()}`, ...payload });
    }
    setIsItemModalOpen(false);
  };

  const handleDeleteItem = (itemId) => {
    deleteMenuItem(itemId);
    setDeleteConfirmItemId(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData((prev) => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-bk-cream p-3 sm:p-6 flex flex-col gap-4 sm:gap-6">

      {/* ── Top Header Card ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-bk-gold/30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex md:hidden p-2 sm:p-2.5 rounded-[10px] bg-[#282828] hover:bg-black text-white transition-all duration-200 active:scale-95 shadow-sm shrink-0 items-center justify-center border border-bk-gold/20"
            title="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-bk-charcoal flex items-center gap-2.5">
              <UtensilsCrossed size={24} className="text-bk-red shrink-0" />
              Menu &amp; Inventory
            </h1>
            <p className="text-xs text-bk-charcoal/60 mt-1">
              Manage food categories, items, pricing variants, images and availability.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setIsCatManagerOpen(true)}
            title="Manage Categories"
            className="flex items-center justify-center gap-2 bg-bk-charcoal hover:bg-black text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 sm:px-5 rounded-xl shadow-md transition active:scale-95 shrink-0"
          >
            <FolderCog size={18} className="shrink-0" />
            <span className="hidden lg:inline">Manage Categories</span>
          </button>
          <button
            onClick={handleOpenCreateItem}
            title="Add New Item"
            className="flex items-center justify-center gap-2 bg-bk-red hover:bg-bk-red-dark text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 sm:px-5 rounded-xl shadow-md transition active:scale-95 shrink-0"
          >
            <Plus size={18} className="shrink-0" />
            <span className="hidden lg:inline">+ Add New Item</span>
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 shrink-0">
        <div className="bg-white p-2.5 sm:p-5 rounded-2xl border border-bk-gold/30 shadow-sm flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">Total Items</p>
            <h3 className="text-sm sm:text-2xl font-black text-bk-charcoal mt-0.5">{allItems.length}</h3>
          </div>
          <div className="p-1.5 sm:p-3 bg-red-50 text-bk-red rounded-xl shrink-0 ml-1">
            <PackageCheck size={18} className="sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-5 rounded-2xl border border-bk-gold/30 shadow-sm flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">Categories</p>
            <h3 className="text-sm sm:text-2xl font-black text-bk-charcoal mt-0.5">{menuCategories.length}</h3>
          </div>
          <div className="p-1.5 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 ml-1">
            <Layers size={18} className="sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-5 rounded-2xl border border-bk-gold/30 shadow-sm flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">In Stock</p>
            <h3 className="text-sm sm:text-2xl font-black text-emerald-600 mt-0.5">
              {inStockCount} <span className="text-[9px] sm:text-xs font-semibold text-gray-400 block sm:inline">({outOfStockCount} out)</span>
            </h3>
          </div>
          <div className="p-1.5 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 ml-1">
            <TrendingUp size={18} className="sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* ── Search + Category Filter ── */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-bk-gold/30 shadow-sm shrink-0 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Search */}
        <div className="relative w-full md:w-64 lg:w-80 shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items…"
            className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red transition font-medium text-bk-charcoal placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-bk-red transition"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills (scrollable) */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <button
            onClick={() => categoryScrollRef.current?.scrollBy({ left: -160, behavior: 'smooth' })}
            className="p-1 rounded-lg text-bk-charcoal/40 hover:text-bk-red hover:bg-red-50 transition shrink-0"
          >
            <ChevronLeft size={16} />
          </button>

          <div
            ref={categoryScrollRef}
            className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1"
          >
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold shrink-0 transition-all duration-200 ${
                selectedCat === 'all'
                  ? 'bg-bk-charcoal text-white shadow-sm'
                  : 'bg-bk-cream text-bk-charcoal/60 border border-bk-gold/40 hover:bg-bk-gold/15'
              }`}
            >
              All ({allItems.length})
            </button>
            {menuCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold shrink-0 transition-all duration-200 ${
                  selectedCat === c.id
                    ? 'bg-bk-red text-white shadow-sm'
                    : 'bg-bk-cream text-bk-charcoal/60 border border-bk-gold/40 hover:bg-bk-gold/15'
                }`}
              >
                {c.name} ({c.items.length})
              </button>
            ))}
          </div>

          <button
            onClick={() => categoryScrollRef.current?.scrollBy({ left: 160, behavior: 'smooth' })}
            className="p-1 rounded-lg text-bk-charcoal/40 hover:text-bk-red hover:bg-red-50 transition shrink-0"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Result count */}
        <span className="text-[11px] text-bk-charcoal/50 font-semibold shrink-0 self-end md:self-center">
          {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Product Table — scrollable body, 5 rows visible ── */}
      <div className="rounded-2xl border border-bk-gold/30 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <div className="min-w-[650px]">

          {/* Table HEAD — sticky */}
          <div className="grid grid-cols-[2.4fr_1fr_1fr_1fr_0.8fr] bg-[#fdf8f0] border-b border-bk-gold/30 px-5 py-3 shrink-0">
            {['Product Details', 'Category', 'Price / Variants', 'Stock Status', 'Actions'].map((h, i) => (
              <span
                key={h}
                className={`text-[10px] font-extrabold uppercase tracking-widest text-bk-charcoal/50 ${i === 4 ? 'text-right' : ''
                  }`}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Table BODY — fixed height, hover-to-scroll */}
          <div
            className="overflow-y-auto divide-y divide-gray-100/80 inventory-scroll"
            style={{ maxHeight: `${TABLE_BODY_MAX_H}px` }}
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const isAvailable = (item.status || 'Available') === 'Available';
                const displayPrice = item.prices
                  ? `₹${item.prices.Normal} – ₹${item.prices.Korean}`
                  : `₹${item.price}`;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[2.4fr_1fr_1fr_1fr_0.8fr] items-center px-5 py-3 hover:bg-amber-50/60 transition-colors duration-150 group animate-fadeSlideUp"
                    style={{ animationDelay: `${Math.min(idx, 10) * 30}ms`, minHeight: `${ROW_HEIGHT_PX}px` }}
                  >
                    {/* ── Product Details ── */}
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="eager"
                          decoding="async"
                          className={`w-11 h-11 rounded-xl object-cover shrink-0 border border-bk-gold/30 shadow-sm ${!isAvailable ? 'grayscale opacity-50' : ''
                            }`}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-bk-gold/20 flex items-center justify-center font-black text-bk-gold-dark text-xs shrink-0 border border-bk-gold/20">
                          BK
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={`font-extrabold text-sm leading-snug break-words ${isAvailable ? 'text-bk-charcoal' : 'text-gray-400'}`}>
                          {item.name}
                        </p>
                        {item.prices && (
                          <span className="text-[10px] text-gray-400 font-semibold">
                            3 Variants (Normal, Nashville, Korean)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── Category ── */}
                    <div>
                      <span className="inline-block bg-bk-gold/15 text-bk-gold-dark text-[11px] font-extrabold px-3 py-1 rounded-full">
                        {item.categoryName}
                      </span>
                    </div>

                    {/* ── Price ── */}
                    <div>
                      <span className="font-black text-bk-red text-sm">{displayPrice}</span>
                    </div>

                    {/* ── Stock Status ── */}
                    <div>
                      <button
                        onClick={() => toggleItemStatus(item.id)}
                        title="Click to toggle availability"
                        className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer active:scale-95 ${isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400'
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-400'
                          }`}
                      >
                        {isAvailable ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {isAvailable ? 'Available' : 'Out of Stock'}
                      </button>
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditItem(item)}
                        className="p-2 text-gray-400 hover:text-bk-red hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100"
                        title="Edit Item"
                      >
                        <Edit2 size={15} />
                      </button>

                      {deleteConfirmItemId === item.id ? (
                        <div className="flex items-center gap-1 animate-fadeSlideUp">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-[10px] font-extrabold bg-bk-red text-white px-2 py-1 rounded-lg hover:bg-bk-red-dark"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmItemId(null)}
                            className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmItemId(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Delete Item"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-bk-gold/10 flex items-center justify-center mb-4">
                  <UtensilsCrossed size={28} className="text-bk-gold/60" />
                </div>
                <p className="font-bold text-bk-charcoal/50 text-sm mb-1">No items found</p>
                <p className="text-xs text-gray-400 mb-4">
                  {query ? `No results for "${query}"` : 'This category has no items yet'}
                </p>
                <button
                  onClick={handleOpenCreateItem}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-bk-red hover:underline"
                >
                  <Plus size={14} /> Add the first item
                </button>
              </div>
            )}
          </div>

          {/* Scroll hint — shown only when items overflow */}
          {filteredItems.length > VISIBLE_ROWS && (
            <div className="border-t border-bk-gold/20 bg-[#fdf8f0] px-5 py-2 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-bk-charcoal/40 font-semibold">
                Showing {VISIBLE_ROWS} of {filteredItems.length} items — scroll to see more
              </span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-bk-red/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-bk-red/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-bk-red/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* ══════════════════════════════════════════
          MODAL 1 — Manage Categories
      ══════════════════════════════════════════ */}
      {isCatManagerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsCatManagerOpen(false)}>
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-white/20 animate-fadeSlideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-bk-gold/30 flex items-center justify-between bg-bk-cream">
              <h3 className="font-extrabold text-bk-charcoal text-base flex items-center gap-2">
                <FolderCog size={20} className="text-bk-red" />
                Manage Menu Categories
              </h3>
              <button
                onClick={() => setIsCatManagerOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-bk-charcoal hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Add category */}
              <form onSubmit={handleSaveCategory} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="New category name (e.g. Ice Cream)…"
                  className="flex-1 px-3.5 py-2 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red transition font-medium"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-bk-red hover:bg-bk-red-dark text-white rounded-xl text-xs font-extrabold shadow transition shrink-0 flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </form>

              {/* Existing categories */}
              <div className="border-t border-gray-100 pt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
                <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider mb-2">
                  Existing ({menuCategories.length})
                </p>
                {menuCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-bk-cream/70 border border-bk-gold/30 hover:border-bk-gold transition"
                  >
                    {editingCatId === cat.id ? (
                      <div className="flex-1 flex gap-2 items-center mr-2">
                        <input
                          type="text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs bg-white rounded-lg border border-bk-red outline-none font-bold text-bk-charcoal"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRenameCategory(cat.id)}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="p-1.5 bg-gray-200 text-gray-700 rounded-lg"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-bk-charcoal">{cat.name}</span>
                        <span className="text-[11px] text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                          {cat.items.length} items
                        </span>
                      </div>
                    )}

                    {editingCatId !== cat.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }}
                          className="p-1.5 text-gray-400 hover:text-bk-red hover:bg-white rounded-lg transition"
                        >
                          <Edit2 size={13} />
                        </button>
                        {confirmDeleteCatId === cat.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="text-[10px] font-extrabold bg-red-600 text-white px-2 py-1 rounded-md"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteCatId(null)}
                              className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-1 rounded-md"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteCatId(cat.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL 2 — Add / Edit Item
      ══════════════════════════════════════════ */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsItemModalOpen(false)}>
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/20 animate-fadeSlideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-bk-gold/30 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #2A1B1B 0%, #3d2020 100%)' }}
            >
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Tag size={18} className="text-bk-gold" />
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitItem} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Product Name */}
              <div>
                <label className="text-[11px] font-extrabold text-bk-charcoal/70 uppercase tracking-wider block mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Special Fried Chicken Wings"
                  className="w-full px-4 py-3 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red transition font-semibold text-bk-charcoal"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[11px] font-extrabold text-bk-charcoal/70 uppercase tracking-wider block mb-1.5">
                  Menu Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                  className="w-full px-4 py-3 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red transition font-semibold text-bk-charcoal"
                >
                  {menuCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Pricing Mode */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-extrabold text-bk-charcoal/70 uppercase tracking-wider">
                    Pricing Mode
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-bk-red cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVariantPrice}
                      onChange={(e) => setFormData((p) => ({ ...p, isVariantPrice: e.target.checked }))}
                      className="accent-bk-red w-4 h-4 rounded"
                    />
                    Variant Prices (Normal, Nashville, Korean)
                  </label>
                </div>

                {formData.isVariantPrice ? (
                  <div className="grid grid-cols-3 gap-2 bg-bk-cream p-3 rounded-xl border border-bk-gold/30">
                    {[
                      { label: 'Normal ₹', key: 'priceNormal' },
                      { label: 'Nashville ₹', key: 'priceNashville' },
                      { label: 'Korean ₹', key: 'priceKorean' },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">{label}</label>
                        <input
                          type="number"
                          value={formData[key]}
                          onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-sm bg-white rounded-lg border border-bk-gold/40 outline-none font-extrabold text-bk-red"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                    placeholder="Price in ₹"
                    className="w-full px-4 py-3 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red transition font-extrabold text-bk-red"
                  />
                )}
              </div>

              {/* Image */}
              <div>
                <label className="text-[11px] font-extrabold text-bk-charcoal/70 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                  <span>Product Image</span>
                  <span className="text-[10px] text-gray-400 font-normal normal-case">URL or file upload</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData((p) => ({ ...p, image: e.target.value }))}
                      placeholder="Paste image URL…"
                      className="w-full pl-9 pr-3 py-3 text-xs bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red transition font-medium"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 px-3.5 py-2 bg-bk-charcoal hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 transition">
                    <Upload size={14} /> Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-2.5 flex items-center gap-3 p-2.5 bg-bk-cream rounded-xl border border-bk-gold/30">
                    <img src={formData.image} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-white" />
                    <span className="text-xs font-bold text-emerald-600">✓ Image ready</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="text-[11px] font-extrabold text-bk-charcoal/70 uppercase tracking-wider block mb-2">
                  Availability
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Available', 'Out of Stock'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, status: s }))}
                      className={`py-2.5 text-xs font-extrabold rounded-xl border transition ${formData.status === s
                        ? s === 'Available'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                          : 'bg-red-600 text-white border-red-600 shadow'
                        : 'bg-bk-cream text-gray-600 border-bk-gold/40'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-bk-red hover:bg-bk-red-dark text-white rounded-xl text-xs font-extrabold shadow-md transition"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
