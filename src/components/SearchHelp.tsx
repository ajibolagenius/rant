import React from 'react';
import {
    QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const SearchHelp: React.FC = () => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="text-gray-400 hover:text-white">
                    <QuestionMarkCircledIcon className="h-5 w-5" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-[#1A1A1A] border border-[#333] text-white p-4">
                <div className="space-y-4">
                    <h3 className="font-medium text-lg">Search Tips</h3>

                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Basic Search</h4>
                        <p className="text-sm text-gray-300">
                            Type any word or phrase to find matching rants.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Mood Filter</h4>
                        <p className="text-sm text-gray-300">
                            Use <code className="bg-[#252525] px-1 rounded">mood:angry</code> to find rants with a specific mood.
                        </p>
                        <p className="text-sm text-gray-300">
                            Available moods: sad, crying, angry, eyeRoll, heartbroken, mindBlown, speechless, confused, tired, nervous, smiling, laughing, celebratory, confident, loved
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Exact Phrases</h4>
                        <p className="text-sm text-gray-300">
                            Use quotes for exact phrase matching: <code className="bg-[#252525] px-1 rounded">"exactly this phrase"</code>
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Combined Search</h4>
                        <p className="text-sm text-gray-300">
                            You can combine these techniques:
                        </p>
                        <p className="text-sm text-gray-300">
                            <code className="bg-[#252525] px-1 rounded">mood:angry "terrible day" work</code>
                        </p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default SearchHelp;
