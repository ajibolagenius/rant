// Automated meta/OG tag and OG image endpoint testing script
// Usage: node scripts/test-meta-og.js

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import assert from 'assert';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';
const OG_IMAGE_API = process.env.TEST_OG_API || 'http://localhost:3000/api/og-image';

const PAGES = [
    '/',
    '/my-rants',
    '/rant/52e3f4ba-0e11-4b07-8fb9-9c1e5f012ddd', // Replace with a valid rant ID in your test DB
    '/404-not-found-page',
];

const META_TAGS = [
    { name: 'description' },
    { name: 'keywords' },
    { property: 'og:title' },
    { property: 'og:description' },
    { property: 'og:image' },
    { property: 'og:url' },
    { property: 'og:type' },
    { property: 'og:site_name' },
    { property: 'twitter:title' },
    { property: 'twitter:description' },
    { property: 'twitter:image' },
    { property: 'twitter:card' },
    { property: 'twitter:site' },
];

async function testMetaTags(page) {
    const url = BASE_URL + page;
    const res = await fetch(url);
    const html = await res.text();
    const dom = new JSDOM(html);
    const { document } = dom.window;
    console.log(`\nTesting meta tags for: ${url}`);
    META_TAGS.forEach(tag => {
        let el;
        if (tag.name) {
            el = document.querySelector(`meta[name='${tag.name}']`);
        } else if (tag.property) {
            el = document.querySelector(`meta[property='${tag.property}']`);
        }
        assert(el, `Missing meta tag: ${tag.name || tag.property}`);
        assert(el.getAttribute('content'), `Empty content for: ${tag.name || tag.property}`);
        console.log(`  ✓ ${tag.name || tag.property}: ${el.getAttribute('content')}`);
    });
}

async function testOgImageEndpoint(rantId = null) {
    let url = OG_IMAGE_API;
    if (rantId) url += `?rantId=${rantId}`;
    const res = await fetch(url);
    console.log(`\nTesting OG image endpoint: ${url}`);
    assert(res.ok, `OG image endpoint failed: ${res.status}`);
    assert(res.headers.get('content-type').includes('image/png'), 'OG image is not PNG');
    const buffer = await res.arrayBuffer();
    assert(buffer.byteLength > 1000, 'OG image is too small');
    console.log('  ✓ OG image endpoint returns valid PNG');
}

(async () => {
    for (const page of PAGES) {
        await testMetaTags(page);
    }
    // Test OG image endpoint for homepage and a rant (replace with a valid rantId)
    await testOgImageEndpoint();
    await testOgImageEndpoint('1'); // Replace '1' with a valid rantId for your DB
    console.log('\nAll meta/OG tests passed!');
})();
