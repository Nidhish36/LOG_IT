'use client';

import React, { useState } from 'react';
import { UserMediaRecord } from '@/types/media';
import { Star, Edit3, Trash2, CheckCircle2, Clock, Eye } from 'lucide-react';
import { MediaActionModal } from './MediaActionModal';
import { removeUserMedia } from '@/actions/media';

interface MediaCardProps {
    record: UserMediaRecord;
    index?: number;
}

export function MediaCard({ record, index = 0 }: MediaCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Subtle polaroid tilt (-2deg to +2deg) based on card index
    const rot = (index % 2 === 0 ? -(index % 3 + 1) : (index % 3 + 1)) * 0.8;

    async function handleDelete(e: React.MouseEvent) {
        e.stopPropagation();
        if (!confirm(`Delete "${record.media.title}" from your library?`)) return;
        setIsDeleting(true);
        await removeUserMedia(record.id);
        setIsDeleting(false);
    }

    const statusIcons = {
        watched: <CheckCircle2 className="h-3 w-3 text-black dark:text-black" />,
        watching: <Eye className="h-3 w-3 text-black dark:text-black" />,
        watchlist: <Clock className="h-3 w-3 text-black dark:text-black" />,
    };

    return (
        <>
            <div
                onClick={() => setIsEditOpen(true)}
                className="group relative bg-white dark:bg-zinc-100 p-3 pb-4 text-black border border-black/20 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] transition-all duration-200 hover:scale-[1.03] hover:z-20 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.35)] cursor-pointer flex flex-col justify-between select-none"
                style={{ transform: `rotate(${rot}deg)` }}
            >
                {/* Top Tape Accent */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-white/80 dark:bg-zinc-300/80 border border-black/20 rotate-1 shadow-sm pointer-events-none" />

                {/* Photo Viewport */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-black border border-black/30">
                    {record.media.posterUrl ? (
                        <img
                            src={record.media.posterUrl}
                            alt={record.media.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center font-mono-sharp text-xs text-zinc-500">
                            NO_POSTER
                        </div>
                    )}

                    {/* Top Status & Type Badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                        <span className="bg-black text-white px-2 py-0.5 text-[9px] font-mono-sharp font-bold uppercase tracking-wider border border-white/20">
                            {record.media.type}
                        </span>
                        <span className="bg-white text-black px-1.5 py-0.5 text-[9px] font-mono-sharp font-bold uppercase tracking-wider border border-black/20 flex items-center gap-1 shadow-sm">
                            {statusIcons[record.status]}
                            <span className="hidden sm:inline">{record.status}</span>
                        </span>
                    </div>

                    {/* Progress Overlay (For TV / Anime) */}
                    {record.progress > 0 && (
                        <div className="absolute bottom-2 left-2 bg-black/90 text-white px-2 py-0.5 text-[9px] font-mono-sharp font-bold border border-white/20">
                            EP {record.progress}{record.media.totalEpisodes ? `/${record.media.totalEpisodes}` : ''}
                        </div>
                    )}
                </div>

                {/* Lower Polaroid Chin / Typewriter Caption */}
                <div className="mt-3 px-1 font-mono-sharp">
                    <div className="flex items-center justify-between gap-1 border-b border-black/15 pb-1 mb-1.5">
                        <h3 className="font-black text-xs text-black truncate tracking-tight">
                            {record.media.title}
                        </h3>
                        <span className="text-[10px] font-bold text-zinc-600 flex-shrink-0">
                            [{record.media.releaseDate ? record.media.releaseDate.split('-')[0] : '????'}]
                        </span>
                    </div>

                    {record.review ? (
                        <p className="text-[10px] text-zinc-700 italic line-clamp-1 mb-1.5">
                            &ldquo;{record.review}&rdquo;
                        </p>
                    ) : null}

                    {/* Rating & Action Buttons */}
                    <div className="flex items-center justify-between pt-1 text-[10px] font-bold text-zinc-800 border-t border-black/10">
                        <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-black text-black" />
                            <span>{record.rating ? `${record.rating.toFixed(1)}/5` : 'UNRATED'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditOpen(true);
                                }}
                                className="text-zinc-600 hover:text-black transition"
                                title="Edit Entry"
                            >
                                <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="text-zinc-400 hover:text-red-600 transition"
                                title="Delete Entry"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <MediaActionModal
                isOpen={isEditOpen}
                media={record.media}
                existingRecord={record}
                onClose={() => setIsEditOpen(false)}
            />
        </>
    );
}