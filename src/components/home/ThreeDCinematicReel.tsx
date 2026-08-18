'use client';

import React, { useState, useEffect } from 'react';
import { UnifiedMediaItem } from '@/types/media';
import { Plus, TrendingUp } from 'lucide-react';
import { MediaActionModal } from '@/components/media/MediaActionModal';

export function ThreeDCinematicReel() {
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedMedia, setSelectedMedia] = useState<UnifiedMediaItem | null>(null);

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
            .catch((err) => console.error('Trending fetch error:', err))
            .finally(() => setLoading(false));
    }, []);

    const items = (data[activeTab] || []).slice(0, 7);
    const count = items.length;

    const nextSlide = () => {
        if (count === 0) return;
        setCurrentIndex((prev) => (prev + 1) % count);
    };

    const prevSlide = () => {
        if (count === 0) return;
        setCurrentIndex((prev) => (prev - 1 + count) % count);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [count]);

    if (loading) {
        return (
            <div className="w-full h-[380px] flex items-center justify-center border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 my-6 animate-pulse font-mono-sharp text-xs text-zinc-500">
                [INITIALIZING_CINEMATIC_COVERFLOW...]
            </div>
        );
    }

    if (count === 0) return null;

    return (
        <section className="relative w-full py-6 my-4 select-none font-mono-sharp overflow-hidden">
            {/* Top Header & Category Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/15 dark:border-white/15 pb-3 mb-8 gap-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-red-500 animate-pulse" />
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                        <span>Spotlight Reel</span>
                        <span className="text-[10px] text-zinc-500 font-bold hidden sm:inline">// LIVE POPULAR SELECTIONS</span>
                    </h2>
                </div>

                {/* Category Switcher */}
                <div className="flex items-center gap-1.5 border border-black/20 dark:border-white/20 bg-white dark:bg-black p-0.5 self-start sm:self-auto">
                    {[
                        { id: 'all', label: 'ALL' },
                        { id: 'movies', label: 'MOVIES' },
                        { id: 'tv', label: 'TV SHOWS' },
                        { id: 'anime', label: 'ANIME' },
                    ].map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => {
                                setActiveTab(id as any);
                                setCurrentIndex(0);
                            }}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition ${activeTab === id
                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cinematic Showcase Container */}
            <div className="relative w-full h-[400px] sm:h-[440px] flex items-center justify-center">
                {/* Dynamic Coverflow Cards */}
                <div className="relative w-full h-full flex items-center justify-center">
                    {items.map((media, i) => {
                        let offset = i - currentIndex;
                        if (offset > count / 2) offset -= count;
                        if (offset < -count / 2) offset += count;

                        const isCenter = offset === 0;
                        const isVisible = Math.abs(offset) <= 2;

                        if (!isVisible) return null;

                        // Spacing & 3D styling
                        const translateX = offset * 220; // clean separation
                        const scale = isCenter ? 1 : 0.82;
                        const opacity = isCenter ? 1 : 0.65;
                        const rotateY = offset * -18; // angled inwards towards center
                        const zIndex = 20 - Math.abs(offset);

                        return (
                            <div
                                key={media.id}
                                onClick={() => {
                                    if (isCenter) setSelectedMedia(media);
                                    else setCurrentIndex(i);
                                }}
                                className={`absolute w-[220px] sm:w-[260px] aspect-[2/3] bg-black border-2 transition-all duration-500 ease-out flex flex-col justify-between overflow-hidden cursor-pointer ${isCenter
                                        ? 'border-black dark:border-white shadow-[10px_10px_0px_0px_rgba(255,255,255,0.2)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.25)] ring-2 ring-white/10'
                                        : 'border-black/30 dark:border-white/20 hover:opacity-90 hover:scale-[0.85]'
                                    }`}
                                style={{
                                    transform: `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                                    opacity,
                                    zIndex,
                                }}
                            >
                                {/* Full Color Poster */}
                                {media.posterUrl ? (
                                    <img
                                        src={media.posterUrl}
                                        alt={media.title}
                                        className={`h-full w-full object-cover transition-transform duration-500 ${isCenter ? 'hover:scale-105' : 'brightness-90'
                                            }`}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                                        NO_IMAGE
                                    </div>
                                )}

                                {/* Top Badges */}
                                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                                    <span className="bg-black/90 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-white/20">
                                        {media.type}
                                    </span>
                                    <span className="bg-white/90 text-black px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                        {media.source}
                                    </span>
                                </div>

                                {/* Bottom Overlay (Active Center Card Only) */}
                                {isCenter && (
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pt-12 flex flex-col gap-2">
                                        <div>
                                            <h3 className="font-black text-sm text-white truncate uppercase tracking-tight">
                                                {media.title}
                                            </h3>
                                            <p className="text-[10px] text-zinc-400">
                                                {media.releaseDate ? `RELEASED: ${media.releaseDate.split('-')[0]}` : 'TRENDING'}
                                            </p>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMedia(media);
                                            }}
                                            className="sharp-btn w-full bg-white text-black py-2 text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition flex items-center justify-center gap-1.5 shadow-md"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            <span>LOG TO LIBRARY</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Slide Indicators */}
            <div className="flex items-center justify-center gap-2 mt-4">
                {items.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1 transition-all duration-300 ${currentIndex === idx
                                ? 'w-8 bg-black dark:bg-white'
                                : 'w-2 bg-black/20 dark:bg-white/20 hover:bg-black/50 dark:hover:bg-white/50'
                            }`}
                    />
                ))}
            </div>

            {/* Action Modal */}
            {selectedMedia && (
                <MediaActionModal
                    isOpen={!!selectedMedia}
                    media={selectedMedia}
                    onClose={() => setSelectedMedia(null)}
                />
            )}
        </section>
    );
}