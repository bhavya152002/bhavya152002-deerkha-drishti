"use client";
import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Alert {
    id: number;
    timestamp: string;
    source: string;
    message: string;
    type: 'warning' | 'critical';
    animals: Record<string, number>;
}

// Utility to get cookie by name
const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
};

const AlertsPanel = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Use the public backend URL or fallback to localhost
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

        // Check if admin
        const storedUsername = localStorage.getItem('username');
        if (storedUsername === 'admin') {
            setIsAdmin(true);
        }

        // Fetch initial alerts with authentication
        const token = getCookie('auth_token');
        fetch(`${backendUrl}/api/alerts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                if (res.status === 401) {
                    console.error("[AlertsPanel] Unauthorized, logout triggered");
                    handleLogout();
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.alerts) {
                    setAlerts(data.alerts);
                }
            })
            .catch(err => console.error("[AlertsPanel] Failed to fetch history:", err));

        console.log(`[AlertsPanel] Connecting to Socket.IO at ${backendUrl}`);

        socketRef.current = io(backendUrl, {
            transports: ['polling'], // Force polling to avoid Socket.IO 500 errors on Werkzeug
            reconnectionAttempts: 5,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('[AlertsPanel] Connected to WebSocket');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('[AlertsPanel] Disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.error('[AlertsPanel] Connection error:', err);
        });

        socket.on('new_alert', (newAlert: Alert) => {
            console.log('[AlertsPanel] Received alert:', newAlert);
            setAlerts(prev => {
                // Avoid duplicates if possible, though ID check is O(N)
                const exists = prev.some(a => a.id === newAlert.id);
                if (exists) return prev;
                return [newAlert, ...prev].slice(0, 50);
            });

            // Play alert sound if critical
            if (newAlert.type === 'critical' && audioRef.current) {
                audioRef.current.play().catch(e => console.error("Audio play failed", e));
            }
        });

        // Cleanup
        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    const handleLogout = () => {
        // Clear cookie by setting expiry in past
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        // Clear username from local storage
        localStorage.removeItem('username');
        window.location.href = '/login';
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex flex-col gap-3 bg-gray-900/50 backdrop-blur">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <span className="text-2xl">🚨</span> Live Alerts
                    </h2>
                    <div className={`px-2 py-1 rounded text-[10px] font-mono ${isConnected ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {isConnected ? 'CONNECTED' : 'OFFLINE'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold rounded-lg border border-gray-700 transition-colors group"
                    >
                        <span>🚪</span> LOGOUT
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => window.location.href = '/admin'}
                            className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg border border-blue-500/50 transition-colors"
                        >
                            <span>🛠️</span> ADMIN
                        </button>
                    )}
                </div>
            </div>

            {/* Audio element for sound */}
            <audio ref={audioRef} src="/alert.mp3" preload="auto" />

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {alerts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                        <div className="text-4xl mb-2">🛡️</div>
                        <p>No recent alerts</p>
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`relative overflow-hidden rounded-lg p-3 border transition-all duration-300 hover:scale-[1.01] ${alert.type === 'critical'
                                ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                                : 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${alert.type === 'critical' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                                    }`}>
                                    {alert.type}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                </span>
                            </div>

                            <p className="text-gray-200 font-medium text-sm mt-1">
                                {alert.message}
                            </p>

                            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1 overflow-hidden">
                                <span className="truncate">Source: {alert.source}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AlertsPanel;
