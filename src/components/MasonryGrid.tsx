import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Rant } from '@/lib/types/rant';
import { useTranslation } from 'react-i18next';
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
    onNewRantAppear
}) => {
    const { t } = useTranslation();
    const [columns, setColumns] = useState(getColumnCount());
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const newRantRef = useRef<HTMLDivElement>(null);
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

    // Calculate fixed column width based on container width
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const columnWidth = (containerWidth - (gap * (columns - 1))) / columns;

                // Apply fixed width to all column divs
                const columnDivs = containerRef.current.querySelectorAll('.masonry-column');
                columnDivs.forEach((div) => {
                    (div as HTMLElement).style.width = `${columnWidth}px`;
                });
            }
        };

        // Initial calculation
        handleResize();

        // Set up resize observer
        if (containerRef.current) {
            const resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(containerRef.current);
            return () => {
                if (containerRef.current) {
                    resizeObserver.disconnect();
                }
            };
        }
    }, [columns, gap]);

    // Keyboard navigation handler
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // If no rants or no focused rant, select the first one on arrow or home key
        if (rants.length === 0) return;

        // Initialize focus if none exists
        if (focusedRantIndex === null &&
            (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'Home')) {
            setFocusedRantIndex(0);
            e.preventDefault();
            return;
        }

        if (focusedRantIndex === null) return;

        switch (e.key) {
            case 'ArrowDown': {
                e.preventDefault();
                // Move to the next rant in the same column or to the next column
                const currentCol = focusedRantIndex % columns;
                const nextIndex = focusedRantIndex + columns;
                if (nextIndex < rants.length) {
                    setFocusedRantIndex(nextIndex);
                }
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                // Move to the previous rant in the same column
                const prevIndex = focusedRantIndex - columns;
                if (prevIndex >= 0) {
                    setFocusedRantIndex(prevIndex);
                }
                break;
            }
            case 'ArrowRight': {
                e.preventDefault();
                // Move to the next column in the same row
                const currentCol = focusedRantIndex % columns;
                if (currentCol < columns - 1 && focusedRantIndex + 1 < rants.length) {
                    setFocusedRantIndex(focusedRantIndex + 1);
                }
                break;
            }
            case 'ArrowLeft': {
                e.preventDefault();
                // Move to the previous column in the same row
                const currentCol = focusedRantIndex % columns;
                if (currentCol > 0) {
                    setFocusedRantIndex(focusedRantIndex - 1);
                }
                break;
            }
            case 'Home': {
                e.preventDefault();
                // Move to the first rant
                setFocusedRantIndex(0);
                break;
            }
            case 'End': {
                e.preventDefault();
                // Move to the last rant
                setFocusedRantIndex(rants.length - 1);
                break;
            }
        }
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
                <h3 className="text-xl font-medium text-white mb-2">{t('rants.noRantsFound', 'No rants found')}</h3>
                <p className="text-gray-400 max-w-md">
                    {searchTerm
                        ? t('rants.noMatchingRants', 'No rants matching "{{searchTerm}}" were found. Try a different search term.', { searchTerm })
                        : t('rants.beFirstToPost', 'Be the first to post a rant!')}
                </p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full"
            onKeyDown={handleKeyDown}
            role="region"
            aria-label={t('rants.feed', 'Rants feed')}
        >
            <div className="flex" style={{ gap: `${gap}px` }}>
                {columnArrays.map((columnRants, columnIndex) => (
                    <div
                        key={columnIndex}
                        className="masonry-column flex-shrink-0"
                        style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}
                    >
                        {columnRants.map((rant, rantIndex) => {
                            const overallIndex = rantIndex * columns + columnIndex;
                            const isNewRant = rant.id === newRantId;
                            const isFocused = focusedRantIndex === overallIndex;

                            return (
                                <div
                                    key={rant.id}
                                    className={cn(
                                        "w-full",
                                        isNewRant ? 'new-rant' : '',
                                        isFocused ? 'ring-2 ring-primary ring-offset-2' : ''
                                    )}
                                    ref={(el) => {
                                        if (isNewRant) newRantRef.current = el;
                                        rantRefs.current[rant.id] = el;
                                    }}
                                    tabIndex={0}
                                    role="article"
                                    aria-label={t('rants.rantLabel', 'Rant number {{index}}', { index: overallIndex + 1 })}
                                    onFocus={() => setFocusedRantIndex(overallIndex)}
                                    data-rant-index={overallIndex}
                                >
                                    {renderItem ? renderItem(rant, overallIndex) : null}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Loading indicator and trigger for infinite scroll */}
            <div
                ref={loadMoreTriggerRef}
                className="h-20 w-full flex items-center justify-center mt-4"
                aria-hidden="true"
            >
                {isLoadingMore && (
                    <div
                        className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"
                        role="status"
                        aria-label={t('rants.loading', 'Loading more rants')}
                    ></div>
                )}

                {!isLoading && !hasMore && rants.length > 0 && (
                    <div
                        className="text-center text-gray-400 py-2"
                        aria-live="polite"
                    >
                        {t('rants.noMoreRants', 'No more rants to load')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(MasonryGrid);
