"use client";
import React, { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AlertsPanel from '../../../components/AlertsPanel';

export default function CameraDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    // Get URL from query param (simplest way to pass state from grid)
    const streamUrlRaw = searchParams.get('url');
    const [streamUrl, setStreamUrl] = useState<string | null>(null);

    useEffect(() => {
        if (streamUrlRaw) {
            // Reconstruct the full backend stream URL with Domain Sharding
            const baseBackend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            let backendUrl = baseBackend;

            // Only shard if we are using localhost (development)
            // Use camera ID to determine the shard
            const cameraIdx = parseInt(id) || 0;
            if (baseBackend.includes('localhost') || baseBackend.includes('127.0.0.1')) {
                backendUrl = (cameraIdx % 2 === 0)
                    ? 'http://localhost:8000'
                    : 'http://127.0.0.1:8000';
            }

            const fullUrl = `${backendUrl}/stream/animal?video=${encodeURIComponent(streamUrlRaw)}`;
            setStreamUrl(fullUrl);
        }
    }, [streamUrlRaw, id]);

    if (!streamUrlRaw) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Stream Not Found</h1>
                    <Link href="/" className="text-blue-400 hover:underline">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-black overflow-hidden">
            {/* Main Content Area - Video */}
            <div className="flex-1 flex flex-col relative">
                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center pointer-events-none">
                    <div className="pointer-events-auto">
                        <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/40 px-3 py-1.5 rounded-full backdrop-blur border border-white/10">
                            <span className="text-lg">←</span>
                            <span className="text-sm font-medium">Back to Grid</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-red-500/20 backdrop-blur px-3 py-1 rounded-full border border-red-500/30 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            <span className="text-red-400 font-bold text-sm tracking-wide">LIVE MONITORING</span>
                        </div>
                        <div className="bg-black/40 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-white/90 font-mono">
                            CAM-{id}
                        </div>
                    </div>
                </div>

                {/* Large Video Player */}
                <div className="flex-1 bg-black flex items-center justify-center">
                    {streamUrl ? (
                        <img
                            src={streamUrl}
                            alt={`Camera ${id} Stream`}
                            className="max-w-full max-h-full object-contain shadow-2xl"
                        />
                    ) : (
                        <div className="text-gray-500 animate-pulse">Loading Stream...</div>
                    )}
                </div>
            </div>

            {/* Sidebar - Alerts */}
            <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col z-20 shadow-2xl">
                <AlertsPanel />
            </div>
        </div>
    );
}
