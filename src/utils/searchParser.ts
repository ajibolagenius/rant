import { MoodType, allMoods } from "@/lib/utils/mood";

interface ParsedSearch {
    text: string;
    mood: MoodType | null;
    exactPhrases: string[];
}

export const parseSearchQuery = (query: string): ParsedSearch => {
    const result: ParsedSearch = {
        text: '',
        mood: null,
        exactPhrases: []
    };

    // Extract mood filter (e.g., mood:angry)
    const moodRegex = /mood:(\w+)/i;
    const moodMatch = query.match(moodRegex);

    if (moodMatch && moodMatch[1]) {
        const moodCandidate = moodMatch[1].toLowerCase();

        // Check if the mood is valid
        const validMood = allMoods.find(mood =>
            mood.toLowerCase() === moodCandidate
        );

        if (validMood) {
            result.mood = validMood;
            // Remove the mood filter from the query
            query = query.replace(moodRegex, '').trim();
        }
    }

    // Extract exact phrases (text in quotes)
    const exactPhraseRegex = /"([^"]*)"/g;
    let match;

    while ((match = exactPhraseRegex.exec(query)) !== null) {
        if (match[1].trim()) {
            result.exactPhrases.push(match[1].trim());
        }
    }

    // Remove exact phrases from the query
    query = query.replace(exactPhraseRegex, '').trim();

    // The remaining text is the regular search text
    result.text = query;

    return result;
};
