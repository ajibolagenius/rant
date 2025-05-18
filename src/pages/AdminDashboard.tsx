import React from "react";
import { useAdminStore } from '@/store/useAdminStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AdminStats from '@/components/AdminStats';
import AdminActivityGraph from '@/components/AdminActivityGraph';
import AdminRantManagement from '@/components/AdminRantManagement';
import AdminUserMonitoring from '@/components/AdminUserMonitoring';
import AdminLinkShortener from '@/components/AdminLinkShortener';
import AdminContentTools from '@/components/AdminContentTools';
import AdminModeration from '@/components/AdminModeration';
import AdminSettings from '@/components/AdminSettings';

const AdminDashboard: React.FC = () => {
    const { filter, setFilter } = useAdminStore();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-admin-primary">Admin Dashboard</h1>
            <div className="max-w-6xl mx-auto">
                <Tabs defaultValue="dashboard" className="w-full">
                    <TabsList className="mb-6 flex flex-wrap gap-2">
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="rants">Rant Management</TabsTrigger>
                        <TabsTrigger value="users">User Monitoring</TabsTrigger>
                        <TabsTrigger value="links">Link Shortener</TabsTrigger>
                        <TabsTrigger value="content">Content Tools</TabsTrigger>
                        <TabsTrigger value="moderation">Moderation</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="dashboard">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <AdminStats />
                            <AdminActivityGraph />
                        </div>
                    </TabsContent>
                    <TabsContent value="rants">
                        <AdminRantManagement />
                    </TabsContent>
                    <TabsContent value="users">
                        <AdminUserMonitoring />
                    </TabsContent>
                    <TabsContent value="links">
                        <AdminLinkShortener />
                    </TabsContent>
                    <TabsContent value="content">
                        <AdminContentTools />
                    </TabsContent>
                    <TabsContent value="moderation">
                        <AdminModeration />
                    </TabsContent>
                    <TabsContent value="settings">
                        <AdminSettings />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminDashboard;
