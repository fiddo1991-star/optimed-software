import { useState, useRef, useCallback } from 'react';

/**
 * SpeechMicButton — A reusable Speech-to-Text button using the Web Speech API.
 * Works in Chrome, Edge, and Electron.
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  TO ADD A NEW LANGUAGE:                                     ║
 * ║  Just add one line to the LANGUAGES array below!            ║
 * ║  Example: { code: 'hi-IN', label: 'हिंदी', short: 'HI' }  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ─── ADD / REMOVE LANGUAGES HERE ──────────────────────────────
const LANGUAGES = [
  { code: 'en-US', label: '🇺🇸 English',    short: 'EN' },
  { code: 'ur-PK', label: '🇵🇰 اردو',       short: 'UR' },
  // { code: 'hi-IN', label: '🇮🇳 हिंदी',      short: 'HI' },
  // { code: 'ar-SA', label: '🇸🇦 العربية',    short: 'AR' },
  // { code: 'pa-IN', label: '🇮🇳 ਪੰਜਾਬੀ',     short: 'PA' },
  // { code: 'ps-AF', label: '🇦🇫 پښتو',       short: 'PS' },
  // { code: 'sd-PK', label: '🇵🇰 سنڌي',       short: 'SD' },
  // { code: 'fr-FR', label: '🇫🇷 Français',   short: 'FR' },
  // { code: 'de-DE', label: '🇩🇪 Deutsch',    short: 'DE' },
  // { code: 'es-ES', label: '🇪🇸 Español',    short: 'ES' },
  // { code: 'zh-CN', label: '🇨🇳 中文',        short: 'ZH' },
  // { code: 'tr-TR', label: '🇹🇷 Türkçe',     short: 'TR' },
];
// ───────────────────────────────────────────────────────────────

interface Props {
  /** Called with the recognized text. The parent decides how to merge it. */
  onResult: (text: string) => void;
  /** Optional: compact mode for inline use */
  compact?: boolean;
}

const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function SpeechMicButton({ onResult, compact = false }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [langIndex, setLangIndex] = useState(0);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);

  const isSupported = !!SpeechRecognitionAPI;
  const currentLang = LANGUAGES[langIndex];

  const createRecognition = useCallback((langCode: string) => {
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = langCode;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
      if (finalTranscript.trim()) {
        onResult(finalTranscript.trim());
        setInterimText('');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('🎤 Microphone access denied. Please allow microphone permission in your browser settings.');
      }
      if (event.error !== 'no-speech') {
        setIsListening(false);
        setInterimText('');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    return recognition;
  }, [onResult]);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    const recognition = createRecognition(currentLang.code);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [currentLang.code, createRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  // Cycle to next language (single click). If listening, restart with new lang.
  const cycleLang = () => {
    const nextIndex = (langIndex + 1) % LANGUAGES.length;
    setLangIndex(nextIndex);
    if (isListening) {
      stopListening();
      setTimeout(() => {
        const recognition = createRecognition(LANGUAGES[nextIndex].code);
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      }, 100);
    }
  };

  // Select a specific language from the dropdown
  const selectLang = (index: number) => {
    setLangIndex(index);
    setShowLangMenu(false);
    if (isListening) {
      stopListening();
      setTimeout(() => {
        const recognition = createRecognition(LANGUAGES[index].code);
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      }, 100);
    }
  };

  if (!isSupported) {
    return (
      <div className="relative inline-flex items-center gap-1 group">
        <button
          type="button"
          disabled
          title="Speech-to-Text requires Chrome or Edge browser. Firefox is not supported."
          className={`${compact ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'} rounded-lg flex items-center justify-center bg-gray-100 text-gray-300 cursor-not-allowed`}
        >
          🎤
        </button>
        <div className="hidden group-hover:block absolute top-full right-0 mt-1 bg-gray-800 text-white text-[10px] px-2 py-1.5 rounded-lg z-50 whitespace-nowrap shadow-lg">
          ⚠️ Use Chrome or Edge for voice input
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center gap-1">
      {/* Mic Button */}
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? 'Stop listening' : `Start voice input (${currentLang.label})`}
        className={`${compact ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'} rounded-lg flex items-center justify-center transition-all ${
          isListening
            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200'
            : 'bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600'
        }`}
      >
        {isListening ? '⏹' : '🎤'}
      </button>

      {/* Language Badge: Click = cycle, Right-click = dropdown */}
      <button
        type="button"
        onClick={LANGUAGES.length <= 2 ? cycleLang : () => setShowLangMenu(!showLangMenu)}
        onContextMenu={(e) => { e.preventDefault(); setShowLangMenu(!showLangMenu); }}
        title={LANGUAGES.length <= 2
          ? `Click to switch (${LANGUAGES.map(l => l.short).join(' ↔ ')})`
          : `Click to select language`
        }
        className={`${compact ? 'text-[9px] px-1 py-0.5' : 'text-[10px] px-1.5 py-1'} rounded font-bold transition-all cursor-pointer ${
          currentLang.code.startsWith('en')
            ? 'bg-blue-100 text-blue-700'
            : 'bg-emerald-100 text-emerald-700'
        } hover:scale-110`}
      >
        {currentLang.short}
      </button>

      {/* Language Dropdown (for 3+ languages, or on right-click) */}
      {showLangMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
          <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-xl z-50 w-44 overflow-hidden">
            <div className="px-3 py-1.5 bg-gray-50 text-[9px] font-bold uppercase text-gray-400 border-b">Voice Language</div>
            {LANGUAGES.map((l, i) => (
              <button
                key={l.code}
                onClick={() => selectLang(i)}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-blue-50 transition-all ${
                  i === langIndex ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700'
                }`}
              >
                {l.label} {i === langIndex && '✓'}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Live interim text indicator */}
      {isListening && interimText && (
        <div className="absolute top-full left-0 mt-1 bg-black/80 text-white text-[10px] px-2 py-1 rounded-lg max-w-[200px] truncate z-50 whitespace-nowrap pointer-events-none">
          {interimText}...
        </div>
      )}
    </div>
  );
}
