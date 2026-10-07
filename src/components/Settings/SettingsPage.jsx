import { useState, useEffect } from 'react';
import { useBilling } from '../../context/BillingContext';
import { SlidersHorizontal, Save, Building, Receipt, Phone, FileText, CheckCircle2, Eye, Menu, Database, Download, Upload, HardDrive, Sparkles, RefreshCw } from 'lucide-react';
import logo2 from '../../assets/Logo/Logo_2.png';

export default function SettingsPage({ onToggleSidebar, collapsed }) {
  const { storeSettings, updateStoreSettings, exportBackup, importBackup } = useBilling();

  const [form, setForm] = useState({
    storeName: storeSettings?.storeName || 'Broasted Kozhi',
    address: storeSettings?.address || '',
    phone: storeSettings?.phone || '',
    billTitle: storeSettings?.billTitle || 'Bill of Supply',
    currencySymbol: storeSettings?.currencySymbol || '₹',
    footerNote: storeSettings?.footerNote || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');
  const [currentAppVersion, setCurrentAppVersion] = useState('1.1.0');

  useEffect(() => {
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI.getAppVersion().then((v) => {
        if (v) setCurrentAppVersion(v);
      });
    }
  }, []);

  const handleExportBackup = async () => {
    const res = await exportBackup();
    if (res?.success) {
      setBackupMsg('Backup file exported successfully!');
      setTimeout(() => setBackupMsg(''), 4000);
    }
  };

  const handleImportBackup = async () => {
    const res = await importBackup();
    if (res) {
      setBackupMsg('Database restored successfully!');
      setTimeout(() => setBackupMsg(''), 4000);
    }
  };

  useEffect(() => {
    if (storeSettings) {
      setForm({
        storeName: storeSettings.storeName || 'Broasted Kozhi',
        address: storeSettings.address || '',
        phone: storeSettings.phone || '',
        billTitle: storeSettings.billTitle || 'Bill of Supply',
        currencySymbol: storeSettings.currencySymbol || '₹',
        footerNote: storeSettings.footerNote || '',
      });
    }
  }, [storeSettings]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateStoreSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const previewAddressLines = form.address
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="flex-1 overflow-y-auto bg-bk-cream p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-bk-gold/30">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex md:hidden p-2 sm:p-2.5 rounded-[10px] bg-[#282828] hover:bg-black text-white transition-all duration-200 active:scale-95 shadow-sm shrink-0 items-center justify-center border border-bk-gold/20"
            title="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-bk-charcoal flex items-center gap-2.5">
              <SlidersHorizontal size={26} className="text-bk-red" />
              POS &amp; Invoice Settings
            </h1>
            <p className="text-xs text-bk-charcoal/60 mt-1">
              Configure store address, phone number, invoice titles, and receipt details with real-time bill preview.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl animate-fadeSlideUp">
              <CheckCircle2 size={16} /> Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-bk-red hover:bg-bk-red-dark text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition active:scale-95"
          >
            <Save size={18} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Left = Form Inputs, Right = Real-Time Live Invoice Bill Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Input Form Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Store Branding Details */}
          <div className="bg-white p-6 rounded-2xl border border-bk-gold/30 shadow-sm space-y-4">
            <h3 className="font-extrabold text-bk-charcoal text-base flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building size={18} className="text-bk-red" /> Store Header & Address Details
            </h3>

            <div>
              <label className="text-xs font-bold text-bk-charcoal uppercase tracking-wider block mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                placeholder="e.g. Broasted Kozhi"
                className="w-full px-3.5 py-2.5 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red focus:ring-2 focus:ring-bk-red/20 transition font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-bk-charcoal uppercase tracking-wider block mb-1">
                Store Address (Printed on Invoice)
              </label>
              <textarea
                rows={5}
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Door No, Street Name, Area, City, Pin Code..."
                className="w-full px-3.5 py-2.5 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red focus:ring-2 focus:ring-bk-red/20 transition font-medium resize-y leading-relaxed"
              />
              <p className="text-[11px] text-gray-400 mt-1">Each line break will be printed on a separate line on the invoice bill.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-bk-charcoal uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <Phone size={13} className="text-bk-red" /> Contact Phone Number
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g. 7358967717"
                className="w-full px-3.5 py-2.5 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red focus:ring-2 focus:ring-bk-red/20 transition font-medium"
              />
            </div>
          </div>

          {/* Invoice Header & Footer Preferences */}
          <div className="bg-white p-6 rounded-2xl border border-bk-gold/30 shadow-sm space-y-4">
            <h3 className="font-extrabold text-bk-charcoal text-base flex items-center gap-2 border-b border-gray-100 pb-3">
              <Receipt size={18} className="text-bk-red" /> Bill Header & Currency Config
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-bk-charcoal uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                  <FileText size={13} className="text-bk-red" /> Invoice Title
                </label>
                <input
                  type="text"
                  value={form.billTitle}
                  onChange={(e) => handleChange('billTitle', e.target.value)}
                  placeholder="Bill of Supply"
                  className="w-full px-3.5 py-2.5 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red focus:ring-2 focus:ring-bk-red/20 transition font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-bk-charcoal uppercase tracking-wider block mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={form.currencySymbol}
                  onChange={(e) => handleChange('currencySymbol', e.target.value)}
                  placeholder="₹"
                  className="w-full px-3.5 py-2.5 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red focus:ring-2 focus:ring-bk-red/20 transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-bk-charcoal uppercase tracking-wider block mb-1">
                Receipt Footer Note
              </label>
              <textarea
                rows={2}
                value={form.footerNote}
                onChange={(e) => handleChange('footerNote', e.target.value)}
                placeholder="Thank you for visiting Broasted Kozhi! Come back soon!"
                className="w-full px-3.5 py-2.5 text-sm bg-bk-cream rounded-xl border border-bk-gold/40 outline-none focus:border-bk-red focus:ring-2 focus:ring-bk-red/20 transition font-medium resize-none"
              />
            </div>
          </div>

          {/* Windows Data Storage & Backup Settings */}
          <div className="bg-white p-6 rounded-2xl border border-bk-gold/30 shadow-sm space-y-4">
            <h3 className="font-extrabold text-bk-charcoal text-base flex items-center gap-2 border-b border-gray-100 pb-3">
              <Database size={18} className="text-bk-red" /> Data Storage & Backup Manager
            </h3>

            <div className="bg-bk-cream/70 p-3.5 rounded-xl border border-bk-gold/30 text-xs text-bk-charcoal space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-bk-charcoal">
                <HardDrive size={14} className="text-emerald-600" /> Windows Safe Storage Path:
              </p>
              <p className="font-mono text-[11px] bg-white p-2 rounded-lg border border-gray-200 text-gray-700 break-all select-all">
                %AppData%\Brosted Kozhi Billing\Data
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                App data (Orders, Invoices, Menu) is automatically stored in the Windows User AppData folder. This ensures seamless read/write access without requiring Administrator rights when installed in Program Files.
              </p>
            </div>

            {backupMsg && (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center animate-fadeSlideUp">
                {backupMsg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex-1 flex items-center justify-center gap-2 bg-bk-charcoal hover:bg-black text-white font-bold text-xs px-4 py-2.5 rounded-xl transition active:scale-95 shadow-sm"
              >
                <Download size={15} /> Export Backup (.json)
              </button>

              <button
                type="button"
                onClick={handleImportBackup}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-bk-cream text-bk-charcoal font-bold text-xs px-4 py-2.5 rounded-xl border border-bk-gold/40 transition active:scale-95 shadow-sm"
              >
                <Upload size={15} /> Restore Backup (.json)
              </button>
            </div>
          </div>

          {/* Software Version & Auto-Updater Section */}
          <div className="bg-white p-6 rounded-2xl border border-bk-gold/30 shadow-sm space-y-4">
            <h3 className="font-extrabold text-bk-charcoal text-base flex items-center gap-2 border-b border-gray-100 pb-3">
              <Sparkles size={18} className="text-bk-red" /> Software Version & Auto-Update
            </h3>

            <div className="flex items-center justify-between p-3.5 bg-bk-cream/70 rounded-xl border border-bk-gold/30">
              <div>
                <p className="text-xs font-bold text-bk-charcoal">Installed Software Version</p>
                <p className="text-[11px] text-gray-500">Brosted Kozhi Billing v{currentAppVersion} (Windows x64)</p>
              </div>
              <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 size={13} /> Active
              </span>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (window.electronAPI?.checkForUpdates) {
                  const res = await window.electronAPI.checkForUpdates();
                  if (res?.available) {
                    alert(`🎉 New Version Available: v${res.version}!\n\nClick "Update Now" on the notification popup to update automatically.`);
                  } else if (res?.error) {
                    alert(`Unable to check for updates: ${res.error}\nPlease check your internet connection.`);
                  } else {
                    alert(`You are running the latest version (v${currentAppVersion}).`);
                  }
                } else {
                  alert(`You are running the latest version (v${currentAppVersion}).`);
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-bk-red hover:bg-bk-red-dark text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-md transition active:scale-95"
            >
              <RefreshCw size={15} /> Check for Software Updates
            </button>
          </div>
        </div>

        {/* Right Side: Real-Time Live Invoice Preview (5 Cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-bk-charcoal/70 flex items-center gap-1.5">
              <Eye size={16} className="text-bk-red" /> Live Invoice Bill Preview
            </span>
            <span className="text-[10px] font-bold bg-bk-gold/20 text-bk-gold-dark px-2 py-0.5 rounded-full">
              Real-time Sync
            </span>
          </div>

          {/* Invoice Card UI */}
          <div className="bg-white rounded-2xl shadow-xl border border-bk-gold/40 p-6 font-sans text-bk-charcoal transition-all duration-300">
            {/* Header / Logo */}
            <div className="flex flex-col items-center text-center mb-3">
              <img src={logo2} alt={form.storeName} className="h-14 w-auto object-contain mb-2" />
              {previewAddressLines.length > 0 ? (
                previewAddressLines.map((line, i) => (
                  <p key={i} className="text-[11px] leading-tight text-bk-charcoal/80 text-center">
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-[11px] text-gray-400 italic">[Enter store address above]</p>
              )}

              {form.phone && (
                <p className="text-[11px] leading-tight font-bold text-bk-charcoal mt-1 text-center">
                  Phone: {form.phone}
                </p>
              )}
            </div>

            <div className="border-t border-dashed border-bk-charcoal/30 my-2" />
            <p className="text-center font-extrabold text-sm my-1">{form.billTitle || 'Bill of Supply'}</p>

            <div className="flex justify-between text-[11px] text-bk-charcoal/70 my-1">
              <span>Cash</span>
              <span className="text-right">
                Date: {new Date().toLocaleDateString('en-GB')}<br />
                Invoice no: 1001
              </span>
            </div>

            <div className="border-t border-dashed border-bk-charcoal/30 my-2" />

            {/* Sample Items Table */}
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left border-b border-bk-charcoal/30">
                  <th className="py-1 font-bold">Item</th>
                  <th className="py-1 font-bold text-center">Qty</th>
                  <th className="py-1 font-bold text-right">Price</th>
                  <th className="py-1 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-bk-charcoal/15">
                <tr>
                  <td className="py-1">Moru Moru Chicken</td>
                  <td className="py-1 text-center">1</td>
                  <td className="py-1 text-right">99.00</td>
                  <td className="py-1 text-right">99.00</td>
                </tr>
                <tr>
                  <td className="py-1">Royal Mushroom Burger</td>
                  <td className="py-1 text-center">2</td>
                  <td className="py-1 text-right">99.00</td>
                  <td className="py-1 text-right">198.00</td>
                </tr>
              </tbody>
            </table>

            <div className="border-t border-dashed border-bk-charcoal/30 my-2" />
            <div className="flex justify-between text-[11px]">
              <span>Subtotal</span>
              <span>{form.currencySymbol}297.00</span>
            </div>
            <div className="flex justify-between text-xs font-extrabold text-bk-red mt-1">
              <span>Total Amount</span>
              <span>{form.currencySymbol}297.00</span>
            </div>

            <div className="border-t border-dashed border-bk-charcoal/30 my-3" />
            <p className="text-center text-[10px] font-bold text-bk-charcoal">Terms &amp; Conditions</p>
            <p className="text-center text-[10px] text-bk-charcoal/70">
              {form.footerNote || 'Thank you for doing business with us.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
