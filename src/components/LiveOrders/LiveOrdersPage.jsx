import RecentOrders from '../RecentOrders';

export default function LiveOrdersPage({ onViewOrder, onToggleSidebar, collapsed }) {
  return <RecentOrders onView={onViewOrder} onToggleSidebar={onToggleSidebar} collapsed={collapsed} />;
}
