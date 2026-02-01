'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SecurityContextType {
    isEncrypted: boolean;
    isMasked: boolean;
    isLockdown: boolean;
    isMuted: boolean;
    toggleEncrypted: () => void;
    toggleMasked: () => void;
    toggleLockdown: () => void;
    toggleMuted: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
    const [isEncrypted, setIsEncrypted] = useState(false);
    const [isMasked, setIsMasked] = useState(false);
    const [isLockdown, setIsLockdown] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Audio effects - Deprecated in favor of useSoundFX hook, but keeping reference safe? 
    // actually let's just keep the state here and move logic to the hook.

    const toggleMuted = () => {
        setIsMuted(prev => !prev);
    };

    const toggleEncrypted = () => {
        setIsEncrypted(prev => !prev);
    };

    const toggleMasked = () => {
        setIsMasked(prev => !prev);
    };

    const toggleLockdown = () => {
        setIsLockdown(prev => !prev);
    };

    // Global Effects - Applying classes to body
    useEffect(() => {
        if (isLockdown) {
            document.body.classList.add('security-lockdown');
        } else {
            document.body.classList.remove('security-lockdown');
        }
    }, [isLockdown]);

    useEffect(() => {
        if (isMasked) {
            document.body.classList.add('security-masked');
        } else {
            document.body.classList.remove('security-masked');
        }
    }, [isMasked]);

    return (
        <SecurityContext.Provider value={{
            isEncrypted,
            isMasked,
            isLockdown,
            isMuted,
            toggleEncrypted,
            toggleMasked,
            toggleLockdown,
            toggleMuted
        }}>
            {children}
        </SecurityContext.Provider>
    );
}

export function useSecurity() {
    const context = useContext(SecurityContext);
    if (context === undefined) {
        throw new Error('useSecurity must be used within a SecurityProvider');
    }
    return context;
}
