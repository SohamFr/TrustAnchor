'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to monitoring service (optional)
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Error Container */}
                <div className="relative bg-slate-950/80 border-2 border-rose-500/50 rounded-2xl p-8 overflow-hidden">
                    {/* Animated border glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-rose-900/10 animate-pulse" />

                    {/* Content */}
                    <div className="relative z-10 text-center">
                        {/* Icon */}
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-rose-500/20 rounded-full mb-6">
                            <AlertTriangle className="w-12 h-12 text-rose-500 animate-pulse" />
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-mono font-bold text-white mb-2 tracking-wider">
                            SYSTEM_ERROR
                        </h1>

                        <div className="inline-block px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded text-rose-400 text-sm font-mono mb-6">
                            RUNTIME_EXCEPTION_DETECTED
                        </div>

                        {/* Error message (only in development) */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="bg-black/40 border border-rose-900/30 rounded-lg p-4 mb-6 text-left">
                                <p className="text-rose-400/80 font-mono text-xs break-all">
                                    {error.message}
                                </p>
                                {error.digest && (
                                    <p className="text-slate-600 font-mono text-xs mt-2">
                                        Digest: {error.digest}
                                    </p>
                                )}
                            </div>
                        )}

                        <p className="text-slate-400 font-mono text-sm max-w-md mx-auto mb-8">
                            An unexpected error disrupted the application. This incident has been logged.
                            Please try again or return to the dashboard.
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={reset}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono rounded-lg transition-colors border border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                            >
                                <RotateCcw size={18} />
                                Retry Operation
                            </button>

                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-mono rounded-lg transition-colors border border-slate-600"
                            >
                                <Home size={18} />
                                Return to Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Decorative grid */}
                    <div className="absolute bottom-0 left-0 w-full h-32 opacity-10 pointer-events-none">
                        <div className="grid grid-cols-12 gap-1 h-full">
                            {[...Array(48)].map((_, i) => (
                                <div key={i} className="bg-rose-500/50"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
