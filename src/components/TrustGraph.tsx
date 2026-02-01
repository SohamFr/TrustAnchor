'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { generateNetworkScan, NetworkNode, NetworkLink, NodeType } from '@/lib/generateNetwork';
import { useSoundFX } from '@/hooks/useSoundFX';
import { Shield, Skull, Router, HelpCircle, Zap, RefreshCw } from 'lucide-react';

export default function TrustGraph() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { playSound } = useSoundFX();

    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [hoverNode, setHoverNode] = useState<NetworkNode | null>(null);
    const [nodeData, setNodeData] = useState(() => generateNetworkScan(25));

    // D3 simulation ref
    const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkLink> | null>(null);
    const animationRef = useRef<number>(undefined);

    // Handle window resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                setDimensions({ width: clientWidth, height: clientHeight });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Initialize D3 Force Simulation
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d')!;
        const { width, height } = dimensions;

        // Create D3 force simulation with ORGANIC PHYSICS
        const simulation = d3.forceSimulation(nodeData.nodes)
            .force('link', d3.forceLink(nodeData.links)
                .id((d: any) => d.id)
                .distance(80)
                .strength(0.3))
            .force('charge', d3.forceManyBody()
                .strength(-300)           // Strong repulsion
                .distanceMax(300))
            .force('center', d3.forceCenter(width / 2, height / 2)
                .strength(0.05))          // Weak centering
            .force('collide', d3.forceCollide()
                .radius((d: any) => getNodeRadius(d.type) + 5)
                .strength(0.8))
            .alphaDecay(0.001)            // Very slow decay = continuous movement
            .velocityDecay(0.2)           // Low friction = smooth flow
            .alphaMin(0.0001);            // Never fully stops

        simulationRef.current = simulation;

        // Organic "swimming" effect - add random velocity
        const swimTick = setInterval(() => {
            nodeData.nodes.forEach((node) => {
                if (!node.quarantined) {
                    node.vx = (node.vx || 0) + (Math.random() - 0.5) * 0.5;
                    node.vy = (node.vy || 0) + (Math.random() - 0.5) * 0.5;
                }
            });
        }, 100);

        // Animation loop
        const tick = () => {
            context.clearRect(0, 0, width, height);

            // Draw links
            context.strokeStyle = 'rgba(148, 163, 184, 0.2)';
            context.lineWidth = 1.5;
            nodeData.links.forEach((link: any) => {
                const source = link.source;
                const target = link.target;

                context.beginPath();
                context.moveTo(source.x, source.y);
                context.lineTo(target.x, target.y);
                context.stroke();
            });

            // Draw nodes
            nodeData.nodes.forEach((node) => {
                drawNode(context, node);
            });

            animationRef.current = requestAnimationFrame(tick);
        };

        simulation.on('tick', tick);
        tick();

        return () => {
            simulation.stop();
            clearInterval(swimTick);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [dimensions, nodeData]);

    // Drag behavior
    useEffect(() => {
        if (!canvasRef.current || !simulationRef.current) return;

        const canvas = canvasRef.current;
        const simulation = simulationRef.current;

        let dragNode: NetworkNode | null = null;

        const dragstarted = (event: MouseEvent) => {
            const [x, y] = [event.offsetX, event.offsetY];
            dragNode = findNode(x, y);

            if (dragNode) {
                playSound('tick');
                simulation.alphaTarget(0.3).restart();
                dragNode.fx = dragNode.x;
                dragNode.fy = dragNode.y;
            }
        };

        const dragged = (event: MouseEvent) => {
            if (dragNode) {
                dragNode.fx = event.offsetX;
                dragNode.fy = event.offsetY;
            }
        };

        const dragended = () => {
            if (dragNode) {
                simulation.alphaTarget(0.0001);
                dragNode.fx = null;
                dragNode.fy = null;
                dragNode = null;
            }
        };

        canvas.addEventListener('mousedown', dragstarted);
        canvas.addEventListener('mousemove', dragged);
        canvas.addEventListener('mouseup', dragended);

        return () => {
            canvas.removeEventListener('mousedown', dragstarted);
            canvas.removeEventListener('mousemove', dragged);
            canvas.removeEventListener('mouseup', dragended);
        };
    }, [nodeData, simulationRef.current]);

    // Hover detection
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;

        const handleMouseMove = (event: MouseEvent) => {
            const [x, y] = [event.offsetX, event.offsetY];
            const node = findNode(x, y);

            if (node !== hoverNode) {
                setHoverNode(node);
                if (node) playSound('tick');
            }
        };

        const handleClick = (event: MouseEvent) => {
            const [x, y] = [event.offsetX, event.offsetY];
            const node = findNode(x, y);

            if (node && node.type === 'malicious' && !node.quarantined) {
                quarantineNode(node);
                playSound('alarm');
            }
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleClick);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleClick);
        };
    }, [nodeData, hoverNode]);

    const findNode = (x: number, y: number): NetworkNode | null => {
        for (const node of nodeData.nodes) {
            const dx = (node.x || 0) - x;
            const dy = (node.y || 0) - y;
            const radius = getNodeRadius(node.type);
            if (dx * dx + dy * dy < radius * radius) {
                return node;
            }
        }
        return null;
    };

    const quarantineNode = (node: NetworkNode) => {
        node.quarantined = true;
        setNodeData({ ...nodeData }); // Trigger re-render
    };

    const resetNetwork = () => {
        const newData = generateNetworkScan(25);
        setNodeData(newData);
        playSound('powerUp');
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-slate-950 overflow-hidden" style={{ touchAction: 'none' }}>
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
            />

            {/* Hover Info Panel */}
            {hoverNode && (
                <div className="absolute top-4 right-4 w-80 p-4 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl font-mono text-xs z-10">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-cyan-400 font-bold uppercase">{hoverNode.name}</h3>
                        {getNodeIcon(hoverNode.type)}
                    </div>
                    <div className="space-y-1.5 text-slate-300">
                        <div className="flex justify-between border-b border-slate-700 pb-1">
                            <span className="text-slate-500">IP:</span>
                            <span className="text-white font-bold">{hoverNode.ip}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-700 pb-1">
                            <span className="text-slate-500">Type:</span>
                            <span className="text-white capitalize">{hoverNode.type}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-700 pb-1">
                            <span className="text-slate-500">Threat Level:</span>
                            <span className={`font-bold ${getThreatColor(hoverNode.threatLevel)}`}>
                                {hoverNode.threatLevel}%
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-700 pb-1">
                            <span className="text-slate-500">Device:</span>
                            <span className="text-white text-[10px]">{hoverNode.deviceInfo}</span>
                        </div>
                        {hoverNode.quarantined && (
                            <div className="mt-2 px-2 py-1 bg-gray-800 rounded text-center">
                                <span className="text-gray-400 text-[10px]">🔒 QUARANTINED</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Control Panel */}
            <div className="absolute top-4 left-4 w-64 p-4 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl z-10">
                <h2 className="text-cyan-400 font-mono text-xs font-bold uppercase mb-3">
                    Network Topology
                </h2>

                <button
                    onClick={resetNetwork}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded text-xs uppercase flex items-center justify-center gap-2 transition-all"
                >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate Network
                </button>

                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 text-[10px]">
                    {getNodeStats(nodeData.nodes).map(({ type, count, color }) => (
                        <div key={type} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${color}`}></div>
                            <span className="text-slate-400 capitalize">{type}: {count}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 text-[9px] text-slate-600">
                    <div>Drag: Move nodes</div>
                    <div>Click red: Quarantine</div>
                </div>
            </div>
        </div>
    );
}

// Helper functions
function getNodeRadius(type: NodeType): number {
    switch (type) {
        case 'gateway': return 30;
        case 'firewall': return 20;
        case 'router': return 18;
        case 'unknown': return 16;
        case 'malicious': return 18;
        default: return 15;
    }
}

function getNodeColor(type: NodeType, quarantined: boolean): string {
    if (quarantined) return '#6b7280'; // gray

    switch (type) {
        case 'gateway': return '#0ea5e9';   // blue
        case 'firewall': return '#10b981';  // emerald
        case 'router': return '#06b6d4';    // cyan
        case 'unknown': return '#eab308';   // yellow
        case 'malicious': return '#ef4444'; // red
        default: return '#94a3b8';
    }
}

function drawNode(context: CanvasRenderingContext2D, node: NetworkNode) {
    const x = node.x || 0;
    const y = node.y || 0;
    const radius = node.quarantined ? getNodeRadius(node.type) * 0.5 : getNodeRadius(node.type);
    const color = getNodeColor(node.type, node.quarantined || false);

    // Pulsing effect for threats
    let pulseRadius = radius;
    if (node.type === 'malicious' && !node.quarantined) {
        const pulse = Math.sin(Date.now() / 200) * 2 + 2;
        pulseRadius = radius + pulse;
    } else if (node.type === 'unknown') {
        const pulse = Math.sin(Date.now() / 800) * 1 + 1;
        pulseRadius = radius + pulse;
    }

    // Glow
    context.shadowBlur = node.quarantined ? 5 : 15;
    context.shadowColor = color;

    // Main circle
    context.beginPath();
    context.arc(x, y, pulseRadius, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();

    context.shadowBlur = 0;

    // Border
    context.strokeStyle = node.quarantined ? '#374151' : 'rgba(255, 255, 255, 0.3)';
    context.lineWidth = 2;
    context.stroke();

    // Label
    context.fillStyle = '#fff';
    context.font = 'bold 8px monospace';
    context.textAlign = 'center';
    context.fillText(node.type.toUpperCase().slice(0, 3), x, y + radius + 12);
}

function getNodeIcon(type: NodeType) {
    const className = "w-4 h-4";
    switch (type) {
        case 'gateway': return <Zap className={`${className} text-blue-400`} />;
        case 'firewall': return <Shield className={`${className} text-emerald-400`} />;
        case 'router': return <Router className={`${className} text-cyan-400`} />;
        case 'unknown': return <HelpCircle className={`${className} text-yellow-400`} />;
        case 'malicious': return <Skull className={`${className} text-red-400`} />;
    }
}

function getThreatColor(level: number): string {
    if (level > 70) return 'text-red-400';
    if (level > 30) return 'text-yellow-400';
    return 'text-green-400';
}

function getNodeStats(nodes: NetworkNode[]) {
    const stats = [
        { type: 'gateway', count: 0, color: 'bg-blue-500' },
        { type: 'firewall', count: 0, color: 'bg-emerald-500' },
        { type: 'router', count: 0, color: 'bg-cyan-500' },
        { type: 'unknown', count: 0, color: 'bg-yellow-500' },
        { type: 'malicious', count: 0, color: 'bg-red-500' },
    ];

    nodes.forEach((node) => {
        const stat = stats.find((s) => s.type === node.type);
        if (stat) stat.count++;
    });

    return stats;
}
