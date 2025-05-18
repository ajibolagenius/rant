import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from '@/hooks/use-toast';

interface Setting {
    key: string;
    value: string;
}
interface AdminUser {
    id: string;
    email: string;
}

const AdminSettings: React.FC = () => {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [maintenance, setMaintenance] = useState(false);
    const [siteTitle, setSiteTitle] = useState("");
    const [ogImage, setOgImage] = useState("");
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [newAdmin, setNewAdmin] = useState("");

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            const { data: settingsData } = await supabase.from("settings").select("key, value");
            setSettings(settingsData || []);
            setMaintenance(settingsData?.find(s => s.key === "maintenance_mode")?.value === "true");
            setSiteTitle(settingsData?.find(s => s.key === "site_title")?.value || "");
            setOgImage(settingsData?.find(s => s.key === "og_image")?.value || "");
            const { data: adminsData } = await supabase.from("admins").select("id, email");
            setAdmins(adminsData || []);
            setLoading(false);
        }
        fetchSettings();
    }, []);

    async function handleToggleMaintenance() {
        const { error } = await supabase.from("settings").update({ value: (!maintenance).toString() }).eq("key", "maintenance_mode");
        if (error) { toast({ title: 'Error', description: 'Failed to update maintenance mode', variant: 'error' }); return; }
        setMaintenance(m => !m);
        toast({ title: maintenance ? 'Maintenance disabled' : 'Maintenance enabled', variant: 'success' });
    }
    async function handleUpdateMetadata() {
        const { error: err1 } = await supabase.from("settings").update({ value: siteTitle }).eq("key", "site_title");
        const { error: err2 } = await supabase.from("settings").update({ value: ogImage }).eq("key", "og_image");
        if (err1 || err2) { toast({ title: 'Error', description: 'Failed to update metadata', variant: 'error' }); return; }
        toast({ title: 'Metadata updated', variant: 'success' });
    }
    async function handleAddAdmin(e: React.FormEvent) {
        e.preventDefault();
        const { error } = await supabase.from("admins").insert([{ email: newAdmin }]);
        if (error) { toast({ title: 'Error', description: 'Failed to add admin', variant: 'error' }); return; }
        setNewAdmin("");
        const { data: adminsData } = await supabase.from("admins").select("id, email");
        setAdmins(adminsData || []);
        toast({ title: 'Admin added', variant: 'success' });
    }
    async function handleRemoveAdmin(id: string) {
        if (!window.confirm("Remove this admin?")) return;
        const { error } = await supabase.from("admins").delete().eq("id", id);
        if (error) { toast({ title: 'Error', description: 'Failed to remove admin', variant: 'error' }); return; }
        setAdmins(admins => admins.filter(a => a.id !== id));
        toast({ title: 'Admin removed', variant: 'success' });
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold mb-2">Maintenance Mode</h3>
                <button onClick={handleToggleMaintenance} className={maintenance ? "bg-red-600 text-white px-3 py-1 rounded" : "bg-green-600 text-white px-3 py-1 rounded"}>
                    {maintenance ? "Disable" : "Enable"} Maintenance Mode
                </button>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">Site Metadata</h3>
                <div className="flex flex-col gap-2 max-w-md">
                    <input type="text" placeholder="Site Title" value={siteTitle} onChange={e => setSiteTitle(e.target.value)} className="border rounded px-2 py-1 text-sm" />
                    <input type="text" placeholder="Open Graph Image URL" value={ogImage} onChange={e => setOgImage(e.target.value)} className="border rounded px-2 py-1 text-sm" />
                    <button onClick={handleUpdateMetadata} className="bg-blue-600 text-white px-3 py-1 rounded self-start">Update Metadata</button>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">Admin Roles</h3>
                <form onSubmit={handleAddAdmin} className="flex gap-2 mb-2">
                    <input type="email" placeholder="Admin email" value={newAdmin} onChange={e => setNewAdmin(e.target.value)} className="border rounded px-2 py-1 text-sm" required />
                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
                </form>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 overflow-x-auto">
                    {loading ? "Loading..." : (
                        <table className="min-w-full text-xs">
                            <thead><tr><th className="px-2 py-1 text-left">Email</th><th className="px-2 py-1">Actions</th></tr></thead>
                            <tbody>
                                {admins.length === 0 && !loading ? (
                                    <tr><td colSpan={2} className="text-center py-4 text-gray-400">No admins found.</td></tr>
                                ) : admins.map(admin => (
                                    <tr key={admin.id} className="border-b">
                                        <td className="px-2 py-1">{admin.email}</td>
                                        <td className="px-2 py-1">
                                            <button className="text-red-500 hover:underline" onClick={() => handleRemoveAdmin(admin.id)} aria-label="Remove admin">Remove</button>
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

export default AdminSettings;
