"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
    url: string;
    title: string;
    index: number;
    onRename?: (newTitle: string) => void;
}

const GridPreview = ({ url, backendUrl }: { url: string, backendUrl: string }) => {
    const [src, setSrc] = useState<string>("");
    const [tick, setTick] = useState(0);

    useEffect(() => {
        // Update tick every 1.5 seconds to refresh snapshot
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setSrc(`${backendUrl}/snapshot/animal?video=${encodeURIComponent(url)}&t=${Date.now()}`);
    }, [tick, url, backendUrl]);

    return (
        <img
            src={src}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
        />
    );
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, index, onRename }) => {
    const [hasWindow, setHasWindow] = useState(false);
    const [error, setError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [localTitle, setLocalTitle] = useState(title);

    useEffect(() => {
        setHasWindow(true);
    }, []);

    useEffect(() => {
        setLocalTitle(title);
    }, [title]);

    const handleSaveRename = () => {
        if (localTitle.trim() && localTitle !== title && onRename) {
            onRename(localTitle);
        }
        setIsEditing(false);
    };

    // Domain Sharding to bypass browser 6-connection limit per host
    // We alternate between localhost and 127.0.0.1 to get 6+6 = 12 concurrent streams
    const baseBackend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    let backendUrl = baseBackend;

    // Only shard if we are using localhost (development)
    if (baseBackend.includes('localhost') || baseBackend.includes('127.0.0.1')) {
        backendUrl = index % 2 === 0
            ? 'http://localhost:8000'
            : 'http://127.0.0.1:8000';
    }
    // Use Raw Mode (?raw=true) for grid view to save CPU (no AI on 9 streams)
    const streamUrl = `${backendUrl}/stream/animal?video=${encodeURIComponent(url)}&raw=true`;

    if (!hasWindow) {
        return <div className="aspect-video bg-gray-900 animate-pulse rounded-lg"></div>;
    }

    return (
        <div className="flex flex-col gap-2 p-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 h-full transition-transform hover:scale-[1.02] duration-200 group/card">
            <div className="flex justify-between items-center px-1 mb-1 gap-2">
                {isEditing ? (
                    <div className="flex items-center gap-1 flex-1">
                        <input
                            autoFocus
                            value={localTitle}
                            onChange={(e) => setLocalTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                            onBlur={() => handleSaveRename()}
                            className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded border border-blue-500 outline-none w-full"
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Link href={`/camera/${index + 1}?url=${encodeURIComponent(url)}`} className="text-white text-sm font-medium truncate hover:text-blue-400 transition-colors">
                            {title}
                        </Link>
                        <button
                            onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                            className="opacity-0 group-hover/card:opacity-50 hover:!opacity-100 transition-opacity text-[10px] text-gray-400"
                            title="Rename stream"
                        >
                            ✏️
                        </button>
                    </div>
                )}
                <span className="text-[10px] text-red-400 font-bold animate-pulse flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    LIVE
                </span>
            </div>

            <Link href={`/camera/${index + 1}?url=${encodeURIComponent(url)}`} className="relative aspect-video bg-black rounded overflow-hidden group w-full h-full block cursor-pointer">
                {!error ? (
                    <>
                        <img
                            src={streamUrl}
                            alt={title}
                            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                            onError={(e) => {
                                // If MJPEG stream fails (or connection limit reached), fallback to snapshot polling
                                // However, keeping 12 MJPEG connections usually blocks the browser.
                                // Let's default to snapshot polling for the grid view.
                                e.currentTarget.style.display = 'none';
                                setError(true);
                            }}
                        />
                        {/* GridPreview removed to allow smooth MJPEG stream to be visible. Snapshot polling caused stuttering. */}
                        {/* <GridPreview url={url} backendUrl={backendUrl} /> */}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white font-medium border border-white/30">
                                View Details
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-500">
                        <div className="text-2xl mb-1">⚠️</div>
                        <p className="text-xs">Stream Offline</p>
                    </div>
                )}
            </Link>
        </div>
    );
};

export default VideoPlayer;
