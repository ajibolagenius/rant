import React from 'react';
import { Heart } from 'lucide-react';

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
                <div className="flex justify-center mt-8">
                    <button
                        onClick={scrollToTop}
                        aria-label="Scroll to top"
                        className="text-xs text-gray-500 hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 px-3 py-1 rounded-full bg-[#1A1A1A] transition-transform transform hover:scale-105"
                    >
                        Go Up
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
