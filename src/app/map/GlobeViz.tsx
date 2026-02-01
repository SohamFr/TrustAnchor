'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';

// --- Types ---
type City = {
    name: string;
    lat: number;
    lng: number;
    pop: number;
    color?: string;
};

type Arc = {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    color: string[];
    name: string;
    sourceIp: string;
    targetName: string;
};

type Ring = {
    lat: number;
    lng: number;
    maxR: number;
    propagationSpeed: number;
    repeatPeriod: number;
    color: string;
};

// --- Mock Data ---
const CITIES: City[] = [
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194, pop: 884363, color: '#06b6d4' },
    { name: 'New York', lat: 40.7128, lng: -74.0060, pop: 8468000, color: '#3b82f6' },
    { name: 'London', lat: 51.5074, lng: -0.1278, pop: 8982000, color: '#8b5cf6' },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, pop: 13960000, color: '#f43f5e' },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093, pop: 5312000, color: '#10b981' },
    { name: 'Sao Paulo', lat: -23.5505, lng: -46.6333, pop: 12330000, color: '#eab308' },
    { name: 'Moscow', lat: 55.7558, lng: 37.6173, pop: 12690000, color: '#f97316' },
    { name: 'Beijing', lat: 39.9042, lng: 116.4074, pop: 21540000, color: '#ef4444' },
    { name: 'New Delhi', lat: 28.6139, lng: 77.2090, pop: 30290000, color: '#ec4899' },
    { name: 'Cairo', lat: 30.0444, lng: 31.2357, pop: 20900000, color: '#6366f1' },
    { name: 'Cape Town', lat: -33.9249, lng: 18.4241, pop: 433688, color: '#14b8a6' },
    { name: 'Paris', lat: 48.8566, lng: 2.3522, pop: 2161000, color: '#a855f7' },
    { name: 'Berlin', lat: 52.5200, lng: 13.4050, pop: 3645000, color: '#3b82f6' },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198, pop: 5686000, color: '#06b6d4' },
];

