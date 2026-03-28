import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: email.split('@')[0], // Default name
          }
        }
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for the confirmation link!');
      }
    } else {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Failed to login');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black mx-auto mb-6 shadow-2xl shadow-blue-500/20">
            M
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">MedAssist Cloud</h1>
          <p className="text-slate-400 mt-2 font-medium">Precision Clinical Management</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Clinic Username or Email</label>
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="e.g. cityclinic-admin"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            {message && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold text-center">
                {message}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Clinic Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-bold text-slate-500 hover:text-blue-400 transition-all"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need a new clinic? Create Account'}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-8">
          Secure Multi-User Patient Synchronization
        </p>
      </div>
    </div>
  );
}
