'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Zap } from 'lucide-react';
import { useSecurity } from '@/context/SecurityContext';
import { useSoundFX } from '@/hooks/useSoundFX';

export default function ProtocolsPage() {
    const {
        isMasked, toggleMasked,
        isEncrypted, toggleEncrypted,
        isLockdown, toggleLockdown
    } = useSecurity();
    const { playSound } = useSoundFX();

    // Keep local state for protocols not yet wired to global context
    const [localProtocols, setLocalProtocols] = useState<string[]>([]);

    const toggleProtocol = (id: string) => {
        const willBeActive = !isProtocolActive(id);

        // Play sound based on new state
        playSound(willBeActive ? 'powerUp' : 'tick');

        switch (id) {
            case 'identity':
                toggleMasked();
                break;
            case 'encryption':
                toggleEncrypted();
                break;
            case 'firewall':
                toggleLockdown();
                break;
            default:
                setLocalProtocols(prev =>
                    prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
                );
        }
    };

    const isProtocolActive = (id: string) => {
        switch (id) {
            case 'identity': return isMasked;
            case 'encryption': return isEncrypted;
            case 'firewall': return isLockdown;
            default: return localProtocols.includes(id);
        }
    };

    const ProtocolSwitch = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => {
        const isActive = isProtocolActive(id);

        return (
            <div className={`relative group border p-6 rounded-xl flex items-center justify-between overflow-hidden transition-colors duration-500 ${isActive ? 'bg-slate-900/80 border-cyan-500/50' : 'bg-slate-900/50 border-slate-700/50'}`}>
                {/* Active Background Effect */}
                <div className={`absolute inset-0 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 bg-cyan-900/20" />
                    <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 w-full shadow-[0_0_20px_2px_rgba(6,182,212,0.5)]" />
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className={`p-3 rounded-lg transition-colors duration-300 ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className={`font-mono text-lg font-bold tracking-wider transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}>
                            {label}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-1">Status: {isActive ? 'ENGAGED' : 'STANDBY'}</p>
                    </div>
                </div>

                {/* Industrial Toggle Switch */}
                <button
                    onClick={() => toggleProtocol(id)}
                    className="relative z-10 w-20 h-32 flex flex-col items-center justify-center gap-2 group cursor-pointer focus:outline-none"
                    aria-label={`Toggle ${label}`}
                >
                    <div className={`w-12 h-24 rounded-lg border-2 relative p-1 shadow-inner transition-colors duration-300 ${isActive ? 'bg-slate-900 border-cyan-500/50' : 'bg-slate-800 border-slate-600'}`}>
                        <motion.div
                            className={`w-full h-1/2 rounded border border-white/10 shadow-lg ${isActive ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 'bg-slate-600'}`}
                            animate={{ y: isActive ? 0 : '100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        />
                        {/* Toggle Track Lines */}
                        <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-px bg-slate-700/50 z-0" />
                    </div>
                    <span className={`text-[10px] font-mono font-bold uppercase transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-600'}`}>
                        {isActive ? 'ON' : 'OFF'}
                    </span>
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen p-6 md:p-12 pb-24">
            <header className="mb-12 border-b border-white/10 pb-6">
                <h1 className="text-3xl font-mono font-bold text-cyan-500 tracking-widest mb-2 flex items-center gap-3">
                    <Database className="w-8 h-8" />
                    DATA_BREAKER // CONTROL_ROOM
                </h1>
                <p className="text-slate-400 font-mono text-sm max-w-2xl">
                    Override global privacy settings. Engaging protocols creates an encrypted noise layer, rendering user data unreadable to external trackers.
                </p>
            </header>

            {/* Active Protocols Banner */}
            {(isMasked || isEncrypted || isLockdown || localProtocols.length > 0) && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-cyan-900/20 border-l-4 border-cyan-500 rounded-lg"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
                            <span className="text-cyan-400 font-mono text-sm font-bold uppercase">
                                Active Protocols: {[isMasked, isEncrypted, isLockdown, ...localProtocols].filter(Boolean).length}
                            </span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {isMasked && (
                                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-mono rounded">IDENTITY_MASK</span>
                            )}
                            {isEncrypted && (
                                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-mono rounded">QUANTUM_ENCRYPTION</span>
                            )}
                            {isLockdown && (
                                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-mono rounded">NEURAL_FIREWALL</span>
                            )}
                            {localProtocols.includes('trace') && (
                                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-mono rounded">TRACE_SCRAMBLER</span>
                            )}
                            {localProtocols.includes('storage') && (
                                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-mono rounded">ZERO-K_STORAGE</span>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProtocolSwitch id="identity" label="IDENTITY MASK" icon={Eye} />
                <ProtocolSwitch id="encryption" label="QUANTUM ENCRYPTION" icon={Lock} />
                <ProtocolSwitch id="firewall" label="NEURAL FIREWALL" icon={Shield} />
                <ProtocolSwitch id="trace" label="TRACE SCRAMBLER" icon={Zap} />
                <ProtocolSwitch id="storage" label="ZERO-K STORAGE" icon={Database} />
            </div>

            {/* Fake Data Stream Visualization */}
            <div className="mt-12 p-6 bg-black/40 border border-slate-800 rounded-xl font-mono text-xs text-green-500/80 h-48 overflow-hidden relative">
                <div className="absolute top-2 right-4 text-[10px] text-slate-600">LIVE_METRICS_STREAM</div>
                <div className="flex items-end gap-1 h-full opacity-50">
                    {[...Array(60)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="bg-green-500/50 w-full"
                            animate={{ height: `${Math.random() * 100}%` }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
