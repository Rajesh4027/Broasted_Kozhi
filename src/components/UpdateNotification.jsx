import { useState, useEffect, useRef } from 'react';
import { Sparkles, Download, RefreshCw, X, CheckCircle2, ArrowRight, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

export default function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  // Updating states
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isReadyToRestart, setIsReadyToRestart] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const dropdownRef = useRef(null);
  const [installedVersion, setInstalledVersion] = useState('1.6.0');

  useEffect(() => {
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI.getAppVersion().then((ver) => {
        if (ver) setInstalledVersion(ver);
      });
    }
  }, []);

  // Check for updates on mount
  const checkUpdates = async () => {
    setChecking(true);
    setErrorMessage('');
    if (window.electronAPI?.checkForUpdates) {
      try {
        const res = await window.electronAPI.checkForUpdates();
        if (res?.available) {
          setUpdateAvailable(true);
          setUpdateInfo(res);
        } else {
          setUpdateAvailable(false);
        }
      } catch (err) {
        console.warn('Update check error:', err);
      } finally {
        setChecking(false);
      }
    } else {
      setTimeout(() => {
        setChecking(false);
      }, 800);
    }
  };

  useEffect(() => {
    checkUpdates();
  }, []);

  // Listen to IPC events from main process
  useEffect(() => {
    if (!window.electronAPI) return;

    const cleanupProgress = window.electronAPI.onUpdateProgress?.((data) => {
      setIsDownloading(true);
      const p = Math.round(data.percent || 0);
      setDownloadProgress(p);
    });

    const cleanupDownloaded = window.electronAPI.onUpdateDownloaded?.((info) => {
      setIsDownloading(false);
      setDownloadProgress(100);
      setIsReadyToRestart(true);
    });

    const cleanupError = window.electronAPI.onUpdateError?.((err) => {
      setIsDownloading(false);
      setErrorMessage(typeof err === 'string' ? err : 'Update failed.');
    });

    return () => {
      if (cleanupProgress) cleanupProgress();
      if (cleanupDownloaded) cleanupDownloaded();
      if (cleanupError) cleanupError();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartUpdate = () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setErrorMessage('');

    if (window.electronAPI?.startDownloadUpdate) {
      window.electronAPI.startDownloadUpdate();
    } else {
      // Browser preview demo simulation
      let currentP = 0;
      const interval = setInterval(() => {
        currentP += 15;
        if (currentP >= 100) {
          currentP = 100;
          clearInterval(interval);
          setDownloadProgress(100);
          setIsDownloading(false);
          setIsReadyToRestart(true);
        } else {
          setDownloadProgress(currentP);
        }
      }, 400);
    }
  };

  const handleRestart = () => {
    if (window.electronAPI?.restartAndInstall) {
      window.electronAPI.restartAndInstall();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* ── Header Icon Button (Placed Left of AI Voice) ── */}
      <button
        onClick={() => setIsDropdownOpen((v) => !v)}
        title="Software Updates & Release Notes"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-extrabold shadow-sm transition-all duration-300 active:scale-95 border ${
          isReadyToRestart
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400 animate-bounce'
            : isDownloading
            ? 'bg-amber-500 text-white border-amber-400'
            : updateAvailable
            ? 'bg-red-50 text-bk-red border-red-300 hover:bg-bk-red hover:text-white'
            : 'bg-bk-cream text-bk-charcoal/80 border-bk-gold/40 hover:border-bk-gold hover:bg-white'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {isDownloading ? (
            <RefreshCw size={16} className="animate-spin text-white" />
          ) : isReadyToRestart ? (
            <CheckCircle2 size={16} className="text-white" />
          ) : checking ? (
            <RefreshCw size={16} className="animate-spin text-bk-gold-dark" />
          ) : (
            <Sparkles size={16} className={updateAvailable ? 'animate-pulse text-bk-red' : 'text-bk-gold-dark'} />
          )}

          {updateAvailable && !isDownloading && !isReadyToRestart && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-bk-red border-2 border-white animate-ping" />
          )}
        </div>

        <span className="hidden sm:inline font-extrabold">
          {isReadyToRestart
            ? 'Restart App'
            : isDownloading
            ? `${downloadProgress}%`
            : updateAvailable
            ? `Update v${updateInfo?.version || '1.2.0'}`
            : `v${installedVersion}`}
        </span>
      </button>

      {/* ── Dropdown Popover ── */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl p-4 shadow-2xl border border-bk-gold/30 z-50 animate-fadeSlideUp font-sans text-bk-charcoal">
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                isReadyToRestart ? 'bg-emerald-600' : updateAvailable ? 'bg-bk-red' : 'bg-[#282828]'
              }`}>
                {isReadyToRestart ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-bk-charcoal leading-tight">Software Updates</h4>
                <p className="text-[11px] text-gray-500">
                  Installed: <span className="font-bold text-bk-charcoal">v{installedVersion}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDropdownOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-bk-charcoal hover:bg-gray-100 transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Content */}
          <div className="py-3 space-y-3">
            {isReadyToRestart ? (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={24} className="animate-bounce" />
                </div>
                <h5 className="font-extrabold text-sm text-emerald-900">Update Installed &amp; Ready!</h5>
                <p className="text-xs text-emerald-700">Restart the software now to apply version v{updateInfo?.version || '1.2.0'} changes.</p>
              </div>
            ) : isDownloading ? (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-amber-900">
                  <span>Downloading GitHub Release...</span>
                  <span className="font-mono text-sm">{downloadProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-amber-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-amber-700 text-center font-medium">Please wait while downloading update package.</p>
              </div>
            ) : updateAvailable ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-bk-red bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                    🚀 New Release Available: v{updateInfo?.version || '1.2.0'}
                  </span>
                </div>
                {updateInfo?.releaseNotes && (
                  <div className="p-2.5 bg-bk-cream/70 rounded-xl border border-bk-gold/20 text-xs text-bk-charcoal/80 whitespace-pre-line leading-relaxed max-h-28 overflow-y-auto">
                    {updateInfo.releaseNotes}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-1">
                <ShieldCheck size={24} className="text-emerald-600 mx-auto" />
                <p className="font-bold text-xs text-bk-charcoal">Software is Up-to-Date</p>
                <p className="text-[11px] text-gray-400">You are running the latest v{installedVersion} release.</p>
              </div>
            )}

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span className="truncate">{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
            {isReadyToRestart ? (
              <button
                onClick={handleRestart}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition active:scale-95"
              >
                <RefreshCw size={14} className="animate-spin" />
                <span>Restart &amp; Install Now</span>
              </button>
            ) : isDownloading ? (
              <button
                disabled
                className="w-full bg-gray-200 text-gray-500 font-bold text-xs py-2.5 px-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} className="animate-spin" />
                <span>Downloading ({downloadProgress}%)</span>
              </button>
            ) : updateAvailable ? (
              <button
                onClick={handleStartUpdate}
                className="w-full flex items-center justify-center gap-2 bg-bk-red hover:bg-bk-red-dark text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition active:scale-95 group"
              >
                <Download size={14} className="group-hover:translate-y-0.5 transition" />
                <span>Update Now</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
              </button>
            ) : (
              <button
                onClick={checkUpdates}
                disabled={checking}
                className="w-full flex items-center justify-center gap-2 bg-[#282828] hover:bg-black text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition active:scale-95"
              >
                <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
                <span>{checking ? 'Checking GitHub...' : 'Check GitHub Updates'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
