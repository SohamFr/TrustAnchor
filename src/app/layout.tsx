import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import CyberBreachLogin from "@/components/CyberBreachLogin";
import SystemBoot from "@/components/SystemBoot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrustAnchor | Digital Security & Trust Verification Platform",
  description: "Advanced cybersecurity platform for URL analysis, threat detection, and digital trust verification. Real-time security scanning, AI-powered risk assessment, and network monitoring.",
  keywords: ["cybersecurity", "url scanner", "trust verification", "threat detection", "malware analysis", "phishing detection", "domain security", "VirusTotal", "security platform"],
  authors: [{ name: "TrustAnchor Security" }],
  openGraph: {
    title: "TrustAnchor - Cybersecurity Platform",
    description: "Real-time security scanning and AI-powered threat analysis for digital trust verification.",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#020408] text-slate-200 overflow-hidden`}
        >
          <SystemBoot />
          {/* Unauthenticated State - CyberBreach Login */}
          <SignedOut>
            <CyberBreachLogin />
          </SignedOut>

          {/* Authenticated State - Dashboard UI */}
          <SignedIn>
            <ClientLayout>{children}</ClientLayout>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}
