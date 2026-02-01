import { NextResponse } from 'next/server';
import * as tls from 'tls';
import * as dns from 'node:dns/promises';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Force Node.js runtime for TLS/Net modules
export const runtime = 'nodejs';

// --- CACHING LAYER ---
const cache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCached(key: string) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[CACHE HIT] ${key}`);
        return cached.result;
    }
    return null;
}

function setCache(key: string, result: any) {
    cache.set(key, { result, timestamp: Date.now() });
    console.log(`[CACHE SET] ${key}`);
}

// --- RETRY HELPER ---
async function fetchWithRetry(url: string, options: any, retries = 2): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(url, options);
            if (res.ok) return res;
            if (i < retries) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        } catch (e) {
            if (i === retries) throw e;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
    throw new Error('Max retries exceeded');
}

// --- Types ---
type ScanResult = {
    score: number;
    riskLevel: 'Safe' | 'Caution' | 'Critical' | 'Unknown';
    confidence: 'High' | 'Medium' | 'Low';
    domainAge: string;
    impersonationTarget: string | null;
    ssl: { isValid: boolean; issuer: string; daysRemaining: number; secure: boolean; };
    headers: { hsts: boolean; csp: boolean; xFrame: boolean; };
    reputation: { maliciousCount: number; platform: string; details?: string[]; };
    hosting: { country: string; isp: string; ip: string; };
    domainMetadata?: {
        creationDate: string;
        ageYears: number;
        registrar: string;
        serverCountry: string;
        consensusStats: { malicious: number; suspicious: number; clean: number; total: number };
    };
    summary: string;
    redFlags: string[];
    dataQuality: {
        virusTotalSuccess: boolean;
        domainAgeSuccess: boolean;
        domainMetadataSuccess: boolean;
        typosquattingSuccess: boolean;
        sslSuccess: boolean;
        headersSuccess: boolean;
    };
    error?: string;
};

// --- Helpers ---

// 1. SSL/TLS Handshake
async function checkSSL(hostname: string): Promise<ScanResult['ssl']> {
    return new Promise((resolve) => {
        try {
            const socket = tls.connect(443, hostname, { servername: hostname, rejectUnauthorized: false }, () => {
                const cert = socket.getPeerCertificate();
                const authorized = socket.authorized;
                socket.end();

                if (!cert || Object.keys(cert).length === 0) {
                    resolve({ isValid: false, issuer: 'Unknown', daysRemaining: 0, secure: false });
                    return;
                }

                const validTo = new Date(cert.valid_to).getTime();
                const now = new Date().getTime();
                const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));

                resolve({
                    isValid: daysRemaining > 0,
                    issuer: (cert.issuer as any).O || (cert.issuer as any).CN || 'Unknown',
                    daysRemaining,
                    secure: authorized
                });
            });
            socket.on('error', () => resolve({ isValid: false, issuer: 'Error', daysRemaining: 0, secure: false }));
            socket.setTimeout(3000, () => { socket.destroy(); resolve({ isValid: false, issuer: 'Timeout', daysRemaining: 0, secure: false }); });
        } catch (e) { resolve({ isValid: false, issuer: 'Failed', daysRemaining: 0, secure: false }); }
    });
}

// 2. Security Headers
async function checkHeaders(url: string): Promise<ScanResult['headers']> {
    try {
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        const headers = res.headers;
        return {
            hsts: headers.has('strict-transport-security'),
            csp: headers.has('content-security-policy'),
            xFrame: headers.has('x-frame-options') || headers.has('frame-options')
        };
    } catch (e) { return { hsts: false, csp: false, xFrame: false }; }
}

// 3. VirusTotal Reputation (Consensus Rule) - IMPROVED WITH RETRY
async function checkReputation(url: string): Promise<{ success: boolean; data: ScanResult['reputation'] }> {
    const apiKey = process.env.NEXT_PUBLIC_VIRUSTOTAL_KEY;
    if (!apiKey) return { success: false, data: { maliciousCount: 0, platform: 'VirusTotal (No API Key)' } };

    try {
        const formData = new URLSearchParams();
        formData.append("url", url);
        const scanRes = await fetchWithRetry('https://www.virustotal.com/api/v3/urls', {
            method: 'POST',
            headers: { 'x-apikey': apiKey },
            body: formData
        });

        const scanData = await scanRes.json();
        const analysisId = scanData.data.id;

        // OPTIMIZED POLLING TIME: 5 seconds + retry loop (faster while still accurate)
        await new Promise(r => setTimeout(r, 5000));

        let analysisData;
        // Retry up to 3 times if still queued
        for (let i = 0; i < 3; i++) {
            const analysisRes = await fetchWithRetry(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
                headers: { 'x-apikey': apiKey }
            });
            analysisData = await analysisRes.json();

            if (analysisData.data.attributes.status === 'completed') break;
            if (i < 2) await new Promise(r => setTimeout(r, 2000)); // 2s between retries (optimized)
        }

        const stats = analysisData.data.attributes.stats;
        const results = analysisData.data.attributes.results;
        const flags = Object.values(results)
            .filter((r: any) => r.category === 'malicious')
            .map((r: any) => r.engine_name)
            .slice(0, 3);

        return {
            success: true,
            data: { maliciousCount: stats.malicious || 0, platform: 'VirusTotal API', details: flags }
        };
    } catch (e) {
        console.error('VirusTotal Error:', e);
        return { success: false, data: { maliciousCount: 0, platform: 'VirusTotal (Failed)' } };
    }
}

// 7. VirusTotal Domain Metadata (ScamAdviser-style Intelligence)
async function checkDomainMetadata(hostname: string): Promise<{ success: boolean; data: ScanResult['domainMetadata'] | null }> {
    const apiKey = process.env.NEXT_PUBLIC_VIRUSTOTAL_KEY;
    if (!apiKey) return { success: false, data: null };

    try {
        const res = await fetchWithRetry(`https://www.virustotal.com/api/v3/domains/${hostname}`, {
            headers: { 'x-apikey': apiKey }
        });

        const data = await res.json();
        const attrs = data.data.attributes;

        // 1. Domain Age Calculation
        const creationTimestamp = attrs.creation_date;
        const creationDate = creationTimestamp ? new Date(creationTimestamp * 1000).toISOString() : 'Unknown';
        const ageYears = creationTimestamp
            ? (Date.now() - (creationTimestamp * 1000)) / (1000 * 60 * 60 * 24 * 365)
            : 0;

        // 2. Registrar
        const registrar = attrs.registrar || 'Unknown';

        // 3. Server Location
        const serverCountry = attrs.country || 'XX';

        // 4. Security Consensus
        const stats = attrs.last_analysis_stats || {};
        const consensusStats = {
            malicious: stats.malicious || 0,
            suspicious: stats.suspicious || 0,
            clean: stats.harmless || 0,
            total: (stats.malicious || 0) + (stats.suspicious || 0) + (stats.harmless || 0) + (stats.undetected || 0)
        };

        return {
            success: true,
            data: {
                creationDate,
                ageYears,
                registrar,
                serverCountry,
                consensusStats
            }
        };
    } catch (e) {
        console.error('VirusTotal Domain Metadata Error:', e);
        return { success: false, data: null };
    }
}

