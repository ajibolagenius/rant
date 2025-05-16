import express from 'express';
import bodyParser from 'body-parser';
import webpush from 'web-push';
import cors from 'cors';

const app = express();
const port = 4000;

// Store subscriptions in-memory (replace with DB in production)
const subscriptions = [];

// VAPID keys
const VAPID_PUBLIC_KEY = 'BOEt_7zXjc8BfH4RyU8NnijB2eo2W_rhx70UgAEY7i5l8hkBPCDlF7nPEk07K2ciky7vaasCdDiTuq7Wg5NPKs8';
const VAPID_PRIVATE_KEY = 'JSgqPbt1cTxyYCfoAm-dAPZEbB4flC9M1TRmEWrIpto';

webpush.setVapidDetails(
    'mailto:your@email.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

app.use(cors());
app.use(bodyParser.json());

// Endpoint to receive and store push subscriptions
app.post('/api/subscribe', (req, res) => {
    const subscription = req.body;
    // Avoid duplicates
    if (!subscriptions.find(sub => JSON.stringify(sub) === JSON.stringify(subscription))) {
        subscriptions.push(subscription);
    }
    res.status(201).json({ success: true });
});

// Endpoint to trigger a push notification to all subscribers (for demo)
app.post('/api/notify', async (req, res) => {
    const { title = 'Trending Rant!', body = 'A new rant is trending now.', url = '/' } = req.body || {};
    const payload = JSON.stringify({ title, body, url });
    let sent = 0;
    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(sub, payload);
            sent++;
        } catch (err) {
            // Remove invalid subscriptions
            if (err.statusCode === 410 || err.statusCode === 404) {
                const idx = subscriptions.indexOf(sub);
                if (idx > -1) subscriptions.splice(idx, 1);
            }
        }
    }
    res.json({ sent });
});

app.listen(port, () => {
    console.log(`Push notification server running on http://localhost:${port}`);
});
