import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
            <div className="text-center">
                {/* Animated loader */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-pulse" />
                </div>

                {/* Loading text */}
                <div className="space-y-2">
                    <h2 className="text-xl font-mono font-bold text-cyan-500 tracking-widest">
                        INITIALIZING
                    </h2>
                    <p className="text-sm font-mono text-slate-500">
                        Loading security modules...
                    </p>
                </div>

                {/* Animated dots */}
                <div className="flex justify-center gap-2 mt-6">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}
