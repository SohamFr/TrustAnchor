'use client';

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useScan } from '@/context/ScanContext';
import { useUserProgress } from '@/context/UserProgressContext';

interface TrustCoreProps {
    // No props needed now
}

interface AnalysisResult {
    score?: number;
    riskLevel?: string;
    redFlags?: string[];
    summary?: string;
    domainMetadata?: {
        creationDate: string;
        ageYears: number;
        registrar: string;
        serverCountry: string;
        consensusStats: { malicious: number; suspicious: number; clean: number; total: number };
    };
    error?: string;
}

const LOG_LINES = [
    "> Initializing Secure Socket Layer...",
    "> Resolving DNS Heuristics...",
    "> Querying Global Threat Intelligence...",
    "> Analyzing Semantic Patterns...",
    "> Verifying Digital Signatures...",
    "> Cross-referencing Blacklists...",
    "> Finalizing Integrity Score..."
];

const TrustCore = ({ }: TrustCoreProps) => {
    const { scanQuery, setScanQuery, scanResult, setScanResult, isScanning, setIsScanning } = useScan();
    const { incrementScans, incrementThreats, unlockBadge } = useUserProgress();
    const [logIndex, setLogIndex] = useState(0);
    const [scanStartTime, setScanStartTime] = useState<number>(0);

    // Terminal Log Animation
    useEffect(() => {
        if (!isScanning) {
            setLogIndex(0);
            return;
        }
        const interval = setInterval(() => {
            setLogIndex(prev => (prev + 1) % LOG_LINES.length);
        }, 300);
        return () => clearInterval(interval);
    }, [isScanning]);

    const handleAnalyze = async () => {
        if (!scanQuery.trim()) return;

        setIsScanning(true);
        setScanResult(null);
        const startTime = Date.now();
        setScanStartTime(startTime);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: scanQuery }),
            });
            const data = await response.json();
            setScanResult(data);

            if (data.error) {
                // If backend returned a validation error, stop here (don't track stats or badges)
                return;
            }

            // Track progress
            incrementScans();
            if (data.riskLevel === 'Critical') {
                incrementThreats();
            }

            // Check for speed badge (under 5s)
            const scanDuration = (Date.now() - startTime) / 1000;
            if (scanDuration < 5) {
                setTimeout(() => unlockBadge('speed_analyst'), 1000);
            }
        } catch (error) {
            console.error('Analysis failed', error);
            setScanResult({
                score: 0,
                riskLevel: 'Error',
                redFlags: ['Connection Failed', 'Try Again Later'],
                summary: 'Local system was unable to reach the intelligence engine.',
            });
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="w-full relative max-w-4xl mx-auto">
            {/* Input Module */}
            <div className="relative group transition-all duration-500 mb-8">
                <div className="absolute inset-0 bg-cyan-500/10 blur-xl rounded-lg group-hover:bg-cyan-500/20 transition-all" />

                <div className="relative bg-[#050A14] border border-cyan-900/50 rounded-lg p-1 flex items-center shadow-[0_0_30px_rgba(8,145,178,0.1)] w-full overflow-hidden">
                    <div className="pl-4 pr-2 text-cyan-700 shrink-0">
                        <Search size={20} />
                    </div>

                    <input
                        type="text"
                        value={scanQuery}
                        onChange={(e) => setScanQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                        placeholder="Enter URL or text..."
                        className="flex-1 bg-transparent border-none outline-none text-cyan-100 font-mono placeholder:text-cyan-900/50 h-10 md:h-12 min-w-0 w-full text-sm md:text-base"
                    />

                    <button
                        onClick={handleAnalyze}
                        disabled={isScanning || !scanQuery.trim()}
                        className="px-4 md:px-6 h-9 md:h-10 ml-2 rounded bg-cyan-950/50 border border-cyan-900/50 text-cyan-400 font-mono text-xs md:text-sm uppercase tracking-wider hover:bg-cyan-900/50 hover:text-cyan-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 whitespace-nowrap"
                    >
                        {isScanning ? (
                            <>
                                <span className="w-3 h-3 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin" />
                                <span className="hidden md:inline">Processing</span>
                            </>
                        ) : (
                            <span>Analyze</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Terminal Log Output (Visible during analysis) */}
            <AnimatePresence>
                {isScanning && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 font-mono text-xs text-emerald-500/80 bg-black/40 p-4 rounded border border-emerald-900/30 overflow-hidden"
                    >
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                            <Terminal size={14} />
                            <span>LIVE_KERNEL_LOG</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            {LOG_LINES.slice(0, logIndex + 1).slice(-4).map((line, i) => (
                                <div key={i} className="opacity-80">{line}</div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Display */}
            <AnimatePresence>
                {scanResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-[#050A14]/80 backdrop-blur-md border border-cyan-900/30 rounded-lg overflow-hidden"
                    >
                        {scanResult.error ? (
                            <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/50 shadow-[0_0_30px_rgba(225,29,72,0.2)]">
                                    <XCircle size={48} className="text-rose-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-mono text-rose-400 font-bold uppercase tracking-widest mb-2">Input Error</h3>
                                    <p className="text-slate-300 max-w-md mx-auto leading-relaxed">
                                        {scanResult.error}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-3">
                                    {/* Score Card */}
                                    <div className="col-span-1 flex flex-col items-center justify-center p-4 bg-cyan-950/10 rounded border border-cyan-900/20 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
                                        <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest mb-4">Integrity Score</span>

                                        <div className="relative flex items-center justify-center w-32 h-32">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle cx="64" cy="64" r="56" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                                                <circle
                                                    cx="64" cy="64" r="56"
                                                    className={`${(scanResult?.riskLevel || 'UNKNOWN') === 'Safe' ? 'stroke-emerald-500' :
                                                        (scanResult?.riskLevel || 'UNKNOWN') === 'Caution' ? 'stroke-amber-500' : 'stroke-rose-500'
                                                        }`}
                                                    strokeWidth="8"
                                                    strokeDasharray="351.8"
                                                    strokeDashoffset={351.8 - (351.8 * (scanResult?.score || 0)) / 100}
                                                    strokeLinecap="round"
                                                    fill="transparent"
                                                />
                                            </svg>
                                            <div className="absolute flex flex-col items-center">
                                                <span className="text-3xl font-bold font-mono text-slate-200">{scanResult?.score ?? '--'}</span>
                                                <span className="text-[10px] text-slate-500">/ 100</span>
                                            </div>
                                        </div>

                                        <span className={`mt-4 font-mono font-bold tracking-wider px-3 py-1 rounded text-xs ${(scanResult?.riskLevel || 'UNKNOWN') === 'Safe' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50' :
                                            (scanResult?.riskLevel || 'UNKNOWN') === 'Caution' ? 'bg-amber-950/50 text-amber-400 border border-amber-900/50' : 'bg-rose-950/50 text-rose-400 border border-rose-900/50'
                                            }`}>
                                            {(scanResult?.riskLevel || 'UNKNOWN').toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="col-span-2 space-y-6">
                                        <div>
                                            <h3 className="text-xs font-mono text-cyan-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <Activity size={14} /> Analysis Summary
                                            </h3>
                                            <p className="text-sm text-slate-300 leading-relaxed font-light border-l-2 border-cyan-800 pl-4 py-1">
                                                {scanResult?.summary || "Analysis data could not be retrieved."}
                                            </p>
                                        </div>

                                        {scanResult?.redFlags && scanResult.redFlags.length > 0 && (
                                            <div>
                                                <h3 className="text-xs font-mono text-rose-500/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <AlertTriangle size={14} /> Detected Anomalies
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {scanResult.redFlags.map((flag, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-rose-300 text-xs font-mono bg-rose-950/20 border border-rose-900/30 p-2 rounded">
                                                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                                            <span>{flag}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* DUMMY ANALYTICS PLACEHOLDER */}
                                <div className="px-6 py-4 bg-black/20 border-t border-cyan-900/30 flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 space-y-1">
                                        <span className="text-[9px] text-slate-500 font-mono uppercase">Global Threat Level</span>
                                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-rose-500 w-[70%]" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <span className="text-[9px] text-slate-500 font-mono uppercase">System Load</span>
                                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-cyan-500 w-[45%]" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <span className="text-[9px] text-slate-500 font-mono uppercase">Network Stability</span>
                                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[92%]" />
                                        </div>
                                    </div>
                                </div>

                                {/* DEEP METADATA SECTION */}
                                {scanResult?.domainMetadata && (
                                    <div className="px-6 py-5 bg-black/30 border-t border-cyan-900/30">
                                        <h3 className="text-xs font-mono text-cyan-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Activity size={14} /> Deep Metadata
                                        </h3>

                                        {/* Metadata Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                            <div className="bg-cyan-950/10 border border-cyan-900/20 rounded p-2">
                                                <span className="text-[9px] text-cyan-500/70 font-mono uppercase block mb-1">Domain Age</span>
                                                <span className="text-sm text-slate-200 font-mono">
                                                    {scanResult.domainMetadata.ageYears.toFixed(1)}y
                                                </span>
                                            </div>
                                            <div className="bg-cyan-950/10 border border-cyan-900/20 rounded p-2">
                                                <span className="text-[9px] text-cyan-500/70 font-mono uppercase block mb-1">Registrar</span>
                                                <span className="text-sm text-slate-200 font-mono truncate block">
                                                    {scanResult.domainMetadata.registrar}
                                                </span>
                                            </div>
                                            <div className="bg-cyan-950/10 border border-cyan-900/20 rounded p-2">
                                                <span className="text-[9px] text-cyan-500/70 font-mono uppercase block mb-1">Server Location</span>
                                                <span className="text-sm text-slate-200 font-mono">
                                                    {scanResult.domainMetadata.serverCountry}
                                                </span>
                                            </div>
                                            <div className="bg-cyan-950/10 border border-cyan-900/20 rounded p-2">
                                                <span className="text-[9px] text-cyan-500/70 font-mono uppercase block mb-1">Consensus</span>
                                                <span className="text-sm text-slate-200 font-mono">
                                                    {scanResult.domainMetadata.consensusStats.malicious}/{scanResult.domainMetadata.consensusStats.total}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Risk Highlight Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {/* RED X Cards (High Risk) */}
                                            {scanResult.domainMetadata.ageYears < 0.5 && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center gap-2 bg-rose-950/20 border border-rose-900/50 text-rose-300 p-3 rounded font-mono text-xs"
                                                >
                                                    <XCircle size={16} className="text-rose-500 shrink-0" />
                                                    <span>⚠️ High Risk: Domain Created Recently ({scanResult.domainMetadata.ageYears < 0.08 ? '<1 month' : '<6 months'})</span>
                                                </motion.div>
                                            )}

                                            {scanResult.domainMetadata.consensusStats.malicious > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                    className="flex items-center gap-2 bg-rose-950/20 border border-rose-900/50 text-rose-300 p-3 rounded font-mono text-xs"
                                                >
                                                    <XCircle size={16} className="text-rose-500 shrink-0" />
                                                    <span>🚨 Security Flag: Detected by {scanResult.domainMetadata.consensusStats.malicious} vendors</span>
                                                </motion.div>
                                            )}

                                            {/* GREEN Check Card (Positive Signal) */}
                                            {scanResult.domainMetadata.ageYears > 5 && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center gap-2 bg-emerald-950/20 border border-emerald-900/50 text-emerald-300 p-3 rounded font-mono text-xs"
                                                >
                                                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                                                    <span>✓ Established Domain (5+ years old)</span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default memo(TrustCore);