// 4. Server Location
async function checkLocation(hostname: string): Promise<ScanResult['hosting']> {
    try {
        const res = await fetch(`http://ip-api.com/json/${hostname}`);
        const data = await res.json();
        return { country: data.countryCode || 'Unknown', isp: data.isp || 'Unknown', ip: data.query || '0.0.0.0' };
    } catch (e) { return { country: 'XX', isp: 'Unknown', ip: '0.0.0.0' }; }
}

// 5. Domain Age (RDAP) - WITH SUCCESS TRACKING
async function checkDomainAge(hostname: string): Promise<{ success: boolean; data: { ageYears: number; label: string } }> {
    try {
        const res = await fetchWithRetry(`https://rdap.org/domain/${hostname}`, {});
        const data = await res.json();

        const events = data.events || [];
        const regEvent = events.find((e: any) => e.eventAction === 'registration' || e.eventAction === 'last changed');
        const regDateStr = regEvent ? regEvent.eventDate : null;

        if (!regDateStr) return { success: false, data: { ageYears: 5, label: "Unknown Age" } };

        const regDate = new Date(regDateStr).getTime();
        const now = new Date().getTime();
        const diffYears = (now - regDate) / (1000 * 60 * 60 * 24 * 365);

        let label = `${diffYears.toFixed(1)} Years`;
        if (diffYears < 0.1) label = "Freshly Registered (<1 Mo)";
        else if (diffYears < 1) label = "< 1 Year";

        return { success: true, data: { ageYears: diffYears, label } };
    } catch (e) {
        console.error('Domain Age Error:', e);
        return { success: false, data: { ageYears: 5, label: "Unknown Age" } };
    }
}

