'use client';

import { HelpCircle, Mail, DollarSign, ChevronDown, ChevronUp, Phone, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function Footer() {
    const [openSection, setOpenSection] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [revealed, setRevealed] = useState(false);

    const upiId = "7044271606@upi";

    const handleCopy = () => {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggle = (section: string) => setOpenSection(openSection === section ? null : section);

    return (
        <footer className="w-full bg-[#030711] border-t border-cyan-900/30 mt-24 pb-24 z-10 relative">
            <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-12">

                {/* 1. FAQ Section */}
                <div>
                    <button onClick={() => toggle('faq')} className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-bold tracking-widest mb-4 hover:text-white transition-colors">
                        <HelpCircle size={16} /> FAQ
                        {openSection === 'faq' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <div className={`space-y-4 transition-all overflow-hidden ${openSection === 'faq' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-50'}`}>
                        <div className="text-xs text-slate-400">
                            <strong className="text-slate-200 block mb-1">How is the score calculated?</strong>
                            Using heuristic analysis of domain age, SSL validity, and social graph citations via our internal TrustGraph protocol.
                        </div>
                        <div className="text-xs text-slate-400">
                            <strong className="text-slate-200 block mb-1">Is this data real?</strong>
                            Data is simulated for demonstration but relies on real-time API formatting guidelines for future integration.
                        </div>
                    </div>
                </div>

                {/* 2. Contact Section */}
                <div>
                    <button onClick={() => toggle('contact')} className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold tracking-widest mb-4 hover:text-white transition-colors">
                        <Mail size={16} /> CONTACT_US
                        {openSection === 'contact' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <div className={`space-y-4 transition-all overflow-hidden ${openSection === 'contact' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-50'}`}>
                        <div className="space-y-3">
                            {/* Phone */}
                            <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded flex items-center gap-4 group cursor-default">
                                <div className="p-2 bg-emerald-900/20 rounded-full text-emerald-400 group-hover:text-emerald-300 transition-colors">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 font-mono block tracking-widest">SECURE_LINE</span>
                                    <span className="text-slate-300 font-mono text-xs group-hover:text-emerald-400 transition-colors">+91 7044271606</span>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded flex items-center gap-4 group cursor-pointer">
                                <div className="p-2 bg-emerald-900/20 rounded-full text-emerald-400 group-hover:text-emerald-300 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 font-mono block tracking-widest">ENCRYPTED_MAIL</span>
                                    <a href="mailto:gsohamp@gmail.com" className="text-slate-300 font-mono text-xs group-hover:text-emerald-400 transition-colors">gsohamp@gmail.com</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Donation Section */}
                <div>
                    <button onClick={() => toggle('donate')} className="flex items-center gap-2 text-rose-400 font-mono text-sm font-bold tracking-widest mb-4 hover:text-white transition-colors">
                        <DollarSign size={16} /> DONATE / SUPPORT
                        {openSection === 'donate' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <div className={`space-y-4 transition-all overflow-hidden ${openSection === 'donate' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-50'}`}>
                        <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded">
                            <div className="text-center mb-4">
                                <span className="text-rose-400 font-mono font-bold text-xs tracking-widest">SUPPORT_THE_NETWORK</span>
                            </div>

                            <div className="bg-black/40 border border-rose-900/20 rounded p-3 flex items-center justify-between group hover:border-rose-500/30 transition-colors">
                                <div>
                                    <span className="text-[10px] text-slate-500 block mb-1 font-mono">UPI_ID</span>
                                    <span className="text-rose-300 font-mono text-sm tracking-wider">
                                        {revealed ? upiId : "•••• •••• ••••"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setRevealed(!revealed)}
                                        className="p-2 hover:bg-rose-900/20 rounded text-slate-400 hover:text-cyan-400 transition-colors"
                                        title={revealed ? "Hide ID" : "Reveal ID"}
                                    >
                                        {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 hover:bg-rose-900/20 rounded text-slate-400 hover:text-rose-400 transition-colors relative"
                                        title="Copy UPI ID"
                                    >
                                        {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="text-center text-[10px] text-slate-700 font-mono uppercase border-t border-white/5 pt-4 mt-4">
                TrustAnchor Systems v4.2 • Decentralized Intelligence
            </div>
        </footer>
    );
}
