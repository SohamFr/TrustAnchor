'use client';

import React from 'react';
import './GlitchText.css';

interface GlitchTextProps {
    text: string;
    className?: string;
}

export function GlitchText({ text, className = '' }: GlitchTextProps) {
    return (
        <div className={`glitch-wrapper ${className}`}>
            <div className="glitch-text" data-text={text}>
                {text}
            </div>
        </div>
    );
}