// 6. Typosquatting (Gemini)
async function checkTyposquatting(hostname: string): Promise<{ isSuspicious: boolean; target: string | null }> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) return { isSuspicious: false, target: null };

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Analyze the domain "${hostname}". Is this URL trying to impersonate a famous brand (like 'g0ogle.com', 'paypa1.com', 'faceb0ok.com')? Check for Levenshtein distance against top 500 global brands.
        Return ONLY a JSON object: { "isImpersonation": boolean, "targetBrand": string | null }.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const analysis = JSON.parse(text);

        return { isSuspicious: analysis.isImpersonation, target: analysis.targetBrand };
    } catch (e) { return { isSuspicious: false, target: null }; }
}


// --- Main Handler ---
export async function POST(req: Request) {
    try {
        const body = await req.json();
        let { query } = body;

        if (!query.startsWith('http')) { query = `https://${query}`; }

        const urlObj = new URL(query);
        const hostname = urlObj.hostname;

        console.log(`[WeightedRisk] Analyzing ${hostname}`);

        // --- STEP A: VALIDATION ---

        // 1. Syntax Check (Regex)
        const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(hostname)) {
            return NextResponse.json({ error: "Invalid domain format. Please enter a valid URL (e.g., google.com)" }, { status: 400 });
        }

        // 2. DNS Resolution (Reality Check)
        try {
            await dns.resolve(hostname);
        } catch (e: any) {
            if (e.code === 'ENOTFOUND') {
                return NextResponse.json({ error: "Domain does not exist. It may be unregistered or offline." }, { status: 404 });
            }
            // Fail safe for other resolution errors which likely mean we can't scan it anyway
            console.error(`DNS Resolution failed for ${hostname}:`, e);
            return NextResponse.json({ error: "Domain resolution failed. Please check the URL." }, { status: 400 });
        }

        // CHECK CACHE FIRST
        const cacheKey = hostname;
        const cached = getCached(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // Data Quality Tracking
        const dataQuality = {
            virusTotalSuccess: false,
            domainAgeSuccess: false,
            domainMetadataSuccess: false,
            typosquattingSuccess: false,
            sslSuccess: false,
            headersSuccess: false
        };

        // Parallel Execution
        const [sslResult, headersResult, reputationResult, hosting, domainAgeResult, domainMetadataResult, typosquatting] = await Promise.all([
            checkSSL(hostname).then(r => ({ success: r.isValid || r.daysRemaining > 0, data: r })).catch(() => ({ success: false, data: { isValid: false, issuer: 'Error', daysRemaining: 0, secure: false } })),
            checkHeaders(query).then(r => ({ success: true, data: r })).catch(() => ({ success: false, data: { hsts: false, csp: false, xFrame: false } })),
            checkReputation(query),
            checkLocation(hostname),
            checkDomainAge(hostname),
            checkDomainMetadata(hostname),
            checkTyposquatting(hostname)
        ]);

        // Extract data and track quality
        const ssl = sslResult.data;
        dataQuality.sslSuccess = sslResult.success;

        const headers = headersResult.data;
        dataQuality.headersSuccess = headersResult.success;

        const reputation = reputationResult.data;
        dataQuality.virusTotalSuccess = reputationResult.success;

        const domainAge = domainAgeResult.data;
        dataQuality.domainAgeSuccess = domainAgeResult.success;

        const domainMetadata = domainMetadataResult.data;
        dataQuality.domainMetadataSuccess = domainMetadataResult.success;

        dataQuality.typosquattingSuccess = !typosquatting.isSuspicious || typosquatting.target !== null;

        // --- WEIGHTED RISK CALCULATION ---
        let riskScore = 0; // Points added for bad things
        const redFlags: string[] = [];

        // 1. Consensus Rule (VirusTotal)
        if (reputation.maliciousCount >= 3) {
            riskScore += 100; // Confirmed Threat
            redFlags.push(`CONFIRMED THREAT: Flagged by ${reputation.maliciousCount} vendors`);
        } else if (reputation.maliciousCount > 0) {
            riskScore += 15; // Noise
            redFlags.push(`Suspicious Activity: ${reputation.maliciousCount} flags (Likely Heuristic Noise)`);
        }

        // Add warning if VirusTotal failed
        if (!dataQuality.virusTotalSuccess) {
            redFlags.push(`⚠️ VirusTotal check unavailable - using cached/limited data`);
        }

        // 2. Domain Age
        if (domainAge.ageYears < 0.08) { // < 1 Month
            riskScore += 50;
            redFlags.push("New Domain (< 1 Month Old) - High Risk");
        } else if (domainAge.ageYears < 0.5) { // < 6 Months
            riskScore += 20;
            redFlags.push("Young Domain (< 6 Months)");
        } else if (domainAge.ageYears > 1) {
            riskScore -= 10; // Old domain bonus
        }

        // 3. Typosquatting
        if (typosquatting.isSuspicious) {
            riskScore += 100; // Critical
            redFlags.push(`IMPERSONATION DETECTED: Mimicking ${typosquatting.target}`);
        }

        // 4. SSL & Headers (Minor Penalties)
        if (!ssl.isValid) { riskScore += 40; redFlags.push("Invalid SSL"); }
        if (!headers.hsts) { riskScore += 5; } // Minor

        // --- FINAL CALCULATION ---
        // Base 100 - Risk. Floor 0.
        let finalScore = 100 - riskScore;
        finalScore = Math.max(0, Math.min(100, finalScore));

        // Determine Verdict
        let verdict: ScanResult['riskLevel'] = 'Safe';
        if (finalScore <= 40) verdict = 'Critical';
        else if (finalScore <= 70) verdict = 'Caution';

        // Calculate Confidence
        const successfulChecks = Object.values(dataQuality).filter(v => v).length;
        const totalChecks = Object.values(dataQuality).length;
        const confidencePercent = (successfulChecks / totalChecks) * 100;

        let confidence: ScanResult['confidence'] = 'High';
        if (confidencePercent < 50) confidence = 'Low';
        else if (confidencePercent < 80) confidence = 'Medium';

        // Final Summary with Domain Metadata Context
        let summary = `VERDICT: ${verdict.toUpperCase()}. Domain is ${domainAge.label}. `;

        // Add metadata context if available
        if (domainMetadata) {
            if (domainMetadata.serverCountry !== 'XX') {
                summary += `Hosted in ${domainMetadata.serverCountry}. `;
            }
            if (domainMetadata.registrar !== 'Unknown') {
                summary += `Registrar: ${domainMetadata.registrar}. `;
            }
            if (domainMetadata.consensusStats.malicious > 0) {
                summary += `${domainMetadata.consensusStats.malicious}/${domainMetadata.consensusStats.total} security vendors flagged as malicious. `;
            }
        }

        if (typosquatting.isSuspicious) summary += `Alert: Potential impersonation of ${typosquatting.target}. `;
        if (reputation.maliciousCount >= 3) summary += `Malware signatures confirmed. `;
        else if (riskScore < 20) summary += `No significant threats detected.`;

        if (confidence !== 'High') {
            summary += ` [${confidence} Confidence - ${successfulChecks}/${totalChecks} checks successful]`;
        }

        const result = {
            score: finalScore,
            riskLevel: verdict,
            confidence,
            domainAge: domainAge.label,
            impersonationTarget: typosquatting.target,
            domainMetadata: domainMetadata || undefined,
            redFlags,
            summary,
            dataQuality,
            details: { ssl, headers, reputation, hosting }
        };

        // CACHE RESULT
        setCache(cacheKey, result);

        return NextResponse.json(result);

    } catch (error) {
        console.error("WeightedRisk Error:", error);
        return NextResponse.json({
            score: 0,
            riskLevel: 'Unknown',
            confidence: 'Low',
            redFlags: ['Scan Failed', 'Engine Error'],
            summary: "Critical failure in Weighted Risk Engine.",
            dataQuality: {
                virusTotalSuccess: false,
                domainAgeSuccess: false,
                typosquattingSuccess: false,
                sslSuccess: false,
                headersSuccess: false
            }
        });
    }
}
