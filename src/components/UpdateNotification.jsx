import { useState, useEffect } from 'react';
import { Sparkles, Download, RefreshCw, X, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Updating modal states
  const [isUpdatingModalOpen, setIsUpdatingModalOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateStage, setUpdateStage] = useState('downloading'); // 'downloading' | 'applying' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check for update automatically when app starts
    if (window.electronAPI?.checkForUpdates) {
      window.electronAPI.checkForUpdates().then((res) => {
        if (res?.available) {
          setUpdateAvailable(true);
          setUpdateInfo(res);
        }
      });
    } else {
      // Demo mode for browser preview / local testing
      const timer = setTimeout(() => {
        setUpdateAvailable(true);
        setUpdateInfo({
          version: '1.1.0',
          releaseNotes: '• Advanced Analytics Dashboard\n• Thermal Printer Speed Optimization\n• Automatic Windows AppData Data Protection'
        });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!window.electronAPI) return;

    const cleanupProgress = window.electronAPI.onUpdateProgress?.((data) => {
      const p = Math.round(data.percent || 0);
      setDownloadProgress(p);
      if (p >= 90 && updateStage === 'downloading') {
        setUpdateStage('applying');
      }
    });

    const cleanupDownloaded = window.electronAPI.onUpdateDownloaded?.((info) => {
      setDownloadProgress(100);
      setUpdateStage('ready');
      // Auto restart after 2 seconds
      setTimeout(() => {
        if (window.electronAPI?.restartAndInstall) {
          window.electronAPI.restartAndInstall();
        }
      }, 2500);
    });

    const cleanupError = window.electronAPI.onUpdateError?.((err) => {
      setUpdateStage('error');
      setErrorMessage(typeof err === 'string' ? err : 'Update failed to install.');
    });

    return () => {
      if (cleanupProgress) cleanupProgress();
      if (cleanupDownloaded) cleanupDownloaded();
      if (cleanupError) cleanupError();
    };
  }, [updateStage]);

  const handleStartUpdate = () => {
    setIsDismissed(true);
    setIsUpdatingModalOpen(true);
    setUpdateStage('downloading');
    setDownloadProgress(0);

    if (window.electronAPI?.startDownloadUpdate) {
      window.electronAPI.startDownloadUpdate();
    } else {
      // Simulated animation for browser preview mode
      let currentP = 0;
      const interval = setInterval(() => {
        currentP += 12;
        if (currentP >= 80 && currentP < 100) {
          setUpdateStage('applying');
        }
        if (currentP >= 100) {
          currentP = 100;
          clearInterval(interval);
          setDownloadProgress(100);
          setUpdateStage('ready');
        } else {
          setDownloadProgress(currentP);
        }
      }, 500);
    }
  };

  const handleManualRestart = () => {
    if (window.electronAPI?.restartAndInstall) {
      window.electronAPI.restartAndInstall();
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      {/* ── Top Right Corner Update Notification Banner ── */}
      {updateAvailable && !isDismissed && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-bk-red/30 p-4 font-sans text-bk-charcoal animate-bounce-short">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-bk-red text-white flex items-center justify-center shadow-md shadow-bk-red/30 shrink-0">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-bk-charcoal">New Update Available!</span>
                  <span className="text-[10px] font-bold bg-bk-gold/20 text-bk-red px-2 py-0.5 rounded-full border border-bk-gold/40">
                    v{updateInfo?.version || '1.1.0'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  A fresh software update with new features is ready for installation.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>

          {updateInfo?.releaseNotes && (
            <div className="mt-2.5 p-2.5 bg-bk-cream/70 rounded-xl border border-bk-gold/20 text-[11px] text-bk-charcoal/80 whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto">
              {updateInfo.releaseNotes}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleStartUpdate}
              className="flex-1 flex items-center justify-center gap-2 bg-bk-red hover:bg-bk-red-dark text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition active:scale-95 group"
            >
              <Download size={14} className="group-hover:translate-y-0.5 transition" />
              <span>Update Now</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* ── Updating Progress & Finishing Animation Modal Overlay ── */}
      {isUpdatingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-bk-gold/30 max-w-md w-full p-6 text-center space-y-6 animate-scaleUp">
            
            {/* Header Animation Icon */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              {updateStage === 'downloading' && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-bk-red/20 animate-ping" />
                  <div className="w-16 h-16 rounded-2xl bg-bk-red text-white flex items-center justify-center shadow-lg shadow-bk-red/30">
                    <Download size={32} className="animate-bounce" />
                  </div>
                </div>
              )}

              {updateStage === 'applying' && (
                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Zap size={32} className="animate-pulse" />
                </div>
              )}

              {updateStage === 'ready' && (
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 scale-110 transition">
                  <CheckCircle2 size={36} className="animate-bounce" />
                </div>
              )}

              {updateStage === 'error' && (
                <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
                  <X size={36} />
                </div>
              )}
            </div>

            {/* Status Titles */}
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-bk-charcoal">
                {updateStage === 'downloading' && 'Downloading Software Update...'}
                {updateStage === 'applying' && 'Applying Updates & Verifying Files...'}
                {updateStage === 'ready' && 'Update Complete! Restarting Software...'}
                {updateStage === 'error' && 'Update Interrupted'}
              </h2>

              <p className="text-xs text-gray-500">
                {updateStage === 'downloading' && 'Please keep the application open. Fetching package files.'}
                {updateStage === 'applying' && 'Installing new features and patching core files.'}
                {updateStage === 'ready' && 'Brosted Kozhi Billing is restarting to apply changes.'}
                {updateStage === 'error' && (errorMessage || 'An error occurred during update.')}
              </p>
            </div>

            {/* Animated Progress Bar */}
            {updateStage !== 'error' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-extrabold">
                  <span className="text-bk-charcoal/70 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    {updateStage === 'downloading' && 'Downloading Assets'}
                    {updateStage === 'applying' && 'Patching Binaries'}
                    {updateStage === 'ready' && 'Ready for Launch'}
                  </span>
                  <span className="text-bk-red font-mono text-sm">{downloadProgress}%</span>
                </div>

                <div className="w-full h-3 bg-bk-cream rounded-full overflow-hidden border border-bk-gold/30 p-0.5 relative">
                  <div
                    className="h-full bg-gradient-to-r from-bk-gold via-bk-red to-bk-red-dark rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${downloadProgress}%` }}
                  >
                    {/* Animated shine line */}
                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons on finish or error */}
            {updateStage === 'ready' && (
              <button
                onClick={handleManualRestart}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-lg transition active:scale-95"
              >
                <RefreshCw size={18} className="animate-spin" />
                <span>Restart Now</span>
              </button>
            )}

            {updateStage === 'error' && (
              <button
                onClick={() => setIsUpdatingModalOpen(false)}
                className="w-full bg-bk-charcoal hover:bg-black text-white font-bold text-sm py-2.5 px-4 rounded-xl transition"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
