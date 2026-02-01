'use client';

import { useState, useEffect, useRef, FormEvent, KeyboardEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface TerminalLine {
    id: string;
    content: React.ReactNode;
}

export default function CyberTerminalPage() {
    const router = useRouter();
    const [lines, setLines] = useState<TerminalLine[]>([]);
    const [input, setInput] = useState('');
    const [isBooting, setIsBooting] = useState(true);
    const [cmdHistory, setCmdHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const historyEndRef = useRef<HTMLDivElement>(null);

    const addLine = useCallback((content: React.ReactNode, type: 'system' | 'input' | 'output' | 'error' = 'output') => {
        setLines(prev => [...prev, {
            id: Math.random().toString(36).substring(2, 11),
            content: (
                <div className={`
                    ${type === 'error' ? 'text-red-500' : ''}
                    ${type === 'system' ? 'text-slate-500' : ''}
                    ${type === 'input' ? 'text-white' : ''}
                    ${type === 'output' ? 'text-slate-300' : ''}
                `}>
                    {content}
                </div>
            )
        }]);
    }, []);

    // Auto-scroll to bottom whenever lines change
    useEffect(() => {
        historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    // Focus management
    useEffect(() => {
        const handleClick = () => inputRef.current?.focus();
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // Boot Sequence
    useEffect(() => {
        const bootSequence = [
            "TrustOS Kernel v4.4.0-generic loading...",
            "[ OK ] Mounted root filesystem.",
            "[ OK ] Started Network Manager.",
            "[ OK ] Started SSH Daemon.",
            "[ OK ] Initialized Security Subsystems.",
            "Loading TrustAnchor Shell...",
            " "
        ];

        let delay = 0;
        bootSequence.forEach((line, i) => {
            delay += Math.random() * 300 + 100;
            setTimeout(() => {
                addLine(line, 'system');
                if (i === bootSequence.length - 1) setIsBooting(false);
            }, delay);
        });
    }, [addLine]);

    const executeCommand = async (cmd: string) => {
        const trimmed = cmd.trim();
        if (!trimmed) return;

        // Add input line to display
        addLine(
            <div className="flex gap-2">
                <span className="text-emerald-500 font-bold">root@trust-anchor:~#</span>
                <span>{cmd}</span>
            </div>,
            'input'
        );

        // Update History - append, don't overwrite
        setCmdHistory(prev => [...prev, trimmed]);
        setHistoryIndex(cmdHistory.length + 1);

        const args = trimmed.split(' ');
        const command = args[0].toLowerCase();

        // Command Logic
        switch (command) {
            case 'help':
                addLine((
                    <div className="space-y-1 text-slate-300">
                        <div>GNU bash, version 5.1.16(1)-release (x86_64-pc-linux-gnu)</div>
                        <div>These shell commands are defined internally. Type 'help' to see this list.</div>
                        <div className="mt-2 grid grid-cols-[120px_1fr] gap-2">
                            <span className="text-cyan-400">help</span><span>Show this help message</span>
                            <span className="text-cyan-400">scan [url]</span><span>Launch URL scanner with specified URL</span>
                            <span className="text-cyan-400">clear</span><span>Clear terminal screen</span>
                            <span className="text-cyan-400">whoami</span><span>Display current user identity</span>
                            <span className="text-cyan-400">sandbox</span><span>Launch Malware Analysis Sandbox</span>
                            <span className="text-cyan-400">encrypt [text]</span><span>Base64 Encode text</span>
                            <span className="text-cyan-400">decrypt [text]</span><span>Base64 Decode text</span>
                            <span className="text-cyan-400">date</span><span>Print system date/time</span>
                            <span className="text-cyan-400">exit</span><span>Logout and return to GUI</span>
                        </div>
                    </div>
                ));
                break;

            case 'clear':
            case 'cls':
                setLines([]);
                break;

            case 'whoami':
                const mockIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
                addLine((
                    <div className="space-y-1">
                        <div>User: <span className="text-cyan-400 font-bold">ROOT</span></div>
                        <div>IP: <span className="text-emerald-400">{mockIp}</span></div>
                    </div>
                ));
                break;

            case 'scan':
                if (args.length < 2) {
                    addLine("usage: scan <url>", 'error');
                    addLine("example: scan https://example.com");
                } else {
                    const url = args[1];
                    addLine(`Initializing scanner for: ${url}`);
                    setTimeout(() => {
                        addLine("Redirecting to URL Scanner...");
                        setTimeout(() => router.push(`/?url=${encodeURIComponent(url)}`), 500);
                    }, 300);
                }
                break;

            case 'date':
                addLine(new Date().toString());
                break;

            case 'sandbox':
                addLine("Starting Sandbox Environment...");
                setTimeout(() => router.push('/sandbox'), 800);
                break;

            case 'exit':
                addLine("logging out...");
                setTimeout(() => router.push('/'), 500);
                break;

            case 'encrypt':
                if (args.length < 2) {
                    addLine("usage: encrypt <message>", 'error');
                } else {
                    addLine(btoa(args.slice(1).join(' ')));
                }
                break;

            case 'decrypt':
                if (args.length < 2) {
                    addLine("usage: decrypt <base64_string>", 'error');
                } else {
                    try {
                        addLine(atob(args.slice(1).join(' ')));
                    } catch {
                        addLine("Invalid Base64 string", 'error');
                    }
                }
                break;

            default:
                addLine(`bash: ${command}: command not found`, 'error');
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent form submission
        executeCommand(input);
        setInput('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(cmdHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < cmdHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(cmdHistory[newIndex]);
            } else {
                setHistoryIndex(cmdHistory.length);
                setInput('');
            }
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#0c0c0c] font-mono text-sm md:text-base overflow-hidden">
            {/* Terminal History - Scrollable Area */}
            <div
                className="flex-1 overflow-y-auto p-4 custom-scrollbar"
                id="terminal-history"
                style={{ fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace' }}
            >
                <div className="space-y-0.5">
                    {lines.map((line) => (
                        <div key={line.id} className="break-words leading-tight">
                            {line.content}
                        </div>
                    ))}
                    <div ref={historyEndRef} />
                </div>
            </div>

            {/* Input Line - Fixed at Bottom */}
            {!isBooting && (
                <div className="flex-none px-4 pb-4">
                    <form onSubmit={handleSubmit} className="flex gap-2 items-center" style={{ fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace' }}>
                        <span className="text-emerald-500 font-bold shrink-0">root@trust-anchor:~#</span>
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-transparent border-none outline-none text-white caret-white"
                                autoFocus
                                autoComplete="off"
                                spellCheck="false"
                            />
                            {/* Blinking Cursor */}
                            {input === '' && (
                                <span className="absolute left-0 top-0 animate-pulse inline-block w-2 h-4 bg-slate-400" />
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
