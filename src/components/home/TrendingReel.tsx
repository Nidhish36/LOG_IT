'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PolaroidCard } from '@/components/media/PolaroidCard';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { UnifiedMediaItem } from '@/types/media';

export function TrendingReel() {
    const [data, setData] = useState<{
        all: UnifiedMediaItem[];
        movies: UnifiedMediaItem[];
        tv: UnifiedMediaItem[];
        anime: UnifiedMediaItem[];
    }>({
        all: [],
        movies: [],
        tv: [],
        anime: [],
    });

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'tv' | 'anime'>('all');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/trending')
            .then((res) => res.json())
            .then((json) => {
                setData({
                    all: Array.isArray(json.all) ? json.all : [],
                    movies: Array.isArray(json.movies) ? json.movies : [],
                    tv: Array.isArray(json.tv) ? json.tv : [],
                    anime: Array.isArray(json.anime) ? json.anime : [],
                });
            })
            .catch((err) => console.error('Failed to load trending items:', err))
            .finally(() => setLoading(false));
    }, []);

    const currentList = data[activeTab] || [];

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -480, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 480, behavior: 'smooth' });
        }
    };

    return (
        <section className="mb-12 font-mono-sharp select-none">
            {/* Reel Header & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/15 dark:border-white/15 pb-2 mb-6 gap-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-red-500 animate-pulse" />
                    <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-black dark:text-white">
                        Live Popular & Trending ({currentList.length})
                    </h2>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 border border-black/20 dark:border-white/20 bg-white dark:bg-black p-0.5">
                        {[
                            { id: 'all', label: 'ALL' },
                            { id: 'movies', label: 'MOVIES' },
                            { id: 'tv', label: 'TV SHOWS' },
                            { id: 'anime', label: 'ANIME' },
                        ].map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id as any)}
                                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition ${activeTab === id
                                        ? 'bg-black text-white dark:bg-white dark:text-black'
                                        : 'text-zinc-500 hover:text-black dark:hover:text-white'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Smooth Carousel Arrow Controls */}
                    <div className="flex items-center gap-1 border border-black/20 dark:border-white/20 p-0.5 bg-white dark:bg-black">
                        <button
                            onClick={scrollLeft}
                            className="p-1 text-zinc-500 hover:text-black dark:hover:text-white transition"
                            title="Scroll Left"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={scrollRight}
                            className="p-1 text-zinc-500 hover:text-black dark:hover:text-white transition"
                            title="Scroll Right"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading Skeleton or 15+ Horizontal Scrollable Polaroid Cards */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 pt-2 animate-pulse">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="aspect-[3/4] bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/15"
                        />
                    ))}
                </div>
            ) : currentList.length > 0 ? (
                <div
                    ref={scrollContainerRef}
                    className="flex gap-6 overflow-x-auto pb-6 pt-3 px-1 scroll-smooth snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {currentList.map((media, i) => (
                        <div
                            key={media.id}
                            className="flex-shrink-0 w-[200px] sm:w-[230px] snap-start"
                        >
                            <PolaroidCard
                                media={media}
                                rotation={i % 2 === 0 ? -(i % 3 + 1.2) : (i % 3 + 1.2)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 border border-dashed border-black/15 dark:border-white/15 text-center text-xs text-zinc-500">
                    [TRENDING_DATA_CURRENTLY_UNAVAILABLE]
                </div>
            )}
        </section>
    );
}