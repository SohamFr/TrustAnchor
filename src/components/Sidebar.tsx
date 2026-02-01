'use client';

import { useState, memo } from 'react';
import {
    Shield, Activity, Network, Settings, Home, Database,
    ChevronLeft, ChevronRight, Users, Bot, Banknote, Fingerprint,
    ChevronDown, ChevronUp, Volume2, VolumeX, ScanEye, Phone
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { useSecurity } from '../context/SecurityContext';
import { useSoundFX } from '../hooks/useSoundFX';
import { useUserProgress } from '../context/UserProgressContext';
import { GlitchText } from './GlitchText';

const Sidebar = ({ isOpen, setIsOpen, openSettings }: { isOpen: boolean, setIsOpen: (val: boolean) => void, openSettings: () => void }) => {
    const pathname = usePathname();
    const { isSignedIn, user } = useUser();
    const { isMuted, toggleMuted } = useSecurity();
    const { playSound } = useSoundFX();
    const { progress } = useUserProgress();
    const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({
        'CORE': true,
        'MODULES': true
    });

    const toggleCategory = (cat: string) => {
        setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const getLinkClass = (path: string) => {
        const isActive = pathname === path;
        return `flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-all duration-300 ml-2 border-l border-white/5 hover:border-cyan-500/50 ${isActive
            ? 'bg-cyan-900/10 text-cyan-400 border-l-cyan-500'
            : 'text-slate-500 hover:text-cyan-200 hover:bg-white/5'
            }`;
    };

    const CategoryHeader = ({ title, id }: { title: string, id: string }) => (
        <button
            onClick={() => toggleCategory(id)}
            onMouseEnter={() => playSound('tick')}
            className={`w-full flex items-center justify-between px-2 py-2 mt-4 text-[10px] font-mono font-bold text-slate-600 tracking-wider hover:text-cyan-400 transition-colors ${!isOpen && "justify-center"}`}
        >
            <span className={`${!isOpen && "hidden"}`}>{title}</span>
            {isOpen && (openCategories[id] ? <ChevronDown size={10} /> : <ChevronRight size={10} />)}
        </button>
    );

    return (
        <aside
            className={`fixed left-0 top-0 h-full bg-black/40 backdrop-blur-xl border-r border-cyan-900/30 flex flex-col z-50 transition-all duration-300
            ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-16 w-64'}
            `}
        >
            {/* Header */}
            <div className={`p-4 flex items-center gap-2 border-b border-white/5 relative ${!isOpen && "justify-center"}`}>
                <img
                    src="/logo.png"
                    alt="Trust Anchor"
                    className={`w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all ${!isOpen && "scale-90"}`}
                />
                <div className={`font-sans font-black text-xl tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                    <GlitchText text="TRUST ANCHOR" />
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute -right-3 top-6 bg-cyan-950 border border-cyan-700 text-cyan-400 rounded-full p-1 hover:bg-cyan-900 transition-colors z-50 shadow-lg"
                >
                    {isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
                </button>
            </div>

            <nav className="flex-1 px-2 space-y-1 mt-4 overflow-y-auto custom-scrollbar">

                {/* Dashboard - Always Visible */}
                <Link
                    href="/"
                    onMouseEnter={() => playSound('tick')}
                    className={`flex items-center gap-3 px-3 py-3 rounded mb-2 ${pathname === '/' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                >
                    <Home size={20} className="min-w-[20px]" />
                    <span className={`font-mono text-xs font-bold tracking-wider ${isOpen ? 'opacity-100' : 'hidden'}`}>DASHBOARD</span>
                </Link>

                {/* Modules Category */}
                {isOpen && <CategoryHeader title="MODULES" id="MODULES" />}

                {isOpen && openCategories['MODULES'] && (
                    <div className="space-y-1 animate-in slide-in-from-left-2 duration-300">
                        <Link href="/social" className={getLinkClass('/social')} title="Social Trust">
                            <Users size={16} className="min-w-[16px]" />
                            <span className="font-mono text-xs whitespace-nowrap">Social Trust</span>
                        </Link>
                        <Link href="/ai" className={getLinkClass('/ai')} title="AI & Automation">
                            <Bot size={16} className="min-w-[16px]" />
                            <span className="font-mono text-xs whitespace-nowrap">AI & Automation</span>
                        </Link>
                        <Link href="/finance" className={getLinkClass('/finance')} title="Financial">
                            <Banknote size={16} className="min-w-[16px]" />
                            <span className="font-mono text-xs whitespace-nowrap">Financial</span>
                        </Link>
                        <Link href="/identity" className={getLinkClass('/identity')} title="Identity">
                            <Fingerprint size={16} className="min-w-[16px]" />
                            <span className="font-mono text-xs whitespace-nowrap">Identity</span>
                        </Link>
                        <Link href="/academy" className={getLinkClass('/academy')} title="Trust Academy">
                            <Users size={16} className="min-w-[16px]" />
                            <span className="font-mono text-xs whitespace-nowrap">Trust Academy</span>
                        </Link>
                    </div>
                )}

                {/* Collapsed Icons for Modules */}
                {!isOpen && (
                    <div className="flex flex-col gap-4 items-center mt-4">
                        <Link href="/social" title="Social"><Users size={20} className="text-slate-500 hover:text-cyan-400" /></Link>
                        <Link href="/ai" title="AI"><Bot size={20} className="text-slate-500 hover:text-cyan-400" /></Link>
                        <Link href="/finance" title="Financial"><Banknote size={20} className="text-slate-500 hover:text-cyan-400" /></Link>
                        <Link href="/academy" title="Academy"><Users size={20} className="text-slate-500 hover:text-cyan-400" /></Link>
                    </div>
                )}

                {/* Tools Category */}
                {isOpen && <CategoryHeader title="TOOLS" id="TOOLS" />}

                {isOpen && openCategories['TOOLS'] && (
                    <div className="space-y-1 animate-in slide-in-from-left-2 duration-300">
                        <Link href="/terminal" className={getLinkClass('/terminal')} title="Cyber Terminal">
                            <Shield size={16} className="min-w-[16px]" />
                            <span className="font-mono text-xs whitespace-nowrap">Cyber Terminal</span>
                        </Link>
                        <Link href="/sandbox" className={getLinkClass('/sandbox')} title="Malware Sandbox">
                            <Activity size={16} className="min-w-[16px]" />
                            <span className="font-mono text-xs whitespace-nowrap">Malware Sandbox</span>
                        </Link>
                        <Link href="/audit" className={getLinkClass('/audit')} title="Identity Exposure Audit">
                            <ScanEye size={16} className="min-w-[16px]" />
                            <span className="font-mono text-xs whitespace-nowrap">Identity Audit</span>
                        </Link>
                        <Link href="/phone" className={getLinkClass('/phone')} title="Phone Intelligence">
                            <Phone size={16} className="min-w-[16px]" />
                            <span className="font-mono text-xs whitespace-nowrap">Signal Tracer</span>
                        </Link>
                    </div>
                )}

                {/* Collapsed Icons for Tools */}
                {!isOpen && (
                    <div className="flex flex-col gap-4 items-center mt-4 border-t border-white/5 pt-4">
                        <Link href="/terminal" title="Terminal"><Shield size={20} className="text-slate-500 hover:text-cyan-400" /></Link>
                        <Link href="/sandbox" title="Sandbox"><Activity size={20} className="text-slate-500 hover:text-cyan-400" /></Link>
                        <Link href="/audit" title="Identity Audit"><ScanEye size={20} className="text-slate-500 hover:text-cyan-400" /></Link>
                        <Link href="/phone" title="Phone Tracer"><Phone size={20} className="text-slate-500 hover:text-cyan-400" /></Link>
                    </div>
                )}

                {/* Intelligence Category */}
                {isOpen && <CategoryHeader title="INTELLIGENCE" id="CORE" />}

                {isOpen && openCategories['CORE'] && (
                    <div className="space-y-1 animate-in slide-in-from-left-2 duration-300">
                        <Link href="/network" className={getLinkClass('/network')} title="Trust Graph">
                            <Network size={16} className="min-w-[16px]" />
                            <span className="font-mono text-xs whitespace-nowrap">Global Graph</span>
                        </Link>
                        <Link href="/map" className={getLinkClass('/map')} title="Threat Map">
                            <Activity size={16} className="min-w-[16px]" />
                            <span className="font-mono text-xs whitespace-nowrap">Live Map</span>
                        </Link>
                        <Link href="/protocols" className={getLinkClass('/protocols')} title="Protocols">
                            <Database size={16} className="min-w-[16px]" />
                            <span className="font-mono text-xs whitespace-nowrap">Protocols</span>
                        </Link>
                    </div>
                )}

                {!isOpen && (
                    <div className="flex flex-col gap-4 items-center mt-4 border-t border-white/5 pt-4">
                        <Link href="/network" title="Graph"><Network size={20} className="text-slate-500 hover:text-cyan-400" /></Link>
                        <Link href="/map" title="Map"><Activity size={20} className="text-slate-500 hover:text-cyan-400" /></Link>
                    </div>
                )}

            </nav>

            <div className="p-2 border-t border-cyan-900/30 space-y-2">
                {/* User Profile */}
                {isSignedIn ? (
                    <Link
                        href="/profile"
                        onMouseEnter={() => playSound('tick')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-white/5 transition-colors cursor-pointer ${!isOpen && "justify-center"}`}
                    >
                        <img
                            src={user?.imageUrl || '/default-avatar.png'}
                            alt="Profile"
                            className="w-8 h-8 rounded-full border border-cyan-500/50 shrink-0"
                        />
                        {isOpen && (
                            <div className="flex-1 text-left">
                                <div className="text-xs font-mono text-cyan-200 tracking-wider">
                                    {user?.fullName || user?.username || 'Operator'}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                    LVL {progress.level} • {progress.xp} XP
                                </div>
                            </div>
                        )}
                    </Link>
                ) : (
                    <SignInButton mode="modal">
                        <button className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 px-3 py-2">
                            <Users size={20} className="min-w-[20px]" />
                            <span className={`font-mono text-xs tracking-wider whitespace-nowrap ${isOpen ? 'opacity-100' : 'hidden'}`}>LOGIN</span>
                        </button>
                    </SignInButton>
                )}

                <button
                    onClick={toggleMuted}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors rounded hover:bg-white/5 ${!isOpen && "justify-center"}`}
                    title={isMuted ? "Unmute Sound" : "Mute Sound"}
                    onMouseEnter={() => playSound('tick')}
                >
                    {isMuted ? <VolumeX size={20} className="min-w-[20px]" /> : <Volume2 size={20} className="min-w-[20px]" />}
                    <span className={`font-mono text-xs tracking-wider whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                        AUDIO: {isMuted ? 'OFF' : 'ON'}
                    </span>
                </button>

                <button
                    onClick={openSettings}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors rounded hover:bg-white/5 ${!isOpen && "justify-center"}`}
                    title="System Settings"
                >
                    <Settings size={20} className="min-w-[20px]" />
                    <span className={`font-mono text-xs tracking-wider whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                        SYSTEM
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default memo(Sidebar);
