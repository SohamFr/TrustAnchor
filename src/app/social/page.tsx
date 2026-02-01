'use client';

import { useScan } from '@/context/ScanContext';
import { Users, UserCheck, Shield, Share2 } from 'lucide-react';
import { generateSeed, getDeterminsticValue } from '@/utils/seedGenerator';

export default function SocialTrustPage() {
    const { scanQuery } = useScan();
    const seed = scanQuery ? generateSeed(scanQuery) : 0;

    // Deterministic Mock Data
    const mockConnections = scanQuery ? [
        { name: 'IdentityVerifier.io', trust: getDeterminsticValue(seed + 1, 85, 99), type: 'Certifier' },
        { name: 'GlobalTrustNodes', trust: getDeterminsticValue(seed + 2, 70, 95), type: 'Network' },
        { name: 'SecureLink', trust: getDeterminsticValue(seed + 3, 60, 90), type: 'Validator' },
        { name: 'UnknownEntity_X', trust: getDeterminsticValue(seed + 4, 20, 60), type: 'Peer' },
    ] : [];

    if (!scanQuery) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono space-y-4">
                <Shield size={48} className="opacity-20" />
                <p>WAITING FOR TARGET ASSIGNMENT...</p>
                <div className="text-[10px] bg-white/5 px-2 py-1 rounded">GO TO HOME &gt; SCAN A URL</div>
            </div>
        );
    }

    return (
        <div className="p-12 max-w-6xl mx-auto space-y-8">
            <header className="mb-12">
                <h1 className="text-4xl font-mono font-bold text-white mb-2 flex items-center gap-3">
                    <Users className="text-cyan-400" size={36} />
                    SOCIAL TRUST GRAPH
                </h1>
                <p className="text-slate-400 font-mono text-sm max-w-xl">
                    Visualizing interpersonal and organizational trust chains.
                </p>
                <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg inline-block">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Active Target</span>
                    <span className="text-xl font-mono text-cyan-300">{scanQuery}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Graph Visualization (Mock) */}
                <div className="md:col-span-2 bg-black/40 border border-cyan-900/30 rounded-xl p-8 min-h-[400px] relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                    {/* Central Node */}
                    <div className="relative z-10 flex flex-col items-center group cursor-pointer">
                        <div className="w-24 h-24 rounded-full bg-cyan-500/10 border-2 border-cyan-500 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-transform group-hover:scale-110">
                            <Shield size={32} className="text-cyan-400" />
                        </div>
                        <div className="bg-black/80 px-4 py-1 rounded-full border border-cyan-900 text-cyan-200 font-mono text-sm">
                            {scanQuery}
                        </div>

                        {/* Interactive Details Tooltip */}
                        <div className="absolute top-full mt-2 w-48 bg-black/90 border border-cyan-500/30 rounded p-2 text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            ENTITY HASH: 0x{seed.toString(16).toUpperCase()}
                        </div>
                    </div>

                    {/* Orbiting Nodes */}
                    <div className="absolute inset-0 animate-spin-slow pointer-events-none">
                        <div className="absolute top-[20%] left-[20%] w-16 h-16 bg-emerald-500/10 border border-emerald-500/50 rounded-full flex items-center justify-center">
                            <UserCheck size={20} className="text-emerald-400" />
                        </div>
                        <div className="absolute bottom-[30%] right-[20%] w-12 h-12 bg-indigo-500/10 border border-indigo-500/50 rounded-full flex items-center justify-center">
                            <Share2 size={16} className="text-indigo-400" />
                        </div>
                    </div>
                </div>

                {/* Connection List */}
                <div className="bg-[#050A14] border border-white/5 rounded-xl p-6">
                    <h3 className="font-mono text-sm text-cyan-400 mb-6 uppercase tracking-widest">Inbound Citations</h3>
                    <div className="space-y-4">
                        {mockConnections.map((conn, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/5 hover:border-cyan-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${conn.trust > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className="text-sm font-mono text-slate-300">{conn.name}</span>
                                </div>
                                <div className="text-xs text-slate-500 font-mono">{conn.type} • {conn.trust}%</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metrics using Seed */}
                <div className="bg-[#050A14] border border-white/5 rounded-xl p-6">
                    <h3 className="font-mono text-sm text-cyan-400 mb-6 uppercase tracking-widest">Trust Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-cyan-950/10 rounded flex flex-col gap-2">
                            <span className="text-xs text-slate-500">Domain Age</span>
                            <span className="text-xl font-mono text-white">{getDeterminsticValue(seed, 1, 15)} Yrs</span>
                        </div>
                        <div className="p-4 bg-cyan-950/10 rounded flex flex-col gap-2">
                            <span className="text-xs text-slate-500">Social Overlap</span>
                            <span className="text-xl font-mono text-emerald-400">
                                {getDeterminsticValue(seed, 0, 1) > 0.5 ? 'High' : 'Moderate'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
