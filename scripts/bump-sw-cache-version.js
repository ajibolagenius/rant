// scripts/bump-sw-cache-version.js
const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '../public/service-worker.js');
const now = new Date();
const version = `v${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/CACHE_VERSION = 'v[^']*'/, `CACHE_VERSION = '${version}'`);
fs.writeFileSync(swPath, sw);

console.log(`Updated service worker CACHE_VERSION to ${version}`);
