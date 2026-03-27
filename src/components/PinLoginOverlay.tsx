import { useState, useEffect } from 'react';

import { useAuth } from '../context/AuthContext';

export default function PinLoginOverlay() {
  const { isAuthenticated, user, activeProfile, profiles, unlockWithPin, logout, clinic } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-hide error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // If not authenticated (master login) or already has an active profile, don't show
  if (!isAuthenticated || activeProfile) return null;

  const handlePinSubmit = async (finalPin: string) => {
    setLoading(true);
    const result = await unlockWithPin(finalPin);
    setLoading(false);
    
    if (!result.success) {
      setError(result.error || 'Invalid PIN');
      setPin('');
    }
  };

  const onKeyClick = (digit: string) => {
    if (loading) return;
    const newPin = pin + digit;
    if (newPin.length <= 4) {
      setPin(newPin);
      if (newPin.length === 4) {
        handlePinSubmit(newPin);
      }
    }
  };

  const onBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/90 backdrop-blur-2xl transition-all duration-700">
      <div className="max-w-md w-full mx-4">
        {/* Logo/Clinic Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-500/30 mb-6">
            M
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">{clinic?.clinicName || 'MedAssist'}</h1>
          <p className="text-blue-200/60 font-medium">Enter your 4-digit PIN to access clinical dashboard</p>
        </div>

        {/* PIN Display & Keypad */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
          <div className="flex justify-center gap-4 mb-10">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                  pin.length > i 
                    ? 'bg-blue-400 border-blue-400 scale-125 shadow-[0_0_15px_rgba(96,165,250,0.8)]' 
                    : 'bg-transparent border-white/30'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-6 py-3 px-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-100 text-xs font-bold text-center">
               ⚠️ {error}
            </div>
          )}

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => onKeyClick(digit)}
                disabled={loading}
                className="h-20 bg-white/5 hover:bg-white/15 border border-white/10 rounded-2xl text-2xl font-black text-white transition-all active:scale-95 flex items-center justify-center -mb-2"
              >
                {digit}
              </button>
            ))}
            <button key="clear" onClick={() => setPin('')} className="h-20 text-white/40 font-bold hover:text-white transition-all">Clear</button>
            <button
              key="0"
              onClick={() => onKeyClick('0')}
              disabled={loading}
              className="h-20 bg-white/5 hover:bg-white/15 border border-white/10 rounded-2xl text-2xl font-black text-white transition-all active:scale-95"
            >
              0
            </button>
            <button key="backspace" onClick={onBackspace} className="h-20 text-white/40 text-xl flex items-center justify-center hover:text-white transition-all">
              ⌫
            </button>
          </div>

          <button 
            onClick={() => logout()}
            className="w-full mt-10 py-4 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-2xl text-sm font-black text-white/40 hover:text-red-400 transition-all uppercase tracking-widest"
          >
            ← Sign Out of {user?.email}
          </button>
        </div>

        {/* Staff footer */}
        <div className="mt-10 flex items-center justify-center gap-6 opacity-60">
           <div className="flex -space-x-3">
              {profiles.slice(0, 3).map((p, idx) => (
                <div key={p.id} className="w-10 h-10 rounded-full border-2 border-gray-900 bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-800" style={{ zIndex: 3 - idx }}>
                  {p.full_name.charAt(0)}
                </div>
              ))}
           </div>
           <p className="text-xs font-bold text-white/40 tracking-wide">{profiles.length} Authorized Staff Registered</p>
        </div>
      </div>
    </div>
  );
}
