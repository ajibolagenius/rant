import React, { useEffect, useState } from "react";
import { supabase, getActiveUserCount } from "@/lib/supabase";

const AdminStats: React.FC = () => {
    const [totalRants, setTotalRants] = useState<number | null>(null);
    const [activeUsers, setActiveUsers] = useState<number | null>(null);
    const [flaggedRants, setFlaggedRants] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            // Total rants
            const { count: rantCount, error: rantError } = await supabase
                .from("rants")
                .select("id", { count: "exact", head: true });
            setTotalRants(rantError ? null : rantCount ?? 0);

            // Active users
            getActiveUserCount().then(setActiveUsers).catch(() => setActiveUsers(null));

            // Flagged rants (assuming a 'flagged' boolean column)
            const { count: flaggedCount, error: flaggedError } = await supabase
                .from("rants")
                .select("id", { count: "exact", head: true })
                .eq("flagged", true);
            setFlaggedRants(flaggedError ? null : flaggedCount ?? 0);

            setLoading(false);
        }
        fetchStats();
    }, []);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Stats Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="text-2xl font-bold">{loading ? "-" : totalRants}</div>
                    <div className="text-sm text-gray-500">Total Rants</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="text-2xl font-bold">{loading ? "-" : activeUsers}</div>
                    <div className="text-sm text-gray-500">Active Users</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="text-2xl font-bold">{loading ? "-" : flaggedRants}</div>
                    <div className="text-sm text-gray-500">Flagged Rants</div>
                </div>
            </div>
        </div>
    );
};

export default AdminStats;
