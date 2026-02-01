'use client';

import { useScan } from '@/context/ScanContext';
import { generateSeed, getDeterminsticValue } from '@/utils/seedGenerator';
import { Banknote, TrendingUp, DollarSign } from 'lucide-react';

export default function FinancePage() {
    const { scanQuery } = useScan();
    const seed = scanQuery ? generateSeed(scanQuery) : 0;
    const tokenPrice = getDeterminsticValue(seed, 12, 450);

    // Mock Price History (7 Days)
    const history = Array.from({ length: 7 }).map((_, i) => ({
        day: `D-${7 - i}`,
        val: getDeterminsticValue(seed + i, tokenPrice - 20, tokenPrice + 20)
    }));

    if (!scanQuery) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono space-y-4">
                <Banknote size={48} className="opacity-20" />
                <p>TARGET ACQUISITION REQUIRED...</p>
            </div>
        );
    }

    return (
        <div className="p-12 max-w-6xl mx-auto space-y-8">
            <header className="mb-12">
                <h1 className="text-4xl font-mono font-bold text-white mb-2 flex items-center gap-3">
                    <Banknote className="text-emerald-400" size={36} />
                    FINANCIAL REPUTATION LEDGER
                </h1>
                <p className="text-slate-400 font-mono text-sm max-w-xl">
                    Blockchain-verified domain reputation token valuation.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Graph (CSS Based for minimalism) */}
                <div className="col-span-2 bg-[#050A14] border border-emerald-900/30 rounded-xl p-8 min-h-[300px] flex flex-col">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Trust Token Value</span>
                            <div className="text-4xl font-mono font-bold text-white mt-2 flex items-center gap-2">
                                <DollarSign size={24} className="text-emerald-400" />
                                {tokenPrice.toFixed(2)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-emerald-400 font-mono text-sm bg-emerald-950/30 px-3 py-1 rounded inline-flex items-center gap-2">
                                <TrendingUp size={14} /> +{(getDeterminsticValue(seed, 1, 15) / 10).toFixed(2)}%
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-4 h-48 border-b border-white/5 pb-4 px-4">
                        {history.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end group h-full relative">
                                <div
                                    style={{ height: `${(d.val / (tokenPrice + 50)) * 100}%` }}
                                    className="w-full bg-emerald-500/20 border-t-2 border-emerald-400 rounded-t min-h-[10px] group-hover:bg-emerald-500/40 transition-all relative"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        ${d.val.toFixed(2)}
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-600 text-center mt-2 group-hover:text-emerald-400">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ledger Details */}
                <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-6">
                    <h3 className="font-mono text-sm text-emerald-400 mb-4 uppercase tracking-widest">Asset Details</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-emerald-900/30 pb-2">
                            <span className="text-slate-400 text-xs font-mono">Token Name</span>
                            <span className="text-white text-xs font-mono uppercase">{scanQuery.slice(0, 3)}CN (Coin)</span>
                        </div>
                        <div className="flex justify-between border-b border-emerald-900/30 pb-2">
                            <span className="text-slate-400 text-xs font-mono">Market Cap</span>
                            <span className="text-white text-xs font-mono">$ {getDeterminsticValue(seed + 10, 100000, 5000000).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-xs font-mono">Volatility</span>
                            <span className="text-white text-xs font-mono">LOW</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
