import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from '@/hooks/use-toast';

interface BlogPost {
    id: string;
    title: string;
    content: string;
    published: boolean;
    created_at: string;
}
interface Mood {
    id: string;
    name: string;
    emoji: string;
}

const AdminContentTools: React.FC = () => {
    // Blog manager state
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [postTitle, setPostTitle] = useState("");
    const [postContent, setPostContent] = useState("");
    const [editingPost, setEditingPost] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    // Mood manager state
    const [moods, setMoods] = useState<Mood[]>([]);
    const [loadingMoods, setLoadingMoods] = useState(true);
    const [moodName, setMoodName] = useState("");
    const [moodEmoji, setMoodEmoji] = useState("");
    const [editingMood, setEditingMood] = useState<string | null>(null);
    const [editMoodName, setEditMoodName] = useState("");
    const [editMoodEmoji, setEditMoodEmoji] = useState("");

    // Blog posts fetch
    useEffect(() => {
        async function fetchPosts() {
            setLoadingPosts(true);
            const { data } = await supabase.from("blog_posts").select("id, title, content, published, created_at").order("created_at", { ascending: false });
            setPosts(data || []);
            setLoadingPosts(false);
        }
        fetchPosts();
    }, []);
    // Moods fetch
    useEffect(() => {
        async function fetchMoods() {
            setLoadingMoods(true);
            const { data } = await supabase.from("moods").select("id, name, emoji");
            setMoods(data || []);
            setLoadingMoods(false);
        }
        fetchMoods();
    }, []);

    async function handleAddPost(e: React.FormEvent) {
        e.preventDefault();
        try {
            await supabase.from("blog_posts").insert([{ title: postTitle, content: postContent, published: false }]);
            setPostTitle(""); setPostContent("");
            const { data } = await supabase.from("blog_posts").select("id, title, content, published, created_at").order("created_at", { ascending: false });
            setPosts(data || []);
            toast({ title: 'Post added', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to add post', variant: 'error' });
        }
    }
    async function handlePublish(id: string, published: boolean) {
        try {
            await supabase.from("blog_posts").update({ published: !published }).eq("id", id);
            setPosts(posts => posts.map(p => p.id === id ? { ...p, published: !published } : p));
            toast({ title: published ? 'Post unpublished' : 'Post published', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to update publish status', variant: 'error' });
        }
    }
    async function handleDeletePost(id: string) {
        try {
            await supabase.from("blog_posts").delete().eq("id", id);
            setPosts(posts => posts.filter(p => p.id !== id));
            toast({ title: 'Post deleted', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to delete post', variant: 'error' });
        }
    }
    async function handleAddMood(e: React.FormEvent) {
        e.preventDefault();
        try {
            await supabase.from("moods").insert([{ name: moodName, emoji: moodEmoji }]);
            setMoodName(""); setMoodEmoji("");
            const { data } = await supabase.from("moods").select("id, name, emoji");
            setMoods(data || []);
            toast({ title: 'Mood added', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to add mood', variant: 'error' });
        }
    }
    async function handleDeleteMood(id: string) {
        try {
            await supabase.from("moods").delete().eq("id", id);
            setMoods(moods => moods.filter(m => m.id !== id));
            toast({ title: 'Mood deleted', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to delete mood', variant: 'error' });
        }
    }
    async function handleEditPost(post: BlogPost) {
        setEditingPost(post.id);
        setEditTitle(post.title);
        setEditContent(post.content);
    }
    async function handleSaveEditPost(id: string) {
        const { error } = await supabase.from("blog_posts").update({ title: editTitle, content: editContent }).eq("id", id);
        if (error) { toast({ title: 'Error', description: 'Failed to update post', variant: 'error' }); return; }
        setPosts(posts => posts.map(p => p.id === id ? { ...p, title: editTitle, content: editContent } : p));
        setEditingPost(null);
        toast({ title: 'Post updated', variant: 'success' });
    }
    async function handleEditMood(mood: Mood) {
        setEditingMood(mood.id);
        setEditMoodName(mood.name);
        setEditMoodEmoji(mood.emoji);
    }
    async function handleSaveEditMood(id: string) {
        const { error } = await supabase.from("moods").update({ name: editMoodName, emoji: editMoodEmoji }).eq("id", id);
        if (error) { toast({ title: 'Error', description: 'Failed to update mood', variant: 'error' }); return; }
        setMoods(moods => moods.map(m => m.id === id ? { ...m, name: editMoodName, emoji: editMoodEmoji } : m));
        setEditingMood(null);
        toast({ title: 'Mood updated', variant: 'success' });
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold mb-2">Blog Manager</h3>
                <form onSubmit={handleAddPost} className="flex flex-col gap-2 mb-2">
                    <input type="text" placeholder="Title" value={postTitle} onChange={e => setPostTitle(e.target.value)} className="border rounded px-2 py-1 text-sm" required />
                    <textarea placeholder="Content" value={postContent} onChange={e => setPostContent(e.target.value)} className="border rounded px-2 py-1 text-sm" required />
                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded self-start">Add Post</button>
                </form>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 overflow-x-auto">
                    {loadingPosts ? "Loading..." : (
                        <table className="min-w-full text-xs">
                            <thead><tr><th className="px-2 py-1 text-left">Title</th><th className="px-2 py-1">Published</th><th className="px-2 py-1">Actions</th></tr></thead>
                            <tbody>
                                {posts.length === 0 && !loadingPosts ? (
                                    <tr><td colSpan={3} className="text-center py-4 text-gray-400">No blog posts found.</td></tr>
                                ) : posts.map(post => (
                                    <tr key={post.id} className="border-b">
                                        <td className="px-2 py-1 max-w-xs truncate" title={post.title}>
                                            {editingPost === post.id ? (
                                                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="border rounded px-1 text-xs w-full" />
                                            ) : post.title}
                                        </td>
                                        <td className="px-2 py-1 text-center">{post.published ? "Yes" : "No"}</td>
                                        <td className="px-2 py-1 flex gap-1">
                                            {editingPost === post.id ? (
                                                <>
                                                    <button className="text-green-600 hover:underline" onClick={() => handleSaveEditPost(post.id)} aria-label="Save edits">Save</button>
                                                    <button className="text-gray-500 hover:underline" onClick={() => setEditingPost(null)} aria-label="Cancel edit">Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="text-yellow-500 hover:underline" onClick={() => handleEditPost(post)} aria-label="Edit post">Edit</button>
                                                    <button className="text-green-600 hover:underline" onClick={() => handlePublish(post.id, post.published)} aria-label={post.published ? "Unpublish" : "Publish"}>{post.published ? "Unpublish" : "Publish"}</button>
                                                    <button className="text-red-500 hover:underline" onClick={() => handleDeletePost(post.id)} aria-label="Delete post">Delete</button>
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
            <div>
                <h3 className="text-lg font-semibold mb-2">Mood Tag Manager</h3>
                <form onSubmit={handleAddMood} className="flex gap-2 mb-2">
                    <input type="text" placeholder="Mood name" value={moodName} onChange={e => setMoodName(e.target.value)} className="border rounded px-2 py-1 text-sm" required />
                    <input type="text" placeholder="Emoji" value={moodEmoji} onChange={e => setMoodEmoji(e.target.value)} className="border rounded px-2 py-1 text-sm" required />
                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
                </form>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 overflow-x-auto">
                    {loadingMoods ? "Loading..." : (
                        <table className="min-w-full text-xs">
                            <thead><tr><th className="px-2 py-1 text-left">Name</th><th className="px-2 py-1">Emoji</th><th className="px-2 py-1">Actions</th></tr></thead>
                            <tbody>
                                {moods.length === 0 && !loadingMoods ? (
                                    <tr><td colSpan={3} className="text-center py-4 text-gray-400">No moods found.</td></tr>
                                ) : moods.map(mood => (
                                    <tr key={mood.id} className="border-b">
                                        <td className="px-2 py-1">
                                            {editingMood === mood.id ? (
                                                <input value={editMoodName} onChange={e => setEditMoodName(e.target.value)} className="border rounded px-1 text-xs" />
                                            ) : mood.name}
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            {editingMood === mood.id ? (
                                                <input value={editMoodEmoji} onChange={e => setEditMoodEmoji(e.target.value)} className="border rounded px-1 text-xs w-12" />
                                            ) : mood.emoji}
                                        </td>
                                        <td className="px-2 py-1">
                                            {editingMood === mood.id ? (
                                                <>
                                                    <button className="text-green-600 hover:underline" onClick={() => handleSaveEditMood(mood.id)} aria-label="Save edits">Save</button>
                                                    <button className="text-gray-500 hover:underline" onClick={() => setEditingMood(null)} aria-label="Cancel edit">Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="text-yellow-500 hover:underline" onClick={() => handleEditMood(mood)} aria-label="Edit mood">Edit</button>
                                                    <button className="text-red-500 hover:underline" onClick={() => handleDeleteMood(mood.id)} aria-label="Delete mood">Delete</button>
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
        </div>
    );
};

export default AdminContentTools;
