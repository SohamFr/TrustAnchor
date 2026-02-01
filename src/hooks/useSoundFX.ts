import { useCallback, useEffect, useRef } from 'react';
import { useSecurity } from '@/context/SecurityContext';

export function useSoundFX() {
    const { isMuted } = useSecurity();
    const audioContextRef = useRef<AudioContext | null>(null);
    const humOscillatorRef = useRef<OscillatorNode | null>(null);
    const humGainRef = useRef<GainNode | null>(null);

    const getAudioContext = useCallback(() => {
        if (typeof window === 'undefined') return null;

        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass();
            }
        }
        return audioContextRef.current;
    }, []);

    const playSound = useCallback((type: 'chirp' | 'tick' | 'powerUp' | 'alarm' | 'click') => {
        if (isMuted) return;

        const ctx = getAudioContext();
        if (!ctx) return;

        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => { });
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (type) {
            case 'chirp':
                // High-tech UI chirp
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(1200, now);
                oscillator.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
            case 'tick':
                // Subtle hover tick
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(800, now);
                gainNode.gain.setValueAtTime(0.02, now);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
                oscillator.start(now);
                oscillator.stop(now + 0.03);
                break;
            case 'click':
                // Heavier click for activation
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(300, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
            case 'powerUp':
                // Scan complete / Data lock
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(220, now);
                oscillator.frequency.linearRampToValueAtTime(880, now + 0.4);

                // Add a second harmonic
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.type = 'square';
                osc2.frequency.setValueAtTime(110, now);
                osc2.frequency.linearRampToValueAtTime(440, now + 0.4);

                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
                gain2.gain.setValueAtTime(0.05, now);
                gain2.gain.linearRampToValueAtTime(0, now + 0.5);

                oscillator.start(now);
                oscillator.stop(now + 0.5);
                osc2.start(now);
                osc2.stop(now + 0.5);
                break;
            case 'alarm':
                // Threat detected - pulsing
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.linearRampToValueAtTime(100, now + 0.3);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
        }
    }, [isMuted, getAudioContext]);

    const playHum = useCallback((active: boolean) => {
        const ctx = getAudioContext();
        if (!ctx) return;

        if (active && !isMuted) {
            if (ctx.state === 'suspended') ctx.resume();

            if (!humOscillatorRef.current) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();

                // Brown noise approximation or low sine for server hum
                // Let's use a low frequency FM synth for "server drone"
                osc.type = 'sawtooth';
                osc.frequency.value = 40; // Low hum

                filter.type = 'lowpass';
                filter.frequency.value = 120;

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);

                gain.gain.value = 0.03; // Quiet

                osc.start();
                humOscillatorRef.current = osc;
                humGainRef.current = gain;
            } else if (humGainRef.current) {
                // Fade in
                humGainRef.current.gain.setTargetAtTime(0.03, ctx.currentTime, 0.5);
            }
        } else {
            // Stop/Fade out
            if (humGainRef.current && humOscillatorRef.current) {
                humGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
                setTimeout(() => {
                    if (humOscillatorRef.current) {
                        humOscillatorRef.current.stop();
                        humOscillatorRef.current.disconnect();
                        humOscillatorRef.current = null;
                    }
                    if (humGainRef.current) {
                        humGainRef.current.disconnect();
                        humGainRef.current = null;
                    }
                }, 600);
            }
        }
    }, [isMuted, getAudioContext]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (humOscillatorRef.current) {
                humOscillatorRef.current.stop();
                humOscillatorRef.current.disconnect();
            }
        };
    }, []);

    // Watch mute state to kill hum immediately
    useEffect(() => {
        if (isMuted && humOscillatorRef.current) {
            playHum(false);
        }
    }, [isMuted, playHum]);

    return { playSound, playHum };
}
