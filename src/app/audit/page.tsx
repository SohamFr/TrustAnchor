'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Wifi, Cpu, Battery, Globe, AlertTriangle, Eye, MapPin } from 'lucide-react';

interface NetworkData {
    ip: string;
    city: string;
    country: string;
    isp: string;
    timezone: string;
}

interface DeviceData {
    gpu: string;
    screenResolution: string;
    colorDepth: string;
    batteryLevel: string;
}

interface BrowserData {
    userAgent: string;
    doNotTrack: string;
    cookiesEnabled: string;
    language: string;
    languages: string[];
    hardwareConcurrency: string;
    timezone: string;
}

export default function AuditPage() {
    const [networkData, setNetworkData] = useState<NetworkData | null>(null);
    const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
    const [browserData, setBrowserData] = useState<BrowserData | null>(null);
    const [scanning, setScanning] = useState(true);
    const [scanProgress, setScanProgress] = useState(0);
    const [batteryRefreshKey, setBatteryRefreshKey] = useState(0);

    // GPU Fingerprinting Helper
    const getGPUModel = (): string => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) return 'PROTECTED/UNKNOWN';

            const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
            if (!debugInfo) return 'PROTECTED/UNKNOWN';

            const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            return renderer || 'PROTECTED/UNKNOWN';
        } catch (e) {
            return 'PROTECTED/UNKNOWN';
        }
    };

    useEffect(() => {
        // Simulate scanning animation
        const progressInterval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 2;
            });
        }, 30);

        const collectData = async () => {
            await new Promise(resolve => setTimeout(resolve, 1500));

            // NETWORK TRIANGULATION
            let network: NetworkData = {
                ip: 'PROTECTED/UNKNOWN',
                city: 'PROTECTED/UNKNOWN',
                country: 'PROTECTED/UNKNOWN',
                isp: 'PROTECTED/UNKNOWN',
                timezone: 'PROTECTED/UNKNOWN'
            };

            try {
                const response = await fetch('https://ipapi.co/json/');
                if (response.ok) {
                    const data = await response.json();
                    network = {
                        ip: data.ip || 'PROTECTED/UNKNOWN',
                        city: data.city || 'PROTECTED/UNKNOWN',
                        country: data.country_name || 'PROTECTED/UNKNOWN',
                        isp: data.org || 'PROTECTED/UNKNOWN',
                        timezone: data.timezone || 'PROTECTED/UNKNOWN'
                    };
                }
            } catch (e) {
                // Network call failed - keep defaults
            }

            // DEVICE HARDWARE
            const gpu = getGPUModel();

            // Use ACTUAL viewport dimensions (what user sees) not physical screen
            const screenRes = `${window.innerWidth}x${window.innerHeight}`;
            const colorDepth = `${window.screen.colorDepth}-bit`;

            let batteryLevel = 'PROTECTED/UNKNOWN';
            try {
                if ('getBattery' in navigator) {
                    const battery: any = await (navigator as any).getBattery();

                    // Get current LIVE battery state
                    const updateBatteryStatus = () => {
                        const level = Math.round(battery.level * 100);
                        const status = battery.charging ? '⚡ Charging' : '🔋 Discharging';
                        batteryLevel = `${level}% ${status}`;

                        // Update device data state with current battery info
                        setDeviceData(prev => prev ? {
                            ...prev,
                            batteryLevel: `${level}% ${status}`
                        } : null);
                    };

                    // Initial state
                    updateBatteryStatus();

                    // Listen for LIVE battery changes
                    battery.addEventListener('chargingchange', updateBatteryStatus);
                    battery.addEventListener('levelchange', updateBatteryStatus);
                }
            } catch (e) {
                // Battery API not supported - Firefox/Safari
            }

            // BROWSER TRUTH
            const doNotTrack = navigator.doNotTrack || 'PROTECTED/UNKNOWN';
            const cookiesEnabled = navigator.cookieEnabled ? 'ENABLED' : 'DISABLED';
            const language = navigator.language || 'PROTECTED/UNKNOWN';
            const languages = navigator.languages ? Array.from(navigator.languages) : ['PROTECTED/UNKNOWN'];
            const hardwareConcurrency = navigator.hardwareConcurrency
                ? `${navigator.hardwareConcurrency} cores`
                : 'PROTECTED/UNKNOWN';
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'PROTECTED/UNKNOWN';

            setNetworkData(network);
            setDeviceData({
                gpu,
                screenResolution: screenRes,
                colorDepth,
                batteryLevel
            });
            setBrowserData({
                userAgent: navigator.userAgent,
                doNotTrack,
                cookiesEnabled,
                language,
                languages,
                hardwareConcurrency,
                timezone
            });

            setScanning(false);
        };

        collectData();

        // LIVE RESOLUTION UPDATES - Update when window resizes
        const handleResize = () => {
            setDeviceData(prev => prev ? {
                ...prev,
                screenResolution: `${window.innerWidth}x${window.innerHeight}`
            } : null);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(progressInterval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}
            />

            {/* Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="z-10 w-full max-w-6xl mb-12 text-center"
            >
                <div className="flex items-center justify-center gap-4 mb-4">
                    <Eye className="text-red-500" size={48} />
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                        DIGITAL FINGERPRINT DOSSIER
                    </h1>
                </div>
                <p className="text-gray-500 font-mono text-sm uppercase tracking-[0.3em]">
                    Deep Reconnaissance • Active Surveillance
                </p>
            </motion.div>

            <AnimatePresence mode="wait">
                {scanning ? (
                    <motion.div
                        key="scanning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="z-10 w-full max-w-3xl"
                    >
                        <div className="bg-slate-950/50 border border-red-900/30 rounded-xl p-8 backdrop-blur">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <p className="text-red-400 font-mono text-sm uppercase tracking-wider">
                                    Deep Scan In Progress...
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${scanProgress}%` }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>
                            <p className="text-gray-500 font-mono text-xs mt-2 text-center">
                                {scanProgress}%
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="z-10 w-full max-w-6xl space-y-8"
                    >
                        {/* SECTION 1: NETWORK IDENTITY */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-slate-950/50 border border-red-900/50 rounded-xl p-8 backdrop-blur relative overflow-hidden shadow-2xl shadow-red-500/20"
                        >
                            <div className="flex items-center gap-3 mb-8 border-b border-red-900/30 pb-4">
                                <div className="p-3 bg-red-900/30 rounded">
                                    <Wifi className="text-red-400" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-red-100 font-mono">NETWORK IDENTITY</h2>
                                <AlertTriangle className="text-red-500 ml-auto" size={20} />
                            </div>

                            {/* Public IP - LARGE GLITCHING RED */}
                            <div className="mb-6">
                                <div className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-mono">
                                    ⚠️ PUBLIC IP ADDRESS
                                </div>
                                <motion.div
                                    className="text-6xl font-bold text-red-500 font-mono tracking-tight"
                                    animate={{
                                        textShadow: [
                                            '0 0 10px #ef4444, 0 0 20px #ef4444',
                                            '0 0 20px #ef4444, 0 0 40px #ef4444',
                                            '0 0 10px #ef4444, 0 0 20px #ef4444'
                                        ]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    {networkData?.ip}
                                </motion.div>
                            </div>

                            {/* Location & ISP Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-black/40 rounded border border-red-800/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="text-red-400" size={16} />
                                        <div className="text-gray-500 text-xs uppercase tracking-wider">Location</div>
                                    </div>
                                    <div className="text-red-200 font-mono text-lg">
                                        {networkData?.city}, {networkData?.country}
                                    </div>
                                </div>

                                <div className="p-4 bg-black/40 rounded border border-red-800/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Globe className="text-red-400" size={16} />
                                        <div className="text-gray-500 text-xs uppercase tracking-wider">ISP Provider</div>
                                    </div>
                                    <div className="text-red-200 font-mono text-sm break-all">
                                        {networkData?.isp}
                                    </div>
                                </div>

                                <div className="p-4 bg-black/40 rounded border border-red-800/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Globe className="text-red-400" size={16} />
                                        <div className="text-gray-500 text-xs uppercase tracking-wider">Timezone</div>
                                    </div>
                                    <div className="text-red-200 font-mono text-lg">
                                        {networkData?.timezone}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* SECTION 2: DEVICE HARDWARE */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-slate-950/50 border border-orange-900/50 rounded-xl p-8 backdrop-blur relative overflow-hidden shadow-2xl shadow-orange-500/20"
                        >
                            <div className="flex items-center gap-3 mb-8 border-b border-orange-900/30 pb-4">
                                <div className="p-3 bg-orange-900/30 rounded">
                                    <Cpu className="text-orange-400" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-orange-100 font-mono">DEVICE HARDWARE</h2>
                            </div>

                            {/* GPU Model - Most Accurate Identifier */}
                            <div className="mb-6 p-6 bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg border border-orange-700/50">
                                <div className="text-orange-400 text-xs uppercase tracking-wider mb-3 font-mono font-bold">
                                    🎮 Graphics Processing Unit (Most Accurate Hardware ID)
                                </div>
                                <div
                                    className={`text-2xl font-bold font-mono ${deviceData?.gpu === 'PROTECTED/UNKNOWN'
                                        ? 'text-green-400'
                                        : 'text-orange-200'
                                        }`}
                                >
                                    {deviceData?.gpu}
                                </div>
                            </div>

                            {/* Other Hardware Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-black/40 rounded border border-orange-800/30">
                                    <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">Viewport Resolution (Live)</div>
                                    <div className="text-orange-200 font-mono text-lg">
                                        {deviceData?.screenResolution}
                                    </div>
                                </div>

                                <div className="p-4 bg-black/40 rounded border border-orange-800/30">
                                    <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">Color Depth</div>
                                    <div className="text-orange-200 font-mono text-lg">
                                        {deviceData?.colorDepth}
                                    </div>
                                </div>

                                <div className="p-4 bg-black/40 rounded border border-orange-800/30">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Battery className="text-orange-400" size={16} />
                                            <div className="text-gray-500 text-xs uppercase tracking-wider">Battery Level</div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    if ('getBattery' in navigator) {
                                                        const battery: any = await (navigator as any).getBattery();
                                                        const level = Math.round(battery.level * 100);
                                                        const status = battery.charging ? '⚡ Charging' : '🔋 Discharging';
                                                        setDeviceData(prev => prev ? { ...prev, batteryLevel: `${level}% ${status}` } : null);
                                                    }
                                                } catch (e) { }
                                            }}
                                            className="text-orange-400 hover:text-orange-300 transition-colors p-1 rounded hover:bg-orange-900/20"
                                            title="Refresh battery status"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div
                                        className={`font-mono text-lg ${deviceData?.batteryLevel === 'PROTECTED/UNKNOWN'
                                            ? 'text-green-400'
                                            : 'text-orange-200'
                                            }`}
                                    >
                                        {deviceData?.batteryLevel}
                                    </div>
                                    {deviceData?.batteryLevel && deviceData.batteryLevel !== 'PROTECTED/UNKNOWN' && (
                                        <div className="text-[10px] text-gray-600 font-mono mt-1">
                                            ⚠️ From Windows (may be cached)
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* SECTION 3: BROWSER LEAKS */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-slate-950/50 border border-cyan-900/50 rounded-xl p-8 backdrop-blur relative overflow-hidden shadow-2xl shadow-cyan-500/20"
                        >
                            <div className="flex items-center gap-3 mb-8 border-b border-cyan-900/30 pb-4">
                                <div className="p-3 bg-cyan-900/30 rounded">
                                    <Shield className="text-cyan-400" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-cyan-100 font-mono">BROWSER LEAKS</h2>
                            </div>

                            {/* User Agent String */}
                            <div className="mb-6 p-5 bg-black/50 rounded-lg border border-cyan-800/30">
                                <div className="text-cyan-400 text-xs uppercase tracking-wider mb-3 font-mono">
                                    📡 Raw User Agent String
                                </div>
                                <code className="text-gray-300 text-xs font-mono block break-all leading-relaxed bg-black/50 p-3 rounded">
                                    {browserData?.userAgent}
                                </code>
                            </div>

                            {/* Browser Properties Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-black/40 rounded border border-cyan-800/30">
                                    <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">Do Not Track</div>
                                    <div className="text-cyan-200 font-mono text-lg">
                                        {browserData?.doNotTrack}
                                    </div>
                                </div>

                                <div className="p-4 bg-black/40 rounded border border-cyan-800/30">
                                    <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">Cookies Enabled</div>
                                    <div className={`font-mono text-lg ${browserData?.cookiesEnabled === 'ENABLED' ? 'text-red-400' : 'text-green-400'
                                        }`}>
                                        {browserData?.cookiesEnabled}
                                    </div>
                                </div>

                                <div className="p-4 bg-black/40 rounded border border-cyan-800/30">
                                    <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">Primary Language</div>
                                    <div className="text-cyan-200 font-mono text-lg">
                                        {browserData?.language}
                                    </div>
                                </div>

                                <div className="p-4 bg-black/40 rounded border border-cyan-800/30">
                                    <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">Hardware Concurrency</div>
                                    <div
                                        className={`font-mono text-lg ${browserData?.hardwareConcurrency === 'PROTECTED/UNKNOWN'
                                            ? 'text-green-400'
                                            : 'text-cyan-200'
                                            }`}
                                    >
                                        {browserData?.hardwareConcurrency}
                                    </div>
                                </div>
                            </div>

                            {/* System Languages & Timezone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-black/40 rounded border border-cyan-800/30">
                                    <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">System Languages</div>
                                    <div className="text-cyan-200 font-mono text-sm">
                                        {browserData?.languages.join(', ')}
                                    </div>
                                </div>

                                <div className="p-4 bg-black/40 rounded border border-cyan-800/30">
                                    <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">System Timezone</div>
                                    <div className="text-cyan-200 font-mono text-lg">
                                        {browserData?.timezone}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info Footer */}
            {!scanning && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="z-10 w-full max-w-6xl mt-8 p-6 bg-slate-950/30 border border-red-900/20 rounded-xl backdrop-blur text-center"
                >
                    <p className="text-gray-400 text-sm font-mono mb-2">
                        <span className="text-red-400 font-bold">⚠️ PRIVACY WARNING:</span> This demonstrates how much data websites can collect <strong>WITHOUT PERMISSION</strong>.
                    </p>
                    <p className="text-gray-500 text-xs font-mono">
                        Green "PROTECTED/UNKNOWN" values indicate your browser is blocking invasive fingerprinting. All data is local - nothing sent to servers.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
