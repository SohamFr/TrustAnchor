'use client';

import { useScan } from '@/context/ScanContext';
import { Bot, BrainCircuit, Sparkles, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AIPage() {
    const { scanQuery } = useScan();
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (scanQuery) {
            setLoading(true);
            fetch('/api/analyze', {
                method: 'POST',
                body: JSON.stringify({ query: scanQuery }),
                headers: { 'Content-Type': 'application/json' }
            })
                .then(res => res.json())
                .then(data => setAnalysis(data))
                .finally(() => setLoading(false));
        }
    }, [scanQuery]);

    if (!scanQuery) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono space-y-4">
                <Bot size={48} className="opacity-20" />
                <p>AWAITING NEURAL LINK...</p>
            </div>
        );
    }

    return (
        <div className="p-12 max-w-6xl mx-auto space-y-8">
            <header className="mb-12">
                <h1 className="text-4xl font-mono font-bold text-white mb-2 flex items-center gap-3">
                    <Bot className="text-violet-400" size={36} />
                    AI & AUTOMATION ANALYSIS
                </h1>
                <p className="text-slate-400 font-mono text-sm max-w-xl">
                    Detecting synthetic media, deepfakes, and automated behavioral patterns.
                </p>
                <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg inline-block">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Analyzing</span>
                    <span className="text-xl font-mono text-violet-300">{scanQuery}</span>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-t-violet-500 rounded-full animate-spin" />
                        <Bot className="absolute inset-0 m-auto text-violet-400 animate-pulse" size={32} />
                    </div>
                    <div className="text-violet-400 font-mono text-sm tracking-widest animate-pulse">
                        ESTABLISHING NEURAL HANDSHAKE...
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Score Panel */}
                    <div className="bg-violet-950/10 border border-violet-500/20 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-32 h-32 rounded-full border-4 border-violet-500/30 flex items-center justify-center mb-6 relative">
                            <BrainCircuit size={48} className="text-violet-400" />
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-violet-500" strokeDasharray="377" strokeDashoffset={377 - (377 * (analysis?.score || 0)) / 100} strokeLinecap="round" />
                            </svg>
                        </div>
                        <h2 className="text-5xl font-mono font-bold text-white mb-2">{analysis?.score || 0}%</h2>
                        <span className="text-xs uppercase tracking-widest text-violet-400">Trust Probability</span>
                        <p className="mt-4 text-xs text-slate-400 max-w-[200px]">
                            {analysis?.summary || "Analysis complete."}
                        </p>
                    </div>

                    {/* Analysis Grid */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Card 1 */}
                        <div className="bg-[#050A14] p-6 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors">
                            <div className="flex items-center gap-3 mb-4 text-violet-300">
                                <Sparkles size={20} />
                                <h3 className="font-mono font-bold text-sm">Risk Assessment</h3>
                            </div>
                            <span className="text-xl font-bold text-white">{analysis?.riskLevel}</span>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-[#050A14] p-6 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors">
                            <div className="flex items-center gap-3 mb-4 text-rose-300">
                                <AlertTriangle size={20} />
                                <h3 className="font-mono font-bold text-sm">Red Flags</h3>
                            </div>
                            <ul className="text-xs text-slate-400 space-y-1">
                                {analysis?.redFlags?.map((flag: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className="w-1 h-1 bg-rose-500 rounded-full" />
                                        {flag}
                                    </li>
                                )) || <li>No flags detected.</li>}
                            </ul>
                        </div>

                        {/* Log */}
                        <div className="col-span-1 md:col-span-2 bg-black/40 rounded-xl p-4 font-mono text-[10px] text-violet-300/70 h-32 overflow-y-auto border border-white/5">
                            <div className="mb-1">&gt; CONNECTED TO GEMINI_FLASH...</div>
                            <div className="mb-1">&gt; ANALYZING VECTORS...</div>
                            <div className="mb-1">&gt; {analysis ? 'COMPLETE' : 'PROCESSING...'}</div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
