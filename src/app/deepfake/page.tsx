'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileScan, ShieldAlert, ShieldCheck, RefreshCcw } from 'lucide-react';
import { useSoundFX } from '@/hooks/useSoundFX';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function DeepfakeDetector() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Simulated heatmap data (random blobs)
    const heatmapPoints = [
        { x: '20%', y: '30%', type: 'artifact', size: '120px' },
        { x: '60%', y: '50%', type: 'organic', size: '150px' },
        { x: '40%', y: '70%', type: 'artifact', size: '100px' },
    ];

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            handleFileSelect(droppedFile);
        }
    };

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
            startScan();
        };
        reader.readAsDataURL(selectedFile);
    };

    const { playSound } = useSoundFX();

    const startScan = () => {
        setIsScanning(true);
        setScanComplete(false);
        playSound('click');

        // Simulate heuristic scan duration
        setTimeout(() => {
            setIsScanning(false);
            setScanComplete(true);
            playSound('powerUp');
        }, 3000);
    };

    const resetTool = () => {
        setFile(null);
        setPreview(null);
        setIsScanning(false);
        setScanComplete(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-cyan-500 font-mono p-8 selection:bg-cyan-500/20 selection:text-cyan-300">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex justify-between items-center border-b border-cyan-900/50 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-widest uppercase flex items-center gap-3">
                            <FileScan className="w-8 h-8 text-cyan-400" />
                            TrustAnchor <span className="text-cyan-600">//</span> Deepfake Lens
                        </h1>
                        <p className="text-cyan-700 mt-2 text-sm tracking-widest">
                            HEURISTIC MEDIA INTEGRITY ANALYZER v0.9.2
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-cyan-950/30 rounded border border-cyan-900/50">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-cyan-300">SYSTEM ONLINE</span>
                    </div>
                </header>

                <main className="relative min-h-[600px] flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        {!file ? (
                            /* Upload Zone */
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={cn(
                                    "w-full max-w-2xl h-96 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group",
                                    isDragging
                                        ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]"
                                        : "border-cyan-800/50 hover:border-cyan-600 hover:bg-cyan-950/10"
                                )}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                />

                                <div className="z-10 flex flex-col items-center gap-4 text-center p-6">
                                    <div className={cn(
                                        "p-6 rounded-full bg-cyan-950/50 ring-1 ring-cyan-800 transition-transform duration-500",
                                        isDragging ? "scale-110 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]" : "group-hover:scale-105"
                                    )}>
                                        <Upload className="w-10 h-10 text-cyan-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-white">Drop Evidence File</h3>
                                        <p className="text-cyan-600 text-sm">Or click to initiate manual upload stream</p>
                                    </div>
                                    <div className="flex gap-4 mt-4 text-xs text-cyan-700 font-mono">
                                        <span className="border border-cyan-900/50 px-2 py-1 rounded">JPG</span>
                                        <span className="border border-cyan-900/50 px-2 py-1 rounded">PNG</span>
                                        <span className="border border-cyan-900/50 px-2 py-1 rounded">WEBP</span>
                                    </div>
                                </div>

                                {/* Animated Grid Background */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                    style={{
                                        backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)',
                                        backgroundSize: '40px 40px'
                                    }}
                                />
                            </motion.div>
                        ) : (
                            /* Analysis View */
                            <motion.div
                                key="analysis"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative w-full max-w-3xl aspect-video bg-black rounded-lg border border-cyan-800 overflow-hidden shadow-2xl"
                            >
                                {preview && (
                                    <>
                                        {/* Source Image */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={preview}
                                            alt="Analysis Target"
                                            className="w-full h-full object-contain opacity-80"
                                        />

                                        {/* Scanning Laser Grid Animation */}
                                        <AnimatePresence>
                                            {isScanning && (
                                                <motion.div
                                                    initial={{ top: '-10%' }}
                                                    animate={{ top: '110%' }}
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 2,
                                                        ease: "linear"
                                                    }}
                                                    className="absolute left-0 right-0 h-20 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent border-b-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] z-20 pointer-events-none"
                                                >
                                                    <div className="absolute w-full h-[1px] bg-cyan-400 bottom-0 shadow-[0_0_15px_#22d3ee]" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Digital Grid Overlay */}
                                        {isScanning && (
                                            <div className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay opacity-30"
                                                style={{
                                                    backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(34, 211, 238, .3) 25%, rgba(34, 211, 238, .3) 26%, transparent 27%, transparent 74%, rgba(34, 211, 238, .3) 75%, rgba(34, 211, 238, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34, 211, 238, .3) 25%, rgba(34, 211, 238, .3) 26%, transparent 27%, transparent 74%, rgba(34, 211, 238, .3) 75%, rgba(34, 211, 238, .3) 76%, transparent 77%, transparent)',
                                                    backgroundSize: '50px 50px'
                                                }}
                                            />
                                        )}

                                        {/* Heatmap Overlay */}
                                        <AnimatePresence>
                                            {scanComplete && heatmapPoints.map((point, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 0.6, scale: 1 }}
                                                    transition={{ delay: index * 0.2, duration: 0.5 }}
                                                    className={cn(
                                                        "absolute rounded-full blur-2xl z-10 pointer-events-none mix-blend-hard-light",
                                                        point.type === 'artifact' ? "bg-red-500" : "bg-green-500"
                                                    )}
                                                    style={{
                                                        left: point.x,
                                                        top: point.y,
                                                        width: point.size,
                                                        height: point.size,
                                                        transform: 'translate(-50%, -50%)'
                                                    }}
                                                />
                                            ))}
                                        </AnimatePresence>

                                        {/* Scanning UI Overlays */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-end z-30">
                                            <div>
                                                <h2 className="text-white font-bold flex items-center gap-2">
                                                    {isScanning ? (
                                                        <>
                                                            <RefreshCcw className="w-4 h-4 animate-spin text-cyan-400" />
                                                            SCANNING SECTORS...
                                                        </>
                                                    ) : scanComplete ? (
                                                        <>
                                                            <ShieldAlert className="w-5 h-5 text-red-500" />
                                                            <span className="text-red-400">ANOMALIES DETECTED</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-cyan-500">INITIALIZING...</span>
                                                    )}
                                                </h2>
                                                {scanComplete && (
                                                    <div className="flex gap-4 mt-2 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full bg-red-500 box-shadow-[0_0_10px_red]" />
                                                            <span className="text-red-300">Digital Artifacts (92% Conf.)</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                                            <span className="text-green-300">Organic Noise</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {scanComplete && (
                                                <button
                                                    onClick={resetTool}
                                                    className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 hover:border-cyan-500 text-cyan-300 rounded transition duration-200 flex items-center gap-2 font-mono text-sm"
                                                >
                                                    <RefreshCcw className="w-4 h-4" />
                                                    NEW SCAN
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
