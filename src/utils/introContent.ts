export interface HeadingContent {
    heading: string;
    subheading?: string;
    subtext: string;
}

export const headingContents: HeadingContent[] = [
    {
        heading: "RANT ABOUT ANYTHING!",
        subtext: "This is a safe place where your unfiltered thoughts meet the void. No judgment, just pure catharsis."
    },
    {
        heading: "Speak your mind.",
        subheading: "No filter needed.",
        subtext: "A digital sanctuary for your unfiltered thoughts. Rant, release, and find your peace."
    },
    {
        heading: "Express yourself freely.",
        subtext: "Let go of what's bothering you. Type it out, send it off, feel the relief."
    },
    {
        heading: "Thoughts to words.",
        subheading: "Words to freedom.",
        subtext: "Transform your frustrations into text and watch as the weight lifts off your shoulders."

    },
    {
        heading: "Release the pressure.",
        subheading: "Find your calm.",
        subtext: "Your digital outlet for life's frustrations. Let it all out, no holds barred."
    },
    {
        heading: "Vent without limits.",
        subheading: "No censorship, no boundaries.",
        subtext: "A judgment-free zone where your thoughts can roam free and your voice can be heard."
    },
    {
        heading: "Unleash your thoughts.",
        subheading: "Find your peace.",
        subtext: "Turn your inner monologue into a moment of release. Every word typed is a step toward clarity."
    },
    {
        heading: "Your space, your rules.",
        subtext: "No restrictions, no boundaries. Just you and your honest thoughts in their purest form."
    }];

// Color schemes for headings
export const colorSchemes = [
    { heading: "text-text-strong", subheading: "text-primary" },
    { heading: "text-primary", subheading: "text-accent-rose" },
    { heading: "text-accent-teal", subheading: "text-primary" },
    { heading: "text-primary", subheading: "text-accent-amber" }
];
