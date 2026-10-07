import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CATEGORIES as INITIAL_CATEGORIES } from '../data/menuData';

const BillingContext = createContext(null);

const ORDERS_KEY = 'bk_orders_v1';
const COUNTER_KEY = 'bk_invoice_counter_v1';
const SETTINGS_KEY = 'bk_settings_v1';
const MENU_KEY = 'bk_menu_categories_v1';
const STAFF_KEY = 'bk_staff_list_v1';

export const INITIAL_STAFF = [
  { id: 'st-1', name: 'Admin Manager', role: 'Store Manager', shift: 'Morning Shift', status: 'Active', phone: '9865644549', email: 'admin@brostedkozhi.com', ordersHandled: 142 },
  { id: 'st-2', name: 'Rahul Sharma', role: 'Head Cashier', shift: 'Morning Shift', status: 'Active', phone: '9876543210', email: 'rahul@brostedkozhi.com', ordersHandled: 89 },
  { id: 'st-3', name: 'Priya Verma', role: 'Counter Assistant', shift: 'Evening Shift', status: 'On Leave', phone: '9845123789', email: 'priya@brostedkozhi.com', ordersHandled: 54 },
  { id: 'st-4', name: 'Vikram Singh', role: 'Kitchen Chief', shift: 'All Day', status: 'Active', phone: '9789012345', email: 'vikram@brostedkozhi.com', ordersHandled: 210 },
];

function loadStaff() {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    return raw ? JSON.parse(raw) : INITIAL_STAFF;
  } catch {
    return INITIAL_STAFF;
  }
}

export const DEFAULT_SETTINGS = {
  storeName: 'Broasted Kozhi',
  address: `Door No. 102, Old Post Office Odai Street,
Dhanamallam Nadanam
Near Anantha Mahal,
Landmark: Mani Melai Departmental Store,
Theni – 625 531,
Theni (Dt).`,
  phone: '7358967717',
  billTitle: 'Bill of Supply',
  currencySymbol: '₹',
  footerNote: 'Thank you for visiting Broasted Kozhi! Come back soon!',
};

function loadOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function loadCategories() {
  try {
    const raw = localStorage.getItem(MENU_KEY);
    if (!raw) return INITIAL_CATEGORIES;
    const saved = JSON.parse(raw);

    const initCatMap = new Map();
    const initItemMap = new Map();

    INITIAL_CATEGORIES.forEach((c) => {
      initCatMap.set(c.id, c);
      (c.items || []).forEach((i) => initItemMap.set(i.id, i));
    });

    return saved.map((cat) => {
      const initCat = initCatMap.get(cat.id);
      const isCustomCatImg = cat.image && (cat.image.startsWith('data:') || cat.image.startsWith('http://') || cat.image.startsWith('https://'));
      const catImage = isCustomCatImg ? cat.image : (initCat ? initCat.image : cat.image);

      const items = (cat.items || []).map((item) => {
        const initItem = initItemMap.get(item.id);
        const isCustomItemImg = item.image && (item.image.startsWith('data:') || item.image.startsWith('http://') || item.image.startsWith('https://'));
        const itemImage = isCustomItemImg ? item.image : (initItem ? initItem.image : item.image);

        return {
          ...item,
          image: itemImage,
        };
      });

      return {
        ...cat,
        image: catImage,
        items,
      };
    });
  } catch {
    return INITIAL_CATEGORIES;
  }
}

function getNextInvoiceNo(existingOrders) {
  if (!existingOrders || existingOrders.length === 0) {
    return 1;
  }
  const maxInvoice = Math.max(...existingOrders.map((o) => Number(o.invoiceNo) || 0));
  return maxInvoice > 0 ? maxInvoice + 1 : 1;
}

