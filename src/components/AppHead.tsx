import React from "react";
import { Helmet } from "react-helmet-async";

interface AppHeadProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    children?: React.ReactNode;
    canonical?: string;
    siteName?: string;
    twitterSite?: string;
    structuredData?: object;
}

const DEFAULT_TITLE = "Rant: Anonymous Space for Unfiltered Thoughts";
const DEFAULT_DESCRIPTION = "Rant is your anonymous space to share unfiltered thoughts. Join the conversation, express yourself with different moods, and connect with others.";
const DEFAULT_KEYWORDS = "anonymous rants, mood expression, anonymous platform, vent frustrations, share thoughts, social platform, emotional expression, community, ranting, unfiltered thoughts, online venting, discussions, support, mental health, self-expression, engagement, online sharing, rant app, platform, venting, outlet, mood tracking, feedback, digital rants, conversations, social media, connection, support network, expression, mood-based sharing, community support";
const DEFAULT_IMAGE = "/assets/rant_landing.webp";
const DEFAULT_URL = typeof window !== 'undefined' ? window.location.href : "https://gorant.live";
const DEFAULT_TYPE = "website";
const AUTHOR = "Rant App";
const THEME_COLOR = "#904FFF";
const DEFAULT_SITE_NAME = "Rant";
const DEFAULT_TWITTER_SITE = "@gorantlive";

const AppHead: React.FC<AppHeadProps> = ({
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    keywords = DEFAULT_KEYWORDS,
    image = DEFAULT_IMAGE,
    url = DEFAULT_URL,
    type = DEFAULT_TYPE,
    children,
    canonical,
    siteName = DEFAULT_SITE_NAME,
    twitterSite = DEFAULT_TWITTER_SITE,
    structuredData,
}) => (
    <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={AUTHOR} />
        <meta name="theme-color" content={THEME_COLOR} />
        <meta property="og:type" content={type} />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:site_name" content={siteName} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={url} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={image} />
        <meta property="twitter:site" content={twitterSite} />
        <link rel="canonical" href={canonical || url} />
        <link rel="icon" type="image/svg+xml" href="/assets/rant_logo.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {structuredData && (
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        )}
        {children}
    </Helmet>
);

export default AppHead;
