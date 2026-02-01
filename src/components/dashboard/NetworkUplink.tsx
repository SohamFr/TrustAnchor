'use client';

import { useState, useEffect } from 'react';
import { Wifi, Globe, Zap, MapPin, Activity } from 'lucide-react';

export function NetworkUplink() {
    const [telemetry, setTelemetry] = useState({
        ip: '192.168.1.X',
        isp: 'NetLink Corp',
        latency: 0,
        city: 'Unknown',
        country: 'US'
    });

    useEffect(() => {
        // Real data fetching
        const fetchTelemetry = async () => {
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();

                setTelemetry(prev => ({
                    ...prev,
                    ip: data.ip || 'Unknown',
                    isp: data.org || 'Unknown Provider',
                    city: data.city || 'Unknown',
                    country: data.country_code || 'US'
                }));
            } catch (e) {
                console.error("Failed to fetch telemetry", e);
                setTelemetry(prev => ({ ...prev, city: 'Offline Mode', isp: 'Localhost' }));
            }
        };

        fetchTelemetry();

        // Simulate reactive latency
        const timer = setInterval(() => {
            setTelemetry(prev => ({
                ...prev,
                latency: Math.floor(Math.random() * 40) + 15, // 15-55ms
            }));
        }, 1500);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-slate-950/50 backdrop-blur-md border border-cyan-500/20 rounded-xl p-4 w-full h-full flex flex-col gap-4 relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Activity size={16} />
                    <span className="font-mono text-xs font-bold tracking-widest">NETWORK_UPLINK</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-cyan-500/50 rounded-full" />
                </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                {/* IP Address */}
                <div className="space-y-1 overflow-hidden">
                    <div className="text-slate-500 flex items-center gap-1.5">
                        <Globe size={12} />
                        <span>PUBLIC_IP</span>
                    </div>
                    <div className="text-cyan-100 tracking-wider bg-cyan-900/10 px-2 py-1 rounded border border-cyan-500/10 truncate" title={telemetry.ip}>
                        {telemetry.ip}
                    </div>
                </div>

                {/* ISP */}
                <div className="space-y-1 overflow-hidden">
                    <div className="text-slate-500 flex items-center gap-1.5">
                        <Wifi size={12} />
                        <span>PROVIDER</span>
                    </div>
                    <div className="text-cyan-100 tracking-wider bg-cyan-900/10 px-2 py-1 rounded border border-cyan-500/10 truncate" title={telemetry.isp}>
                        {telemetry.isp}
                    </div>
                </div>

                {/* Latency */}
                <div className="space-y-1">
                    <div className="text-slate-500 flex items-center gap-1.5">
                        <Zap size={12} />
                        <span>LATENCY</span>
                    </div>
                    <div className={`tracking-wider px-2 py-1 rounded border border-cyan-500/10 transition-colors ${telemetry.latency < 50 ? 'bg-emerald-900/20 text-emerald-400' : 'bg-red-900/20 text-red-400'}`}>
                        {telemetry.latency}ms
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                    <div className="text-slate-500 flex items-center gap-1.5">
                        <MapPin size={12} />
                        <span>NODE_LOC</span>
                    </div>
                    <div className="text-cyan-100 tracking-wider bg-cyan-900/10 px-2 py-1 rounded border border-cyan-500/10">
                        {telemetry.city}, {telemetry.country}
                    </div>
                </div>
            </div>

            {/* Decorative Scanline */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-scan-fast pointer-events-none" />
        </div>
    );
}
