"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SystemBoot() {
    const [isBooting, setIsBooting] = useState(true);
    const [lines, setLines] = useState<string[]>([]);
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        // Sequence timings
        const lineDelay = 400;
        const totalDuration = 1800;

        // Line 1
        const t1 = setTimeout(() => {
            setLines((prev) => [...prev, "ESTABLISHING SECURE CONNECTION..."]);
        }, 200);

        // Line 2
        const t2 = setTimeout(() => {
            setLines((prev) => [...prev, "VERIFYING HANDSHAKE... [OK]"]);
        }, 200 + lineDelay);

        // Line 3
        const t3 = setTimeout(() => {
            setLines((prev) => [...prev, "LOADING NEURAL CORE... [OK]"]);
        }, 200 + lineDelay * 2);

        // Glitch trigger
        const tGlitch = setTimeout(() => {
            setIsGlitching(true);
        }, totalDuration - 300);

        // Completion/Drop
        const tEnd = setTimeout(() => {
            setIsBooting(false);
        }, totalDuration);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(tGlitch);
            clearTimeout(tEnd);
        };
    }, []);

    return (
        <AnimatePresence>
            {isBooting && (
                <motion.div
                    key="system-boot"
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black font-mono text-cyan-500"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        scale: 1.1,
                        filter: "blur(10px)",
                        backgroundColor: ["#000000", "#00FFFF", "rgba(0,0,0,0)"], // Cyan flash then fade
                        transition: { duration: 0.8, ease: "easeInOut" },
                    }}
                >
                    <div className={`w-full max-w-2xl px-8 ${isGlitching ? "animate-pulse" : ""}`}>
                        {lines.map((text, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    textShadow: isGlitching ? "2px 0 red, -2px 0 blue" : "0px 0px 5px rgba(0, 255, 255, 0.5)"
                                }}
                                className="mb-2 text-lg md:text-2xl font-bold tracking-wider"
                            >
                                <span className="mr-4 text-cyan-300">&gt;</span>
                                {text}
                            </motion.div>
                        ))}

                        <motion.div
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="mt-4 h-6 w-4 bg-cyan-500"
                        />
                    </div>

                    {/* Glitch Overlay Effect */}
                    {isGlitching && (
                        <div className="absolute inset-0 z-10 bg-cyan-500/10 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
