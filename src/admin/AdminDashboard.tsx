import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ContentModeration from './ContentModeration';
import UserManagement from './UserManagement';
import ReportsAndNotifications from './ReportsAndNotifications';
import AnalyticsAndInsights from './AnalyticsAndInsights';
import SystemManagement from './SystemManagement';
import SecurityAndSpamPrevention from './SecurityAndSpamPrevention';
import SettingsAndConfiguration from './SettingsAndConfiguration';
import './AdminDashboard.css';

const AdminDashboard = () => {
    return (
        <Router>
            <div className="admin-dashboard">
                <nav>
                    <ul>
                        <li><Link to="/admin/content">Content Moderation</Link></li>
                        <li><Link to="/admin/users">User Management</Link></li>
                        <li><Link to="/admin/reports">Reports & Notifications</Link></li>
                        <li><Link to="/admin/analytics">Analytics & Insights</Link></li>
                        <li><Link to="/admin/system">System Management</Link></li>
                        <li><Link to="/admin/security">Security & Spam Prevention</Link></li>
                        <li><Link to="/admin/settings">Settings & Configuration</Link></li>
                    </ul>
                </nav>

                <main>
                    <Routes>
                        <Route path="/admin/content" element={<ContentModeration />} />
                        <Route path="/admin/users" element={<UserManagement />} />
                        <Route path="/admin/reports" element={<ReportsAndNotifications />} />
                        <Route path="/admin/analytics" element={<AnalyticsAndInsights />} />
                        <Route path="/admin/system" element={<SystemManagement />} />
                        <Route path="/admin/security" element={<SecurityAndSpamPrevention />} />
                        <Route path="/admin/settings" element={<SettingsAndConfiguration />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default AdminDashboard;
