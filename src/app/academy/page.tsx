'use client';

import { useState } from 'react';
import { Book, Shield, Lock, Globe, CheckCircle, Play, ChevronRight, GraduationCap } from 'lucide-react';

const MODULES = [
    {
        id: 1,
        title: "Phishing Detection 101",
        description: "Learn to identify sophisticated social engineering attacks and email spoofing.",
        level: "Beginner",
        duration: "15 min",
        progress: 100,
        status: "completed"
    },
    {
        id: 2,
        title: "Network Typography",
        description: "Understanding IP addresses, DNS resolution, and secure socket layers.",
        level: "Intermediate",
        duration: "25 min",
        progress: 45,
        status: "in-progress"
    },
    {
        id: 3,
        title: "Encryption Basics",
        description: "Symmetric vs Asymmetric encryption, hashing, and digital signatures.",
        level: "intermediate",
        duration: "30 min",
        progress: 0,
        status: "locked"
    },
    {
        id: 4,
        title: "Zero Trust Architecture",
        description: "Why 'Never Trust, Always Verify' is the future of enterprise security.",
        level: "Advanced",
        duration: "45 min",
        progress: 0,
        status: "locked"
    }
];

export default function AcademyPage() {
    const [activeModule, setActiveModule] = useState<number | null>(null);

    return (
        <div className="min-h-full p-6 max-w-6xl mx-auto w-full">
            <div className="flex flex-col md:flex-row gap-8 mb-12 items-end justify-between">
                <div className="space-y-4">
                    <h2 className="text-[10px] font-mono text-cyan-600 tracking-[0.5em] uppercase opacity-70">
                        Knowledge Base :: v2.1
                    </h2>
                    <h1 className="text-3xl md:text-5xl font-bold font-mono tracking-tighter text-white flex items-center gap-4">
                        <GraduationCap className="text-cyan-400" size={48} />
                        TRUST ACADEMY
                    </h1>
                    <p className="max-w-xl text-slate-400 font-light text-sm">
                        Interactive cybersecurity curriculum designed to enhance digital literacy and threat awareness.
                    </p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex gap-8">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">4</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Modules</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-400">1</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Completed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-400">25%</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Progress</div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {MODULES.map((module) => (
                    <div
                        key={module.id}
                        className={`group relative bg-[#050A14] border rounded-xl overflow-hidden transition-all duration-300 ${module.status === 'locked'
                                ? 'border-slate-800 opacity-60'
                                : 'border-cyan-900/30 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(8,145,178,0.1)]'
                            }`}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${module.level === 'Beginner' ? 'bg-emerald-950/30 text-emerald-400' :
                                        module.level === 'Intermediate' ? 'bg-amber-950/30 text-amber-400' :
                                            'bg-rose-950/30 text-rose-400'
                                    }`}>
                                    {module.level}
                                </div>
                                {module.status === 'completed' ? (
                                    <CheckCircle className="text-emerald-500" size={20} />
                                ) : module.status === 'locked' ? (
                                    <Lock className="text-slate-600" size={20} />
                                ) : (
                                    <Play className="text-cyan-400" size={20} />
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-slate-100 mb-2 font-mono group-hover:text-cyan-400 transition-colors">
                                {module.title}
                            </h3>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                {module.description}
                            </p>

                            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                                <span>{module.duration}</span>

                                {module.status !== 'locked' && (
                                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-cyan-500 rounded-full"
                                            style={{ width: `${module.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {module.status !== 'locked' && (
                            <button className="w-full py-3 bg-white/5 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 border-t border-white/5 group-hover:border-cyan-500/20">
                                {module.status === 'completed' ? 'Review Module' : 'Continue Learning'}
                                <ChevronRight size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Tip Widget */}
            <div className="mt-12 bg-gradient-to-r from-cyan-950/30 to-purple-950/30 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="bg-slate-950 p-3 rounded-full border border-white/10">
                    <Shield size={32} className="text-cyan-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-lg font-bold text-white mb-1">Daily Security Tip</h4>
                    <p className="text-slate-400 text-sm">Enable Multi-Factor Authentication (MFA) on all sensitive accounts using an authenticator app rather than SMS.</p>
                </div>
                <button className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-cyan-50 transition-colors whitespace-nowrap">
                    Read More
                </button>
            </div>
        </div>
    );
}
