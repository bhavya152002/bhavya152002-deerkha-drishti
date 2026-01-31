"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface StreamAssignment {
    url: string;
    name: string;
}

interface User {
    id: number;
    username: string;
    role: string;
    assigned_streams: StreamAssignment[];
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [streamInput, setStreamInput] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    };

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const token = getCookie('auth_token');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401 || res.status === 403) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            setUsers(data.users || []);
            setIsLoading(false);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError("Failed to load users");
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            const res = await fetch(`${backendUrl}/api/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: newUsername,
                    password: newPassword,
                    assigned_streams: streamInput.split('\n')
                        .filter(s => s.trim())
                        .map((s, i) => ({ url: s.trim(), name: `Camera ${i + 1}` }))
                })
            });
            const data = await res.json();
            if (res.ok) {
                setNewUsername('');
                setNewPassword('');
                setStreamInput('');
                fetchUsers();
            } else {
                setError(data.error || "Failed to create user");
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateUser = async (userId: number) => {
        if (!editUser) return;
        setIsSaving(true);
        try {
            const res = await fetch(`${backendUrl}/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    assigned_streams: editUser.assigned_streams,
                    username: editUser.username
                })
            });
            if (res.ok) {
                setEditUser(null);
                fetchUsers();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update user");
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`${backendUrl}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Admin Command Center</h1>
                        <p className="text-gray-400 mt-2 font-mono uppercase text-xs tracking-widest">Client & Intelligence Stream Management</p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                    >
                        <span>⬅️</span> BACK TO SURVEILLANCE
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create User Form */}
                    <div className="lg:col-span-1 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-blue-500">➕</span> Provision New Unit
                        </h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Codenname (Username)</label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-sm focus:border-blue-500/50 transition-all font-mono"
                                    placeholder="e.g., client3"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Security Key (Password)</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-sm focus:border-blue-500/50 transition-all font-mono"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Assigned intelligence streams (One URL per line)</label>
                                <textarea
                                    value={streamInput}
                                    onChange={(e) => setStreamInput(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-2 text-sm h-32 focus:border-blue-500/50 transition-all font-mono whitespace-pre overflow-x-auto"
                                    placeholder="rtsp://...&#10;rtsp://..."
                                />
                            </div>
                            {error && <div className="text-red-500 text-xs bg-red-500/5 p-2 rounded border border-red-500/20">{error}</div>}
                            <button
                                disabled={isSaving}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/20"
                            >
                                {isSaving ? "PROVISIONING..." : "DEPLOY CLIENT UNIT"}
                            </button>
                        </form>
                    </div>

                    {/* User List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="text-purple-500">📋</span> Active Deployments
                        </h2>
                        {users.map((user) => (
                            <div key={user.id} className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 transition-all hover:bg-gray-900/50">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-2xl">
                                            {user.username === 'admin' ? '🛡️' : '👤'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">{user.username}</h3>
                                            <p className="text-xs text-gray-500 font-mono uppercase">{user.assigned_streams?.length || 0} Stream Assignments</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditUser(user)}
                                            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-bold transition-all"
                                        >
                                            EDIT
                                        </button>
                                        {user.username !== 'admin' && (
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded-lg text-xs font-bold transition-all"
                                            >
                                                TERMINATE
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {editUser?.id === user.id ? (
                                    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div>
                                            <label className="block text-[10px] font-mono text-gray-600 uppercase mb-1">Modify Codenname</label>
                                            <input
                                                type="text"
                                                value={editUser.username}
                                                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono text-gray-600 uppercase mb-1">Intelligence Stream URLs (One per line)</label>
                                            <textarea
                                                value={editUser.assigned_streams.map(s => s.url).join('\n')}
                                                onChange={(e) => {
                                                    const urls = e.target.value.split('\n').filter(u => u.trim());
                                                    const updatedStreams = urls.map(url => {
                                                        const existing = editUser.assigned_streams.find(es => es.url === url.trim());
                                                        return existing || { url: url.trim(), name: "New Camera" };
                                                    });
                                                    setEditUser({ ...editUser, assigned_streams: updatedStreams });
                                                }}
                                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm h-32 font-mono"
                                            />
                                        </div>
                                        <div className="flex gap-2 font-bold">
                                            <button
                                                onClick={() => handleUpdateUser(user.id)}
                                                className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-lg text-xs"
                                            >
                                                CONFIRM UPDATES
                                            </button>
                                            <button
                                                onClick={() => setEditUser(null)}
                                                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-xs"
                                            >
                                                CANCEL
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {(user.assigned_streams || []).slice(0, 5).map((s, i) => (
                                            <span key={i} className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 max-w-[150px] truncate" title={s.url}>
                                                {s.name || s.url}
                                            </span>
                                        ))}
                                        {user.assigned_streams?.length > 5 && (
                                            <span className="text-[10px] font-mono bg-gray-800 text-gray-500 px-2 py-0.5 rounded">
                                                +{user.assigned_streams.length - 5} MORE
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
