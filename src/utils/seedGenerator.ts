export const generateSeed = (str: string): number => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

export const getDeterminsticValue = (seed: number, min: number, max: number): number => {
    const x = Math.sin(seed++) * 10000;
    const random = x - Math.floor(x);
    return Math.floor(random * (max - min + 1)) + min;
};

export const generateRiskFactors = (seed: number): string[] => {
    const factors = [
        "Unverified SSL Issuer",
        "Recent Domain Registration",
        "High Entropy Subdomains",
        "Suspicious Redirect Chain",
        "Known Malware IP Block",
        "Obfuscated JavaScript",
        "Lack of DNSSEC",
        "Email Server Blacklisted"
    ];

    // Shuffle deterministically
    const shuffled = [...factors].sort(() => 0.5 - (Math.sin(seed++) * 10000 % 1));
    const count = getDeterminsticValue(seed, 0, 3);
    return shuffled.slice(0, count);
};
