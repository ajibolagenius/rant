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

    useEffect(() => {
        async function fetchWeeklyRants() {
            setLoading(true);
            // Group rants by week using SQL date_trunc
            const { data, error } = await supabase
                .from("rants")
                .select("id, created_at")
                .order("created_at", { ascending: false });
            if (error || !data) {
                setWeeklyData([]);
                setLoading(false);
                return;
            }
            // Group by week in JS (Supabase free tier doesn't support group by date_trunc in JS client)
            const weekMap: Record<string, number> = {};
            data.forEach((rant: { created_at: string }) => {
                const date = new Date(rant.created_at);
                // Get ISO week string (YYYY-WW)
                const week = `${date.getFullYear()}-W${String(Math.ceil(((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(date.getFullYear(), 0, 1).getDay() + 1) / 7)).padStart(2, '0')}`;
                weekMap[week] = (weekMap[week] || 0) + 1;
            });
            const weeklyArr = Object.entries(weekMap).map(([week, count]) => ({ week, count }));
            // Sort by week descending
            weeklyArr.sort((a, b) => b.week.localeCompare(a.week));
            setWeeklyData(weeklyArr.slice(0, 8).reverse()); // Last 8 weeks
            setLoading(false);
        }
        fetchWeeklyRants();
    }, []);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Activity Graph</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-64">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
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
