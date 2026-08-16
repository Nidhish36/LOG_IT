'use client';

import React, { useState } from 'react';
import { UserMediaRecord } from '@/types/media';
import { Star, Trash2, Edit3, Bookmark, Play, CheckCircle2 } from 'lucide-react';
import { removeUserMedia } from '@/actions/media';
import { MediaActionModal } from './MediaActionModal';

interface MediaCardProps {
    record: UserMediaRecord;
}

export function MediaCard({ record }: MediaCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { media, status, rating, review } = record;

    const statusIcons = {
        watchlist: <Bookmark className="h-3 w-3" />,
        watching: <Play className="h-3 w-3" />,
        watched: <CheckCircle2 className="h-3 w-3" />,
    };

    async function handleDelete() {
        if (!confirm(`Remove "${media.title}" from your library?`)) return;
        setIsDeleting(true);
        try {
            await removeUserMedia(media.id);
        } catch (err) {
            console.error(err);
            setIsDeleting(false);
        }
    }

    return (
        <>
            <div className="sharp-card group relative flex flex-col bg-white dark:bg-black">
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900 border-b border-black/10 dark:border-white/10">
                    {media.posterUrl ? (
                        <img
                            src={media.posterUrl}
                            alt={media.title}
                            className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-mono-sharp text-zinc-500">
                            [NO_POSTER]
                        </div>
                    )}

                    {/* Type Badge */}
                    <span className="absolute left-2 top-2 bg-black text-white px-2 py-0.5 text-[9px] font-mono-sharp font-bold uppercase tracking-wider border border-white/20">
                        {media.type}
                    </span>

                    {/* Status Badge */}
                    <div className="absolute right-2 top-2 flex items-center gap-1 bg-black text-white px-2 py-0.5 text-[9px] font-mono-sharp font-bold uppercase border border-white/20">
                        {statusIcons[status]}
                        <span>{status}</span>
                    </div>

                    {/* Rating */}
                    {rating ? (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black text-white px-2 py-0.5 text-xs font-mono-sharp font-bold border border-white/20">
                            <Star className="h-3 w-3 fill-white text-white" />
                            <span>{rating.toFixed(1)}</span>
                        </div>
                    ) : null}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between p-3">
                    <div>
                        <h3 className="font-bold text-sm text-black dark:text-white line-clamp-1 group-hover:underline">
                            {media.title}
                        </h3>
                        <p className="text-[11px] font-mono-sharp text-zinc-500 mt-0.5">
                            {media.releaseDate ? media.releaseDate.split('-')[0] : '????'}
                            {media.genres.length > 0 && ` • ${media.genres.slice(0, 1).join(', ')}`}
                        </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-2 text-zinc-600 dark:text-zinc-400">
                        <button
                            onClick={() => setIsEditOpen(true)}
                            className="flex items-center gap-1 text-xs font-mono-sharp font-semibold hover:text-black dark:hover:text-white transition"
                        >
                            <Edit3 className="h-3 w-3" />
                            <span>Edit</span>
                        </button>

                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-1 hover:text-red-500 transition"
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>

            <MediaActionModal
                isOpen={isEditOpen}
                media={media}
                initialStatus={status}
                initialRating={rating}
                initialReview={review || ''}
                onClose={() => setIsEditOpen(false)}
            />
        </>
    );
}