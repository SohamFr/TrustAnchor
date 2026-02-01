import { Search, Home, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* 404 Container */}
                <div className="relative bg-slate-950/80 border-2 border-cyan-500/50 rounded-2xl p-8 overflow-hidden">
                    {/* Animated border glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-cyan-900/10 animate-pulse" />

                    {/* Content */}
                    <div className="relative z-10 text-center">
                        {/* 404 Code */}
                        <div className="mb-6">
                            <div className="text-8xl md:text-9xl font-mono font-bold text-cyan-500/20 leading-none">
                                404
                            </div>
                            <div className="text-xl md:text-2xl font-mono text-cyan-400 tracking-widest -mt-4">
                                RESOURCE_NOT_FOUND
                            </div>
                        </div>

                        {/* Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500/10 border-2 border-cyan-500/30 rounded-full mb-6">
                            <Search className="w-10 h-10 text-cyan-400" />
                        </div>

                        {/* Message */}
                        <h1 className="text-2xl md:text-3xl font-mono font-bold text-white mb-4 tracking-wider">
                            ENDPOINT_UNREACHABLE
                        </h1>

                        <p className="text-slate-400 font-mono text-sm max-w-md mx-auto mb-8">
                            The requested resource does not exist in our security matrix.
                            This path may have been relocated, deleted, or never existed.
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono rounded-lg transition-colors border border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                            >
                                <Home size={18} />
                                Return to Dashboard
                            </Link>

                            <Link
                                href="/terminal"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-mono rounded-lg transition-colors border border-slate-600"
                            >
                                <Terminal size={18} />
                                Open Terminal
                            </Link>
                        </div>

                        {/* Common Links */}
                        <div className="mt-12 pt-8 border-t border-white/5">
                            <p className="text-slate-500 text-xs font-mono uppercase tracking-wider mb-4">
                                Quick Navigation
                            </p>
                            <div className="flex flex-wrap justify-center gap-3 text-xs font-mono">
                                <Link href="/map" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Threat Map
                                </Link>
                                <span className="text-slate-700">|</span>
                                <Link href="/network" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Network Graph
                                </Link>
                                <span className="text-slate-700">|</span>
                                <Link href="/audit" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Identity Audit
                                </Link>
                                <span className="text-slate-700">|</span>
                                <Link href="/sandbox" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Sandbox
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Decorative binary rain effect */}
                    <div className="absolute top-0 right-0 text-cyan-500/5 font-mono text-xs leading-tight overflow-hidden pointer-events-none h-full w-1/3">
                        {[...Array(20)].map((_, i) => (
                            <div key={i}>
                                {Math.random().toString(2).substring(2, 22)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
