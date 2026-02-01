'use client';

import { useEffect, useState } from 'react';
import { Globe as GlobeIcon, Wifi } from 'lucide-react';
import dynamic from 'next/dynamic';

import { useSoundFX } from '@/hooks/useSoundFX';

const GlobeViz = dynamic(() => import('./GlobeViz'), { ssr: false });

export default function MapPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const { playHum, playSound } = useSoundFX();

    // Ambient Hum
    useEffect(() => {
        playHum(true);
        return () => playHum(false);
    }, [playHum]);

    // Simulating logs
    useEffect(() => {
        const protocols = ['SSH', 'HTTPS', 'FTP', 'SQL', 'RDP'];
        const randomIP = () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');

        const interval = setInterval(() => {
            if (Math.random() > 0.3) return;
            const isAttack = Math.random() > 0.5;
            if (isAttack) {
                const newLog = `[${Math.floor(Date.now() / 1000)}] THREAT DETECTED: Source ${randomIP()} targeting ${protocols[Math.floor(Math.random() * protocols.length)]} port.`;
                setLogs(prev => [newLog, ...prev.slice(0, 7)]);
                playSound('alarm');
            }
        }, 1200);
        return () => clearInterval(interval);
    }, [playSound]);

    return (
        <div className="relative w-full h-screen bg-[#020408] overflow-hidden" style={{ touchAction: 'none' }}>
            {/* 3D Globe Background */}
            <div className="absolute inset-0 z-10">
                <GlobeViz />
            </div>

            {/* Overlay UI */}
            <div className="absolute top-6 left-6 z-30 pointer-events-none">
                <h1 className="text-2xl font-mono font-bold text-cyan-500 tracking-widest flex items-center gap-3">
                    <GlobeIcon className="w-6 h-6 animate-pulse" />
                    GLOBAL_THREAT_MAP
                </h1>
                <div className="flex items-center gap-4 mt-2 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-rose-500"><div className="w-2 h-2 bg-rose-500 rounded-full" /> ACTIVE ATTACKS</span>
                    <span className="flex items-center gap-1 text-blue-500"><div className="w-2 h-2 bg-blue-500 rounded-full" /> DEFENSE PINGS</span>
                </div>
            </div>

            {/* Live Log Console */}
            <div className="absolute bottom-6 left-6 z-30 w-full max-w-lg pointer-events-none">
                <div className="bg-black/80 backdrop-blur border border-slate-800 p-4 rounded-lg font-mono text-[10px] text-slate-300">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10 text-cyan-500 font-bold">
                        <Wifi size={12} /> NETWORK_TRAFFIC_ANALYZER_V9
                    </div>
                    <div className="space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className="truncate text-rose-400/90">{log}</div>
                        ))}
                        {logs.length === 0 && <div className="text-slate-600 animate-pulse">Scanning frequencies...</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
