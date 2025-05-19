import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from '@/hooks/use-toast';

interface ShortLink {
    id: string;
    slug: string;
    url: string;
    clicks: number;
    created_at: string;
}

const AdminLinkShortener: React.FC = () => {
    const [links, setLinks] = useState<ShortLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [slug, setSlug] = useState("");
    const [url, setUrl] = useState("");
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [editSlug, setEditSlug] = useState("");
    const [editUrl, setEditUrl] = useState("");

    useEffect(() => {
        async function fetchLinks() {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from("short_links")
                .select("id, slug, url, clicks, created_at")
                .order("created_at", { ascending: false })
                .limit(50);
            if (error) setError("Failed to load short links");
            setLinks(data || []);
            setLoading(false);
        }
        fetchLinks();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);
        try {
            const { error } = await supabase
                .from("short_links")
                .insert([{ slug, url }]);
            if (error) throw new Error(error.message);
            setSlug("");
            setUrl("");
            // Refresh list
            const { data } = await supabase
                .from("short_links")
                .select("id, slug, url, clicks, created_at")
                .order("created_at", { ascending: false })
                .limit(50);
            setLinks(data || []);
            toast({ title: 'Link created', variant: 'success' });
        } catch (err) {
            setError("Failed to create link");
            toast({ title: 'Error', description: 'Failed to create link', variant: 'error' });
        } finally {
            setCreating(false);
        }
    }

    async function handleEdit(link: ShortLink) {
        setEditing(link.id);
        setEditSlug(link.slug);
        setEditUrl(link.url);
    }
    async function handleSaveEdit(id: string) {
        try {
            const { error } = await supabase.from("short_links").update({ slug: editSlug, url: editUrl }).eq("id", id);
            if (error) throw new Error(error.message);
            setLinks(links => links.map(l => l.id === id ? { ...l, slug: editSlug, url: editUrl } : l));
            setEditing(null);
            toast({ title: 'Link updated', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to update link', variant: 'error' });
        }
    }
    async function handleDelete(id: string) {
        if (!window.confirm("Delete this short link?")) return;
        try {
            const { error } = await supabase.from("short_links").delete().eq("id", id);
            if (error) throw new Error(error.message);
            setLinks(links => links.filter(l => l.id !== id));
            toast({ title: 'Link deleted', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to delete link', variant: 'error' });
        }
    }
    function handleCopy(slug: string) {
        navigator.clipboard.writeText(`${window.location.origin}/out/${slug}`);
        toast({ title: 'Link copied', variant: 'success' });
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Link Shortener Admin</h2>
            <form onSubmit={handleCreate} className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="slug (e.g. xYz)"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    required
                />
                <input
                    type="url"
                    placeholder="Destination URL"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    required
                />
                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded" disabled={creating}>
                    Create
                </button>
            </form>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 overflow-x-auto">
                {loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr className="border-b">
                                <th className="px-2 py-1 text-left">Slug</th>
                                <th className="px-2 py-1 text-left">URL</th>
                                <th className="px-2 py-1">Clicks</th>
                                <th className="px-2 py-1">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {links.length === 0 && !loading ? (
                                <tr><td colSpan={5} className="text-center py-4 text-gray-400">No links found.</td></tr>
                            ) : links.map(link => (
                                <tr key={link.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <td className="px-2 py-1 font-mono">
                                        {editing === link.id ? (
                                            <input value={editSlug} onChange={e => setEditSlug(e.target.value)} className="border rounded px-1 text-xs" />
                                        ) : (
                                            <span>{link.slug}</span>
                                        )}
                                    </td>
                                    <td className="px-2 py-1 max-w-xs truncate" title={link.url}>
                                        {editing === link.id ? (
                                            <input value={editUrl} onChange={e => setEditUrl(e.target.value)} className="border rounded px-1 text-xs w-full" />
                                        ) : (
                                            <span>{link.url}</span>
                                        )}
                                    </td>
                                    <td className="px-2 py-1 text-center">{link.clicks}</td>
                                    <td className="px-2 py-1 text-center">{new Date(link.created_at).toLocaleString()}</td>
                                    <td className="px-2 py-1 flex gap-1">
                                        {editing === link.id ? (
                                            <>
                                                <button className="text-green-600 hover:underline" onClick={() => handleSaveEdit(link.id)} aria-label="Save edits">Save</button>
                                                <button className="text-gray-500 hover:underline" onClick={() => setEditing(null)} aria-label="Cancel edit">Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="text-blue-500 hover:underline" onClick={() => handleCopy(link.slug)} aria-label="Copy link">Copy</button>
                                                <button className="text-yellow-500 hover:underline" onClick={() => handleEdit(link)} aria-label="Edit link">Edit</button>
                                                <button className="text-red-500 hover:underline" onClick={() => handleDelete(link.id)} aria-label="Delete link">Delete</button>
                                            </>
                                        )}
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

export default AdminLinkShortener;
