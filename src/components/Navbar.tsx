
import React from 'react';
import { Github, Moon, Search } from 'lucide-react';

const Navbar: React.FC = () => {
    return (
        <nav className="w-full py-6 px-6 flex justify-between items-center border-b border-[#222222]">
            <div className="text-primary text-3xl font-bold font-outfit">rant</div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="flex items-center bg-[#121212] border border-[#333] rounded-full px-4 py-2">
                        <input
                            type="text"
                            placeholder="Search Rant..."
                            className="bg-transparent border-none outline-none text-sm text-gray-300 w-40 md:w-56"
                        />
                        <Search size={18} className="text-gray-500" />
                    </div>
                </div>
                {/* Add the Github icon here */}
                {/* <button className="text-gray-400 hover:text-gray-200">
                    <Github size={20} />
                </button> */}
                {/* Add the Moon icon here */}
                {/* <button className="text-gray-400 hover:text-gray-200">
          <Moon size={20} />
        </button> */}
            </div>
        </nav>
    );
};

export default Navbar;
