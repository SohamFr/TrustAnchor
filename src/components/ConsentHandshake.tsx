'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, MapPin, User, ShieldCheck, Zap } from 'lucide-react';

interface ConsentHandshakeProps {
    onComplete?: () => void;
}

type ConsentCategory = 'identity' | 'location' | 'biometrics';

export const ConsentHandshake = ({ onComplete }: ConsentHandshakeProps) => {
    const [toggles, setToggles] = useState<Record<ConsentCategory, boolean>>({
        identity: false,
        location: false,
        biometrics: false,
    });

    // Track if all consents are granted to trigger "Link Established"
    const [linkEstablished, setLinkEstablished] = useState(false);

    // Audio refs
    const switchAudioRef = useRef<HTMLAudioElement | null>(null);
    const linkAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize audio objects on client side only to avoid SSR issues
        switchAudioRef.current = new Audio('/sounds/switch-click.mp3'); // path to be created or assumed
        linkAudioRef.current = new Audio('/sounds/link-established.mp3');

        // Preload sounds
        switchAudioRef.current.load();
        linkAudioRef.current.load();
    }, []);

    const playSound = (type: 'switch' | 'link') => {
        try {
            if (type === 'switch' && switchAudioRef.current) {
                switchAudioRef.current.currentTime = 0;
                switchAudioRef.current.play().catch(() => { });
            } else if (type === 'link' && linkAudioRef.current) {
                linkAudioRef.current.currentTime = 0;
                linkAudioRef.current.play().catch(() => { });
            }
        } catch (e) {
            console.warn("Audio play failed", e);
        }
    };

    const handleToggle = (category: ConsentCategory) => {
        const newValue = !toggles[category];
        setToggles(prev => ({ ...prev, [category]: newValue }));

        if (newValue) {
            playSound('switch');
        }

        // Check if all will be true (including the one just toggled)
        const allTrue = newValue &&
            Object.entries(toggles).every(([key, val]) => key === category ? true : val);

        if (allTrue && !linkEstablished) {
            setTimeout(() => {
                setLinkEstablished(true);
                playSound('link');
                if (onComplete) onComplete();
            }, 500);
        } else if (!allTrue && linkEstablished) {
            setLinkEstablished(false);
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto p-1">
            {/* Glassmorphism Container */}
            <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">

                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <h2 className="text-xl font-mono text-cyan-400 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="tracking-widest uppercase">Data Breaker Panel</span>
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Engage protocols to establish trust anchor.</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Categories */}
                    <BreakerRow
                        label="Identity Protocol"
                        icon={<User className="w-4 h-4" />}
                        active={toggles.identity}
                        onToggle={() => handleToggle('identity')}
                    />
                    <BreakerRow
                        label="Location Mesh"
                        icon={<MapPin className="w-4 h-4" />}
                        active={toggles.location}
                        onToggle={() => handleToggle('location')}
                    />
                    <BreakerRow
                        label="Biometric Link"
                        icon={<Fingerprint className="w-4 h-4" />}
                        active={toggles.biometrics}
                        onToggle={() => handleToggle('biometrics')}
                    />
                </div>

                {/* Footer / Status Area */}
                <div className="h-16 relative bg-black/20 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {linkEstablished ? (
                            <motion.div
                                key="linked"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 text-emerald-400 font-bold tracking-widest uppercase font-mono"
                            >
                                <Zap className="w-5 h-5 fill-current" />
                                <span>Link Established</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="waiting"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-slate-500 font-mono text-xs uppercase tracking-widest"
                            >
                                Waiting for authorization...
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Background Link Animation Loading Bar */}
                    {linkEstablished && (
                        <motion.div
                            layoutId="link-bar"
                            className="absolute bottom-0 left-0 h-1 bg-emerald-500 shadow-[0_0_10px_2px_rgba(16,185,129,0.5)]"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-component for the Breaker Toggle
const BreakerRow = ({ label, icon, active, onToggle }: {
    label: string,
    icon: React.ReactNode,
    active: boolean,
    onToggle: () => void
}) => {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3 text-slate-300 group-hover:text-white transition-colors">
                <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                    {icon}
                </div>
                <span className="font-medium tracking-wide">{label}</span>
            </div>

            {/* Circuit Breaker Switch */}
            <button
                onClick={onToggle}
                className="relative w-16 h-8 focus:outline-none"
            >
                {/* Track */}
                <div className={`absolute inset-0 rounded-md transition-colors duration-300 border ${active
                        ? 'bg-cyan-900/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-800 border-slate-600'
                    }`}></div>

                {/* Ticks/Grid lines on track for industrial look */}
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between px-1 opacity-20">
                    <div className="w-0.5 h-2 bg-white"></div>
                    <div className="w-0.5 h-2 bg-white"></div>
                    <div className="w-0.5 h-2 bg-white"></div>
                </div>

                {/* Handle */}
                <motion.div
                    className={`absolute top-1 bottom-1 w-6 rounded-sm shadow-md border-t border-white/20 flex items-center justify-center`}
                    animate={{
                        x: active ? 34 : 4,
                        backgroundColor: active ? '#06b6d4' : '#475569'
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                    {/* Grip lines on handle */}
                    <div className="flex gap-0.5">
                        <div className="w-0.5 h-3 bg-black/20"></div>
                        <div className="w-0.5 h-3 bg-black/20"></div>
                        <div className="w-0.5 h-3 bg-black/20"></div>
                    </div>
                </motion.div>

                {/* Indicator Light */}
                <div className={`absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${active ? 'bg-cyan-400 shadow-[0_0_8px_cyan]' : 'bg-slate-900'
                    }`}></div>
            </button>
        </div>
    );
};
