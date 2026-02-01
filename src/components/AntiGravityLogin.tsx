'use client';

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Feather, Send, X } from 'lucide-react';
import { SignInButton } from "@clerk/nextjs";

const AntiGravityLogin = () => {
    const sceneRef = useRef(null);
    const engineRef = useRef(null);
    const renderRef = useRef(null);
    const runnerRef = useRef(null);
    const [gravityEnabled, setGravityEnabled] = useState(false);
    const elementsRef = useRef(new Map());

    // Helper to add DOM elements to physics world
    const addToPhysics = (id: string, element: HTMLElement | null) => {
        if (!element || !engineRef.current || elementsRef.current.has(id)) return;

        const rect = element.getBoundingClientRect();
        const body = Matter.Bodies.rectangle(
            rect.x + rect.width / 2,
            rect.y + rect.height / 2,
            rect.width,
            rect.height,
            {
                isStatic: true, // Initially static until gravity triggers
                restitution: 0.6, // Bounciness
                friction: 0.1,
                render: { opacity: 0 } as any // Hide the physics body, show the DOM element
            }
        );

        elementsRef.current.set(id, { body, element });
        const engine = engineRef.current as any;
        if (engine) {
            Matter.World.add(engine.world, body);
        }
    };

    useEffect(() => {
        // 1. Setup Matter.js Engine
        const engine = Matter.Engine.create();
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

        engineRef.current = engine as any;
        renderRef.current = render as any;

        // 2. Add Boundaries (Walls/Floor)
        const floor = Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true });
        const leftWall = Matter.Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });
        const rightWall = Matter.Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });

        Matter.World.add(engine.world, [floor, leftWall, rightWall]);

        // 3. Start Engine
        const runner = Matter.Runner.create();
        runnerRef.current = runner as any;
        Matter.Runner.run(runner, engine);
        Matter.Render.run(render);

        // 4. Sync Loop: Update DOM positions based on Physics Bodies
        const updateLoop = () => {
            elementsRef.current.forEach(({ body, element }) => {
                if (!body.isStatic) {
                    const { x, y } = body.position;
                    const angle = body.angle;
                    // Apply physics transform to DOM element
                    element.style.transform = `translate(${x - element.offsetWidth / 2 - element.offsetLeft}px, ${y - element.offsetHeight / 2 - element.offsetTop}px) rotate(${angle}rad)`;
                    element.style.pointerEvents = 'none'; // Disable input once falling
                }
            });
            requestAnimationFrame(updateLoop);
        };
        updateLoop();

        return () => {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        };
    }, []);

    // Trigger Gravity
    const toggleGravity = () => {
        setGravityEnabled(true);
        elementsRef.current.forEach(({ body }: any) => {
            Matter.Body.setStatic(body, false);
            // Give them a tiny random push
            Matter.Body.setVelocity(body, {
                x: (Math.random() - 0.5) * 5,
                y: (Math.random() - 0.5) * 5
            });
        });
    };

    // Custom Font Injection
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }, []);

    return (
        <div className="relative w-full h-screen bg-[#F4F1EA] overflow-hidden selection:bg-neutral-800 selection:text-[#F4F1EA] text-neutral-900">

            {/* Physics Debug Canvas (Hidden but active) */}
            <div ref={sceneRef} className="absolute inset-0 pointer-events-none z-0" />

            {/* Background Texture (Noise/Paper) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none z-0 mix-blend-multiply"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* --- UI LAYER --- */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">

                {/* Header Section */}
                <div
                    ref={(el) => addToPhysics('header', el)}
                    className="mb-12 text-center border-b-4 border-double border-neutral-900 pb-6 w-full max-w-2xl"
                >
                    <p className="font-['Playfair_Display'] italic text-neutral-600 mb-2 tracking-widest uppercase text-xs">
                        Est. MMXXIV • Vol. No. 1 • Price: One Soul
                    </p>
                    <h1 className="font-['UnifrakturMaguntia'] text-7xl md:text-9xl text-neutral-900 leading-none tracking-tight">
                        The Chronicle
                    </h1>
                    <div className="flex justify-between items-center mt-4 border-t border-neutral-900 pt-2 font-['Playfair_Display'] text-sm font-bold">
                        <span>LONDON</span>
                        <span className="uppercase tracking-[0.3em]">Authentic Login</span>
                        <span>NEW YORK</span>
                    </div>
                </div>

                {/* Login Container */}
                <div className="flex gap-8 items-start max-w-4xl w-full">

                    {/* Left Column: Editorial */}
                    <div
                        ref={(el) => addToPhysics('editorial', el)}
                        className="hidden md:block w-1/3 text-justify font-['Playfair_Display'] text-neutral-800 text-sm leading-relaxed border-r border-neutral-400 pr-8"
                    >
                        <h3 className="font-bold text-lg mb-2 border-b border-neutral-900 inline-block">Gravity Protocol</h3>
                        <p className="mb-4">
                            <span className="text-4xl float-left mr-2 font-['UnifrakturMaguntia'] leading-none mt-[-5px]">W</span>
                            e regret to inform the public that the laws of physics are currently pending review.
                            Users are advised to secure their credentials before the inevitable collapse of the Newtonian framework.
                        </p>
                        <p>
                            Proceed with caution. The interface is unstable.
                        </p>
                    </div>

                    {/* Center: The Form */}
                    <div
                        ref={(el) => addToPhysics('form-card', el)}
                        className="flex-1 bg-[#F4F1EA] border border-neutral-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md mx-auto"
                    >
                        <div className="text-center mb-8">
                            <h2 className="font-['UnifrakturMaguntia'] text-4xl mb-2 text-neutral-900">Member Access</h2>
                            <div className="h-px w-full bg-neutral-900 my-2"></div>
                        </div>

                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-2">
                                <label className="block font-['Playfair_Display'] font-bold text-xs uppercase tracking-widest text-neutral-800">
                                    Identity (Email)
                                </label>
                                <input
                                    type="email"
                                    placeholder="sir.isaac@cambridge.edu"
                                    className="w-full bg-transparent border-b-2 border-neutral-300 focus:border-neutral-900 outline-none py-2 font-['Playfair_Display'] placeholder:italic placeholder:text-neutral-400 transition-colors text-neutral-900"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block font-['Playfair_Display'] font-bold text-xs uppercase tracking-widest text-neutral-800">
                                    Secret (Password)
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••••"
                                    className="w-full bg-transparent border-b-2 border-neutral-300 focus:border-neutral-900 outline-none py-2 font-['Playfair_Display'] text-neutral-900"
                                />
                            </div>

                            <SignInButton mode="modal">
                                <button
                                    className="group relative w-full bg-neutral-900 text-[#F4F1EA] py-4 mt-4 overflow-hidden border border-neutral-900 hover:bg-[#F4F1EA] hover:text-neutral-900 transition-colors duration-300"
                                >
                                    <span className="relative z-10 font-['Playfair_Display'] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                        Authenticate <Feather className="w-4 h-4" />
                                    </span>
                                </button>
                            </SignInButton>
                        </form>
                    </div>

                    {/* Right Column: Ads/Extras */}
                    <div className="hidden lg:flex flex-col gap-4 w-1/4 pl-4">
                        <div
                            ref={(el) => addToPhysics('ad-1', el)}
                            className="border-4 border-neutral-900 p-4 text-center"
                        >
                            <h4 className="font-['UnifrakturMaguntia'] text-2xl text-neutral-900">Lost Gravity?</h4>
                            <p className="font-['Playfair_Display'] text-xs italic mt-2 text-neutral-600">Find it here for only 5 pence.</p>
                        </div>

                        <div
                            ref={(el) => addToPhysics('ad-2', el)}
                            className="border border-neutral-900 p-4 text-center bg-neutral-900 text-[#F4F1EA] cursor-pointer"
                            onClick={toggleGravity}
                        >
                            <h4 className="font-['Playfair_Display'] font-bold uppercase tracking-widest text-xs mb-2 text-white">Notice</h4>
                            <p className="font-serif text-sm text-neutral-300">Clicking this WILL break the interface. Prepared for chaos?</p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div
                    ref={(el) => addToPhysics('footer', el)}
                    className="mt-auto pt-12 pb-4 text-center font-['Playfair_Display'] text-xs text-neutral-500 uppercase tracking-widest"
                >
                    &copy; 1887 Anti-Gravity Corp • All Rights Reserved
                </div>

            </div>
        </div>
    );
};

export default AntiGravityLogin;
