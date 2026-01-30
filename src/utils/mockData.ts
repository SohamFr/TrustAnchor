export interface TrustReport {
  score: number;
  status: 'secure' | 'warning' | 'critical';
  details: string[];
}

export const analyzeInput = async (input: string): Promise<TrustReport> => {
  // Simulate network delay for "Deep Scan" effect
  await new Promise((resolve) => setTimeout(resolve, 2500));

  const lower = input.toLowerCase();

  if (lower.includes('secure') || lower.includes('google.com')) {
    return {
      score: 98,
      status: 'secure',
      details: [
        'SSL Certificate: Valid (EV)',
        'Domain Age: > 10 years',
        'Reputation: High Trust',
        'Phishing Heuristics: Negative'
      ]
    };
  }

  if (lower.includes('phishing') || lower.includes('malicious')) {
    return {
      score: 12,
      status: 'critical',
      details: [
        'SSL Certificate: Invalid / Self-signed',
        'Domain Age: < 48 hours',
        'Heuristics: Social Engineering Detected',
        'Database Match: Known Threat'
      ]
    };
  }

  // Default / Neutral
  return {
    score: 65,
    status: 'warning',
    details: [
      'SSL Certificate: Valid (Standard)',
      'Domain Age: 3 months',
      'Traffic Pattern: Low Volume',
      'Community Reports: None'
    ]
  };
};
