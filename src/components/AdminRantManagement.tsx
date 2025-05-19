import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from '@/hooks/use-toast';

interface Rant {
    id: string;
    content: string;
    mood: string;
    created_at: string;
    likes: number;
    flagged?: boolean;
    featured?: boolean;
}

const AdminRantManagement: React.FC = () => {
    const [rants, setRants] = useState<Rant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 20;

    useEffect(() => {
        async function fetchRants() {
            setLoading(true);
            setError(null);
            let query = supabase.from("rants").select("id, content, mood, created_at, likes, flagged, featured").order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
            if (filter) {
                query = query.ilike("content", `%${filter}%`);
            }
            const { data, error, count } = await query;
            if (error) setError("Failed to load rants");
            setRants(data || []);
            setHasMore((data?.length || 0) === PAGE_SIZE);
            setLoading(false);
        }
        fetchRants();
    }, [filter, page]);

    async function handleDelete(id: string) {
        if (!window.confirm("Delete this rant?")) return;
        try {
            const { error } = await supabase.from("rants").delete().eq("id", id);
            if (error) throw new Error(error.message);
            setRants(rants => rants.filter(r => r.id !== id));
            toast({ title: 'Rant deleted', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to delete rant', variant: 'error' });
        }
    }
    async function handleFeature(id: string) {
        try {
            const { error } = await supabase.from("rants").update({ featured: true }).eq("id", id);
            if (error) throw new Error(error.message);
            setRants(rants => rants.map(r => r.id === id ? { ...r, featured: true } : r));
            toast({ title: 'Rant featured', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to feature rant', variant: 'error' });
        }
    }
    async function handleHide(id: string) {
        try {
            const { error } = await supabase.from("rants").update({ flagged: true }).eq("id", id);
            if (error) throw new Error(error.message);
            setRants(rants => rants.map(r => r.id === id ? { ...r, flagged: true } : r));
            toast({ title: 'Rant hidden', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to hide rant', variant: 'error' });
        }
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Rant Management</h2>
            <div className="mb-2 flex gap-2 items-center">
                <input
                    type="text"
                    placeholder="Filter by content..."
                    value={filter}
                    onChange={e => { setFilter(e.target.value); setPage(1); }}
                    className="border rounded px-2 py-1 text-sm"
                    aria-label="Filter rants by content"
                />
                <button
                    className="border rounded px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700"
                    onClick={() => setFilter("")}
                    aria-label="Clear filter"
                >Clear</button>
            </div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Page {page}</span>
                <div className="flex gap-2">
                    <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Prev</button>
                    <button disabled={!hasMore} onClick={() => setPage(p => p + 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Next</button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 overflow-x-auto">
                {loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <table className="min-w-full text-xs">
                        <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <tr className="border-b">
                                <th className="px-2 py-1 text-left">Content</th>
                                <th className="px-2 py-1">Mood</th>
                                <th className="px-2 py-1">Likes</th>
                                <th className="px-2 py-1">Flagged</th>
                                <th className="px-2 py-1">Featured</th>
                                <th className="px-2 py-1">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rants.length === 0 && !loading ? (
                                <tr><td colSpan={6} className="text-center py-4 text-gray-400">No rants found.</td></tr>
                            ) : rants.map(rant => (
                                <tr key={rant.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <td className="px-2 py-1 max-w-xs truncate" title={rant.content}>{rant.content}</td>
                                    <td className="px-2 py-1">{rant.mood}</td>
                                    <td className="px-2 py-1 text-center">{rant.likes}</td>
                                    <td className="px-2 py-1 text-center">
                                        <span className={rant.flagged ? 'text-red-500 font-bold' : 'text-gray-400'}>{rant.flagged ? 'Yes' : 'No'}</span>
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                        <span className={rant.featured ? 'text-blue-500 font-bold' : 'text-gray-400'}>{rant.featured ? 'Yes' : 'No'}</span>
                                    </td>
                                    <td className="px-2 py-1 flex gap-1">
                                        <button className="text-red-500 hover:underline" onClick={() => handleDelete(rant.id)} aria-label="Delete rant">Delete</button>
                                        <button className="text-yellow-500 hover:underline" onClick={() => handleHide(rant.id)} aria-label="Hide rant">Hide</button>
                                        <button className="text-blue-500 hover:underline" onClick={() => handleFeature(rant.id)} aria-label="Feature rant">Feature</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminRantManagement;
