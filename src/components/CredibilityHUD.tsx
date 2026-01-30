'use client';

import { motion } from 'framer-motion';
import { Shield, Activity, Radio } from 'lucide-react';

export const CredibilityHUD = () => {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-[#050A14]/90 backdrop-blur-md border-b border-cyan-900/30 z-50 flex items-center justify-between px-6 md:px-12">
            {/* Left: Identity */}
            <div className="flex items-center gap-4">
                <div className="p-2 bg-cyan-950/30 rounded border border-cyan-900/50">
                    <Shield className="text-cyan-400" size={20} />
                </div>
                <div>
                    <h1 className="text-cyan-100 font-bold tracking-widest text-lg font-mono">
                        TRUST_ANCHOR
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] text-cyan-600 font-mono uppercase">
                        <span>Ver. 1.0.4</span>
                        <span className="w-1 h-1 bg-cyan-600 rounded-full" />
                        <span>Net_Secure</span>
                    </div>
                </div>
            </div>

            {/* Center: Decorative Stream - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-1 opacity-20">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-12 h-1 bg-cyan-400"
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                    />
                ))}
            </div>

            {/* Right: Status */}
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <div className="text-xs text-cyan-400 font-mono tracking-wider">SYSTEM_ACTIVE</div>
                    <div className="text-[10px] text-slate-500 font-mono">DATA_STREAM.04</div>
                </div>
                <div className="relative">
                    <motion.div
                        className="absolute inset-0 bg-cyan-500 rounded-full blur-sm"
                        animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                    <div className="relative z-10 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
                </div>
            </div>
        </header>
    );
};
