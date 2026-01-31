"use client";
import React, { useEffect, useState } from 'react';
import VideoPlayer from './VideoPlayer';

interface Stream {
    id: string;
    name: string;
    type: string;
}

const StreamGrid = () => {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Utility to get cookie by name
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    };

    const handleRename = async (url: string, newName: string) => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const token = getCookie('auth_token');

        try {
            const res = await fetch(`${backendUrl}/api/cameras/rename`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url, name: newName })
            });

            if (res.ok) {
                // Update local state
                setStreams(prev => prev.map(s =>
                    s.id === url ? { ...s, name: newName } : s
                ));
            } else {
                console.error("[StreamGrid] Failed to rename camera");
            }
        } catch (err) {
            console.error("[StreamGrid] Error renaming camera:", err);
        }
    };

    useEffect(() => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const token = getCookie('auth_token');

        fetch(`${backendUrl}/api/cameras`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.cameras) {
                    setStreams(data.cameras);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error("[StreamGrid] Failed to fetch cameras:", err);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-mono text-sm animate-pulse">Initializing Surveillance Network...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Surveillance Station</h1>
                    <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest leading-none">
                        Tactical Monitoring Grid • v4.2.0
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <div className="text-[10px] text-gray-500 font-mono uppercase">System Pulse</div>
                        <div className="text-sm text-green-500 flex items-center bg-green-500/5 px-2 py-0.5 rounded border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block mr-2 animate-pulse"></span>
                            STABLE
                        </div>
                    </div>
                </div>
            </div>

            {streams.length === 0 ? (
                <div className="h-[60vh] flex flex-col items-center justify-center bg-gray-900/20 border border-dashed border-gray-800 rounded-2xl p-8">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🛰️</div>
                    <h3 className="text-xl font-bold text-gray-300">No Feeds Detected</h3>
                    <p className="text-gray-500 max-w-sm text-center mt-2 leading-relaxed">
                        Your account has no assigned camera feeds. Please contact system admin for deployment.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {streams.map((stream, index) => (
                        <VideoPlayer
                            key={stream.id}
                            url={stream.id}
                            title={stream.name}
                            index={index}
                            onRename={(newName) => handleRename(stream.id, newName)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default StreamGrid;
