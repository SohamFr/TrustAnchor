'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
}

interface UserProgress {
    totalScans: number;
    threatsDetected: number;
    academyLessonsCompleted: number;
    terminalCommandsRun: number;
    sandboxUploads: number;
    unlockedBadges: string[];
    xp: number;
    level: number;
    theme: 'dark' | 'light';
}

interface UserProgressContextType {
    progress: UserProgress;
    badges: Badge[];
    addXP: (amount: number) => void;
    unlockBadge: (badgeId: string) => void;
    incrementScans: () => void;
    incrementThreats: () => void;
    incrementAcademyProgress: () => void;
    incrementTerminalCommands: () => void;
    incrementSandboxUploads: () => void;
    toggleTheme: () => void;
    getSecurityClearance: () => string;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

const BADGES: Badge[] = [
    { id: 'first_scan', name: 'First Scan', description: 'Complete your first URL scan', icon: '🛡️', unlocked: false },
    { id: 'academy_initiate', name: 'Academy Initiate', description: 'Complete 3 Academy lessons', icon: '🎓', unlocked: false },
    { id: 'threat_hunter', name: 'Threat Hunter', description: 'Detect 5 malicious URLs', icon: '🔍', unlocked: false },
    { id: 'terminal_warrior', name: 'Terminal Warrior', description: 'Execute 10 terminal commands', icon: '💻', unlocked: false },
    { id: 'lab_rat', name: 'Lab Rat', description: 'Upload file to Sandbox', icon: '🧪', unlocked: false },
    { id: 'network_guardian', name: 'Network Guardian', description: 'View Trust Graph', icon: '🌐', unlocked: false },
    { id: 'encryption_master', name: 'Encryption Master', description: 'Use encrypt/decrypt 5 times', icon: '🔐', unlocked: false },
    { id: 'speed_analyst', name: 'Speed Analyst', description: 'Complete scan in under 5s', icon: '⚡', unlocked: false },
];

const DEFAULT_PROGRESS: UserProgress = {
    totalScans: 0,
    threatsDetected: 0,
    academyLessonsCompleted: 0,
    terminalCommandsRun: 0,
    sandboxUploads: 0,
    unlockedBadges: [],
    xp: 0,
    level: 1,
    theme: 'dark',
};

export function UserProgressProvider({ children }: { children: ReactNode }) {
    const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
    const [badges, setBadges] = useState<Badge[]>(BADGES);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('userProgress');
        if (stored) {
            const parsed = JSON.parse(stored);
            setProgress(parsed);
            // Update badge unlock status
            setBadges(prev => prev.map(badge => ({
                ...badge,
                unlocked: parsed.unlockedBadges.includes(badge.id)
            })));
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('userProgress', JSON.stringify(progress));
        // Apply theme
        document.body.classList.toggle('light-theme', progress.theme === 'light');
    }, [progress]);

    const addXP = (amount: number) => {
        setProgress(prev => {
            const newXP = prev.xp + amount;
            const newLevel = Math.floor(newXP / 500) + 1; // Level up every 500 XP
            return { ...prev, xp: newXP, level: newLevel };
        });
    };

    const unlockBadge = (badgeId: string) => {
        setProgress(prev => {
            if (prev.unlockedBadges.includes(badgeId)) return prev;
            return {
                ...prev,
                unlockedBadges: [...prev.unlockedBadges, badgeId]
            };
        });
        setBadges(prev => prev.map(badge =>
            badge.id === badgeId ? { ...badge, unlocked: true } : badge
        ));
        addXP(100); // Award XP for unlocking badge
    };

    const incrementScans = () => {
        setProgress(prev => {
            const newScans = prev.totalScans + 1;
            // Check for first scan badge
            if (newScans === 1) {
                setTimeout(() => unlockBadge('first_scan'), 500);
            }
            return { ...prev, totalScans: newScans };
        });
        addXP(10);
    };

    const incrementThreats = () => {
        setProgress(prev => {
            const newThreats = prev.threatsDetected + 1;
            // Check for threat hunter badge
            if (newThreats === 5) {
                setTimeout(() => unlockBadge('threat_hunter'), 500);
            }
            return { ...prev, threatsDetected: newThreats };
        });
        addXP(50);
    };

    const incrementAcademyProgress = () => {
        setProgress(prev => {
            const newLessons = prev.academyLessonsCompleted + 1;
            // Check for academy initiate badge
            if (newLessons === 3) {
                setTimeout(() => unlockBadge('academy_initiate'), 500);
            }
            return { ...prev, academyLessonsCompleted: newLessons };
        });
        addXP(50);
    };

    const incrementTerminalCommands = () => {
        setProgress(prev => {
            const newCommands = prev.terminalCommandsRun + 1;
            // Check for terminal warrior badge
            if (newCommands === 10) {
                setTimeout(() => unlockBadge('terminal_warrior'), 500);
            }
            return { ...prev, terminalCommandsRun: newCommands };
        });
        addXP(5);
    };

    const incrementSandboxUploads = () => {
        setProgress(prev => {
            const newUploads = prev.sandboxUploads + 1;
            // Check for lab rat badge
            if (newUploads === 1) {
                setTimeout(() => unlockBadge('lab_rat'), 500);
            }
            return { ...prev, sandboxUploads: newUploads };
        });
        addXP(25);
    };

    const toggleTheme = () => {
        setProgress(prev => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark'
        }));
    };

    const getSecurityClearance = (): string => {
        const { level } = progress;
        if (level >= 10) return 'Elite Operative';
        if (level >= 7) return 'Senior Analyst';
        if (level >= 5) return 'Security Analyst';
        if (level >= 3) return 'Cyber Specialist';
        return 'Cyber Cadet';
    };

    return (
        <UserProgressContext.Provider
            value={{
                progress,
                badges,
                addXP,
                unlockBadge,
                incrementScans,
                incrementThreats,
                incrementAcademyProgress,
                incrementTerminalCommands,
                incrementSandboxUploads,
                toggleTheme,
                getSecurityClearance,
            }}
        >
            {children}
        </UserProgressContext.Provider>
    );
}

export const useUserProgress = () => {
    const context = useContext(UserProgressContext);
    if (!context) {
        throw new Error('useUserProgress must be used within UserProgressProvider');
    }
    return context;
};
