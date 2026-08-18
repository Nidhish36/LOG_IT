'use client';

import React, { useState } from 'react';
import { UnifiedMediaItem, UserMediaRecord, WatchStatus } from '@/types/media';
import { upsertUserMedia } from '@/actions/media';
import { X, Star, Bookmark, Play, CheckCircle2, Loader2 } from 'lucide-react';

interface MediaActionModalProps {
    isOpen: boolean;
    media: UnifiedMediaItem;
    existingRecord?: UserMediaRecord;
    onClose: () => void;
}

export function MediaActionModal({
    isOpen,
    media,
    existingRecord,
    onClose,
}: MediaActionModalProps) {
    const [status, setStatus] = useState<WatchStatus>(existingRecord?.status || 'watchlist');
    const [rating, setRating] = useState<number | null>(existingRecord?.rating || null);
    const [review, setReview] = useState<string>(existingRecord?.review || '');
    const [progress, setProgress] = useState<number>(existingRecord?.progress || 0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await upsertUserMedia(media, {
                status,
                rating,
                review: review.trim() || undefined,
                progress,
                isFavorite: existingRecord?.isFavorite || false,
            });

            if (res?.error) {
                setError(res.error);
            } else {
                onClose();
            }
        } catch (err: any) {
            setError(err.message || 'Failed to save media');
        } finally {
            setLoading(false);
        }
    }

    const statuses: { id: WatchStatus; label: string; icon: React.ReactNode }[] = [
        { id: 'watchlist', label: 'WATCHLIST', icon: <Bookmark className="h-3.5 w-3.5" /> },
        { id: 'watching', label: 'WATCHING', icon: <Play className="h-3.5 w-3.5" /> },
        { id: 'watched', label: 'WATCHED', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="sharp-card relative w-full max-w-lg bg-white dark:bg-black p-6 font-mono-sharp text-black dark:text-white border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.15)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Media Header with Full-Color Poster */}
                <div className="flex gap-4 items-start mb-6 pr-8">
                    <div className="relative aspect-[3/4] w-16 flex-shrink-0 bg-black border border-black/20 dark:border-white/20 overflow-hidden shadow-sm">
                        {media.posterUrl ? (
                            <img
                                src={media.posterUrl}
                                alt={media.title}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-[9px] text-zinc-500">
                                NO_IMG
                            </div>
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                {media.source}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">
                // {media.type}
                            </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-black truncate tracking-tight uppercase">
                            {media.title}
                        </h2>
                        <p className="text-xs text-zinc-500">
                            {media.releaseDate ? `RELEASED: ${media.releaseDate}` : '[DATE_UNKNOWN]'}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 border border-red-500 bg-red-500/10 p-2.5 text-xs text-red-500">
                        [ERROR]: {error}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-5">
                    {/* Status Selection */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            TRACKING_STATUS
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {statuses.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setStatus(s.id)}
                                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-bold uppercase tracking-wider border transition ${status === s.id
                                            ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]'
                                            : 'border-black/20 dark:border-white/20 text-zinc-500 hover:text-black dark:hover:text-white'
                                        }`}
                                >
                                    {s.icon}
                                    <span>{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Episode Progress (for TV / Anime) */}
                    {(media.type === 'tv' || media.type === 'anime') && (
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                                EPISODE_PROGRESS
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max={media.totalEpisodes || 9999}
                                    value={progress}
                                    onChange={(e) => setProgress(parseInt(e.target.value, 10) || 0)}
                                    className="w-24 border border-black/20 dark:border-white/20 bg-black/5 dark:bg-zinc-950 px-3 py-1.5 text-xs text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
                                />
                                <span className="text-xs text-zinc-500">
                                    {media.totalEpisodes ? `/ ${media.totalEpisodes} EPISODES` : 'EPISODES WATCHED'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Star Rating */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            RATING {rating ? `[${rating.toFixed(1)} / 5.0]` : '[UNRATED]'}
                        </label>
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(rating === star ? null : star)}
                                    className="p-1 text-black dark:text-white hover:scale-110 transition-transform"
                                >
                                    <Star
                                        className={`h-6 w-6 ${rating && rating >= star
                                                ? 'fill-black text-black dark:fill-white dark:text-white'
                                                : 'text-zinc-400 stroke-1'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Review / Note */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                            PERSONAL_REVIEW / NOTES
                        </label>
                        <textarea
                            rows={3}
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Record your thoughts, memorable scenes, or review..."
                            className="w-full border border-black/20 dark:border-white/20 bg-black/5 dark:bg-zinc-950 p-3 text-xs text-black dark:text-white placeholder-zinc-500 focus:border-black dark:focus:border-white focus:outline-none resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white uppercase tracking-wider"
                        >
                            [CANCEL]
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="sharp-btn bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '[SAVE_TO_DATABASE]'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}