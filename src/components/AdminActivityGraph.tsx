import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface WeeklyRantData {
    week: string;
    count: number;
}

const AdminActivityGraph: React.FC = () => {
    const [weeklyData, setWeeklyData] = useState<WeeklyRantData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchWeeklyRants() {
            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from("rants")
                    .select("id, created_at")
                    .order("created_at", { ascending: false });
                if (error || !data) throw new Error(error?.message || "No data");
                const weekMap: Record<string, number> = {};
                data.forEach((rant: { created_at: string }) => {
                    const date = new Date(rant.created_at);
                    const week = `${date.getFullYear()}-W${String(Math.ceil(((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(date.getFullYear(), 0, 1).getDay() + 1) / 7)).padStart(2, '0')}`;
                    weekMap[week] = (weekMap[week] || 0) + 1;
                });
                const weeklyArr = Object.entries(weekMap).map(([week, count]) => ({ week, count }));
                weeklyArr.sort((a, b) => b.week.localeCompare(a.week));
                setWeeklyData(weeklyArr.slice(0, 8).reverse());
            } catch (err) {
                setWeeklyData([]);
                setError("Failed to load activity data");
            } finally {
                setLoading(false);
            }
        }
        fetchWeeklyRants();
    }, []);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Activity Graph</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-64">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 text-center h-full flex items-center justify-center">{error}</div>
                ) : weeklyData.length === 0 ? (
                    <div className="text-gray-400 text-center h-full flex items-center justify-center">No activity data found.</div>
                ) : (
                    <ChartContainer config={{}}>
                        <BarChart data={weeklyData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#6366f1" name="Rants" />
                        </BarChart>
                    </ChartContainer>
                )}
            </div>
        </div>
    );
};

export default AdminActivityGraph;
