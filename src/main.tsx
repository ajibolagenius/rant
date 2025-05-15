import { createRoot } from 'react-dom/client'
import DOMPurify from 'dompurify'
import App from './App.tsx'
import './index.css'

// Initialize DOMPurify with secure configuration
DOMPurify.setConfig({
    ADD_ATTR: ['target'], // Allow target attribute for links
    FORBID_TAGS: ['style', 'script'], // Explicitly forbid potentially dangerous tags
    FORBID_ATTR: ['style', 'onerror', 'onload'] // Forbid event handler attributes
});

// Log successful initialization
// console.debug('DOMPurify initialized for XSS protection');

createRoot(document.getElementById("root")!).render(<App />);
