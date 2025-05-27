import React, { useState } from 'react';
import './ContentModeration.css';

const ContentModeration = () => {
    const [rants, setRants] = useState([]); // Placeholder for rants data
    const [selectedRants, setSelectedRants] = useState([]);

    const handleSelectRant = (rantId) => {
        setSelectedRants((prev) =>
            prev.includes(rantId) ? prev.filter((id) => id !== rantId) : [...prev, rantId]
        );
    };

    const handleBulkAction = (action) => {
        console.log(`Performing ${action} on`, selectedRants);
        // Implement bulk action logic here
    };

    return (
        <div className="content-moderation">
            <h2>Content Moderation</h2>
            <div className="filters">
                {/* Add filtering, search, and sorting UI here */}
            </div>
            <div className="rant-list">
                {rants.map((rant) => (
                    <div key={rant.id} className="rant-item">
                        <input
                            type="checkbox"
                            checked={selectedRants.includes(rant.id)}
                            onChange={() => handleSelectRant(rant.id)}
                        />
                        <p>{rant.content}</p>
                        <button onClick={() => console.log(`Editing rant ${rant.id}`)}>Edit</button>
                        <button onClick={() => console.log(`Deleting rant ${rant.id}`)}>Delete</button>
                    </div>
                ))}
            </div>
            <div className="bulk-actions">
                <button onClick={() => handleBulkAction('approve')}>Approve</button>
                <button onClick={() => handleBulkAction('hide')}>Hide</button>
                <button onClick={() => handleBulkAction('delete')}>Delete</button>
            </div>
        </div>
    );
};

export default ContentModeration;
