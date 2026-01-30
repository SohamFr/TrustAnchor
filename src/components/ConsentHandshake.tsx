'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, Lock } from 'lucide-react';
import clsx from 'clsx';

export const ConsentHandshake = () => {
    const [consented, setConsented] = useState(false);

    return (
        <div className="border-t border-cyan-900/30 pt-6 mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-slate-400 text-sm font-mono max-w-md">
                    <p className="mb-2">
                        <span className="text-cyan-500 mr-2">[REQUIRED]</span>
                        Establish secure handshake for data processing?
                    </p>
                    <p className="text-xs opacity-60">
                        By engaging the protocol, you grant permission for ephemeral data analysis.
                    </p>
                </div>

                <div className="relative h-14 w-64 bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden flex items-center p-1 group">
                    <AnimatePresence mode='wait'>
                        {consented ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full flex items-center justify-center gap-2 text-cyan-400 font-bold font-mono uppercase tracking-widest text-sm"
                            >
                                <ShieldCheck size={18} />
                                Protocol Active
                            </motion.div>
                        ) : (
                            <>
                                <motion.div
                                    className="absolute left-0 top-0 bottom-0 bg-cyan-900/20 z-0"
                                    style={{ width: '0%' }} // Placeholder for progress if we did drag logic fully custom, but utilizing drag constraints below
                                />
                                <div className="absolute w-full text-center text-xs font-mono text-cyan-600/50 pointer-events-none z-0 tracking-[0.2em] uppercase">
                                    Slide to Authorize
                                </div>

                                <motion.div
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 190 }}
                                    dragElastic={0.1}
                                    dragMomentum={false}
                                    onDragEnd={(event, info) => {
                                        if (info.offset.x > 150) {
                                            setConsented(true);
                                        }
                                    }}
                                    className="relative z-10 h-10 w-12 bg-cyan-500 rounded flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-400 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Lock className="text-slate-950" size={18} />
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
