import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
    },
    plugins: [
        react(),
        mode === 'development' &&
        componentTagger(),
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
            external: ['/dist/main.js'],
        },
    },
}));
