"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay for "premium" feel
        await new Promise(resolve => setTimeout(resolve, 800));

        // Create backend URL (respecting environment)
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        console.log("Attempting login to:", `${backendUrl}/api/login`);

        try {
            const response = await fetch(`${backendUrl}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Set cookie (valid for 1 day)
                document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
                localStorage.setItem('username', data.username);
                console.log("Login successful, redirecting...");

                // Force hard navigation to trigger middleware check freshly
                const prefix = process.env.NODE_ENV === 'production' ? '/app' : '';
                window.location.href = `${prefix}/`;
            } else {
                setError(data.error || 'Login failed');
                setIsLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError('Connection error');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-50 animate-pulse"></div>
            </div>

            <div className="relative z-10 w-full max-w-md bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl overflow-hidden p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20">
                        <span className="text-3xl">👁️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Access Control</h1>
                    <p className="text-gray-400 text-sm mt-1">Authorized Personnel Only</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-950/50 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                            placeholder="Enter ID"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-950/50 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
                            <span>🚫</span> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-white text-black font-bold py-3.5 rounded-lg hover:bg-gray-200 transition-all transform active:scale-95 shadow-lg shadow-white/5 flex items-center justify-center relative overflow-hidden ${isLoading ? 'cursor-wait opacity-80' : ''}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        ) : (
                            "AUTHENTICATE"
                        )}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-[10px] text-gray-600 font-mono">
                            SECURE SYSTEM • v2.4.0 • REJU AI
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
