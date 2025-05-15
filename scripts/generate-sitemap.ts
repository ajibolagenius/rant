import fs from "fs";
import path from "path";

// This script generates a sitemap.xml based on your routes and rants.
// Run this script as a build step or manually to update sitemap.xml.

const BASE_URL = "https://www.rantapp.com";
const staticRoutes = ["/", "/my-rants"];

// Optionally, fetch dynamic rant IDs from your database or a JSON file
// For demo, we'll use a static array
const dynamicRantIds = ["1", "2", "3"]; // Replace with real IDs

const urls = [
  ...staticRoutes.map(route => ({ loc: `${BASE_URL}${route}`, priority: route === "/" ? 1.0 : 0.8 })),
  ...dynamicRantIds.map(id => ({ loc: `${BASE_URL}/rant/${id}`, priority: 0.7 })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, priority }) => `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>\n`;

fs.writeFileSync(path.join(process.cwd(), "public", "sitemap.xml"), sitemap);
console.log("sitemap.xml generated with", urls.length, "URLs");
