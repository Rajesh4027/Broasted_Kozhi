import RecentOrders from '../RecentOrders';

export default function LiveOrdersPage({ onViewOrder, onToggleSidebar, collapsed, onEditOrder }) {
  return <RecentOrders onView={onViewOrder} onToggleSidebar={onToggleSidebar} collapsed={collapsed} onEditOrder={onEditOrder} />;
}
