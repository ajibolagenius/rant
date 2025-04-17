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

            // Optional: If you have a fixed header, add an offset
            // window.scrollBy(0, -80);  // Adjust the value based on your header height
        }
    };

    return (
        <footer className="py-8 px-6 border-t border-gray-800 mt-16">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-primary text-xl font-bold font-outfit">rant</div>
                    <div className="text-sm text-gray-400">
                        The anonymous space for your unfiltered thoughts.
                    </div>
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                        Made with <Heart size={16} className="text-red-500" /> for the chronically online.
                    </div>
                </div>

                {/* Go Up button */}
                {/* <div className="flex justify-center mt-8">
                    <Button
                        onClick={scrollToTop}
                        variant="outline"
                        className="border-[#333] bg-[#121212] hover:bg-[#1A1A1A] text-white rounded-full px-6 py-2 flex items-center gap-2"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp size={16} />
                        Go Up
                    </Button>
                </div> */}
            </div>
        </footer>
    );
};

export default Footer;
