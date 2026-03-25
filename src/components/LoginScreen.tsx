import { useState, useEffect } from 'react';
import type { ClinicInfo, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
    clinicInfo: ClinicInfo;
}

export default function LoginScreen({ clinicInfo }: Props) {
    const { login, loginByPin, getQuickUsers, error: authError } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [pin, setPin] = useState('');
    const [selectedUser, setSelectedUser] = useState<{ id: string, name: string, role: UserRole } | null>(null);
    const [quickUsers, setQuickUsers] = useState<{ id: string, name: string, role: UserRole }[]>([]);
    const [showStandardLogin, setShowStandardLogin] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const users = getQuickUsers();
        setQuickUsers(users);
        if (users.length === 0) {
            setShowStandardLogin(true);
        }
    }, [getQuickUsers]);

    const handleStandardSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await login(identifier, password);
        if (!result.success) {
            setLoginError(result.error || 'Login failed');
            setTimeout(() => setLoginError(''), 3000);
        }
    };

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        const result = await loginByPin(selectedUser.id, pin);
        if (!result.success) {
            setLoginError(result.error || 'Invalid PIN');
            setPin('');
            setTimeout(() => setLoginError(''), 3000);
        }
    };

    const mainDoctor = quickUsers.length === 1 && (quickUsers[0].role === 'admin' || quickUsers[0].role === 'doctor') 
        ? quickUsers[0] 
        : null;

    return (
        <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-40 p-4 animate-in fade-in duration-500 overflow-y-auto">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col items-center p-8 border border-gray-100 my-8">
                {clinicInfo.logoDataUrl ? (
                    <img src={clinicInfo.logoDataUrl} alt="Logo" className="w-20 h-20 object-contain mb-4 rounded-xl shadow-sm bg-white" />
                ) : (
                    <div className="w-20 h-20 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-4xl mb-4 shadow-sm">
                        🏥
                    </div>
                )}
                <h2 className="text-2xl font-bold text-gray-800 mb-2 truncate max-w-full text-center">
                    {clinicInfo.clinicName || 'Clinic Manager'}
                </h2>
                
                {selectedUser ? (
                    <div className="w-full animate-in slide-in-from-right duration-300">
                        <button onClick={() => setSelectedUser(null)} className="text-blue-600 text-sm mb-4 hover:underline flex items-center gap-1">
                            ← Back to users
                        </button>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                                {selectedUser.name[0]}
                            </div>
                            <h3 className="font-bold text-gray-800">{selectedUser.name}</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{selectedUser.role}</p>
                        </div>

                        <form onSubmit={handlePinSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1 uppercase">Enter 4-Digit PIN</label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                    placeholder="• • • •"
                                    className="w-full text-center tracking-[1em] text-2xl bg-gray-50 border-2 border-gray-200 rounded-xl py-3 focus:border-blue-500 focus:bg-white transition-all outline-none"
                                    autoFocus
                                />
                            </div>
                            {loginError && <p className="text-center text-xs text-red-500 font-semibold animate-pulse">{loginError}</p>}
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition-all">
                                Access Dashboard
                            </button>
                        </form>
                    </div>
                ) : !showStandardLogin && quickUsers.length > 0 ? (
                    <div className="w-full space-y-4 animate-in fade-in duration-300">
                        {mainDoctor ? (
                            <div className="space-y-4">
                                <p className="text-gray-500 text-sm text-center mb-6">Welcome back! Quick access for the main doctor.</p>
                                <button
                                    onClick={() => setSelectedUser(mainDoctor)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex flex-col items-center justify-center gap-1"
                                >
                                    <span className="text-lg">Login as {mainDoctor.name}</span>
                                    <span className="text-[10px] opacity-80 uppercase tracking-widest">Administrator</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-2">Select User</p>
                                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto px-1">
                                    {quickUsers.map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => setSelectedUser(user)}
                                            className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-xl transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-white border border-gray-200 text-blue-600 rounded-lg flex items-center justify-center font-bold group-hover:border-blue-200">
                                                {user.name[0]}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-bold text-gray-700">{user.name}</div>
                                                <div className="text-[10px] text-gray-400 uppercase">{user.role}</div>
                                            </div>
                                            <span className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or</span></div>
                        </div>

                        <button
                            onClick={() => setShowStandardLogin(true)}
                            className="w-full py-3 text-sm text-gray-500 hover:text-blue-600 font-medium transition-all"
                        >
                            Log in with email/username
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleStandardSubmit} className="w-full space-y-4 animate-in fade-in duration-300">
                        {quickUsers.length > 0 && (
                             <button onClick={() => setShowStandardLogin(false)} className="text-blue-600 text-sm mb-2 hover:underline flex items-center gap-1">
                                ← Quick Login
                            </button>
                        )}
                        <p className="text-gray-500 text-sm text-center mb-4">Enter your credentials to access the clinic dashboard.</p>
                        
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 ml-1 uppercase">Username or Email</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="doctor@example.com"
                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 ml-1 uppercase">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2 ml-1">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="remember" className="text-sm text-gray-500 select-none">Remember this device</label>
                        </div>

                        {(loginError || authError) && (
                            <p className="text-center text-xs text-red-500 font-semibold animate-pulse">
                                {loginError || authError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex justify-center items-center gap-2"
                        >
                            <span>Access Dashboard</span>
                            <span>→</span>
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 w-full text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">✨ Secure Encrypted Session</p>
                </div>
            </div>
        </div>
    );
}
