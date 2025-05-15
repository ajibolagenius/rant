import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Rant } from '@/lib/types/rant';
import { cn } from '@/lib/utils';

// Function to determine column count based on screen width
function getColumnCount() {
    if (typeof window === 'undefined') return 2; // Default for SSR

    const width = window.innerWidth;
    if (width < 640) return 1; // Mobile - single column
    if (width < 1024) return 2; // Tablet - two columns
    if (width < 1280) return 3; // Small desktop - three columns
    return 4; // Large desktop - four columns
}

interface MasonryGridProps {
    rants?: Rant[];
    gap?: number;
    onRemove?: (id: string) => void;
    searchTerm?: string;
    onLike?: (id: string) => void;
    onLoadMore?: () => Promise<void>;
    renderItem?: (rant: Rant, index: number) => React.ReactNode;
    isLoading?: boolean;
    hasMore?: boolean;
    newRantId?: string | null;
    onNewRantAppear?: () => void;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
    rants = [],
    gap = 24,
    searchTerm = "",
    onLike,
    onLoadMore,
    renderItem,
    isLoading = false,
    hasMore = true,
    newRantId = null,
    onNewRantAppear,
    onRemove
}) => {
    const [columns, setColumns] = useState(getColumnCount());
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const newRantRef = useRef<HTMLDivElement | null>(null);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // For keyboard navigation
    const [focusedRantIndex, setFocusedRantIndex] = useState<number | null>(null);
    const rantRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Handle resize with debounce for better performance
    useEffect(() => {
        const handleResize = () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }

            resizeTimeoutRef.current = setTimeout(() => {
                const newColumnCount = getColumnCount();
                if (newColumnCount !== columns) {
                    setColumns(newColumnCount);
                }
            }, 150); // Debounce resize for 150ms
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, [columns]);

    // Effect to scroll to new rant when it appears
    useEffect(() => {
        if (newRantId && newRantRef.current) {
            // Smooth scroll to the new rant
            newRantRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Add pulse animation class
            newRantRef.current.classList.add('pulse-animation');

            // Notify parent that we've handled the new rant
            if (onNewRantAppear) {
                onNewRantAppear();
            }

            // Remove animation class after it completes
            const timer = setTimeout(() => {
                if (newRantRef.current) {
                    newRantRef.current.classList.remove('pulse-animation');
                }
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [newRantId, onNewRantAppear]);

    // Set up intersection observer for infinite scrolling with debounce
    const setupObserver = useCallback(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        // Create a new observer with improved options
        observerRef.current = new IntersectionObserver(
            async (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && onLoadMore && !isLoadingMore && hasMore) {
                    try {
                        setIsLoadingMore(true);

                        if (loadingTimeoutRef.current) {
                            clearTimeout(loadingTimeoutRef.current);
                        }

                        // Reduce debounce time for faster response
                        loadingTimeoutRef.current = setTimeout(async () => {
                            await onLoadMore();
                            setIsLoadingMore(false);
                        }, 150); // Reduced from 300ms to 150ms
                    } catch (error) {
                        console.error("Error loading more rants:", error);
                        setIsLoadingMore(false);
                    }
                }
            },
            {
                // Increase rootMargin to start loading even earlier
                rootMargin: '500px', // Increased from 300px to 500px
                threshold: 0.1
            }
        );

        if (loadMoreTriggerRef.current) {
            observerRef.current.observe(loadMoreTriggerRef.current);
        }
    }, [onLoadMore, isLoadingMore, hasMore]);

    useEffect(() => {
        setupObserver();
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }

            // Clear any pending timeouts
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
        };
    }, [setupObserver]);

    // Calculate column width based on container width and number of columns
    const getColumnWidth = () => {
        // Calculate percentage width for each column, accounting for gaps
        const gapSpace = (columns - 1) * gap;
        return `calc((100% - ${gapSpace}px) / ${columns})`;
    };

    // Focus the rant when focusedRantIndex changes
    useEffect(() => {
        if (focusedRantIndex !== null && rants[focusedRantIndex]) {
            const rantId = rants[focusedRantIndex].id;
            const element = rantRefs.current[rantId];
            if (element) {
                element.focus();
                // Scroll into view if needed
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }
    }, [focusedRantIndex, rants]);

    // Distribute rants across columns
    const columnArrays: Rant[][] = Array.from({ length: columns }, () => []);
    rants.forEach((rant, index) => {
        const columnIndex = index % columns;
        columnArrays[columnIndex].push(rant);
    });

    if (rants.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-white mb-2">No rants found</h3>
                <p className="text-gray-400 max-w-md">
                    {searchTerm
                        ? `No rants matching "${searchTerm}" were found. Try a different search term.`
                        : 'Be the first to post a rant!'}
                </p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full"
            role="region"
            aria-label="Rants feed"
        >
            <div className="flex" style={{ gap: `${gap}px` }}>
                {columnArrays.map((columnRants, columnIndex) => (
                    <div
                        key={columnIndex}
                        className="masonry-column"
                        style={{
                            width: getColumnWidth(),
                            display: 'flex',
                            flexDirection: 'column',
                            gap: `${gap}px`
                        }}
                    >
                        {columnRants.map((rant, rantIndex) => {
                            const overallIndex = rantIndex * columns + columnIndex;
                            const isNewRant = rant.id === newRantId;

                            return (
                                <div
                                    key={rant.id || `rant-${columnIndex}-${rantIndex}`}
                                    ref={(el) => {
                                        // Store reference for keyboard navigation
                                        if (rant.id) {
                                            rantRefs.current[rant.id] = el;
                                        }

                                        // Store reference for new rant scrolling
                                        if (isNewRant) {
                                            newRantRef.current = el;
                                        }
                                    }}
                                    className={cn(isNewRant ? 'new-rant' : '')}
                                    tabIndex={0}
                                    aria-label={`Rant ${overallIndex + 1} of ${rants.length}`}
                                >
                                    {renderItem ? renderItem(rant, overallIndex) : (
                                        <>
                                            <p>By: {rant.userAlias || 'Anonymous'}</p>
                                            <p>{rant.content || 'No content available.'}</p>
                                            <p style={{ color: 'gray', fontSize: '12px' }}>Posted on: {new Date(rant.created_at).toLocaleString()}</p>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Load more trigger */}
            {hasMore && (
                <div
                    ref={loadMoreTriggerRef}
                    className="h-20 w-full flex items-center justify-center mt-4"
                >
                    {isLoadingMore && (
                        <div className="text-sm text-gray-400">Loading more rants...</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default React.memo(MasonryGrid);
