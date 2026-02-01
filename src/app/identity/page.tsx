'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldAlert, ShieldCheck, FileText, Globe, Mail, AlertTriangle } from 'lucide-react';
import { validateEmail, checkDomain } from './actions';

// --- Typewriter Component ---
const Typewriter = ({ text, speed = 20, className = "" }: { text: string; speed?: number; className?: string }) => {
    const [displayedText, setDisplayedText] = useState('');

    React.useEffect(() => {
        setDisplayedText(''); // Reset on new text
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => text.substring(0, i + 1));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return <p className={className}>{displayedText}</p>;
};

// --- Dossier Card Component ---
const DossierCard = ({
    title,
    data,
    riskScore,
    type
}: {
    title: string;
    data: any;
    riskScore: 'CRITICAL' | 'SAFE' | 'UNKNOWN';
    type: 'EMAIL' | 'DOMAIN'
}) => {
    const isCritical = riskScore === 'CRITICAL';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`relative w-full max-w-2xl bg-[#1a1a1a] border-l-4 ${isCritical ? 'border-red-500' : 'border-green-500'} p-6 shadow-2xl font-mono overflow-hidden`}
            style={{
                boxShadow: isCritical ? '0 0 20px rgba(239, 68, 68, 0.2)' : '0 0 20px rgba(34, 197, 94, 0.2)'
            }}
        >
            {/* Background Texture similar to old paper or grid */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            {/* Stamp */}
            <motion.div
                initial={{ opacity: 0, scale: 2, rotate: -20 }}
                animate={{ opacity: 0.15, scale: 1, rotate: -15 }}
                transition={{ delay: 1.5, duration: 0.5, type: 'spring' }}
                className={`absolute top-4 right-10 border-4 ${isCritical ? 'border-red-600 text-red-600' : 'border-green-600 text-green-600'} rounded p-2 text-4xl font-black uppercase tracking-widest pointer-events-none select-none`}
            >
                {riskScore}
            </motion.div>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6 border-b border-gray-700 pb-4">
                <div className={`p-3 rounded-full ${isCritical ? 'bg-red-900/30 text-red-500' : 'bg-green-900/30 text-green-500'}`}>
                    {type === 'EMAIL' ? <Mail size={24} /> : <Globe size={24} />}
                </div>
                <div>
                    <h2 className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-1">Subject</h2>
                    <h3 className="text-xl text-white font-bold tracking-wide">{title}</h3>
                </div>
            </div>

            {/* Content Body */}
            <div className="space-y-4 text-sm text-gray-300">
                {Object.entries(data).map(([key, value], idx) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <span className="text-gray-500 uppercase w-32 shrink-0 text-xs">{key.replace(/_/g, ' ')}:</span>
                        <Typewriter
                            text={String(value)}
                            speed={10 + (Math.random() * 20)}
                            className={key === 'Risk Analysis' && isCritical ? 'text-red-400 font-bold' : 'text-green-400'}
                        />
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-8 border-t border-gray-800 pt-4 flex justify-between items-center text-[10px] text-gray-600 uppercase tracking-wider">
                <span>Classified: TOP SECRET</span>
                <span>Gen. Date: {new Date().toLocaleDateString()}</span>
            </div>
        </motion.div>
    );
};

export default function IdentityPage() {
    const [email, setEmail] = useState('');
    const [domain, setDomain] = useState('');
    const [mode, setMode] = useState<'EMAIL' | 'DOMAIN'>('EMAIL');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        // Artificial delay for "processing" effect
        await new Promise(r => setTimeout(r, 800));

        if (mode === 'EMAIL') {
            const res = await validateEmail(email);
            if (res.error) {
                setResult({ error: res.error });
            } else {
                setResult({
                    type: 'EMAIL',
                    subject: email,
                    data: {
                        "Target ID": email,
                        "Disposable Status": res.disposable ? "CONFIRMED BURNER" : "STANDARD ACCOUNT",
                        "Risk Analysis": res.disposable ? "HIGH PROBABILITY OF FRAUD" : "LOW RISK DETECTED",
                        "Provider Check": res.raw?.reason || "N/A"
                    },
                    riskScore: res.disposable ? 'CRITICAL' : 'SAFE'
                });
            }
        } else {
            const res = await checkDomain(domain);
            if (res.error) {
                setResult({ error: res.error });
            } else {
                const isCritical = (res.threatCount || 0) > 0;
                setResult({
                    type: 'DOMAIN',
                    subject: domain,
                    data: {
                        "Target Host": domain,
                        "Threat Pulse": `${res.threatCount || 0} INDICATORS FOUND`,
                        "Registry Check": "ARCHIVED",
                        "Risk Analysis": isCritical ? "KNOWN THREAT DETECTED" : "NO ACTIVE THREATS"
                    },
                    riskScore: isCritical ? 'CRITICAL' : 'SAFE'
                });
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center relative overflow-hidden">

            {/* Grid Background */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="z-10 w-full max-w-4xl mb-12 text-center"
            >
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    IDENTITY_RESOLVER
                </h1>
                <p className="text-gray-500 font-mono text-sm uppercase tracking-[0.3em]">
                    Open Source Intelligence Bureau
                </p>
            </motion.div>

            {/* Input Selection */}
            <div className="z-10 w-full max-w-xl mb-12">
                <div className="flex bg-gray-900/50 p-1 rounded-lg backdrop-blur mb-8 border border-gray-800">
                    <button
                        onClick={() => { setMode('EMAIL'); setResult(null); }}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all rounded-md flex items-center justify-center gap-2 ${mode === 'EMAIL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Mail size={16} /> Email Trace
                    </button>
                    <button
                        onClick={() => { setMode('DOMAIN'); setResult(null); }}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all rounded-md flex items-center justify-center gap-2 ${mode === 'DOMAIN' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Globe size={16} /> Domain Intel
                    </button>
                </div>

                <form onSubmit={handleAnalyze} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative bg-black border border-gray-800 rounded-xl p-2 flex items-center">
                        <div className="pl-4 text-gray-500">
                            <Search size={20} />
                        </div>
                        <input
                            type={mode === 'EMAIL' ? 'email' : 'text'}
                            required
                            value={mode === 'EMAIL' ? email : domain}
                            onChange={(e) => mode === 'EMAIL' ? setEmail(e.target.value) : setDomain(e.target.value)}
                            placeholder={mode === 'EMAIL' ? "Enter target email address..." : "Enter domain (e.g., example.com)..."}
                            className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 font-mono placeholder:text-gray-700 w-full"
                        />
                        <button
                            disabled={loading}
                            type="submit"
                            className="bg-white text-black font-bold uppercase text-xs px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Scanning..." : "Analyze"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Section */}
            <div className="z-10 w-full flex justify-center min-h-[400px]">
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center text-gray-500 gap-4"
                        >
                            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="font-mono text-xs animate-pulse">ESTABLISHING SECURE CONNECTION...</p>
                        </motion.div>
                    )}

                    {!loading && result && !result.error && (
                        <DossierCard
                            key="result"
                            title={result.subject}
                            type={result.type}
                            riskScore={result.riskScore}
                            data={result.data}
                        />
                    )}

                    {!loading && result && result.error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-900/20 border border-red-500/50 p-6 rounded-xl flex items-center gap-4 text-red-400 max-w-md"
                        >
                            <div className="bg-red-900/50 p-3 rounded-full">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold">Scan Failed</h3>
                                <p className="text-sm opacity-80">{result.error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
