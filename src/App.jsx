import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ItemsGrid from './components/ItemsGrid';
import CartPanel from './components/CartPanel';
import InvoiceModal from './components/InvoiceModal';
import LiveOrdersPage from './components/LiveOrders/LiveOrdersPage';
import MenuInventoryPage from './components/MenuInventory/MenuInventoryPage';
import StaffManagementPage from './components/StaffManagement/StaffManagementPage';
import SettingsPage from './components/Settings/SettingsPage';
import LoginPage from './components/LoginPage';
import DashboardPage from './Dashboard/DashboardPage';
import UpdateNotification from './components/UpdateNotification';
import { BillingProvider, useBilling } from './context/BillingContext';
import { CATEGORIES } from './data/menuData';

function AppShell({ onLogout }) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768);
  const [activeView, setActiveView] = useState('billing'); // 'dashboard' | 'billing' | 'orders' | 'menu' | 'staff' | 'settings'
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const { finalizeOrder, clearCart } = useBilling();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGenerateInvoice = (meta) => {
    const order = finalizeOrder(meta);
    setInvoiceOrder(order);
    clearCart();
  };

  const handleToggleSidebar = () => {
    setCollapsed((v) => !v);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bk-cream relative">
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggleSidebar}
        activeView={activeView}
        setActiveView={setActiveView}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {activeView === 'dashboard' && (
        <DashboardPage
          onViewOrder={setInvoiceOrder}
          onToggleSidebar={handleToggleSidebar}
          collapsed={collapsed}
        />
      )}

      {activeView === 'billing' && (
        <>
          <ItemsGrid
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            onLogout={onLogout}
            onToggleSidebar={handleToggleSidebar}
            collapsed={collapsed}
          />
          <CartPanel onGenerateInvoice={handleGenerateInvoice} />
        </>
      )}

      {activeView === 'orders' && (
        <LiveOrdersPage
          onViewOrder={setInvoiceOrder}
          onToggleSidebar={handleToggleSidebar}
          collapsed={collapsed}
        />
      )}

      {activeView === 'menu' && (
        <MenuInventoryPage
          onToggleSidebar={handleToggleSidebar}
          collapsed={collapsed}
        />
      )}

      {activeView === 'staff' && (
        <StaffManagementPage
          onToggleSidebar={handleToggleSidebar}
          collapsed={collapsed}
        />
      )}

      {activeView === 'settings' && (
        <SettingsPage
          onToggleSidebar={handleToggleSidebar}
          collapsed={collapsed}
        />
      )}

      {invoiceOrder && (
        <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('bk_auth') === '1');

  const handleLogout = () => {
    localStorage.removeItem('bk_auth');
    setAuthed(false);
  };

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />;
  }

  return (
    <BillingProvider>
      <UpdateNotification />
      <AppShell onLogout={handleLogout} />
    </BillingProvider>
  );
}
