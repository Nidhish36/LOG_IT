'use client';

import React, { useState } from 'react';
import { UnifiedMediaItem } from '@/types/media';
import { Star, Plus } from 'lucide-react';
import { MediaActionModal } from './MediaActionModal';

interface PolaroidCardProps {
    media: UnifiedMediaItem;
    rotation?: number;
    rating?: number | null;
    note?: string | null;
}

export function PolaroidCard({ media, rotation = 0, rating = null, note = null }: PolaroidCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div
                className="group relative bg-white dark:bg-zinc-100 p-3 pb-5 text-black border border-black/20 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] transition-transform duration-200 hover:scale-[1.03] hover:z-20 will-change-transform flex flex-col justify-between"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                {/* Tape Accent */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-white/80 dark:bg-zinc-300/80 border border-black/20 rotate-1 shadow-sm pointer-events-none" />

                {/* Photo Viewport */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-black border border-black/30">
                    {media.posterUrl ? (
                        <img
                            src={media.posterUrl}
                            alt={media.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-mono-sharp text-zinc-500">
                            NO_IMAGE
                        </div>
                    )}

                    {/* Type Badge */}
                    <span className="absolute top-2 left-2 bg-black text-white px-2 py-0.5 text-[9px] font-mono-sharp font-bold uppercase tracking-wider border border-white/20">
                        {media.type}
                    </span>

                    {/* Quick Add Button */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="absolute bottom-2 right-2 flex items-center gap-1 bg-black text-white px-2.5 py-1 text-[10px] font-mono-sharp font-bold border border-white/20 hover:bg-white hover:text-black transition"
                    >
                        <Plus className="h-3 w-3" />
                        <span>LOG</span>
                    </button>
                </div>

                {/* Polaroid Lower Chin */}
                <div className="mt-3 px-1 font-mono-sharp">
                    <div className="flex items-center justify-between gap-1 border-b border-black/15 pb-1 mb-1.5">
                        <h3 className="font-bold text-xs text-black truncate tracking-tight">{media.title}</h3>
                        <span className="text-[10px] font-bold text-zinc-600 flex-shrink-0">
                            [{media.releaseDate ? media.releaseDate.split('-')[0] : '????'}]
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-800">
                        <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-black text-black" />
                            <span>{rating ? rating.toFixed(1) : 'POPULAR'}</span>
                        </div>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider">
                            {media.source.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            <MediaActionModal isOpen={isOpen} media={media} onClose={() => setIsOpen(false)} />
        </>
    );
}