
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getMoodColor, MoodType } from '@/lib/utils/mood';
import MoodSelector from './MoodSelector';
import { MessageCircle } from 'lucide-react';

interface RantFormProps {
    onSubmit: (content: string, mood: MoodType) => void;
}

const RantForm: React.FC<RantFormProps> = ({ onSubmit }) => {
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState<MoodType>('sad');
    const maxLength = 560;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim() && selectedMood) {
            onSubmit(content.trim(), selectedMood);
            setContent('');
        }
    };

    return (
        <Card className="bg-[##09090B] border border-[#222] rounded-2xl overflow-hidden">
            <div className="text-xl font-medium p-6 pb-0 flex items-center gap-2">
                <MessageCircle className="text-cyan-400" size={20} />
                What's bothering you?
            </div>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value.substring(0, maxLength))}
                        placeholder="Type your rant here. No one will know it's from you! 🤐"
                        className="w-full p-3 bg-transparent border border-[#333] focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px] text-base rounded-lg"
                        maxLength={maxLength}
                    />
                    <div className="flex justify-end text-xs text-gray-400">
                        {maxLength - content.length} characters left...
                    </div>

                    <div className="mt-6">
                        <p className="text-sm font-medium mb-2">Current mood:</p>
                        <MoodSelector selectedMood={selectedMood} onMoodSelect={setSelectedMood} />
                    </div>
                </form>
            </CardContent>
            <CardFooter className="px-6 pb-6">
                <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || !selectedMood}
                    className="w-full py-6 text-base font-medium rounded-full"
                    style={{
                        background: `linear-gradient(90deg, #00C2FF, #904FFF)`,
                    }}
                >
                    Rant Anonymously 🔥
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RantForm;