export function BillingProvider({ children }) {
  const [cart, setCart] = useState([]); // { key, name, variant, unitPrice, qty }
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState(loadOrders);
  const [storeSettings, setStoreSettings] = useState(loadSettings);
  const [categories, setCategories] = useState(loadCategories);
  const [staffList, setStaffList] = useState(loadStaff);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    if (window.electronAPI?.writeFileData) {
      window.electronAPI.writeFileData('orders.json', orders);
    }
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(storeSettings));
    if (window.electronAPI?.writeFileData) {
      window.electronAPI.writeFileData('settings.json', storeSettings);
    }
  }, [storeSettings]);

  useEffect(() => {
    localStorage.setItem(MENU_KEY, JSON.stringify(categories));
    if (window.electronAPI?.writeFileData) {
      window.electronAPI.writeFileData('menu.json', categories);
    }
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STAFF_KEY, JSON.stringify(staffList));
    if (window.electronAPI?.writeFileData) {
      window.electronAPI.writeFileData('staff.json', staffList);
    }
  }, [staffList]);

  const addStaffMember = useCallback((newStaff) => {
    const staffObj = {
      id: `st-${Date.now()}`,
      name: newStaff.name,
      role: newStaff.role || 'Counter Assistant',
      shift: newStaff.shift || 'Morning Shift',
      status: newStaff.status || 'Active',
      phone: newStaff.phone || '',
      email: newStaff.email || '',
      ordersHandled: 0,
      createdAt: new Date().toISOString()
    };
    setStaffList((prev) => [staffObj, ...prev]);
  }, []);

  const updateStaffMember = useCallback((id, updatedFields) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
  }, []);

  const deleteStaffMember = useCallback((id) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggleStaffStatus = useCallback((id) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'Active' ? 'On Leave' : 'Active';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  }, []);

  const exportBackup = useCallback(async () => {
    const backupObj = {
      appName: 'Brosted Kozhi Billing',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      orders,
      storeSettings,
      categories
    };

    if (window.electronAPI?.exportBackup) {
      return await window.electronAPI.exportBackup(backupObj);
    } else {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `BrostedKozhi_Backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return { success: true };
    }
  }, [orders, storeSettings, categories]);

  const importBackup = useCallback(async () => {
    let imported = null;
    if (window.electronAPI?.importBackup) {
      imported = await window.electronAPI.importBackup();
    }
    if (imported) {
      if (Array.isArray(imported.orders)) setOrders(imported.orders);
      if (imported.storeSettings) setStoreSettings((prev) => ({ ...prev, ...imported.storeSettings }));
      if (Array.isArray(imported.categories)) setCategories(imported.categories);
      return true;
    }
    return false;
  }, []);

  const updateStoreSettings = useCallback((newSettings) => {
    setStoreSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // ── Menu CRUD operations ──
  const addMenuItem = useCallback((categoryId, newItem) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          return { ...cat, items: [newItem, ...cat.items] };
        }
        return cat;
      })
    );
  }, []);

  const updateMenuItem = useCallback((itemId, updatedData, targetCategoryId) => {
    setCategories((prev) => {
      // If category didn't change, update item in place
      let itemToUpdate = null;
      prev.forEach((cat) => {
        const found = cat.items.find((i) => i.id === itemId);
        if (found) itemToUpdate = { ...found, ...updatedData };
      });

      if (!itemToUpdate) return prev;

      // Clean item out of old category and put in target category
      return prev.map((cat) => {
        const isTarget = cat.id === targetCategoryId;
        const filteredItems = cat.items.filter((i) => i.id !== itemId);
        if (isTarget) {
          return { ...cat, items: [itemToUpdate, ...filteredItems] };
        }
        return { ...cat, items: filteredItems };
      });
    });
  }, []);

  const deleteMenuItem = useCallback((itemId) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.id !== itemId),
      }))
    );
  }, []);

  const toggleItemStatus = useCallback((itemId) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => {
          if (item.id === itemId) {
            const currentStatus = item.status || 'Available';
            const newStatus = currentStatus === 'Available' ? 'Out of Stock' : 'Available';
            return { ...item, status: newStatus };
          }
          return item;
        }),
      }))
    );
  }, []);

  const addCategory = useCallback((categoryName) => {
    if (!categoryName.trim()) return null;
    const name = categoryName.trim();
    const newId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;

    setCategories((prev) => {
      if (prev.some((c) => c.id === newId)) return prev;
      return [...prev, { id: newId, name, items: [] }];
    });
    return newId;
  }, []);

  const updateCategory = useCallback((categoryId, newName) => {
    if (!newName.trim()) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, name: newName.trim() } : c))
    );
  }, []);

  const deleteCategory = useCallback((categoryId) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  }, []);

  const addToCart = useCallback((item, variant, price) => {
    const key = `${item.id}__${variant || 'flat'}`;
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key);
      if (existing) {
        return prev.map((c) => (c.key === key ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { key, name: item.name, variant: variant || null, unitPrice: price, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((key, qty) => {
    setCart((prev) => {
      if (qty <= 0) return prev.filter((c) => c.key !== key);
      return prev.map((c) => (c.key === key ? { ...c, qty } : c));
    });
  }, []);

  const removeFromCart = useCallback((key) => {
    setCart((prev) => prev.filter((c) => c.key !== key));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const finalizeOrder = useCallback(
    ({ paymentMode, customerName, customerPhone }) => {
      const invoiceNo = getNextInvoiceNo(orders);
      const now = new Date();
      const order = {
        invoiceNo,
        date: now.toISOString(),
        paymentMode: paymentMode || 'Cash',
        customerName: customerName || '',
        customerPhone: customerPhone || '',
        items: cart.map((c) => ({ ...c })),
        subtotal: cartTotal,
        total: cartTotal,
      };
      setOrders((prev) => [order, ...prev]);
      localStorage.setItem(COUNTER_KEY, String(invoiceNo));
      return order;
    },
    [cart, cartTotal, orders]
  );

  const deleteOrder = useCallback((invoiceNo) => {
    setOrders((prev) => {
      const remaining = prev.filter((o) => o.invoiceNo !== invoiceNo);
      const maxInvoice = remaining.length > 0 ? Math.max(...remaining.map((o) => Number(o.invoiceNo) || 0)) : 0;
      localStorage.setItem(COUNTER_KEY, String(maxInvoice));
      return remaining;
    });
  }, []);

  const value = {
    cart,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    orders,
    finalizeOrder,
    deleteOrder,
    storeSettings,
    updateStoreSettings,
    categories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemStatus,
    addCategory,
    updateCategory,
    deleteCategory,
    exportBackup,
    importBackup,
    staffList,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    toggleStaffStatus,
  };

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling() {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error('useBilling must be used within BillingProvider');
  return ctx;
}
