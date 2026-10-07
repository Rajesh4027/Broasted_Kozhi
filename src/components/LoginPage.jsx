import { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import logo1 from '../assets/Logo/Logo_1.png';

// Hardcoded credentials — change as needed
const VALID_USER = 'admin';
const VALID_PASS = 'bk@2024';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    setLoading(true);
    // Simulate a brief auth delay for UX
    setTimeout(() => {
      if (username === VALID_USER && password === VALID_PASS) {
        localStorage.setItem('bk_auth', '1');
        onLogin();
      } else {
        setLoading(false);
        setError('Invalid username or password.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-screen flex overflow-hidden bg-[#fdf8f0]">

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden md:flex flex-col items-center justify-center w-[42%] relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #fff8ee 0%, #ffedc8 50%, #ffd98a 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute w-72 h-72 rounded-full bg-bk-gold/20 -top-16 -left-16 blur-3xl" />
        <div className="absolute w-56 h-56 rounded-full bg-bk-red/10 bottom-0 right-0 blur-2xl" />
        <div className="absolute w-40 h-40 rounded-full bg-bk-gold/30 bottom-20 -left-10 blur-2xl" />

        {/* Content */}
        <div
          className="relative z-10 flex flex-col items-center text-center px-10 transition-all duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateX(0)' : 'translateX(-40px)',
          }}
        >
          {/* Logo circle */}
          <div className="w-36 h-36 rounded-3xl bg-white shadow-2xl flex items-center justify-center mb-8 ring-4 ring-bk-gold/30">
            <img src={logo1} alt="Broasted Kozhi" className="w-28 h-28 object-contain" />
          </div>

          <h1 className="text-3xl font-extrabold text-bk-charcoal tracking-tight leading-tight">
            BROASTED KOZHI
          </h1>

          <div className="flex items-center gap-3 mt-2 mb-6">
            <span className="h-px w-10 bg-bk-gold" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-bk-gold-dark">
              Theni Branch
            </span>
            <span className="h-px w-10 bg-bk-gold" />
          </div>

          <p className="text-bk-charcoal/60 text-sm leading-relaxed max-w-[260px]">
            Manage your billing, orders & revenue — all in one place. Built for speed.
          </p>
        </div>

        {/* Bottom watermark */}
        <p className="absolute bottom-5 text-[10px] text-bk-charcoal/30 tracking-widest uppercase">
          © {new Date().getFullYear()} Broasted Kozhi · Theni
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div
          className="w-full max-w-[400px] transition-all duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          }}
        >
          {/* Mobile-only logo */}
          <div className="flex flex-col items-center mb-8 md:hidden">
            <img src={logo1} alt="Broasted Kozhi" className="w-20 h-20 object-contain mb-2" />
            <p className="font-extrabold text-bk-charcoal text-lg tracking-wide">BROASTED KOZHI</p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-bk-charcoal tracking-tight">Sign In</h2>
            <p className="text-sm text-gray-400 mt-1.5">Access your admin portal</p>
            <div className="mt-3 h-1 w-10 rounded-full bg-bk-red" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Username */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Enter your username"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-bk-charcoal bg-white shadow-sm outline-none focus:border-bk-gold focus:ring-2 focus:ring-bk-gold/25 transition placeholder:text-gray-300"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 pr-12 text-sm text-bk-charcoal bg-white shadow-sm outline-none focus:border-bk-gold focus:ring-2 focus:ring-bk-gold/25 transition placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-bk-charcoal transition"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl animate-fadeSlideUp">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-bk-charcoal hover:bg-bk-red text-white font-bold text-sm py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2 group"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={17} className="transition-transform group-hover:translate-x-0.5" />
                  SIGN INTO PORTAL
                </>
              )}
            </button>
          </form>

          {/* Hint */}
          <p className="text-center text-[11px] text-gray-300 tracking-widest uppercase mt-10">
            Secure Admin Access · Broasted Kozhi
          </p>
        </div>
      </div>
    </div>
  );
}
