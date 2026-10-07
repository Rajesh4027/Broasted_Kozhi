import { useState } from 'react';
import { useBilling } from '../../context/BillingContext';
import { Users, UserPlus, Shield, CheckCircle, Clock, Search, Menu, Edit3, Trash2, Phone, Mail, UserCheck, UserX, X, AlertTriangle, Filter } from 'lucide-react';

export default function StaffManagementPage({ onToggleSidebar, collapsed }) {
  const { staffList, addStaffMember, updateStaffMember, deleteStaffMember, toggleStaffStatus } = useBilling();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Active' | 'On Leave' | 'Managers' | 'Cashiers'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null); // null for Add, staff object for Edit
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState(null); // staff object to delete

  // Form State
  const [form, setForm] = useState({
    name: '',
    role: 'Counter Assistant',
    shift: 'Morning Shift',
    status: 'Active',
    phone: '',
    email: '',
  });

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setForm({
      name: '',
      role: 'Counter Assistant',
      shift: 'Morning Shift',
      status: 'Active',
      phone: '',
      email: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff) => {
    setEditingStaff(staff);
    setForm({
      name: staff.name || '',
      role: staff.role || 'Counter Assistant',
      shift: staff.shift || 'Morning Shift',
      status: staff.status || 'Active',
      phone: staff.phone || '',
      email: staff.email || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingStaff) {
      updateStaffMember(editingStaff.id, {
        name: form.name.trim(),
        role: form.role,
        shift: form.shift,
        status: form.status,
        phone: form.phone.trim(),
        email: form.email.trim(),
      });
    } else {
      addStaffMember({
        name: form.name.trim(),
        role: form.role,
        shift: form.shift,
        status: form.status,
        phone: form.phone.trim(),
        email: form.email.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmStaff) {
      deleteStaffMember(deleteConfirmStaff.id);
      setDeleteConfirmStaff(null);
    }
  };

  // Filter staff list
  const filteredStaff = (staffList || []).filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.role.toLowerCase().includes(query.toLowerCase()) ||
      (s.phone && s.phone.includes(query)) ||
      s.shift.toLowerCase().includes(query.toLowerCase());

    if (!matchesQuery) return false;

    if (activeTab === 'Active') return s.status === 'Active';
    if (activeTab === 'On Leave') return s.status === 'On Leave';
    if (activeTab === 'Managers') return s.role.toLowerCase().includes('manager');
    if (activeTab === 'Cashiers') return s.role.toLowerCase().includes('cashier') || s.role.toLowerCase().includes('counter');

    return true;
  });

  const totalMembers = (staffList || []).length;
  const activeMembers = (staffList || []).filter((s) => s.status === 'Active').length;
  const onLeaveMembers = (staffList || []).filter((s) => s.status === 'On Leave').length;
  const totalOrdersProcessed = (staffList || []).reduce((sum, s) => sum + (Number(s.ordersHandled) || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto bg-bk-cream p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-bk-gold/30">
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
              <Users size={26} className="text-bk-red shrink-0" />
              Staff Management
            </h1>
            <p className="text-xs text-bk-charcoal/60 mt-1">
              Manage store employees, shift schedules, contact details, and billing permissions.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-bk-charcoal hover:bg-black text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition active:scale-95 shrink-0"
        >
          <UserPlus size={18} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-bk-gold/30 shadow-sm flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">Total Staff</p>
            <h3 className="text-lg sm:text-2xl font-black text-bk-charcoal mt-0.5 truncate">{totalMembers} Members</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-bk-gold/30 shadow-sm flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">On Duty Now</p>
            <h3 className="text-lg sm:text-2xl font-black text-emerald-600 mt-0.5 truncate">{activeMembers} Active</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-bk-gold/30 shadow-sm flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">On Leave</p>
            <h3 className="text-lg sm:text-2xl font-black text-amber-600 mt-0.5 truncate">{onLeaveMembers} Staff</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-bk-gold/30 shadow-sm flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">Orders Processed</p>
            <h3 className="text-lg sm:text-2xl font-black text-bk-red mt-0.5 truncate">{totalOrdersProcessed} Bills</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-red-50 text-bk-red rounded-xl shrink-0">
            <Shield size={22} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-bk-gold/30 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['All', 'Active', 'On Leave', 'Managers', 'Cashiers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition shrink-0 ${
                activeTab === tab
                  ? 'bg-bk-red text-white shadow-sm'
                  : 'bg-bk-cream text-bk-charcoal/70 hover:bg-bk-gold/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, role, phone..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red transition font-medium"
          />
        </div>
      </div>

      {/* Staff Cards Grid */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-bk-gold/30 text-center space-y-3">
          <Users size={48} className="mx-auto text-gray-300" />
          <h3 className="font-extrabold text-bk-charcoal text-base">No Staff Members Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            No employees match your search query or selected filter tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-white p-5 rounded-2xl border border-bk-gold/30 shadow-sm flex flex-col justify-between hover:shadow-md transition relative group"
            >
              <div className="flex items-start gap-4">
                {/* Avatar Initials Circle */}
                <div className="w-14 h-14 rounded-2xl bg-bk-charcoal text-bk-gold font-black text-xl flex items-center justify-center shrink-0 shadow-sm">
                  {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-bk-charcoal text-base truncate">{staff.name}</h3>
                    
                    {/* Status Pill Button */}
                    <button
                      onClick={() => toggleStaffStatus(staff.id)}
                      title="Click to toggle status"
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border transition active:scale-95 shrink-0 ${
                        staff.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {staff.status === 'Active' ? 'Active' : 'On Leave'}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1 text-bk-red font-bold bg-bk-red/10 px-2 py-0.5 rounded-md text-[11px]">
                      <Shield size={12} /> {staff.role}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="font-semibold text-bk-charcoal/80">{staff.shift}</span>
                  </div>

                  {/* Contact Info & Orders metrics */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 bg-bk-cream/50 p-2.5 rounded-xl border border-bk-gold/20">
                    {staff.phone && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone size={13} className="text-bk-red shrink-0" />
                        <span className="font-medium text-[11px] truncate">{staff.phone}</span>
                      </div>
                    )}
                    {staff.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail size={13} className="text-indigo-600 shrink-0" />
                        <span className="font-medium text-[11px] truncate">{staff.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 col-span-full">
                      <span className="text-[11px] text-gray-500">Processed Orders:</span>
                      <span className="font-black text-bk-charcoal text-xs">{staff.ordersHandled || 0} Bills</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => toggleStaffStatus(staff.id)}
                  className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-bk-charcoal px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                >
                  {staff.status === 'Active' ? <UserX size={14} className="text-amber-600" /> : <UserCheck size={14} className="text-emerald-600" />}
                  <span>{staff.status === 'Active' ? 'Set On Leave' : 'Set Active'}</span>
                </button>

                <button
                  onClick={() => handleOpenEditModal(staff)}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setDeleteConfirmStaff(staff)}
                  className="flex items-center gap-1 text-xs font-bold text-bk-red hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Staff Member Modal Overlay ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-bk-gold/30 max-w-lg w-full p-6 text-left space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-extrabold text-bk-charcoal flex items-center gap-2">
                <UserPlus size={22} className="text-bk-red" />
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-bk-charcoal uppercase tracking-wider block mb-1">
                  Full Name <span className="text-bk-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red font-medium transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-bk-charcoal uppercase tracking-wider block mb-1">
                    Designation Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red font-medium transition"
                  >
                    <option value="Store Manager">Store Manager</option>
                    <option value="Head Cashier">Head Cashier</option>
                    <option value="Counter Assistant">Counter Assistant</option>
                    <option value="Kitchen Chief">Kitchen Chief</option>
                    <option value="Delivery Executive">Delivery Executive</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-bk-charcoal uppercase tracking-wider block mb-1">
                    Shift Schedule
                  </label>
                  <select
                    value={form.shift}
                    onChange={(e) => setForm({ ...form, shift: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red font-medium transition"
                  >
                    <option value="Morning Shift">Morning Shift (8 AM - 4 PM)</option>
                    <option value="Evening Shift">Evening Shift (4 PM - 11 PM)</option>
                    <option value="Night Shift">Night Shift (11 PM - 7 AM)</option>
                    <option value="All Day">All Day / Full Shift</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-bk-charcoal uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red font-medium transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-bk-charcoal uppercase tracking-wider block mb-1">
                    Duty Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red font-medium transition"
                  >
                    <option value="Active">Active (On Duty)</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-bk-charcoal uppercase tracking-wider block mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. rahul@brostedkozhi.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red font-medium transition"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-bk-red hover:bg-bk-red-dark text-white shadow-md transition active:scale-95"
                >
                  {editingStaff ? 'Save Changes' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal Overlay ── */}
      {deleteConfirmStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-bk-gold/30 max-w-sm w-full p-6 text-center space-y-4 animate-scaleUp">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-bk-red flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-bk-charcoal">Remove Staff Member?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-bk-charcoal">{deleteConfirmStaff.name}</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmStaff(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl text-xs font-extrabold bg-bk-red hover:bg-bk-red-dark text-white shadow-md transition active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
