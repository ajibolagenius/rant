import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Rant } from "@/lib/types/rant";
import { highlightText } from "@/lib/utils/highlight";
import { getMoodColor, getMoodEmoji, getMoodUnicodeEmoji, getMoodGradient } from "@/lib/utils/mood";
import { formatDistanceToNow } from "date-fns";
import { Helmet } from "react-helmet-async";
import { Share1Icon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import * as Tooltip from "@radix-ui/react-tooltip";

const RantPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [rant, setRant] = useState<Rant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showShareToast, setShowShareToast] = useState(false);
    const [showFullTimestamp, setShowFullTimestamp] = useState(false);

    // Fetch rant data
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        supabase
            .from("rants")
            .select("*")
            .eq("id", id)
            .single()
            .then(({ data, error }) => {
                if (error || !data) {
                    setError("Rant not found");
                    setRant(null);
                } else {
                    setRant(data as Rant);
                    setError(null);
                }
                setLoading(false);
            });
    }, [id]);

    // Related rants
    const [relatedRants, setRelatedRants] = useState<Rant[]>([]);
    useEffect(() => {
        if (!rant) return;
        // Fetch more related rants by mood (show up to 4)
        supabase
            .from("rants")
            .select("*")
            .eq("mood", rant.mood)
            .neq("id", rant.id)
            .order('created_at', { ascending: false })
            .limit(4)
            .then(({ data }) => {
                if (Array.isArray(data) && data.length > 0) setRelatedRants(data as Rant[]);
                else setRelatedRants([]);
            });
    }, [rant]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error || !rant) return <div className="p-8 text-center text-red-500">{error || "Rant not found"}</div>;

    const moodColor = getMoodColor(rant.mood);
    const moodEmojiPath = getMoodEmoji(rant.mood);
    const moodUnicode = getMoodUnicodeEmoji(rant.mood);
    const moodText = `${rant.mood.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
    const formattedTime = rant.created_at ? formatDistanceToNow(new Date(rant.created_at), { addSuffix: true }) : '';
    const moodGradient = getMoodGradient ? getMoodGradient(rant.mood) : `linear-gradient(to right, ${moodColor}22, ${moodColor}44)`;

    return (
        <div className="flex justify-center items-center min-h-screen bg-background-primary bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#23272f] via-[#18181b] to-[#18181b] px-2 sm:px-0">
            <Helmet>
                <title>Rant | {moodText}</title>
                <meta property="og:title" content={`Rant | ${moodText}`} />
                <meta property="og:description" content={rant.content.slice(0, 120)} />
                <meta property="og:image" content={`${window.location.origin}/api/og-image.ts?rantId=${rant.id}`} />
                <meta property="og:url" content={`${window.location.origin}/rant/${rant.id}`} />
                {/* Twitter card and canonical for #14 */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`Rant | ${moodText}`} />
                <meta name="twitter:description" content={rant.content.slice(0, 120)} />
                <meta name="twitter:image" content={`${window.location.origin}/api/og-image.ts?rantId=${rant.id}`} />
                <link rel="canonical" href={`${window.location.origin}/rant/${rant.id}`} />
            </Helmet>
            <div
                className={cn(
                    "rounded-xl overflow-hidden shadow-medium hover:shadow-high transition-all duration-200",
                    "relative backdrop-blur-sm flex flex-col h-full",
                    "w-full max-w-md p-0 border-0",
                    "sm:mx-0 mx-auto", // center on mobile
                    "sm:p-0 p-2" // add padding on mobile
                )}
                style={{
                    backgroundColor: "var(--background-secondary)",
                    position: 'relative',
                }}
            >
                {/* Mood gradient border with radius */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                    border: '2.5px solid transparent',
                    background: `linear-gradient(120deg, ${moodColor}55 0%, ${moodColor}99 100%) border-box`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                }} />
                {/* Mood gradient header */}
                <div className="h-2 w-full relative z-10" style={{ background: moodGradient, borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }} />
                <div className="flex flex-col h-full relative z-10 sm:p-6 p-3" style={{ minWidth: 0 }}>
                    {/* Back button (to homepage) */}
                    <button
                        className="mb-4 text-xs text-primary font-ui hover:underline w-fit"
                        onClick={() => navigate("/")}
                        aria-label="Back to homepage"
                    >
                        ← Back to Home
                    </button>
                    {/* Header with mood and author info */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <div
                                        className="w-9 h-9 flex items-center justify-center rounded-md overflow-hidden"
                                        style={{ backgroundColor: `${moodColor}22`, border: `1px solid ${moodColor}` }}
                                        aria-hidden="true"
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            <img
                                                src={moodEmojiPath}
                                                alt=""
                                                className="w-full h-full object-contain"
                                                onError={e => {
                                                    (e.currentTarget as HTMLImageElement).src = "/assets/emojis/neutral.gif";
                                                }}
                                            />
                                        </div>
                                    </div>
                                </Tooltip.Trigger>
                                <Tooltip.Content side="top" className="z-50 px-2 py-1 rounded bg-background-dark text-xs text-text-primary border border-border-subtle shadow">
                                    {moodText} {moodUnicode}
                                </Tooltip.Content>
                            </Tooltip.Root>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <span className="text-sm font-ui cursor-help" style={{ color: moodColor }}>{moodText}</span>
                                </Tooltip.Trigger>
                                <Tooltip.Content side="top" className="z-50 px-2 py-1 rounded bg-background-dark text-xs text-text-primary border border-border-subtle shadow">
                                    Mood: {moodText} {moodUnicode}
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </div>
                        <span className="text-xs text-text-muted font-ui ml-auto">
                            Anonymous {rant.anonymous_user_id?.slice(-3).toUpperCase() || "🫣"}
                        </span>
                    </div>
                    {/* Rant content */}
                    <div className="text-text-primary leading-relaxed mb-4 font-body break-words flex-grow" style={{ minHeight: '120px' }}>
                        {highlightText(rant.content, "")}
                        {/* #7: Rant length */}
                        <div className="mt-2 text-xs text-text-muted font-ui">{rant.content.length} characters</div>
                    </div>
                    {/* Footer with timestamp and share icon inline */}
                    <div className="flex items-center justify-between text-xs text-text-muted font-ui mt-auto pt-2">
                        <Tooltip.Root open={showFullTimestamp} onOpenChange={setShowFullTimestamp}>
                            <Tooltip.Trigger asChild>
                                <span
                                    className="cursor-pointer underline decoration-dotted"
                                    onClick={() => setShowFullTimestamp((v) => !v)}
                                    aria-label="Show full timestamp"
                                >
                                    {rant.created_at ? new Date(rant.created_at).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }) : ''} ({formattedTime})
                                </span>
                            </Tooltip.Trigger>
                            <Tooltip.Content side="top" className="z-50 px-2 py-1 rounded bg-background-dark text-xs text-text-primary border border-border-subtle shadow">
                                {rant.created_at ? new Date(rant.created_at).toISOString() : ''}
                            </Tooltip.Content>
                        </Tooltip.Root>
                        <div className="flex items-center gap-2">
                            {/* #10: Share confirmation toast */}
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        className="hover:scale-110 transition-transform text-text-muted hover:text-[#6DD19F] ml-2"
                                        onClick={() => {
                                            const url = `${window.location.origin}/rant/${rant.id}`;
                                            navigator.clipboard.writeText(url);
                                            setShowShareToast(true);
                                            setTimeout(() => setShowShareToast(false), 1800);
                                        }}
                                        aria-label="Copy rant link"
                                    >
                                        <Share1Icon className="w-4 h-4" />
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Content side="top" className="z-50 px-2 py-1 rounded bg-background-dark text-xs text-text-primary border border-border-subtle shadow">
                                    Copy link
                                </Tooltip.Content>
                            </Tooltip.Root>
                            {/* Social share buttons (#9, partial for #10) */}
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        className="hover:scale-110 transition-transform text-text-muted hover:text-[#1DA1F2]"
                                        onClick={() => {
                                            const url = `${window.location.origin}/rant/${rant.id}`;
                                            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(rant.content.slice(0, 120))}`, '_blank');
                                        }}
                                        aria-label="Share on Twitter"
                                    >
                                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 5.924c-.793.352-1.646.59-2.54.698a4.48 4.48 0 0 0 1.965-2.475 8.94 8.94 0 0 1-2.828 1.082 4.48 4.48 0 0 0-7.635 4.085A12.72 12.72 0 0 1 3.11 4.86a4.48 4.48 0 0 0 1.388 5.976 4.47 4.47 0 0 1-2.03-.56v.057a4.48 4.48 0 0 0 3.594 4.393 4.48 4.48 0 0 1-2.025.077 4.48 4.48 0 0 0 4.184 3.11A8.98 8.98 0 0 1 2 19.54a12.7 12.7 0 0 0 6.88 2.017c8.26 0 12.78-6.84 12.78-12.77 0-.195-.004-.39-.013-.583A9.22 9.22 0 0 0 24 4.59a8.93 8.93 0 0 1-2.54.698z" /></svg>
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Content side="top" className="z-50 px-2 py-1 rounded bg-background-dark text-xs text-text-primary border border-border-subtle shadow">
                                    Share on Twitter
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </div>
                    </div>
                    {/* #10: Share confirmation toast */}
                    {showShareToast && (
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-background-dark text-text-primary px-4 py-2 rounded shadow z-50 border border-border-subtle animate-fade-in">
                            Link copied!
                        </div>
                    )}
                    {/* #13: Related rants */}
                    {relatedRants && relatedRants.length > 0 && (
                        <div className="mt-8">
                            <div className="text-xs text-text-muted font-ui mb-2">
                                Related rants with mood{' '}
                                <button
                                    className="underline text-primary font-semibold hover:text-primary/80 transition-colors"
                                    style={{ color: moodColor, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                    onClick={() => navigate(`/?mood=${encodeURIComponent(rant.mood)}`)}
                                    aria-label={`Filter rants by mood: ${moodText}`}
                                >
                                    {moodText}
                                </button>:
                            </div>
                            <div className="flex flex-col gap-2">
                                {relatedRants.map(r => (
                                    <div key={r.id} className="rounded-lg border border-border-subtle bg-background-secondary px-3 py-2 text-xs text-text-primary cursor-pointer hover:bg-background-dark/80 transition"
                                        onClick={() => navigate(`/rant/${r.id}`)}
                                    >
                                        <span className="font-bold" style={{ color: getMoodColor(r.mood) }}>{getMoodUnicodeEmoji(r.mood)} {r.mood}</span> · {r.content.slice(0, 60)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RantPage;
