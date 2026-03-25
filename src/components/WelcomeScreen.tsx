import { useEffect, useState } from 'react';

import type { ClinicInfo } from '../types';
interface Props {
    clinicInfo: ClinicInfo;
    onComplete: () => void;
}

export default function WelcomeScreen({ clinicInfo, onComplete }: Props) {
    const splash = clinicInfo.splashSettings || { title: 'MedAssist', subtitle: 'Clinical Practice Management', loadingText: 'Initializing Healthcare Engine' };
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(onComplete, 600);
        }, 1200);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ${fadeOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[#0f172a]">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 animate-pulse"></div>
                    <div className="relative w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 overflow-hidden">
                        {clinicInfo.logoDataUrl ? (
                            <img src={clinicInfo.logoDataUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-6xl font-bold">
                                {clinicInfo.clinicName?.charAt(0) || '🏥'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-10 text-center space-y-4 px-6 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-2xl">
                        {splash.title}
                    </h1>

                    <div className="flex items-center justify-center gap-3">
                        <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-blue-400"></div>
                        <p className="text-blue-200 font-bold uppercase tracking-[0.3em] text-sm text-center">
                            {splash.subtitle}
                        </p>
                        <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-blue-400"></div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-16 w-64 h-1 bg-white/5 rounded-full overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-indigo-500 w-full animate-[progress_1.2s_ease-in-out]"></div>
                </div>

                <p className="mt-4 text-white/30 text-[10px] uppercase font-bold tracking-widest animate-pulse">
                    {splash.loadingText}
                </p>
            </div>

            <style>{`
                @keyframes progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
