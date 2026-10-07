import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Sparkles, Volume2, X, Check, AlertTriangle, XCircle, ShoppingBag, Phone, User, ReceiptText, Zap } from 'lucide-react';
import { useBilling } from '../../context/BillingContext';

const NUMBER_WORDS = {
  one: 1, a: 1, an: 1, single: 1,
  two: 2, double: 2,
  three: 3, triple: 3,
  four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15
};

// Common phonetic replacements for menu items & actions
const PHONETIC_MAP = {
  mashroom: 'mushroom',
  vings: 'wings',
  brosted: 'broasted',
  roast: 'broasted',
  paner: 'paneer',
  mohit: 'mojito',
  mojitoo: 'mojito',
  periperi: 'peri peri',
  moru: 'moru',
  chick: 'chicken',
  chiken: 'chicken',
  burgr: 'burger',
  fris: 'fries',
};

function parseQuantity(str) {
  const words = str.toLowerCase().split(/\s+/);
  for (const word of words) {
    if (NUMBER_WORDS[word]) return NUMBER_WORDS[word];
    const num = parseInt(word, 10);
    if (!isNaN(num) && num > 0 && num < 100) return num;
  }
  return 1;
}

function speakFeedback(text) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS Error:', e);
    }
  }
}

export default function VoiceAssistant({ onViewOrder }) {
  const {
    categories,
    addToCart,
    clearCart,
    setIsCartOpen,
    setCustomerName,
    setCustomerPhone,
    orders
  } = useBilling();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastAction, setLastAction] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const actionTimerRef = useRef(null);

  // Auto-hide toast after 4 seconds
  const showActionToast = (actionObj) => {
    setLastAction(actionObj);
    if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    actionTimerRef.current = setTimeout(() => {
      setLastAction(null);
    }, 4000);
  };

  // Collect all menu items flat
  const allMenuItems = useCallback(() => {
    if (!categories || !Array.isArray(categories)) return [];
    return categories.flatMap((cat) =>
      (cat.items || []).map((item) => ({ ...item, categoryName: cat.name }))
    );
  }, [categories]);

  // ── Smart Speech Command Processor ──
  const processCommand = useCallback(
    (rawTranscript) => {
      if (!rawTranscript || !rawTranscript.trim()) return;

      let cleanText = rawTranscript.toLowerCase().trim();

      // Apply phonetic corrections
      Object.entries(PHONETIC_MAP).forEach(([wrong, right]) => {
        cleanText = cleanText.replace(new RegExp(`\\b${wrong}\\b`, 'g'), right);
      });

      console.log('Voice Command Processed:', cleanText);

      // 1. Customer Phone Number command (e.g. "customer phone 9842155670", "phone 9876543210", "mobile 9842155670")
      const phoneDigits = cleanText.replace(/\D/g, '');
      if (phoneDigits.length >= 10 && (cleanText.includes('phone') || cleanText.includes('mobile') || cleanText.includes('number') || cleanText.includes('contact') || cleanText.includes('call'))) {
        const phoneNum = phoneDigits.slice(-10);
        setCustomerPhone(phoneNum);
        const msg = `Customer phone set to ${phoneNum}`;
        showActionToast({ type: 'success', text: `📞 Phone set to ${phoneNum}` });
        speakFeedback(msg);
        return;
      }

      // 2. Customer Name command (e.g. "customer name Rajesh", "name Priya", "customer Rajesh")
      if (cleanText.includes('customer name') || cleanText.includes('name is') || cleanText.startsWith('name ') || cleanText.startsWith('customer ')) {
        const namePart = cleanText
          .replace(/customer name/g, '')
          .replace(/name is/g, '')
          .replace(/name/g, '')
          .replace(/customer/g, '')
          .trim();

        if (namePart && !namePart.match(/^\d+$/)) {
          const capitalized = namePart.replace(/\b\w/g, (c) => c.toUpperCase());
          setCustomerName(capitalized);
          const msg = `Customer name set to ${capitalized}`;
          showActionToast({ type: 'success', text: `👤 Customer: ${capitalized}` });
          speakFeedback(msg);
          return;
        }
      }

      // 3. Invoice lookup command (e.g. "details of invoice 8", "invoice 1001", "show bill 5")
      if (cleanText.includes('invoice') || cleanText.includes('in voice') || cleanText.includes('invis') || cleanText.includes('show bill') || cleanText.includes('bill details')) {
        const digits = cleanText.replace(/\D/g, '');
        if (digits) {
          const invNo = Number(digits);
          const foundOrder = orders.find((o) => Number(o.invoiceNo) === invNo);
          if (foundOrder) {
            onViewOrder?.(foundOrder);
            const msg = `Showing details for Invoice number ${invNo}`;
            showActionToast({ type: 'success', text: `🧾 Invoice #${invNo} opened` });
            speakFeedback(msg);
            return;
          } else {
            const msg = `Invoice number ${invNo} not found`;
            showActionToast({ type: 'error', text: `⚠️ Invoice #${invNo} not found` });
            speakFeedback(msg);
            return;
          }
        }
      }

      // 4. Proceed / Checkout bill command (handles phonetic variations like "seat bill", "seed bill", "set bill", "sweet bill", "proceed bill", "checkout", "view order")
      const checkoutKeywords = [
        'proceed', 'checkout', 'check out', 'seat bill', 'seed bill', 'set bill',
        'sweet bill', 'receipt', 'suit bill', 'feed bill', 'speed bill', 'see bill',
        'sea bill', 'open cart', 'view order', 'show order', 'generate invoice',
        'finish order', 'complete order', 'pay', 'billing', 'bill'
      ];

      const matchesCheckout = checkoutKeywords.some((kw) => cleanText.includes(kw));
      if (matchesCheckout && !cleanText.includes('add') && !cleanText.includes('order') && !cleanText.includes('details')) {
        setIsCartOpen(true);
        const msg = `Opening order bill`;
        showActionToast({ type: 'success', text: `🛒 Opening Cart & Checkout` });
        speakFeedback(msg);
        return;
      }

      // 5. Clear Cart command
      if (cleanText.includes('clear cart') || cleanText.includes('reset order') || cleanText.includes('clear order') || cleanText.includes('empty cart') || cleanText.includes('remove all')) {
        clearCart();
        const msg = `Order cart cleared`;
        showActionToast({ type: 'success', text: `🗑️ Cart cleared` });
        speakFeedback(msg);
        return;
      }

      // 6. Super-Intelligent Menu Item Matching Engine
      const items = allMenuItems();
      let bestMatch = null;
      let highestScore = 0;

      items.forEach((item) => {
        const itemNameClean = item.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
        const wordsInItem = itemNameClean.split(/\s+/).filter((w) => w.length > 2);

        let score = 0;

        // Substring match
        if (cleanText.includes(itemNameClean)) {
          score += 10;
        }

        // Individual word match
        wordsInItem.forEach((word) => {
          if (cleanText.includes(word)) {
            score += 3;
          }
        });

        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      });

      if (bestMatch && highestScore >= 3) {
        const qty = parseQuantity(cleanText);
        const hasVariants = !!bestMatch.prices;
        const variant = hasVariants ? 'Normal' : null;
        const price = hasVariants ? bestMatch.prices[variant] : bestMatch.price;

        for (let i = 0; i < qty; i++) {
          addToCart(bestMatch, variant, price);
        }

        const msg = `Added ${qty} ${bestMatch.name} to bill`;
        showActionToast({ type: 'success', text: `+${qty} ${bestMatch.name} (₹${price * qty})` });
        speakFeedback(msg);
        return;
      }

      // Fallback: If still unmatched, show clean warning toast
      showActionToast({ type: 'warning', text: `Command unrecognized: "${rawTranscript}"` });
    },
    [allMenuItems, addToCart, clearCart, setIsCartOpen, setCustomerName, setCustomerPhone, orders, onViewOrder]
  );

  // Initialize SpeechRecognition API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English handles menu items & names best

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          processCommand(event.results[i][0].transcript);
        }
      }
      setTranscript(currentTranscript);

      // Auto-clear transcript display after 3.5 sec of silence
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        setTranscript('');
      }, 3500);
    };

    recognition.onerror = (event) => {
      console.warn('Speech Recognition Error:', event.error);
      if (event.error === 'not-allowed') {
        setIsListening(false);
        showActionToast({ type: 'error', text: '🚫 Microphone permission denied by browser/system.' });
      }
    };

    recognition.onend = () => {
      // Re-start automatically if user hasn't toggled off
      if (recognitionRef.current?.shouldBeListening) {
        try {
          recognition.start();
        } catch (e) {
          console.warn('Recognition restart error:', e);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [processCommand]);

  // Toggle Microphone ON / OFF
  const toggleListening = async () => {
    if (!isSupported) {
      alert('Speech Recognition is not supported by your browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      // Turn OFF
      if (recognitionRef.current) {
        recognitionRef.current.shouldBeListening = false;
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setShowDrawer(false);
      speakFeedback('Voice assistant off');
    } else {
      // Request mic permission and Turn ON
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        if (recognitionRef.current) {
          recognitionRef.current.shouldBeListening = true;
          recognitionRef.current.start();
          setIsListening(true);
          setShowDrawer(true);
          speakFeedback('Voice assistant listening');
        }
      } catch (err) {
        console.error('Microphone Access Error:', err);
        showActionToast({ type: 'error', text: '⚠️ Please allow Microphone access in your browser settings.' });
        alert('Microphone permission required! Please allow microphone access in your browser settings.');
      }
    }
  };

  // Click handler for Voice Commands Cheat Sheet pills
  const handlePillClick = (cmdText) => {
    processCommand(cmdText);
  };

  return (
    <>
      {/* ── Microphone Icon Button (Header Bar) ── */}
      <button
        onClick={toggleListening}
        title={isListening ? 'Click to Mute Voice Assistant' : 'Click to Enable AI Voice Billing'}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-extrabold shadow-sm transition-all duration-300 active:scale-95 border ${
          isListening
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 animate-pulse shadow-emerald-200'
            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 hover:border-bk-gold'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {isListening ? (
            <>
              <Mic size={16} className="text-white animate-bounce" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
            </>
          ) : (
            <Mic size={16} className="text-amber-700" />
          )}
        </div>
        <span className="hidden sm:inline font-bold">
          {isListening ? 'AI Voice Active' : 'AI Voice'}
        </span>
      </button>

      {/* ── Floating AI Listening Drawer / Modal Widget (When Active) ── */}
      {showDrawer && (
        <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 bg-[#282828] text-white rounded-3xl p-4 shadow-2xl border border-bk-gold/30 animate-slideUp">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-bk-gold text-black flex items-center justify-center font-black">
                <Sparkles size={16} className="fill-black" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Broasted Kozhi AI Voice</h4>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Listening to cashiers...
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDrawer(false)}
              className="p-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
              title="Minimize Assistant Widget"
            >
              <X size={16} />
            </button>
          </div>

          {/* Equalizer Visualizer Waves */}
          <div className="my-3 flex items-center justify-center gap-1.5 h-8 bg-black/40 rounded-xl px-4 border border-gray-800">
            <span className="w-1.5 bg-bk-gold h-4 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 bg-emerald-400 h-6 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 bg-bk-red h-3 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="w-1.5 bg-amber-300 h-7 animate-bounce" style={{ animationDelay: '450ms' }} />
            <span className="w-1.5 bg-emerald-400 h-5 animate-bounce" style={{ animationDelay: '600ms' }} />
          </div>

          {/* Transcript Display Box */}
          <div className="bg-black/60 rounded-xl p-2.5 min-h-[44px] max-h-20 overflow-y-auto border border-gray-800">
            <p className="text-xs text-gray-200 font-medium italic">
              {transcript ? `"${transcript}"` : 'Say something like: "Add 2 Mushroom Wings" or "Proceed bill"...'}
            </p>
          </div>

          {/* Last Action Feedback Toast */}
          {lastAction && (
            <div className={`mt-2 p-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 border shadow-sm transition-all duration-300 ${
              lastAction.type === 'success' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700' :
              lastAction.type === 'error' ? 'bg-rose-950/90 text-rose-300 border-rose-700' :
              'bg-amber-950/90 text-amber-300 border-amber-700'
            }`}>
              {lastAction.type === 'success' && <Check size={16} className="text-emerald-400 shrink-0" />}
              {lastAction.type === 'warning' && <AlertTriangle size={16} className="text-amber-400 shrink-0" />}
              {lastAction.type === 'error' && <XCircle size={16} className="text-rose-400 shrink-0" />}
              <span className="truncate flex-1">{lastAction.text}</span>
            </div>
          )}

          {/* Quick Voice Commands Cheat Sheet (Clickable Pills) */}
          <div className="mt-3 pt-2 border-t border-gray-800 text-[10px] text-gray-400 space-y-1.5">
            <p className="font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
              <span>💡 Click or Speak Command:</span>
              <span className="text-[9px] text-bk-gold">Auto-Phonetic Active</span>
            </p>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <button
                onClick={() => handlePillClick('add 2 mushroom wings')}
                className="bg-gray-800 hover:bg-gray-700 text-left px-2 py-1.5 rounded text-gray-200 transition active:scale-95"
              >
                🍗 "Add 2 mushroom wings"
              </button>
              <button
                onClick={() => handlePillClick('customer name Rajesh')}
                className="bg-gray-800 hover:bg-gray-700 text-left px-2 py-1.5 rounded text-gray-200 transition active:scale-95"
              >
                👤 "Customer name Rajesh"
              </button>
              <button
                onClick={() => handlePillClick('phone 9842155670')}
                className="bg-gray-800 hover:bg-gray-700 text-left px-2 py-1.5 rounded text-gray-200 transition active:scale-95"
              >
                📞 "Phone 9842155670"
              </button>
              <button
                onClick={() => handlePillClick('proceed bill')}
                className="bg-gray-800 hover:bg-gray-700 text-left px-2 py-1.5 rounded text-gray-200 transition active:scale-95"
              >
                🛒 "Proceed bill"
              </button>
              <button
                onClick={() => handlePillClick('details of invoice 8')}
                className="bg-gray-800 hover:bg-gray-700 text-left px-2 py-1.5 rounded text-gray-200 transition active:scale-95"
              >
                🧾 "Details of invoice 8"
              </button>
              <button
                onClick={() => handlePillClick('clear cart')}
                className="bg-gray-800 hover:bg-gray-700 text-left px-2 py-1.5 rounded text-gray-200 transition active:scale-95"
              >
                🗑️ "Clear cart"
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
