'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import * as THREE from 'three';
// @ts-ignore
import GLOBE from 'vanta/dist/vanta.globe.min';

export default function CyberBackground({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [vantaEffect, setVantaEffect] = useState<any>(null);
    const myRef = useRef<HTMLDivElement>(null);

    // Define features where the background should be DISABLED for performance
    const disabledRoutes = ['/network', '/map', '/terminal', '/sandbox'];
    const isVantaEnabled = !disabledRoutes.includes(pathname);

    // Route-specific color configurations
    const getGlobeColors = () => {
        switch (pathname) {
            case '/finance':
                return {
                    color: 0x10b981,          // Emerald-500: Green for finance
                    color2: 0x34d399,         // Emerald-400: Lighter green
                    backgroundColor: 0x020617,
                    size: 1.00,
                    backgroundAlpha: 0.0
                };
            case '/academy':
                return {
                    color: 0x0891b2,          // Cyan-600: Keep cyan but more subtle
                    color2: 0x06b6d4,         // Cyan-500: Lighter cyan
                    backgroundColor: 0x020617,
                    size: 0.8,                // Smaller for subtlety
                    backgroundAlpha: 0.3      // More transparent-ish
                };
            case '/social':
                return {
                    color: 0x0891b2,          // Cyan-600: Bright cyan for social
                    color2: 0x22d3ee,         // Cyan-400: Lighter cyan
                    backgroundColor: 0x020617,
                    size: 1.00,
                    backgroundAlpha: 0.0
                };
            case '/ai':
                return {
                    color: 0x8b5cf6,          // Violet-500: Purple for AI
                    color2: 0xa78bfa,         // Violet-400: Lighter purple
                    backgroundColor: 0x020617,
                    size: 1.00,
                    backgroundAlpha: 0.0
                };
            case '/identity':
                return {
                    color: 0x3b82f6,          // Blue-500: Blue for identity
                    color2: 0x8b5cf6,         // Violet-500: Purple gradient
                    backgroundColor: 0x020617,
                    size: 1.00,
                    backgroundAlpha: 0.0
                };
            default:
                return {
                    color: 0x0891b2,          // Default Cyan-600
                    color2: 0x22d3ee,         // Default Cyan-400
                    backgroundColor: 0x020617,
                    size: 1.00,
                    backgroundAlpha: 0.0
                };
        }
    };

    useEffect(() => {
        // If disabled, cleanup and exit
        if (!isVantaEnabled) {
            if (vantaEffect) {
                vantaEffect.destroy();
                setVantaEffect(null);
            }
            return;
        }

        // Destroy existing effect if route changed
        if (vantaEffect) {
            vantaEffect.destroy();
            setVantaEffect(null);
        }

        if (myRef.current) {
            try {
                const globeConfig = getGlobeColors();
                const effect = GLOBE({
                    el: myRef.current,
                    THREE: THREE,
                    mouseControls: false,
                    touchControls: false,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    scale: 1.00,
                    scaleMobile: 1.00,
                    ...globeConfig
                });

                // Disable pointer events on canvas
                const canvas = myRef.current.querySelector('canvas');
                if (canvas) {
                    canvas.style.pointerEvents = 'none';
                }

                setVantaEffect(effect);
            } catch (error) {
                console.error("Failed to load Vanta effect", error);
            }
        }

        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [pathname, isVantaEnabled]);

    // Route-specific fallback gradients
    const getFallbackGradient = () => {
        switch (pathname) {
            case '/finance':
                return 'bg-gradient-to-b from-emerald-950/20 to-black';
            case '/academy':
                return 'bg-gradient-to-b from-cyan-950/10 to-black';
            case '/social':
                return 'bg-gradient-to-b from-cyan-950/20 to-black';
            case '/ai':
                return 'bg-gradient-to-b from-violet-950/20 to-black';
            case '/identity':
                return 'bg-gradient-to-b from-blue-950/20 to-black';
            default:
                return 'bg-gradient-to-b from-cyan-950/20 to-black';
        }
    };

    // If disabled, render simple background wrapper
    if (!isVantaEnabled) {
        return (
            <>
                <div className="fixed inset-0 w-full h-full bg-[#050A14]" style={{ zIndex: -1 }} />
                {children}
            </>
        );
    }

    return (
        <>
            {/* Background layer - no clicks */}
            <div ref={myRef} className="fixed inset-0 w-full h-full" style={{ zIndex: -1, pointerEvents: 'none' }}>
                {/* Fallback gradient */}
                <div className={`absolute inset-0 ${getFallbackGradient()}`} />
            </div>

            {/* Content layer - clicks enabled */}
            {children}
        </>
    );
}

