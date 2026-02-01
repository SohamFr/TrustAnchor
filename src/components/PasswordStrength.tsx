"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PasswordAnalysis {
    entropy: number;
    crackTime: string;
    severity: 'instant' | 'weak' | 'moderate' | 'strong' | 'quantum';
    characterSets: string[];
}

export default function PasswordStrength() {
    const [password, setPassword] = useState('');
    const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);

    // Calculate entropy: L × log₂(N)
    const analyzePassword = (pwd: string): PasswordAnalysis | null => {
        if (!pwd) return null;

        const length = pwd.length;
        const charSets: string[] = [];
        let poolSize = 0;

        // Determine character sets used
        if (/[a-z]/.test(pwd)) {
            charSets.push('lowercase');
            poolSize += 26;
        }
        if (/[A-Z]/.test(pwd)) {
            charSets.push('uppercase');
            poolSize += 26;
        }
        if (/[0-9]/.test(pwd)) {
            charSets.push('numbers');
            poolSize += 10;
        }
        if (/[^a-zA-Z0-9]/.test(pwd)) {
            charSets.push('symbols');
            poolSize += 32;
        }

        // Entropy calculation: L × log₂(N)
        const entropy = length * Math.log2(poolSize);

        // Total possible combinations
        const totalCombinations = Math.pow(poolSize, length);

        // Time to crack at 10 billion guesses/second
        const guessesPerSecond = 10_000_000_000;
        const secondsToCrack = totalCombinations / guessesPerSecond / 2; // Average case

        let crackTime = '';
        let severity: 'instant' | 'weak' | 'moderate' | 'strong' | 'quantum' = 'weak';

        const minute = 60;
        const hour = 60 * minute;
        const day = 24 * hour;
        const year = 365.25 * day;
        const century = 100 * year;

        if (secondsToCrack < hour) {
            severity = 'instant';
            if (secondsToCrack < 1) {
                crackTime = 'INSTANT BREACH';
            } else if (secondsToCrack < minute) {
                crackTime = `${Math.ceil(secondsToCrack)} seconds`;
            } else {
                crackTime = `${Math.ceil(secondsToCrack / minute)} minutes`;
            }
        } else if (secondsToCrack < day) {
            severity = 'weak';
            crackTime = `${Math.ceil(secondsToCrack / hour)} hours`;
        } else if (secondsToCrack < year) {
            severity = 'moderate';
            crackTime = `${Math.ceil(secondsToCrack / day)} days`;
        } else if (secondsToCrack < century) {
            severity = 'strong';
            const years = Math.floor(secondsToCrack / year);
            crackTime = `${years.toLocaleString()} years`;
        } else {
            severity = 'quantum';
            crackTime = 'QUANTUM RESISTANT';
        }

        return {
            entropy,
            crackTime,
            severity,
            characterSets: charSets,
        };
    };

    useEffect(() => {
        setAnalysis(analyzePassword(password));
    }, [password]);

    const getShieldStrength = (): number => {
        if (!analysis) return 0;
        return Math.min(100, (analysis.entropy / 128) * 100);
    };

    const getSeverityColor = () => {
        if (!analysis) return '#444';
        switch (analysis.severity) {
            case 'instant': return '#ff0040';
            case 'weak': return '#ff6b00';
            case 'moderate': return '#ffaa00';
            case 'strong': return '#00ff88';
            case 'quantum': return '#00ffff';
            default: return '#444';
        }
    };

    const ShieldIcon = () => {
        const strength = getShieldStrength();
        const color = getSeverityColor();

        return (
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Outer glow */}
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
                    }}
                />

                {/* Shield SVG */}
                <svg width="160" height="160" viewBox="0 0 100 100" className="relative z-10">
                    {/* Cracks for weak passwords */}
                    <AnimatePresence>
                        {strength < 30 && (
                            <motion.g
                                initial={{ opacity: 0, pathLength: 0 }}
                                animate={{ opacity: 1, pathLength: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <path
                                    d="M50 20 L50 50 L30 70"
                                    stroke={color}
                                    strokeWidth="1"
                                    fill="none"
                                    opacity="0.6"
                                />
                                <path
                                    d="M50 30 L70 50 L60 80"
                                    stroke={color}
                                    strokeWidth="1"
                                    fill="none"
                                    opacity="0.6"
                                />
                            </motion.g>
                        )}
                    </AnimatePresence>

                    {/* Main shield outline */}
                    <motion.path
                        d="M50 10 L80 25 L80 50 Q80 80 50 90 Q20 80 20 50 L20 25 Z"
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: 1,
                            opacity: strength > 20 ? 0.8 : 0.3,
                            filter: strength > 60 ? `drop-shadow(0 0 10px ${color})` : 'none'
                        }}
                        transition={{ duration: 0.5 }}
                    />

                    {/* Inner fill - grows with strength */}
                    <motion.path
                        d="M50 10 L80 25 L80 50 Q80 80 50 90 Q20 80 20 50 L20 25 Z"
                        fill={color}
                        opacity="0"
                        animate={{
                            opacity: strength / 300,
                        }}
                        transition={{ duration: 0.3 }}
                    />

                    {/* Center lock icon for strong passwords */}
                    <AnimatePresence>
                        {strength > 70 && (
                            <motion.g
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                            >
                                {/* Lock body */}
                                <rect x="42" y="50" width="16" height="12" rx="2" fill={color} opacity="0.9" />
                                {/* Lock shackle */}
                                <path
                                    d="M45 50 L45 45 Q45 40 50 40 Q55 40 55 45 L55 50"
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="3"
                                    opacity="0.9"
                                />
                            </motion.g>
                        )}
                    </AnimatePresence>

                    {/* Energy particles */}
                    {strength > 50 && (
                        <>
                            <motion.circle
                                cx="50" cy="50" r="2" fill={color}
                                animate={{
                                    cx: [50, 70, 50],
                                    cy: [50, 30, 50],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: 0,
                                }}
                            />
                            <motion.circle
                                cx="50" cy="50" r="2" fill={color}
                                animate={{
                                    cx: [50, 30, 50],
                                    cy: [50, 60, 50],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: 0.7,
                                }}
                            />
                        </>
                    )}
                </svg>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2" style={{ color: getSeverityColor() }}>
                    CRYPTOGRAPHIC STRENGTH ANALYZER
                </h1>
                <p className="text-gray-400 text-sm font-mono">
                    ENTROPY-BASED RESISTANCE CALCULATION
                </p>
            </div>

            {/* Main Card */}
            <div
                className="rounded-lg p-8 backdrop-blur-md border-2 transition-all duration-300"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderColor: getSeverityColor(),
                    boxShadow: `0 0 30px ${getSeverityColor()}40`,
                }}
            >
                {/* Shield Visualization */}
                <div className="flex justify-center mb-8">
                    <ShieldIcon />
                </div>

                {/* Input Field */}
                <div className="mb-6">
                    <label className="block text-cyan-400 text-sm font-mono mb-2">
                        TEST PASSWORD
                    </label>
                    <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password to analyze..."
                        className="w-full bg-black/50 border-2 border-cyan-500/30 rounded px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                        style={{
                            boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)',
                        }}
                    />
                </div>

                {/* Analysis Results */}
                <AnimatePresence>
                    {analysis && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            {/* Entropy Counter */}
                            <div className="bg-black/30 rounded-lg p-6 border border-cyan-500/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm font-mono">BITS OF ENTROPY</span>
                                    <motion.span
                                        className="text-3xl font-bold font-mono"
                                        style={{ color: getSeverityColor() }}
                                        key={analysis.entropy}
                                        initial={{ scale: 1.3, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        {analysis.entropy.toFixed(1)}
                                    </motion.span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: getSeverityColor() }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${getShieldStrength()}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {/* Time to Crack */}
                            <div
                                className="rounded-lg p-6 border-2"
                                style={{
                                    backgroundColor: analysis.severity === 'instant' ? 'rgba(255, 0, 64, 0.1)' :
                                        analysis.severity === 'quantum' ? 'rgba(0, 255, 255, 0.1)' :
                                            'rgba(0, 0, 0, 0.3)',
                                    borderColor: getSeverityColor(),
                                }}
                            >
                                <div className="text-center">
                                    <div className="text-sm font-mono text-gray-400 mb-2">
                                        TIME TO CRACK @ 10B GUESSES/SEC
                                    </div>
                                    <motion.div
                                        className="text-4xl font-bold font-mono"
                                        style={{ color: getSeverityColor() }}
                                        animate={analysis.severity === 'instant' || analysis.severity === 'quantum' ? {
                                            scale: [1, 1.05, 1],
                                            opacity: [1, 0.8, 1],
                                        } : {}}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                        }}
                                    >
                                        {analysis.crackTime}
                                    </motion.div>
                                </div>
                            </div>

                            {/* Character Sets */}
                            <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/20">
                                <div className="text-sm font-mono text-gray-400 mb-2">CHARACTER SETS DETECTED</div>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.characterSets.map((set) => (
                                        <motion.span
                                            key={set}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="px-3 py-1 rounded text-xs font-mono border"
                                            style={{
                                                backgroundColor: `${getSeverityColor()}20`,
                                                borderColor: getSeverityColor(),
                                                color: getSeverityColor(),
                                            }}
                                        >
                                            {set.toUpperCase()}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {!analysis && (
                    <div className="text-center py-12">
                        <div className="text-gray-600 font-mono text-sm">
                            Enter a password above to begin analysis...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
