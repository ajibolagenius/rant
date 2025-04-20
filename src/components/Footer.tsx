import React from 'react';
import { Heart, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
    // Function to scroll back to the top of the page with a slight offset
    const scrollToTop = () => {
        const section = document.getElementById("rant-section");
        if (section) {
            section.scrollIntoView({
                behavior: "smooth",
                block: "start",  // ensures the section starts at the top
            });
        }
    };

    return (
        <footer className="py-8 px-6 border-t border-border-subtle mt-16 bg-background-secondary">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-accent-teal bg-clip-text text-transparent">rant</div>
                    <div className="text-sm text-text-muted font-body">
                        The anonymous space for your unfiltered thoughts.
                    </div>
                    <div className="text-sm text-text-muted font-body flex items-center gap-1">
                        Made with <Heart size={16} className="text-rose" /> for the chronically online.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
