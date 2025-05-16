// scripts/trigger-notification.js
// Simple Node.js script to trigger a push notification to all subscribers
import fetch from 'node-fetch';

const payload = {
    title: '🔥 Trending Rant!',
    body: 'A new rant is blowing up! Check it out now.',
    url: '/trending'
};

fetch('http://localhost:4000/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
    .then(res => res.json())
    .then(data => {
        console.log(`Notification sent to ${data.sent} subscribers.`);
    })
    .catch(err => {
        console.error('Failed to send notification:', err);
    });
