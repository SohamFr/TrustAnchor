import { NextRequest, NextResponse } from 'next/server';

interface NumVerifyResponse {
    valid: boolean;
    number: string;
    local_format: string;
    international_format: string;
    country_prefix: string;
    country_code: string;
    country_name: string;
    location: string;
    carrier: string;
    line_type: string;
}

interface PhoneIntelligenceResponse {
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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const phoneNumber = searchParams.get('number');

        if (!phoneNumber) {
            return NextResponse.json(
                { error: 'Phone number is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.NUMVERIFY_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'NumVerify API key not configured' },
                { status: 500 }
            );
        }

        // Make request to NumVerify API
        const apiUrl = `http://apilayer.net/api/validate?access_key=${apiKey}&number=${encodeURIComponent(phoneNumber)}&country_code=&format=1`;

        const response = await fetch(apiUrl);
        const data: NumVerifyResponse = await response.json();

        // Risk Assessment Logic
        let riskLevel: 'LOW' | 'HIGH' | 'INVALID' = 'LOW';
        let riskReason = 'Verified Mobile Number';

        if (!data.valid) {
            riskLevel = 'INVALID';
            riskReason = 'Invalid phone number format';
        } else if (data.line_type?.toLowerCase() === 'voip') {
            riskLevel = 'HIGH';
            riskReason = 'VoIP Line - Common Scammer Tool';
        } else if (
            data.carrier?.toLowerCase().includes('twilio') ||
            data.carrier?.toLowerCase().includes('vonage')
        ) {
            riskLevel = 'HIGH';
            riskReason = 'API-Based Carrier - Potential Bot';
        }

        // Check if carrier is a major telecom
        const majorTelecoms = [
            'verizon',
            'at&t',
            'att',
            't-mobile',
            'sprint',
            'vodafone',
            'orange',
            'airtel',
            'jio',
            'china mobile',
            'telstra',
            'telus',
            'rogers',
            'bell',
            'o2',
            'ee',
            'three'
        ];

        const isVerifiedCarrier = majorTelecoms.some(telecom =>
            data.carrier?.toLowerCase().includes(telecom)
        );

        const intelligenceData: PhoneIntelligenceResponse = {
            valid: data.valid,
            number: data.number || phoneNumber,
            formatted: data.international_format || data.local_format || phoneNumber,
            country: data.country_name || 'Unknown',
            location: data.location || 'Unknown',
            carrier: data.carrier || 'Unknown Carrier',
            lineType: data.line_type || 'Unknown',
            riskLevel,
            riskReason,
            isVerifiedCarrier
        };

        return NextResponse.json(intelligenceData);

    } catch (error) {
        console.error('Phone intelligence error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze phone number' },
            { status: 500 }
        );
    }
}
