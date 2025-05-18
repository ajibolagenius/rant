import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePluginPrerender } from "vite-plugin-prerender";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
    },
    plugins: [
        react(),
        mode === 'development' && componentTagger(),
        VitePluginPrerender({
            staticDir: path.resolve(__dirname, 'dist'),
            routes: [
                '/',
                '/my-rants',
                // Dynamically pre-render all rant pages from CSV data
                ...fs.readFileSync(path.resolve(__dirname, 'back_files/rants_rows.csv'), 'utf-8')
                    .split('\n')
                    .slice(1) // skip header
                    .filter(line => line.trim() && !line.startsWith('//'))
                    .map(line => line.split(',')[0])
                    .filter(id => id && id.length > 0)
                    .map(id => `/rant/${id}`)
            ],
            renderAfterDocumentEvent: 'render-event',
        }),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            // Ensure service worker is copied to the root of the build output
            input: {
                main: path.resolve(__dirname, 'index.html'),
                sw: path.resolve(__dirname, 'public/service-worker.js'),
            },
            output: {
                // Keep service worker at root
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name === 'sw') return 'service-worker.js';
                    return '[name].js';
                },
            },
        },
    },
}));
