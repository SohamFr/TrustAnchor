'use client';

import dynamic from 'next/dynamic';
import { Network } from 'lucide-react';

const TrustGraph = dynamic(() => import('@/components/TrustGraph'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-[#020408]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                <span className="text-cyan-500 font-mono text-sm">Loading Graph Engine...</span>
            </div>
        </div>
    )
});

export default function NetworkPage() {
    return (
        <div className="w-full h-screen relative bg-[#020408] overflow-hidden flex flex-col">
            {/* Header Overlay */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none opacity-50"> // Low opacity to not fight controls
                {/*  Simplified header, actually let's keep it minimal or remove it since the component has controls. 
                      Based on the request, the component has a floating control panel top-left.
                      So we should probably remove this duplicate header or move it elsewhere if it overlaps.
                      The TrustGraph's panel is top-left (absolute). 
                      Let's put this page title on the TOP RIGHT or just keep it minimal.
                 */}
            </div>

            <div className="absolute top-6 right-8 z-10 pointer-events-none text-right">
                <h1 className="text-2xl font-mono font-bold text-cyan-500 tracking-widest flex items-center justify-end gap-3">
                    GENERATIVE_TRUST_GRAPH
                    <Network className="w-6 h-6" />
                </h1>
                <p className="text-slate-500 text-xs font-mono mt-1">Interactive Force-Directed Simulation.</p>
            </div>

            {/* Main Graph Area */}
            <div className="flex-1 w-full h-full relative">
                <TrustGraph />
            </div>
        </div>
    );
}
