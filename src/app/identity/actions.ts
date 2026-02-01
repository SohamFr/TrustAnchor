'use server'

type EmailResult = {
    disposable?: boolean;
    error?: string;
    raw?: any;
}

type DomainResult = {
    threatCount?: number;
    error?: string;
    raw?: any;
}

export async function validateEmail(email: string): Promise<EmailResult> {
    if (!email) return { error: "Email is required" };

    try {
        const res = await fetch(`https://disposable.debounce.io/?email=${encodeURIComponent(email)}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!res.ok) {
            // Only if service is 503 or 404
            // If usage limit, etc.
            return { error: `Service returned ${res.status}` };
        }

        const data = await res.json();

        // The API typically returns { "disposable": "true" }
        const isDisposable = data.disposable === 'true' || data.disposable === true;

        return { disposable: isDisposable, raw: data };
    } catch (error) {
        console.error("Identity/Email Error:", error);
        return { error: "Failed to validate email." };
    }
}

export async function checkDomain(domain: string): Promise<DomainResult> {
    if (!domain) return { error: "Domain is required" };

    try {
        const res = await fetch(`https://otx.alienvault.com/api/v1/indicators/domain/${encodeURIComponent(domain)}/general`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!res.ok) {
            return { error: `AlienVault returned ${res.status}` };
        }

        const data = await res.json();
        const count = data.pulse_info?.count || 0;

        return { threatCount: count, raw: data };
    } catch (error) {
        console.error("Identity/Domain Error:", error);
        return { error: "Failed to check domain." };
    }
}
