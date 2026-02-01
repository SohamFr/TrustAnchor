'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AnalysisResult {
    score?: number;
    riskLevel?: string;
    redFlags?: string[];
    summary?: string;
    domainMetadata?: {
        creationDate: string;
        ageYears: number;
        registrar: string;
        serverCountry: string;
        consensusStats: { malicious: number; suspicious: number; clean: number; total: number };
    };
    error?: string;
}

interface ProtocolState {
    identityMask: boolean;
    encryption: boolean;
    locationProxy: boolean;
}

interface ScanContextType {
    scanQuery: string;
    setScanQuery: (query: string) => void;
    scanResult: AnalysisResult | null;
    setScanResult: (result: AnalysisResult | null) => void;
    isScanning: boolean;
    setIsScanning: (scanning: boolean) => void;
    protocols: ProtocolState;
    toggleProtocol: (key: keyof ProtocolState) => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
    const [scanQuery, setScanQuery] = useState('');
    const [scanResult, setScanResult] = useState<AnalysisResult | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [protocols, setProtocols] = useState<ProtocolState>({
        identityMask: true,
        encryption: true,
        locationProxy: false,
    });

    const toggleProtocol = (key: keyof ProtocolState) => {
        setProtocols(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <ScanContext.Provider value={{
            scanQuery,
            setScanQuery,
            scanResult,
            setScanResult,
            isScanning,
            setIsScanning,
            protocols,
            toggleProtocol
        }}>
            {children}
        </ScanContext.Provider>
    );
}

export function useScan() {
    const context = useContext(ScanContext);
    if (context === undefined) {
        throw new Error('useScan must be used within a ScanProvider');
    }
    return context;
}