const getRandomIp = () => {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

export default function GlobeViz() {
    const globeEl = useRef<GlobeMethods | undefined>(undefined);
    const [arcs, setArcs] = useState<Arc[]>([]);
    const [rings, setRings] = useState<Ring[]>([]);
    const [mounted, setMounted] = useState(false);
    const [hoveredArc, setHoveredArc] = useState<Arc | null>(null);
    const idleTimeout = useRef<NodeJS.Timeout | null>(null);
    const isHoveringRef = useRef(false);

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Initial load handling and dimension setup
    useEffect(() => {
        setMounted(true);

        // Set actual dimensions after mount
        if (typeof window !== 'undefined') {
            const updateDimensions = () => {
                setDimensions({
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            };

            // Initial dimension set
            updateDimensions();

            // Update dimensions on resize
            window.addEventListener('resize', updateDimensions);

            return () => {
                window.removeEventListener('resize', updateDimensions);
            };
        }
    }, []);

    // Setup auto-rotate after globe is mounted
    useEffect(() => {
        if (!mounted || !globeEl.current) return;

        // Small delay to ensure globe is fully initialized
        const timer = setTimeout(() => {
            if (globeEl.current) {
                globeEl.current.controls().autoRotate = true;
                globeEl.current.controls().autoRotateSpeed = 0.5;
                globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [mounted]);

    const resetIdleTimer = useCallback(() => {
        if (!globeEl.current) return;

        // Stop rotation on interaction
        globeEl.current.controls().autoRotate = false;

        // Clear existing timer
        if (idleTimeout.current) {
            clearTimeout(idleTimeout.current);
        }

        // Restart timer
        idleTimeout.current = setTimeout(() => {
            // Only resume if we are not currently hovering an interactive element
            if (globeEl.current && !isHoveringRef.current) {
                globeEl.current.controls().autoRotate = true;
            }
        }, 3000); // Resume after 3 seconds of idleness
    }, []);

    // Simulation Loop
    useEffect(() => {
        if (!mounted) return;

        const interval = setInterval(() => {
            // Random Attack Simulation
            const source = CITIES[Math.floor(Math.random() * CITIES.length)];
            let target = CITIES[Math.floor(Math.random() * CITIES.length)];
            while (source === target) target = CITIES[Math.floor(Math.random() * CITIES.length)];

            const isCritical = Math.random() > 0.7;
            const color = isCritical ? ['#f43f5e', '#ef4444'] : ['#06b6d4', '#3b82f6']; // Red/Red or Cyan/Blue

            const newArc: Arc = {
                startLat: source.lat,
                startLng: source.lng,
                endLat: target.lat,
                endLng: target.lng,
                color,
                name: `${source.name} -> ${target.name}`,
                sourceIp: getRandomIp(),
                targetName: target.name
            };

            setArcs(prev => [...prev.slice(-20), newArc]); // Keep last 20

            // Impact Ring
            const newRing: Ring = {
                lat: target.lat,
                lng: target.lng,
                maxR: isCritical ? 5 : 2,
                propagationSpeed: isCritical ? 2 : 1,
                repeatPeriod: 1000,
                color: isCritical ? '#f43f5e' : '#06b6d4'
            };
            setRings(prev => [...prev.slice(-10), newRing]);

        }, 800);

        return () => clearInterval(interval);
    }, [mounted]);

    // Don't render until we have proper dimensions
    if (!mounted || dimensions.width === 0 || dimensions.height === 0) {
        return <div className="w-full h-full flex items-center justify-center text-cyan-500 animate-pulse font-mono">INITIALIZING_GEO_POSITIONING...</div>;
    }

    return (
        <div
            className="w-full h-full relative z-20"
            onPointerDown={resetIdleTimer}
            onWheel={resetIdleTimer}
            onPointerMove={resetIdleTimer}
        >
            <Globe
                ref={globeEl}
                animateIn={true}
                globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"

                // Atmosphere
                atmosphereColor="#06b6d4"
                atmosphereAltitude={0.15}

                // Controls
                // OrbitControls are default enabled.

                // Arcs (Attacks)
                arcsData={arcs}
                // Determine color: if hovered, white, else default
                arcColor={(arc: any) => arc === hoveredArc ? '#ffffff' : arc.color}
                // Determine dash length: if hovered, 1 (solid), else 0.9
                arcDashLength={(arc: any) => arc === hoveredArc ? 1 : 0.9}
                arcDashGap={4}
                arcDashInitialGap={() => Math.random() * 5}
                arcDashAnimateTime={2000}
                arcStroke={(arc: any) => arc === hoveredArc ? 1 : 0.5} // Thicker when hovered

                // Tooltip
                arcLabel={(arc: any) => `
                    <div style="
                        background: rgba(0,0,0,0.8); 
                        color: #06b6d4; 
                        padding: 8px 12px; 
                        border: 1px solid #06b6d4; 
                        border-radius: 4px; 
                        font-family: monospace; 
                        box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
                    ">
                        <div style="font-size: 0.8rem; opacity: 0.7;">THREAT DETECTED</div>
                        <div style="font-weight: bold; color: white;">SOURCE: ${arc.sourceIp}</div>
                        <div>TARGET: ${arc.targetName.toUpperCase()}</div>
                    </div>
                `}

                // Hover Events
                onArcHover={(arc: any) => {
                    setHoveredArc(arc || null);
                    isHoveringRef.current = !!arc;
                    if (arc) {
                        // Explicitly stop rotation if hovering
                        if (globeEl.current) globeEl.current.controls().autoRotate = false;
                        if (idleTimeout.current) clearTimeout(idleTimeout.current);
                    } else {
                        // Resume idle timer when leaving
                        resetIdleTimer();
                    }
                }}

                // Rings (Impacts)
                ringsData={rings}
                ringColor="color"
                ringMaxRadius="maxR"
                ringPropagationSpeed="propagationSpeed"
                ringRepeatPeriod="repeatPeriod"

                // Points (Cities)
                pointsData={CITIES}
                pointColor="color"
                pointAltitude={0.01}
                pointRadius={0.5}
                pointsMerge={true}
                pointLabel="name"

                // Config
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="#00000000" // Transparent
            />
        </div>
    );
}
