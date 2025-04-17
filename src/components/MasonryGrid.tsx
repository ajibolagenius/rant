import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Rant } from '@/lib/types/rant';

// Function to determine column count based on screen width
function getColumnCount() {
    if (typeof window === 'undefined') return 2; // Default for SSR

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
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            const newColumnCount = getColumnCount();
            if (newColumnCount !== columns) {
                setColumns(newColumnCount);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [columns]);

    // Set up intersection observer for infinite scrolling
    const setupObserver = useCallback(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(entries => {
            const [entry] = entries;
            if (entry.isIntersecting && onLoadMore) {
                onLoadMore();
            }
        }, { rootMargin: '200px' });

        if (loadMoreTriggerRef.current) {
            observerRef.current.observe(loadMoreTriggerRef.current);
        }
    }, [onLoadMore]);

    useEffect(() => {
        setupObserver();
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [setupObserver]);

    // Calculate fixed column width based on container width
    useEffect(() => {
        if (containerRef.current) {
            const resizeObserver = new ResizeObserver(() => {
                if (containerRef.current) {
                    const containerWidth = containerRef.current.offsetWidth;
                    const columnWidth = (containerWidth - (gap * (columns - 1))) / columns;

                    // Apply fixed width to all column divs
                    const columnDivs = containerRef.current.querySelectorAll('.masonry-column');
                    columnDivs.forEach((div) => {
                        (div as HTMLElement).style.width = `${columnWidth}px`;
                    });
                }
            });

            resizeObserver.observe(containerRef.current);
            return () => resizeObserver.disconnect();
        }
    }, [columns, gap]);

    // Distribute rants across columns
    const columnArrays: Rant[][] = Array.from({ length: columns }, () => []);
    rants.forEach((rant, index) => {
        const columnIndex = index % columns;
        columnArrays[columnIndex].push(rant);
    });

    if (rants.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-white mb-2">No rants found</h3>
                <p className="text-gray-400 max-w-md">
                    {searchTerm
                        ? `No rants matching "${searchTerm}" were found. Try a different search term.`
                        : "Be the first to post a rant!"}
                </p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full">
            <div className="flex" style={{ gap: `${gap}px` }}>
                {columnArrays.map((columnRants, columnIndex) => (
                    <div
                        key={columnIndex}
                        className="masonry-column flex-shrink-0"
                        style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}
                    >
                        {columnRants.map((rant, rantIndex) => {
                            const overallIndex = rantIndex * columns + columnIndex;
                            return (
                                <div key={rant.id} className="w-full">
                                    {renderItem ? renderItem(rant, overallIndex) : null}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div ref={loadMoreTriggerRef} className="h-10 w-full" />
        </div>
    );
};

export default MasonryGrid;
