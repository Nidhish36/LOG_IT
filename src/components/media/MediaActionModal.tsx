'use client';

import React, { useState } from 'react';
import { UnifiedMediaItem, WatchStatus } from '@/types/media';
import { StarRating } from './StarRating';
import { saveUserMedia } from '@/actions/media';
import { X, Loader2, Bookmark, CheckCircle2, Play } from 'lucide-react';

interface MediaActionModalProps {
    media: UnifiedMediaItem | null;
    isOpen: boolean;
    onClose: () => void;
    initialStatus?: WatchStatus;
    initialRating?: number | null;
    initialReview?: string;
}

export function MediaActionModal({
    media,
    isOpen,
    onClose,
    initialStatus = 'watchlist',
    initialRating = null,
    initialReview = '',
}: MediaActionModalProps) {
    const [status, setStatus] = useState<WatchStatus>(initialStatus);
    const [rating, setRating] = useState<number | null>(initialRating);
    const [review, setReview] = useState(initialReview);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !media) return null;

    async function handleSave() {
        if (!media) return;
        setLoading(true);
        setError(null);

        try {
            await saveUserMedia({
                media,
                status,
                rating,
                review: review.trim() || null,
                watchedAt: status === 'watched' ? new Date().toISOString().split('T')[0] : null,
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save to library. Make sure you are signed in.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Media Preview Header */}
                <div className="flex gap-4 items-start mb-6">
                    {media.posterUrl ? (
                        <img
                            src={media.posterUrl}
                            alt={media.title}
                            className="h-24 w-16 rounded-lg object-cover border border-zinc-800"
                        />
                    ) : (
                        <div className="h-24 w-16 rounded-lg bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                            No Poster
                        </div>
                    )}
                    <div>
                        <span className="inline-block rounded bg-zinc-800 px-2 py-0.5 text-[11px] uppercase font-semibold text-amber-400 tracking-wider mb-1">
                            {media.source.toUpperCase()} • {media.type.toUpperCase()}
                        </span>
                        <h3 className="text-lg font-bold text-white leading-tight">{media.title}</h3>
                        {media.releaseDate && (
                            <p className="text-xs text-zinc-400 mt-1">{media.releaseDate.split('-')[0]}</p>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-400">
                        {error}
                    </div>
                )}

                {/* Status Selector */}
                <div className="mb-5">
                    <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">Status</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
                            { id: 'watching', label: 'Watching', icon: Play },
                            { id: 'watched', label: 'Watched', icon: CheckCircle2 },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setStatus(id as WatchStatus)}
                                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition ${status === id
                                        ? 'bg-amber-500 text-black shadow-md'
                                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Star Rating */}
                <div className="mb-5">
                    <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">Your Rating</label>
                    <StarRating value={rating} onChange={setRating} size={24} />
                </div>

                {/* Notes / Review */}
                <div className="mb-6">
                    <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">Notes / Review</label>
                    <textarea
                        rows={3}
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Write your thoughts..."
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save to Library
                    </button>
                </div>
            </div>
        </div>
    );
}