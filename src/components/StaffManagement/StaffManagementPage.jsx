import { useState } from 'react';
import { Users, UserPlus, Shield, CheckCircle, Clock, Search, Menu } from 'lucide-react';

const INITIAL_STAFF = [
  { id: '1', name: 'Admin Manager', role: 'Store Manager', shift: 'Morning Shift', status: 'Active', ordersHandled: 142 },
  { id: '2', name: 'Rahul Sharma', role: 'Head Cashier', shift: 'Morning Shift', status: 'Active', ordersHandled: 89 },
  { id: '3', name: 'Priya Verma', role: 'Counter Assistant', shift: 'Evening Shift', status: 'On Leave', ordersHandled: 54 },
  { id: '4', name: 'Vikram Singh', role: 'Kitchen Chief', shift: 'All Day', status: 'Active', ordersHandled: 210 },
];

export default function StaffManagementPage({ onToggleSidebar, collapsed }) {
  const [query, setQuery] = useState('');
  const [staffList] = useState(INITIAL_STAFF);

  const filteredStaff = staffList.filter(
    (s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.role.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-bk-cream p-3 sm:p-6 flex flex-col gap-4 sm:gap-6">
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
              <Users size={24} className="text-bk-red shrink-0" />
              Staff Management
            </h1>
            <p className="text-xs text-bk-charcoal/60 mt-1">
              Manage store employees, assigned roles, shift timings, and billing activity logs.
            </p>
          </div>
        </div>

        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-bk-charcoal hover:bg-black text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-md transition active:scale-95 shrink-0">
          <UserPlus size={18} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-bk-gold/30 shadow-sm flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">Total Staff</p>
            <h3 className="text-lg sm:text-2xl font-black text-bk-charcoal mt-0.5 truncate">{staffList.length} Members</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Users size={22} className="sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-bk-gold/30 shadow-sm flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">On Duty Now</p>
            <h3 className="text-lg sm:text-2xl font-black text-emerald-600 mt-0.5 truncate">3 Active</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle size={22} className="sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-bk-gold/30 shadow-sm flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">Current Shift</p>
            <h3 className="text-lg sm:text-2xl font-black text-bk-red mt-0.5 truncate">Morning</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-red-50 text-bk-red rounded-xl shrink-0">
            <Clock size={22} className="sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-bk-gold/30 shadow-sm flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search staff by name or role..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red transition"
          />
        </div>
      </div>

      {/* Staff Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filteredStaff.map((staff) => (
          <div key={staff.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-bk-gold/30 shadow-sm flex items-start sm:items-center gap-3 sm:gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-bk-charcoal text-bk-gold font-extrabold text-lg sm:text-xl flex items-center justify-center shrink-0">
              {staff.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-extrabold text-bk-charcoal text-sm sm:text-base truncate">{staff.name}</h3>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shrink-0 ${
                  staff.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {staff.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1 text-bk-red font-semibold">
                  <Shield size={13} /> {staff.role}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>{staff.shift}</span>
              </div>

              <p className="text-xs font-medium text-bk-charcoal/70 mt-1.5 sm:mt-2">
                Processed Orders: <span className="font-extrabold text-bk-charcoal">{staff.ordersHandled}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
