import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rant } from '@/lib/types/rant';

// Function to determine column count based on viewport width
function getColumnCount() {
    if (typeof window === 'undefined') return 3; // Default for SSR

    const width = window.innerWidth;
    if (width < 640) return 1; // Mobile
    if (width < 1024) return 2; // Tablet
    if (width < 1280) return 3; // Small desktop
    return 4; // Large desktop
}

interface MasonryGridProps {
    rants?: Rant[];
    gap?: number;
    onRemove?: (id: string) => void;
    searchTerm?: string;
    onLike?: (id: string) => void;
    onLoadMore?: () => Promise<void>;
    renderItem?: (rant: Rant, index: number) => React.ReactNode;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
    rants = [],
    gap = 24,
    searchTerm = "",
    onLike,
    onLoadMore,
    renderItem
}) => {
    const [columns, setColumns] = useState(getColumnCount());
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        const handleResize = () => setColumns(getColumnCount());
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Set up intersection observer for infinite scrolling
    const setupObserver = useCallback(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(async entries => {
            const [entry] = entries;
            if (entry.isIntersecting && onLoadMore && !isLoadingMore) {
                setIsLoadingMore(true);
                try {
                    await onLoadMore();
                } finally {
                    setIsLoadingMore(false);
                }
            }
        }, { rootMargin: '200px' });

        if (loadMoreTriggerRef.current) {
            observerRef.current.observe(loadMoreTriggerRef.current);
        }
    }, [onLoadMore, isLoadingMore]);

    useEffect(() => {
        setupObserver();
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [setupObserver]);

    // Filter rants by search term if provided
    const filteredRants = searchTerm
        ? rants.filter(rant =>
            rant.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : rants;

    // Distribute rants across columns
    const columnArrays: Rant[][] = Array.from({ length: columns }, () => []);
    filteredRants.forEach((rant, index) => {
        const columnIndex = index % columns;
        columnArrays[columnIndex].push(rant);
    });

    if (filteredRants.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-white mb-2">No rants found</h3>
                <p className="text-gray-400 max-w-md">
                    {searchTerm
                        ? `No rants matching "${searchTerm}". Try a different search term.`
                        : "Be the first to share your thoughts!"}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div
                className="w-full grid"
                style={{
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: `${gap}px`
                }}
            >
                {columnArrays.map((columnRants, columnIndex) => (
                    <div key={columnIndex} className="flex flex-col gap-6">
                        {columnRants.map((rant, index) => (
                            renderItem ? renderItem(rant, index) : null
                        ))}
                    </div>
                ))}
            </div>

            {/* Load more trigger element */}
            <div
                ref={loadMoreTriggerRef}
                className="w-full h-10 mt-8 flex justify-center"
            >
                {isLoadingMore && (
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MasonryGrid;
