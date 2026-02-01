'use client';

import { useState } from 'react';
import { Phone, MapPin, Shield, AlertTriangle, CheckCircle2, Radio } from 'lucide-react';

interface PhoneIntelligence {
    valid: boolean;
    number: string;
    formatted: string;
    country: string;
    location: string;
    carrier: string;
    lineType: string;
    riskLevel: 'LOW' | 'HIGH' | 'INVALID';
    riskReason: string;
    isVerifiedCarrier: boolean;
}

export default function PhoneTracerPage() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<PhoneIntelligence | null>(null);
    const [error, setError] = useState('');

    const handleScan = async () => {
        if (!phoneNumber.trim()) {
            setError('Please enter a phone number');
            return;
        }

        setError('');
        setIsScanning(true);
        setResult(null);

        try {
            const response = await fetch(`/api/phone?number=${encodeURIComponent(phoneNumber)}`);
            const data = await response.json();

            if (response.ok) {
                // Simulate scanning delay for better UX
                setTimeout(() => {
                    setResult(data);
                    setIsScanning(false);
                }, 1500);
            } else {
                setError(data.error || 'Failed to analyze phone number');
                setIsScanning(false);
            }
        } catch (err) {
            setError('Network error. Please try again.');
            setIsScanning(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'LOW':
                return 'text-green-400';
            case 'HIGH':
                return 'text-red-400';
            case 'INVALID':
                return 'text-yellow-400';
            default:
                return 'text-slate-400';
        }
    };

    const getRiskBgColor = (level: string) => {
        switch (level) {
            case 'LOW':
                return 'bg-green-500/10 border-green-500/30';
            case 'HIGH':
                return 'bg-red-500/10 border-red-500/30';
            case 'INVALID':
                return 'bg-yellow-500/10 border-yellow-500/30';
            default:
                return 'bg-slate-500/10 border-slate-500/30';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-cyan-950/20 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Phone className="w-8 h-8 text-cyan-400" />
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            SIGNAL TRACER
                        </h1>
                    </div>
                    <p className="text-slate-500 font-mono text-sm">
                        Carrier Intelligence & Fraud Detection Protocol
                    </p>
                </div>

                {/* Cyberpunk Dialer */}
                <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-8 mb-6 shadow-2xl shadow-cyan-500/10">
                    <label className="block text-cyan-400 font-mono text-xs mb-3 tracking-wider">
                        TARGET NUMBER
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                            placeholder="Enter phone number (e.g., +14158586273)"
                            className="flex-1 bg-black/60 border border-cyan-500/50 rounded-lg px-6 py-4 text-cyan-100 font-mono text-lg tracking-widest placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                            disabled={isScanning}
                        />
                        <button
                            onClick={handleScan}
                            disabled={isScanning}
                            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-wait shadow-lg shadow-cyan-500/30"
                        >
                            {isScanning ? 'SCANNING...' : 'TRACE'}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400 font-mono text-sm">
                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                        {error}
                    </div>
                )}

                {/* Scanning Animation */}
                {isScanning && (
                    <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-12 text-center">
                        <div className="inline-block relative">
                            <Radio className="w-16 h-16 text-cyan-400 animate-pulse" />
                            <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-500/30 rounded-full animate-ping" />
                        </div>
                        <p className="mt-6 text-cyan-400 font-mono text-lg tracking-wider animate-pulse">
                            Triangulating Signal...
                        </p>
                        <p className="mt-2 text-slate-600 font-mono text-xs">
                            Querying carrier databases...
                        </p>
                    </div>
                )}

                {/* Results */}
                {result && !isScanning && (
                    <div className="space-y-4">
                        {/* Risk Assessment Banner */}
                        <div className={`border-2 rounded-xl p-6 ${getRiskBgColor(result.riskLevel)}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {result.riskLevel === 'LOW' && <Shield className="w-6 h-6 text-green-400" />}
                                    {result.riskLevel === 'HIGH' && <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />}
                                    {result.riskLevel === 'INVALID' && <AlertTriangle className="w-6 h-6 text-yellow-400" />}
                                    <div>
                                        <div className={`font-mono font-bold text-lg ${getRiskColor(result.riskLevel)}`}>
                                            RISK LEVEL: {result.riskLevel}
                                        </div>
                                        <div className="text-slate-400 text-sm font-mono mt-1">
                                            {result.riskReason}
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-lg font-mono text-xs font-bold ${getRiskColor(result.riskLevel)} border ${result.riskLevel === 'LOW' ? 'border-green-500/30' : result.riskLevel === 'HIGH' ? 'border-red-500/30' : 'border-yellow-500/30'}`}>
                                    {result.valid ? 'VALID' : 'INVALID'}
                                </div>
                            </div>
                        </div>

                        {/* Intelligence Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Carrier ID Card */}
                            <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="w-5 h-5 text-cyan-400" />
                                    <h3 className="text-cyan-400 font-mono text-xs tracking-wider">CARRIER ID</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-white font-mono text-xl font-bold">
                                        {result.carrier}
                                    </p>
                                    {result.isVerifiedCarrier && (
                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    )}
                                </div>
                                <p className="text-slate-500 text-xs font-mono mt-2">
                                    {result.isVerifiedCarrier ? 'Verified Major Telecom' : 'Unverified Provider'}
                                </p>
                            </div>

                            {/* Line Type Card */}
                            <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Phone className="w-5 h-5 text-cyan-400" />
                                    <h3 className="text-cyan-400 font-mono text-xs tracking-wider">LINE TYPE</h3>
                                </div>
                                <p className={`font-mono text-xl font-bold uppercase ${result.lineType.toLowerCase() === 'voip' || result.lineType.toLowerCase().includes('voip') ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                                    {result.lineType}
                                </p>
                                <p className="text-slate-500 text-xs font-mono mt-2">
                                    {result.lineType.toLowerCase() === 'mobile' ? 'Standard Mobile Line' :
                                        result.lineType.toLowerCase() === 'voip' ? 'Voice Over IP - High Risk' :
                                            'Line Type Classification'}
                                </p>
                            </div>

                            {/* Location Card */}
                            <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="w-5 h-5 text-cyan-400" />
                                    <h3 className="text-cyan-400 font-mono text-xs tracking-wider">LOCATION</h3>
                                </div>
                                <p className="text-white font-mono text-xl font-bold">
                                    {result.location || result.country}
                                </p>
                                <p className="text-slate-500 text-xs font-mono mt-2">
                                    Country Code: {result.country}
                                </p>
                            </div>

                            {/* Caller ID Card */}
                            <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="w-5 h-5 text-cyan-400" />
                                    <h3 className="text-cyan-400 font-mono text-xs tracking-wider">CALLER ID</h3>
                                </div>
                                <p className="text-green-400 font-mono text-sm font-bold">
                                    [Hidden by Provider]
                                </p>
                                <p className="text-slate-500 text-xs font-mono mt-2">
                                    Name lookup requires premium API access
                                </p>
                            </div>
                        </div>

                        {/* Technical Details */}
                        <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6">
                            <h3 className="text-cyan-400 font-mono text-xs tracking-wider mb-4">TECHNICAL DETAILS</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-600 text-xs font-mono">NUMBER (RAW)</p>
                                    <p className="text-white font-mono">{result.number}</p>
                                </div>
                                <div>
                                    <p className="text-slate-600 text-xs font-mono">FORMATTED</p>
                                    <p className="text-white font-mono">{result.formatted}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
