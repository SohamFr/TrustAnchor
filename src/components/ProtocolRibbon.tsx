'use client';

import { useScan } from "@/context/ScanContext";
import { Shield, Fingerprint, Globe, Lock } from "lucide-react";

export function ProtocolRibbon() {
    const { protocols, toggleProtocol } = useScan();

    return (
        <div className="fixed bottom-0 left-0 w-full h-10 bg-[#050A14]/90 backdrop-blur-md border-t border-cyan-900/30 flex items-center justify-center gap-8 z-50">

            <button
                onClick={() => toggleProtocol('identityMask')}
                className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest transition-all ${protocols.identityMask ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'text-slate-600 hover:text-cyan-400/50'}`}
            >
                <Fingerprint size={12} />
                <span className="hidden md:inline">Identity Mask</span>
                <span className={`w-1 h-1 rounded-full ${protocols.identityMask ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} />
            </button>

            <div className="w-px h-4 bg-white/10" />

            <button
                onClick={() => toggleProtocol('encryption')}
                className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest transition-all ${protocols.encryption ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'text-slate-600 hover:text-emerald-400/50'}`}
            >
                <Lock size={12} />
                <span className="hidden md:inline">Encryption</span>
                <span className={`w-1 h-1 rounded-full ${protocols.encryption ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`} />
            </button>

            <div className="w-px h-4 bg-white/10" />

            <button
                onClick={() => toggleProtocol('locationProxy')}
                className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest transition-all ${protocols.locationProxy ? 'text-violet-400 drop-shadow-[0_0_5px_rgba(167,139,250,0.5)]' : 'text-slate-600 hover:text-violet-400/50'}`}
            >
                <Globe size={12} />
                <span className="hidden md:inline">Location Proxy</span>
                <span className={`w-1 h-1 rounded-full ${protocols.locationProxy ? 'bg-violet-400 animate-pulse' : 'bg-slate-700'}`} />
            </button>

        </div>
    );
}
