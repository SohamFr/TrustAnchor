import { ConsentHandshake } from "@/components/ConsentHandshake";

export default function ConsentDemoPage() {
    return (
        <main className="min-h-screen w-full bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="relative z-10 w-full max-w-2xl text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600 mb-4">
                    Trust Anchor Protocol
                </h1>
                <p className="text-slate-400 max-w-lg mx-auto">
                    Initiate the secure handshake sequence to access sensitive vectors.
                    Authorization is mandatory.
                </p>
            </div>

            <div className="relative z-10 w-full">
                <ConsentHandshake onComplete={() => console.log('Handshake Complete')} />
            </div>

        </main>
    );
}
