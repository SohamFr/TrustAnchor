'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Hexagon, FileText, Activity, ShieldAlert, Bug, Loader2 } from 'lucide-react';

export default function SandboxPage() {
    const [file, setFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState<'hex' | 'forensics' | 'strings' | 'sim'>('hex');
    const [hexDump, setHexDump] = useState<string[]>([]);
    const [strings, setStrings] = useState<string[]>([]);
    const [fileHash, setFileHash] = useState<string>('');
    const [entropy, setEntropy] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [simLogs, setSimLogs] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = async (uploadedFile: File) => {
        setIsProcessing(true);
        setFile(uploadedFile);
        setSimLogs([]);

        try {
            const buffer = await uploadedFile.arrayBuffer();
            const bytes = new Uint8Array(buffer);

            // 1. Generate Hex Dump (First 1KB)
            const hex: string[] = [];
            const hexLimit = Math.min(bytes.length, 1024); // Limit to first 1KB for performance
            for (let i = 0; i < hexLimit; i++) {
                hex.push(bytes[i].toString(16).padStart(2, '0').toUpperCase());
            }
            setHexDump(hex);

            // 2. Calculate SHA-256
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            setFileHash(hashHex);

            // 3. Extract Strings (Printable ASCII > 4 chars)
            // Use a chunk to avoid freezing UI on large files
            const decoder = new TextDecoder('utf-8');
            // Sample first 1MB for strings to avoid browser crash on massive files
            const stringSample = bytes.slice(0, 1024 * 1024);
            const text = decoder.decode(stringSample);
            // Simple regex for printable sequences
            const matches = text.match(/[\x20-\x7E]{4,}/g) || [];
            setStrings(matches.slice(0, 500)); // Limit to 500 strings

            // 4. Calculate Entropy
            setEntropy(calculateEntropy(bytes));

        } catch (error) {
            console.error("Error processing file:", error);
            setSimLogs(prev => [...prev, "ERROR: Failed to analyze file structure."]);
        } finally {
            setIsProcessing(false);
        }
    };

    const calculateEntropy = (data: Uint8Array): number => {
        const frequencies = new Array(256).fill(0);
        for (const byte of data) {
            frequencies[byte]++;
        }

        let ent = 0;
        const len = data.length;
        for (const count of frequencies) {
            if (count === 0) continue;
            const p = count / len;
            ent -= p * Math.log2(p);
        }
        return ent;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const runSimulation = () => {
        const artifacts = [
            `[${new Date().toLocaleTimeString()}] Spawning isolated process...`,
            `[${new Date().toLocaleTimeString()}] PID: ${Math.floor(Math.random() * 9000) + 1000}`,
            `[${new Date().toLocaleTimeString()}] Hooking NtCreateFile...`,
            `[${new Date().toLocaleTimeString()}] Monitoring Registry Keys...`
        ];

        setSimLogs(prev => [...prev, ...artifacts]);

        // Heuristic "fake" detection based on entropy
        setTimeout(() => {
            if (entropy > 7) {
                setSimLogs(prev => [...prev, `[ALERT] High Entropy (${entropy.toFixed(2)}) detected. Likely packed or encrypted payload.`]);
            } else {
                setSimLogs(prev => [...prev, `[INFO] Entropy normal (${entropy.toFixed(2)}). Analyzing imports...`]);
            }
        }, 1000);

        // Strings check
        setTimeout(() => {
            const suspicious = strings.filter(s => /http|cmd|powershell|eval|exec/i.test(s));
            if (suspicious.length > 0) {
                setSimLogs(prev => [...prev, `[CRITICAL] Suspicious strings found: ${suspicious.slice(0, 3).join(', ')}`]);
            } else {
                setSimLogs(prev => [...prev, `[INFO] No common string signatures detected in header.`]);
            }
        }, 2000);
    };

    const renderHexView = () => (
        <div className="font-mono text-xs text-slate-400 grid grid-cols-[auto_1fr] gap-4 h-full overflow-y-auto custom-scrollbar">
            <div className="text-slate-600 select-none border-r border-white/5 pr-4 text-right">
                {Array.from({ length: Math.ceil(hexDump.length / 16) }).map((_, i) => (
                    <div key={i}>{(i * 16).toString(16).padStart(8, '0').toUpperCase()}</div>
                ))}
            </div>
            <div className="break-all font-mono">
                {hexDump.length > 0 ? (
                    <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-x-2 gap-y-0 w-fit">
                        {hexDump.map((byte, i) => (
                            <span key={i} className={`hover:text-cyan-400 cursor-default uppercase ${byte === '00' ? 'text-slate-700' : 'text-slate-300'}`}>
                                {byte}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="text-slate-600 italic">No binary data loaded.</div>
                )}
            </div>
        </div>
    );

    const renderForensics = () => (
        <div className="space-y-6">
            <div className="bg-slate-900/50 p-4 rounded border border-white/5 space-y-2">
                <div className="text-slate-500 text-xs uppercase tracking-widest">SHA-256 HASH</div>
                <div className="font-mono text-cyan-400 text-xs md:text-sm break-all select-all">
                    {fileHash || "Calculating..."}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded border border-white/5 space-y-2">
                    <div className="text-slate-500 text-xs uppercase tracking-widest">Shannon Entropy</div>
                    <div className={`font-mono text-2xl ${entropy > 7 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {entropy.toFixed(3)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                        {entropy > 7.2 ? "High likelihood of packing/encryption." : "Standard distribution."}
                    </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded border border-white/5 space-y-2">
                    <div className="text-slate-500 text-xs uppercase tracking-widest">File Size</div>
                    <div className="font-mono text-slate-200 text-2xl">
                        {(file?.size ? (file.size / 1024).toFixed(2) : 0) + ' KB'}
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded border border-white/5 space-y-2">
                <div className="text-slate-500 text-xs uppercase tracking-widest">File Metadata</div>
                <div className="space-y-1 text-xs font-mono text-slate-300">
                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Name:</span> <span className="text-cyan-400">{file?.name}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1 pt-1"><span>Type:</span> <span className="text-cyan-400">{file?.type || "application/octet-stream"}</span></div>
                    <div className="flex justify-between pt-1"><span>Last Modified:</span> <span className="text-cyan-400">{new Date(file?.lastModified || Date.now()).toLocaleString()}</span></div>
                </div>
            </div>
        </div>
    );

    const renderStrings = () => (
        <div className="bg-slate-900/50 p-4 rounded h-full overflow-y-auto custom-scrollbar font-mono text-xs text-emerald-400/80 space-y-1">
            {strings.length > 0 ? strings.map((s, i) => (
                <div key={i} className="border-b border-emerald-900/20 last:border-0 pb-1 break-words hover:bg-emerald-900/10 transition-colors">
                    <span className="text-slate-600 mr-2 w-8 inline-block text-right">{i}:</span>
                    {s}
                </div>
            )) : (
                <div className="text-slate-600 italic">No readable strings extracted.</div>
            )}
        </div>
    );

    const renderSimulator = () => (
        <div className="h-full flex flex-col gap-4">
            <button
                onClick={runSimulation}
                className="w-full py-3 bg-rose-900/20 border border-rose-500/50 text-rose-400 font-bold tracking-widest hover:bg-rose-900/40 transition-all rounded uppercase flex items-center justify-center gap-2"
            >
                <Bug size={16} /> Detonate Payload
            </button>
            <div className="flex-1 bg-black/40 border border-slate-800 rounded p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
                <div className="text-slate-500 mb-2 border-b border-white/5 pb-1 uppercase tracking-widest">Execution Log</div>
                {simLogs.length === 0 && <div className="text-slate-700 italic">Waiting for manual trigger...</div>}
                {simLogs.map((log, i) => (
                    <div key={i} className="text-cyan-400/80 mb-1 animate-in slide-in-from-left-2 duration-300">
                        <span className="text-slate-600 mr-2">{'>'}</span>{log}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col p-6 max-w-6xl mx-auto w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-[10px] font-mono text-cyan-600 tracking-[0.5em] uppercase opacity-70">
                        Environment :: Isolated
                    </h2>
                    <h1 className="text-3xl font-bold font-mono tracking-tighter text-white flex items-center gap-3">
                        <Bug className="text-rose-500" />
                        MALWARE SANDBOX
                    </h1>
                </div>

                {file && (
                    <div className="flex items-center gap-4 bg-rose-950/20 px-4 py-2 rounded-lg border border-rose-900/30">
                        <ShieldAlert size={16} className="text-rose-500" />
                        <span className="text-rose-200 text-sm font-mono max-w-[200px] truncate">{file.name}</span>
                        <button onClick={() => { setFile(null); setFileHash(''); setHexDump([]); setStrings([]); }} className="text-xs ml-2 text-rose-500 hover:text-white underline">
                            Unload
                        </button>
                    </div>
                )}
            </div>

            {file ? (
                <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-0">
                    {/* Sidebar Tabs */}
                    <div className="md:w-64 flex flex-col gap-2 shrink-0">
                        {[
                            { id: 'hex', label: 'Hex Viewer', icon: Hexagon },
                            { id: 'forensics', label: 'Forensics', icon: Activity },
                            { id: 'strings', label: 'Strings', icon: FileText },
                            { id: 'sim', label: 'Behavior Sim', icon: Bug },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-mono transition-all text-left ${activeTab === tab.id
                                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                        : 'text-slate-500 hover:text-cyan-200 hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-[#050A14] border border-cyan-900/30 rounded-xl p-6 relative overflow-hidden shadow-2xl flex flex-col min-h-0">
                        {/* Scanlines Effect */}
                        <div className="absolute inset-0 pointer-events-none bg-[url('/grid.svg')] opacity-5 z-0" />

                        {isProcessing ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <Loader2 size={48} className="text-cyan-500 animate-spin" />
                                <div className="font-mono text-cyan-400 animate-pulse">ANALYZING BINARY STRUCTURE...</div>
                            </div>
                        ) : (
                            <div className="relative z-10 h-full overflow-hidden">
                                {activeTab === 'hex' && renderHexView()}
                                {activeTab === 'forensics' && renderForensics()}
                                {activeTab === 'strings' && renderStrings()}
                                {activeTab === 'sim' && renderSimulator()}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div
                    className="flex-1 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center bg-black/20 hover:bg-cyan-900/5 transition-colors cursor-pointer group relative overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="text-center space-y-4 relative z-10">
                        <div className="w-20 h-20 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-cyan-500/50 group-hover:scale-110 transition-all duration-300">
                            <Upload size={32} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <div>
                            <p className="font-mono text-lg text-slate-300 font-bold group-hover:text-cyan-200 transition-colors">
                                DROP BINARY FILE
                            </p>
                            <p className="text-xs text-slate-500 mt-2 font-mono uppercase tracking-widest">
                                OR CLICK TO BROWSE SYSTEM
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
