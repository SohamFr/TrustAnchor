'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter, usePathname } from 'next/navigation';
import {
    Home,
    Network,
    ScanEye,
    Database,
    Zap,
    Search,
    Map,
    Shield,
    Phone
} from 'lucide-react';

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Don't render on terminal page to avoid keyboard conflicts
    if (pathname === '/terminal') {
        return null;
    }

    // Keyboard shortcut: Ctrl+K / Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const navigate = (path: string) => {
        router.push(path);
        setOpen(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <Command
                className="w-full max-w-xl bg-[#050A14]/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 overflow-hidden"
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        setOpen(false);
                    }
                }}
            >
                {/* Input */}
                <div className="flex items-center gap-3 border-b border-cyan-900/30 px-4 py-3">
                    <Search className="w-5 h-5 text-cyan-500" />
                    <Command.Input
                        placeholder="Type a command..."
                        className="flex-1 bg-transparent border-none outline-none text-cyan-100 font-mono placeholder:text-cyan-900/50"
                        autoFocus
                    />
                    <kbd className="px-2 py-1 bg-cyan-950/50 border border-cyan-900/50 rounded text-[10px] text-cyan-500 font-mono">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <Command.List className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                    <Command.Empty className="px-4 py-8 text-center text-slate-500 font-mono text-sm">
                        No results found.
                    </Command.Empty>

                    {/* Navigation Section */}
                    <Command.Group
                        heading="Navigation"
                        className="text-[10px] font-mono text-cyan-600 uppercase tracking-wider px-2 py-2"
                    >
                        <Command.Item
                            onSelect={() => navigate('/')}
                            className="flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer text-slate-300 font-mono text-sm hover:bg-cyan-900/20 hover:text-cyan-300 transition-colors mb-1"
                        >
                            <Home className="w-4 h-4 text-cyan-500" />
                            <span>Go to Scanner</span>
                        </Command.Item>

                        <Command.Item
                            onSelect={() => navigate('/network')}
                            className="flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer text-slate-300 font-mono text-sm hover:bg-cyan-900/20 hover:text-cyan-300 transition-colors mb-1"
                        >
                            <Network className="w-4 h-4 text-cyan-500" />
                            <span>Open Trust Graph</span>
                        </Command.Item>

                        <Command.Item
                            onSelect={() => navigate('/audit')}
                            className="flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer text-slate-300 font-mono text-sm hover:bg-cyan-900/20 hover:text-cyan-300 transition-colors mb-1"
                        >
                            <ScanEye className="w-4 h-4 text-cyan-500" />
                            <span>Check Identity Audit</span>
                        </Command.Item>

                        <Command.Item
                            onSelect={() => navigate('/protocols')}
                            className="flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer text-slate-300 font-mono text-sm hover:bg-cyan-900/20 hover:text-cyan-300 transition-colors mb-1"
                        >
                            <Database className="w-4 h-4 text-cyan-500" />
                            <span>System Protocols</span>
                        </Command.Item>
                    </Command.Group>

                    {/* Tools Section */}
                    <Command.Group
                        heading="Tools"
                        className="text-[10px] font-mono text-cyan-600 uppercase tracking-wider px-2 py-2 mt-2"
                    >
                        <Command.Item
                            onSelect={() => navigate('/terminal')}
                            className="flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer text-slate-300 font-mono text-sm hover:bg-cyan-900/20 hover:text-cyan-300 transition-colors mb-1"
                        >
                            <Shield className="w-4 h-4 text-cyan-500" />
                            <span>Cyber Terminal</span>
                        </Command.Item>

                        <Command.Item
                            onSelect={() => navigate('/map')}
                            className="flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer text-slate-300 font-mono text-sm hover:bg-cyan-900/20 hover:text-cyan-300 transition-colors mb-1"
                        >
                            <Map className="w-4 h-4 text-cyan-500" />
                            <span>Live Threat Map</span>
                        </Command.Item>

                        <Command.Item
                            onSelect={() => navigate('/phone')}
                            className="flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer text-slate-300 font-mono text-sm hover:bg-cyan-900/20 hover:text-cyan-300 transition-colors mb-1"
                        >
                            <Phone className="w-4 h-4 text-cyan-500" />
                            <span>Trace Phone Number</span>
                        </Command.Item>
                    </Command.Group>

                    {/* System Section */}
                    <Command.Group
                        heading="System"
                        className="text-[10px] font-mono text-cyan-600 uppercase tracking-wider px-2 py-2 mt-2"
                    >
                        <Command.Item
                            onSelect={() => {
                                // Theme toggle placeholder - can be implemented later
                                console.log('Matrix Mode activated');
                                setOpen(false);
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer text-slate-300 font-mono text-sm hover:bg-cyan-900/20 hover:text-cyan-300 transition-colors mb-1"
                        >
                            <Zap className="w-4 h-4 text-cyan-500" />
                            <span>Theme: Matrix Mode</span>
                            <span className="ml-auto text-[10px] text-slate-600">(Coming Soon)</span>
                        </Command.Item>
                    </Command.Group>
                </Command.List>

                {/* Footer Hint */}
                <div className="border-t border-cyan-900/30 px-4 py-2 bg-black/30 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-slate-600 font-mono">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-cyan-950/50 border border-cyan-900/50 rounded">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-cyan-950/50 border border-cyan-900/50 rounded">↓</kbd>
                            Navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-cyan-950/50 border border-cyan-900/50 rounded">↵</kbd>
                            Select
                        </span>
                    </div>
                    <span className="text-[10px] text-cyan-700 font-mono">
                        OMNI-COMMAND v1.0
                    </span>
                </div>
            </Command>
        </div>
    );
}
