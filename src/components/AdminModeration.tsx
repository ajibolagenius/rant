import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from '@/hooks/use-toast';

interface FlaggedRant {
    id: string;
    content: string;
    created_at: string;
}
interface Feedback {
    id: string;
    message: string;
    created_at: string;
}

const AdminModeration: React.FC = () => {
    const [flagged, setFlagged] = useState<FlaggedRant[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            // Flagged rants
            const { data: flaggedData } = await supabase
                .from("rants")
                .select("id, content, created_at")
                .eq("flagged", true)
                .order("created_at", { ascending: false })
                .limit(50);
            setFlagged(flaggedData || []);
            // Feedback
            const { data: feedbackData } = await supabase
                .from("feedback")
                .select("id, message, created_at")
                .order("created_at", { ascending: false })
                .limit(50);
            setFeedback(feedbackData || []);
            setLoading(false);
        }
        fetchData();
    }, []);

    async function handleApprove(id: string) {
        const { error } = await supabase.from("rants").update({ flagged: false }).eq("id", id);
        if (error) { toast({ title: 'Error', description: 'Failed to approve rant', variant: 'error' }); return; }
        setFlagged(flagged => flagged.filter(r => r.id !== id));
        toast({ title: 'Rant approved', variant: 'success' });
    }
    async function handleDelete(id: string) {
        if (!window.confirm("Delete this rant?")) return;
        const { error } = await supabase.from("rants").delete().eq("id", id);
        if (error) { toast({ title: 'Error', description: 'Failed to delete rant', variant: 'error' }); return; }
        setFlagged(flagged => flagged.filter(r => r.id !== id));
        toast({ title: 'Rant deleted', variant: 'success' });
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold mb-2">Reported Rant Review Queue</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 overflow-x-auto">
                    {loading ? "Loading..." : (
                        <table className="min-w-full text-xs">
                            <thead><tr><th className="px-2 py-1 text-left">Content</th><th className="px-2 py-1">Created</th><th className="px-2 py-1">Actions</th></tr></thead>
                            <tbody>
                                {flagged.length === 0 && !loading ? (
                                    <tr><td colSpan={3} className="text-center py-4 text-gray-400">No flagged rants.</td></tr>
                                ) : flagged.map(rant => (
                                    <tr key={rant.id} className="border-b">
                                        <td className="px-2 py-1 max-w-xs truncate" title={rant.content}>{rant.content}</td>
                                        <td className="px-2 py-1 text-center">{new Date(rant.created_at).toLocaleString()}</td>
                                        <td className="px-2 py-1 flex gap-1">
                                            <button className="text-green-600 hover:underline" onClick={() => handleApprove(rant.id)} aria-label="Approve rant">Approve</button>
                                            <button className="text-red-500 hover:underline" onClick={() => handleDelete(rant.id)} aria-label="Delete rant">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">Contact/Feedback Viewer</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 overflow-x-auto">
                    {loading ? "Loading..." : (
                        <table className="min-w-full text-xs">
                            <thead><tr><th className="px-2 py-1 text-left">Message</th><th className="px-2 py-1">Created</th></tr></thead>
                            <tbody>
                                {feedback.length === 0 && !loading ? (
                                    <tr><td colSpan={2} className="text-center py-4 text-gray-400">No feedback found.</td></tr>
                                ) : feedback.map(fb => (
                                    <tr key={fb.id} className="border-b">
                                        <td className="px-2 py-1 max-w-xs truncate" title={fb.message}>{fb.message}</td>
                                        <td className="px-2 py-1 text-center">{new Date(fb.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminModeration;
