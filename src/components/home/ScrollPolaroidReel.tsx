'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Star, Film, Sparkles, ArrowDown } from 'lucide-react';
import { UserMediaRecord } from '@/types/media';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface ScrollPolaroidReelProps {
    records?: UserMediaRecord[];
}

// Curated cinematic defaults if the user's library is empty
const DEFAULT_POLAROIDS = [
    {
        title: 'LITTLE FOREST',
        year: '2018',
        type: 'MOVIE',
        rating: 4.8,
        note: 'Pure tranquility and countryside cooking.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800',
        rotation: -4,
    },
    {
        title: 'INTERSTELLAR',
        year: '2014',
        type: 'MOVIE',
        rating: 5.0,
        note: 'Love is the one thing that transcends time.',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800',
        rotation: 5,
    },
    {
        title: 'ATTACK ON TITAN',
        year: '2013',
        type: 'ANIME',
        rating: 4.9,
        note: 'Masterpiece storytelling and tension.',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800',
        rotation: -3,
    },
    {
        title: 'SPIRITED AWAY',
        year: '2001',
        type: 'ANIME',
        rating: 5.0,
        note: 'Miyazaki magic at its finest.',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800',
        rotation: 6,
    },
    {
        title: 'BLADE RUNNER 2049',
        year: '2017',
        type: 'MOVIE',
        rating: 4.7,
        note: 'Visual perfection and neon atmosphere.',
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800',
        rotation: -5,
    },
];

export function ScrollPolaroidReel({ records = [] }: ScrollPolaroidReelProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Map user records to polaroids if available
    const polaroidItems = records.length >= 3
        ? records.slice(0, 6).map((r, i) => ({
            title: r.media.title.toUpperCase(),
            year: r.media.releaseDate ? r.media.releaseDate.split('-')[0] : 'LOGGED',
            type: r.media.type.toUpperCase(),
            rating: r.rating || 5.0,
            note: r.review || 'Logged in personal collection.',
            image: r.media.posterUrl || DEFAULT_POLAROIDS[i % DEFAULT_POLAROIDS.length].image,
            rotation: i % 2 === 0 ? -(i * 2 + 2) : (i * 2 + 3),
        }))
        : DEFAULT_POLAROIDS;

    useGSAP(
        () => {
            const cards = gsap.utils.toArray<HTMLElement>('.polaroid-card');
            if (!cards.length) return;

            cards.forEach((card, index) => {
                const rot = card.dataset.rotation || '0';
                const startX = index % 2 === 0 ? -120 : 120;
                const startY = 80;

                gsap.fromTo(
                    card,
                    {
                        x: startX,
                        y: startY,
                        opacity: 0,
                        scale: 0.85,
                        rotate: Number(rot) * 2,
                    },
                    {
                        x: 0,
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        rotate: Number(rot),
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 85%',
                            end: 'top 45%',
                            scrub: 0.8,
                        },
                    }
                );
            });
        },
        { scope: containerRef }
    );

    return (
        <div ref={containerRef} className="relative w-full py-12 select-none">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-black/15 dark:border-white/15 pb-4 mb-10 font-mono-sharp">
                <div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 uppercase tracking-widest mb-1">
                        <Film className="h-3.5 w-3.5 animate-pulse" />
                        <span>[SCROLL_DRIVEN_POLAROID_GALLERY]</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white uppercase tracking-tight">
                        Cinematic Highlights
                    </h2>
                </div>
                <p className="text-xs text-zinc-500 mt-2 sm:mt-0 flex items-center gap-1.5">
                    <span>SCROLL DOWN TO REVEAL FRAMES</span>
                    <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
                </p>
            </div>

            {/* Polaroid Grid / Stack Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 px-2 sm:px-6">
                {polaroidItems.map((item, idx) => (
                    <div
                        key={idx}
                        data-rotation={item.rotation}
                        className="polaroid-card group relative bg-white dark:bg-zinc-100 p-4 pb-6 text-black border border-black/20 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105 hover:z-30 hover:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[14px_14px_0px_0px_rgba(255,255,255,0.35)]"
                        style={{ transform: `rotate(${item.rotation}deg)` }}
                    >
                        {/* Top Tape Strip */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-white/70 dark:bg-zinc-300/80 border border-black/20 rotate-1 backdrop-blur-sm shadow-sm pointer-events-none" />

                        {/* Photo Viewport */}
                        <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-black border border-black/30">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="h-full w-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-500 group-hover:scale-105"
                            />

                            {/* Type Badge in Photo */}
                            <span className="absolute top-2 left-2 bg-black text-white px-2 py-0.5 text-[9px] font-mono-sharp font-bold tracking-widest border border-white/20">
                                {item.type}
                            </span>
                        </div>

                        {/* Polaroid Chin / Handwritten Typewriter Label */}
                        <div className="mt-4 px-1 font-mono-sharp flex flex-col justify-between">
                            <div className="flex items-center justify-between gap-2 border-b border-black/15 pb-1 mb-2">
                                <h3 className="font-black text-sm text-black truncate tracking-wide">
                                    {item.title}
                                </h3>
                                <span className="text-[11px] font-bold text-zinc-600 flex-shrink-0">
                                    [{item.year}]
                                </span>
                            </div>

                            <p className="text-xs text-zinc-700 italic line-clamp-1 mb-2">
                                &ldquo;{item.note}&rdquo;
                            </p>

                            <div className="flex items-center justify-between text-[11px] font-bold pt-1 border-t border-black/10">
                                <div className="flex items-center gap-1 text-black">
                                    <Star className="h-3.5 w-3.5 fill-black text-black" />
                                    <span>{item.rating.toFixed(1)} / 5.0</span>
                                </div>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                                    35MM_FRAME
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}