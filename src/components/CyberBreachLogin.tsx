'use client';

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Terminal, ShieldAlert, Zap, Lock, Activity, Eye, Chrome, UserPlus } from 'lucide-react';
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { GlitchText } from "./GlitchText";

const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles = Array.from({ length: 100 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            color: `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.2})`
        }));

        let animationFrameId: number;

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                const dx = p.x - mouseRef.current.x;
                const dy = p.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const angle = Math.atan2(dy, dx);
                    p.x += Math.cos(angle) * 2;
                    p.y += Math.sin(angle) * 2;
                }

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

const CyberBreachLogin = () => {
    const sceneRef = useRef(null);
    const engineRef = useRef(null);
    const elementsRef = useRef(new Map());
    const requestRef = useRef<number>();

    const [breached, setBreached] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [logs, setLogs] = useState(['> SYSTEM_READY...', '> WAITING_FOR_AUTH...']);

    const addToPhysics = (id: string, element: HTMLElement | null, isBouncy = false) => {
        if (!element || !engineRef.current || elementsRef.current.has(id)) return;

        const rect = element.getBoundingClientRect();
        const body = Matter.Bodies.rectangle(
            rect.x + rect.width / 2,
            rect.y + rect.height / 2,
            rect.width,
            rect.height,
            {
                isStatic: true,
                restitution: isBouncy ? 0.95 : 0.4,
                friction: 0.05,
                density: 0.01,
                chamfer: { radius: 4 },
                render: { visible: false } as any
            }
        );

        elementsRef.current.set(id, { body, element });
        // @ts-ignore
        Matter.World.add(engineRef.current.world, body);
    };

    useEffect(() => {
        const engine = Matter.Engine.create();
        // @ts-ignore
        engineRef.current = engine;

        const render = Matter.Render.create({
            element: sceneRef.current!,
            engine: engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: 'transparent'
            }
        });

        const mouse = Matter.Mouse.create(render.canvas);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });

        Matter.World.add(engine.world, mouseConstraint);
        render.mouse = mouse;

        const ground = Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 100, window.innerWidth, 200, { isStatic: true });
        const wallL = Matter.Bodies.rectangle(-100, window.innerHeight / 2, 200, window.innerHeight, { isStatic: true });
        const wallR = Matter.Bodies.rectangle(window.innerWidth + 100, window.innerHeight / 2, 200, window.innerHeight, { isStatic: true });

        Matter.World.add(engine.world, [ground, wallL, wallR]);

        const runner = Matter.Runner.create();
        Matter.Runner.run(runner, engine);

        const updateLoop = () => {
            elementsRef.current.forEach(({ body, element }) => {
                if (!body.isStatic) {
                    const { x, y } = body.position;
                    const angle = body.angle;
                    element.style.transform = `translate(${x - element.offsetWidth / 2 - element.offsetLeft}px, ${y - element.offsetHeight / 2 - element.offsetTop}px) rotate(${angle}rad)`;
                    element.style.zIndex = "50";
                }
            });
            requestRef.current = requestAnimationFrame(updateLoop);
        };
        updateLoop();

        return () => {
            Matter.Runner.stop(runner);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            Matter.World.clear(engine.world, false);
            Matter.Engine.clear(engine);
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (breached) return;
        const x = (e.clientX - window.innerWidth / 2) / 25;
        const y = (e.clientY - window.innerHeight / 2) / 25;
        setMousePos({ x, y });
    };

    const triggerBreach = () => {
        setBreached(true);
        setLogs(p => [...p, '> GOOGLE_OAUTH_BYPASS', '> INTEGRITY_FAIL', '> GRAVITY_OFFLINE']);

        elementsRef.current.forEach(({ body }: any) => {
            Matter.Body.setStatic(body, false);
            Matter.Body.setVelocity(body, {
                x: (Math.random() - 0.5) * 15,
                y: -5 - Math.random() * 5
            });
            Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.5);
        });
    };

    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }, []);

    return (
        <div
            onMouseMove={handleMouseMove}
            className="relative w-full h-screen bg-black overflow-hidden font-['Rajdhani'] text-cyan-400 select-none"
        >
            <div ref={sceneRef} className="absolute inset-0 pointer-events-none z-0" />
            <ParticleBackground />

            <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06)_1px,transparent_1px),linear-gradient(rgba(255,0,0,0.06)_1px,transparent_1px)] bg-[length:100%_4px,100px_100px,100px_100px] pointer-events-none" />

            <div className="relative z-10 w-full h-full flex flex-col p-6 pointer-events-none">

                <header
                    ref={el => addToPhysics('header', el)}
                    className="flex justify-between items-end border-b-2 border-cyan-900 pb-4 mb-10 pointer-events-auto bg-black/50 backdrop-blur-md"
                >
                    <div>
                        <div className="text-4xl font-['Orbitron'] font-black tracking-widest text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            <GlitchText text="TRUST ANCHOR" />
                        </div>
                        <p className="text-xs tracking-[0.5em] text-cyan-600 mt-1">PERIMETER DEFENSE SYSTEM v9.0</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-red-500 font-bold animate-pulse">
                            <ShieldAlert className="w-5 h-5" />
                            <span>{breached ? 'CONTAINMENT FAILED' : 'ARMED'}</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center perspective-1000">

                    <div
                        ref={el => addToPhysics('main-card', el)}
                        style={{
                            transform: breached ? 'none' : `rotateX(${-mousePos.y}deg) rotateY(${mousePos.x}deg)`,
                            transition: breached ? 'none' : 'transform 0.1s ease-out'
                        }}
                        className="w-full max-w-md bg-black/80 border border-cyan-500/30 p-1 pointer-events-auto shadow-[0_0_50px_rgba(0,255,255,0.1)] group"
                    >
                        <div className="relative p-8 border border-cyan-500/50 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">

                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />

                            <div className="text-center mb-8 relative">
                                <div className="w-16 h-16 mx-auto bg-cyan-900/20 rounded-full flex items-center justify-center border border-cyan-500/30 mb-4 animate-[spin_10s_linear_infinite]">
                                    <Lock className="w-8 h-8 text-cyan-400" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-widest text-white">AUTHENTICATE</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="group/input">
                                    <div className="flex items-center bg-cyan-950/30 border border-cyan-800 focus-within:border-cyan-400 transition-colors p-3">
                                        <Terminal className="w-4 h-4 text-cyan-600 mr-3" />
                                        <input
                                            type="text"
                                            className="bg-transparent w-full outline-none text-cyan-100 font-mono tracking-wider placeholder:text-cyan-900"
                                            placeholder="AGENT ID"
                                        />
                                    </div>
                                </div>

                                <div className="group/input">
                                    <div className="flex items-center bg-cyan-950/30 border border-cyan-800 focus-within:border-cyan-400 transition-colors p-3">
                                        <Eye className="w-4 h-4 text-cyan-600 mr-3" />
                                        <input
                                            type="password"
                                            className="bg-transparent w-full outline-none text-cyan-100 font-mono tracking-widest placeholder:text-cyan-900"
                                            placeholder="ACCESS KEY"
                                        />
                                    </div>
                                </div>

                                <div ref={el => addToPhysics('login-btn', el, true)}>
                                    <SignInButton mode="modal">
                                        <button
                                            onClick={triggerBreach}
                                            className="w-full relative py-3 bg-cyan-600 text-black font-black font-['Orbitron'] tracking-widest hover:bg-cyan-500 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Zap className="w-4 h-4 fill-black" /> ENTER MAINFRAME
                                        </button>
                                    </SignInButton>
                                </div>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-cyan-900"></div>
                                    <span className="flex-shrink mx-4 text-xs text-cyan-700">OR CONNECT VIA</span>
                                    <div className="flex-grow border-t border-cyan-900"></div>
                                </div>

                                <div className="flex gap-3">
                                    <div ref={el => addToPhysics('google-btn', el)} className="flex-1">
                                        <SignInButton mode="modal">
                                            <button
                                                onClick={triggerBreach}
                                                className="w-full py-2 bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-['Orbitron']"
                                            >
                                                <Chrome className="w-4 h-4" /> GOOGLE
                                            </button>
                                        </SignInButton>
                                    </div>
                                    <div ref={el => addToPhysics('clerk-btn', el)} className="flex-1">
                                        <SignUpButton mode="modal">
                                            <button
                                                onClick={triggerBreach}
                                                className="w-full py-2 border border-cyan-600 text-cyan-400 font-bold text-xs hover:bg-cyan-900/30 transition-colors flex items-center justify-center gap-2 font-['Orbitron']"
                                            >
                                                <UserPlus className="w-4 h-4" /> SIGN UP
                                            </button>
                                        </SignUpButton>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-10">
                    <div
                        ref={el => addToPhysics('log-panel', el)}
                        className="w-64 h-32 bg-black/80 border-l-2 border-cyan-700 p-2 font-mono text-[10px] text-cyan-600/80 pointer-events-auto"
                    >
                        <div className="flex items-center gap-2 mb-2 border-b border-cyan-900/50 pb-1">
                            <Activity className="w-3 h-3" /> NETWORK LOGS
                        </div>
                        <div className="flex flex-col-reverse h-20 overflow-hidden">
                            {logs.map((l, i) => <div key={i}>{l}</div>)}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CyberBreachLogin;
