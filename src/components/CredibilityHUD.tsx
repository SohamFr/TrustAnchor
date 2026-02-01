'use client';

import { ShieldCheck } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export function CredibilityHUD() {
    return (
        <nav className="fixed top-0 left-0 w-full p-4 z-50 flex justify-between items-center bg-transparent backdrop-blur-[2px]">
            {/* Brand / Logo Area */}
            <div className="flex items-center gap-2 group cursor-pointer">
                <div className="relative">
                    <ShieldCheck className="w-6 h-6 text-cyan-500 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                    <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full animate-pulse" />
                </div>
                <span className="font-mono text-sm tracking-widest text-cyan-100 font-bold group-hover:text-cyan-400 transition-colors">
                    TRUST<span className="text-slate-500">::</span>ANCHOR
                </span>
            </div>

            {/* Right Side Status Indicators */}
            <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] items-center font-mono text-emerald-500 tracking-wider flex gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        SYSTEM_ONLINE
                    </span>
                    <span className="text-[9px] font-mono text-slate-600">
                        SECURE_LINK_ESTABLISHED
                    </span>
                </div>

                <div className="flex items-center">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-xs font-mono text-cyan-400 border border-cyan-900 px-3 py-1 bg-cyan-950/30 hover:bg-cyan-900/50 transition-all rounded-sm">
                                ACCESS_TERMINAL
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8 ring-2 ring-cyan-900 hover:ring-cyan-500 transition-all"
                                }
                            }}
                        />
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
}
