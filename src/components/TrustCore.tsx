'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';
import { analyzeInput, TrustReport } from '@/utils/mockData';
import clsx from 'clsx';

export const TrustCore = () => {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
    const [report, setReport] = useState<TrustReport | null>(null);

    const handleScan = async () => {
        if (!input.trim()) return;
        setStatus('scanning');
        setReport(null);

        // Simulate scan
        const result = await analyzeInput(input);

        setReport(result);
        setStatus('complete');
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">

            {/* Input Zone */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#050A14] p-1 rounded-lg border border-cyan-900/50">
                    <div className="flex items-center gap-2 bg-[#0A1220] rounded px-4 py-3">
                        <Search className="text-cyan-700" />
                        <input
                            type="text"
                            placeholder="Enter URL or Entity ID for Deep Scan..."
                            className="w-full bg-transparent border-none outline-none text-cyan-100 font-mono placeholder:text-cyan-900/50"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                        />
                        <button
                            onClick={handleScan}
                            disabled={status === 'scanning'}
                            className="px-4 py-1.5 bg-cyan-900/30 hover:bg-cyan-500/10 text-cyan-400 font-mono text-xs uppercase tracking-wider rounded border border-cyan-800/50 transition-colors disabled:opacity-50"
                        >
                            {status === 'scanning' ? 'Scanning...' : 'Initialize'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Scanner Visualizer */}
            <div className="min-h-[300px] flex items-center justify-center relative rounded-xl border border-cyan-950/50 bg-[#060C18] overflow-hidden">

                {/* Grid Background */}
                <div className="absolute inset-0 z-0 opacity-10"
                    style={{ backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />

                {status === 'idle' && (
                    <div className="text-center text-cyan-900/40 font-mono text-sm">
                        <Smartphone size={48} className="mx-auto mb-4 opacity-20" />
                        <div>WAITING FOR TARGET INPUT</div>
                        <div className="text-xs mt-2 opacity-50">System Ready</div>
                    </div>
                )}

                {status === 'scanning' && (
                    <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                        {/* Layers Animation */}
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute border border-cyan-500/20 rounded-full"
                                initial={{ width: 50, height: 50, opacity: 1 }}
                                animate={{ width: 300, height: 300, opacity: 0 }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
                            />
                        ))}
                        <div className="font-mono text-cyan-400 animate-pulse text-sm">PARSING DATA LAYERS...</div>
                        <div className="mt-2 text-xs font-mono text-cyan-700">
                            Decrypting packets... <br />
                            Verifying SSL handshake... <br />
                            Checking reputation DB...
                        </div>
                    </div>
                )}

                {status === 'complete' && report && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full p-8 flex flex-col items-center z-10"
                    >
                        {/* Trust Score Radial */}
                        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="80" cy="80" r="70" className="stroke-slate-800" strokeWidth="8" fill="none" />
                                <motion.circle
                                    cx="80" cy="80" r="70"
                                    className={clsx(
                                        "stroke-current",
                                        report.score > 80 ? "text-emerald-500" : report.score < 50 ? "text-red-500" : "text-amber-500"
                                    )}
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={440}
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 440 - (440 * report.score) / 100 }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className={clsx("text-4xl font-bold font-mono", report.score > 80 ? "text-emerald-400" : report.score < 50 ? "text-red-400" : "text-amber-400")}>
                                    {report.score}%
                                </span>
                                <span className="text-[10px] uppercase tracking-widest text-slate-500">Credibility</span>
                            </div>
                        </div>

                        {/* Warning / Success Visuals */}
                        <h2 className={clsx(
                            "text-xl font-bold font-mono tracking-wider mb-2 flex items-center gap-2",
                            report.status === 'secure' ? "text-emerald-400" : report.status === 'critical' ? "text-red-400" : "text-amber-400"
                        )}>
                            {report.status === 'secure' && <CheckCircle size={20} />}
                            {report.status === 'critical' && <AlertTriangle size={20} />}
                            {report.status === 'warning' && <AlertTriangle size={20} />}
                            {marginTopCase(report.status)}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
                            {report.details.map((detail, idx) => (
                                <div key={idx} className="bg-[#050A14]/50 border border-cyan-900/30 p-2 rounded text-xs font-mono text-cyan-700 flex items-center gap-2">
                                    <div className={clsx("w-1 h-1 rounded-full", report.status === 'secure' ? "bg-emerald-500" : "bg-cyan-500")} />
                                    {detail}
                                </div>
                            ))}
                        </div>

                    </motion.div>
                )}
            </div>

        </div>
    );
};

const marginTopCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
