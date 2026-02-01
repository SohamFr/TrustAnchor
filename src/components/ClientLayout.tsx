'use client';

import { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import { ProtocolRibbon } from "@/components/ProtocolRibbon";
import { Footer } from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";
import { X, ShieldCheck, LogOut, Cpu } from 'lucide-react';
import { SignOutButton } from "@clerk/nextjs";
import { ScanProvider } from "@/context/ScanContext";
import { SecurityProvider } from "@/context/SecurityContext";
import { UserProgressProvider } from "@/context/UserProgressContext";

import { usePathname } from 'next/navigation';

import dynamic from 'next/dynamic';

const CyberBackground = dynamic(() => import('@/components/CyberBackground'), { ssr: false });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const pathname = usePathname();

    // Responsive Sidebar State
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        // Set initial state
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (pathname === '/terminal') {
        return (
            <UserProgressProvider>
                <SecurityProvider>
                    <ScanProvider>
                        {children}
                    </ScanProvider>
                </SecurityProvider>
            </UserProgressProvider>
        );
    }

    return (
        <UserProgressProvider>
            <SecurityProvider>
                <CyberBackground>
                    <div className="flex h-screen w-full relative bg-transparent">
                        {/* Mobile Overlay */}
                        {isSidebarOpen && (
                            <div
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                                onClick={() => setIsSidebarOpen(false)}
                            />
                        )}

                        {/* Hamburger Menu (Mobile Only) */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="fixed top-4 left-4 z-50 p-2 bg-cyan-950/80 border border-cyan-500/30 rounded text-cyan-400 md:hidden hover:bg-cyan-900/80 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>

                        {/* Sidebar */}
                        <Sidebar
                            isOpen={isSidebarOpen}
                            setIsOpen={setIsSidebarOpen}
                            openSettings={() => setIsSettingsOpen(true)}
                        />

                        {/* Main Content Area */}
                        <main
                            className={`flex-1 relative overflow-auto transition-all duration-300 bg-transparent 
                                ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-16'}
                            `}
                        >
                            <ScanProvider>
                                <CommandPalette />
                                {children}
                                <Footer />
                                <ProtocolRibbon />
                            </ScanProvider>
                        </main>

                        {/* System Settings Modal */}
                        {isSettingsOpen && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                <div className="bg-[#050A14] border border-cyan-900/50 rounded-xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_15px_cyan]" />

                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-mono font-bold text-cyan-400 flex items-center gap-2">
                                            <Cpu className="w-5 h-5" /> SYSTEM_CONFIG
                                        </h2>
                                        <button onClick={() => setIsSettingsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-4 font-mono text-sm">
                                        <div className="flex justify-between p-3 bg-slate-900/50 rounded border border-white/5">
                                            <span className="text-slate-400">System Status</span>
                                            <span className="text-emerald-400 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                ONLINE
                                            </span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-slate-900/50 rounded border border-white/5">
                                            <span className="text-slate-400">API Latency</span>
                                            <span className="text-slate-400 sensitive-data delay-75">45ms</span>
                                        </div>
                                        <div className="p-3 bg-slate-900/50 rounded border border-white/5">
                                            <span className="text-slate-400 block mb-2">Active Protocols</span>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] rounded border border-cyan-500/30">IDENTITY_MASK</span>
                                                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] rounded border border-cyan-500/30">NEURAL_FIREWALL</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <SignOutButton>
                                            <button className="flex items-center gap-2 px-4 py-2 bg-rose-950/30 border border-rose-900/50 text-rose-400 hover:bg-rose-900/50 transition-colors rounded text-xs tracking-wider uppercase">
                                                <LogOut size={14} />
                                                Terminate Session
                                            </button>
                                        </SignOutButton>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CyberBackground>
            </SecurityProvider>
        </UserProgressProvider>
    );
}
