import React, { useState } from 'react';
import './ReportsAndNotifications.css';

const ReportsAndNotifications = () => {
    const [reports, setReports] = useState([]); // Placeholder for reports data

    const handleResolveReport = (reportId) => {
        console.log(`Resolving report ${reportId}`);
        // Implement resolve report logic here
    };

    const handleTriggerNotification = () => {
        console.log('Triggering notification');
        // Implement notification logic here
    };

    return (
        <div className="reports-and-notifications">
            <h2>Reports & Notifications</h2>
            <div className="report-list">
                {reports.map((report) => (
                    <div key={report.id} className="report-item">
                        <p>{report.description}</p>
                        <button onClick={() => handleResolveReport(report.id)}>Resolve</button>
                    </div>
                ))}
            </div>
            <div className="notifications">
                <button onClick={handleTriggerNotification}>Trigger Notification</button>
            </div>
        </div>
    );
};

export default ReportsAndNotifications;
