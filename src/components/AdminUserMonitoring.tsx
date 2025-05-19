import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from '@/hooks/use-toast';

interface UserRow {
    id: string;
    banned?: boolean;
    rantCount: number;
    lastActivity: string | null;
}

const AdminUserMonitoring: React.FC = () => {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 20;

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            setError(null);
            const { data: userData, error: userError } = await supabase
                .from("anonymous_users")
                .select("id, banned")
                .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
            if (userError || !userData) {
                setError("Failed to load users");
                setUsers([]);
                setLoading(false);
                return;
            }
            // For each user, get rant count and last activity
            const userIds = userData.map(u => u.id);
            const { data: rantData } = await supabase
                .from("rants")
                .select("anonymous_user_id, created_at")
                .in("anonymous_user_id", userIds);
            const stats: Record<string, { count: number; last: string | null }> = {};
            (rantData as { anonymous_user_id: string; created_at: string }[] | undefined)?.forEach((r) => {
                if (!stats[r.anonymous_user_id]) stats[r.anonymous_user_id] = { count: 0, last: null };
                stats[r.anonymous_user_id].count++;
                if (!stats[r.anonymous_user_id].last || r.created_at > stats[r.anonymous_user_id].last) {
                    stats[r.anonymous_user_id].last = r.created_at;
                }
            });
            setUsers(userData.map(u => ({
                id: u.id,
                banned: u.banned,
                rantCount: stats[u.id]?.count || 0,
                lastActivity: stats[u.id]?.last || null
            })));
            setHasMore((userData?.length || 0) === PAGE_SIZE);
            setLoading(false);
        }
        fetchUsers();
    }, [page]);

    async function handleBan(id: string, banned: boolean) {
        if (!window.confirm(banned ? "Unban this device?" : "Ban this device?")) return;
        try {
            const { error } = await supabase.from("anonymous_users").update({ banned: !banned }).eq("id", id);
            if (error) throw new Error(error.message);
            setUsers(users => users.map(u => u.id === id ? { ...u, banned: !banned } : u));
            toast({ title: banned ? 'Device unbanned' : 'Device banned', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to update ban status', variant: 'error' });
        }
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">User Monitoring</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 overflow-x-auto">
                {loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Page {page}</span>
                            <div className="flex gap-2">
                                <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Prev</button>
                                <button disabled={!hasMore} onClick={() => setPage(p => p + 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Next</button>
                            </div>
                        </div>
                        <table className="min-w-full text-xs">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-2 py-1 text-left">Device ID</th>
                                    <th className="px-2 py-1">Rants</th>
                                    <th className="px-2 py-1">Last Activity</th>
                                    <th className="px-2 py-1">Banned</th>
                                    <th className="px-2 py-1">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 && !loading ? (
                                    <tr><td colSpan={5} className="text-center py-4 text-gray-400">No users found.</td></tr>
                                ) : users.map(user => (
                                    <tr key={user.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <td className="px-2 py-1 font-mono max-w-xs truncate" title={user.id}>{user.id}</td>
                                        <td className="px-2 py-1 text-center">{user.rantCount}</td>
                                        <td className="px-2 py-1 text-center">{user.lastActivity ? new Date(user.lastActivity).toLocaleString() : "-"}</td>
                                        <td className="px-2 py-1 text-center">
                                            <span className={user.banned ? 'text-red-500 font-bold' : 'text-gray-400'}>{user.banned ? 'Yes' : 'No'}</span>
                                        </td>
                                        <td className="px-2 py-1">
                                            <button
                                                className={user.banned ? "text-green-500 hover:underline" : "text-red-500 hover:underline"}
                                                onClick={() => handleBan(user.id, user.banned || false)}
                                                aria-label={user.banned ? "Unban device" : "Ban device"}
                                            >
                                                {user.banned ? "Unban" : "Ban"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminUserMonitoring;
