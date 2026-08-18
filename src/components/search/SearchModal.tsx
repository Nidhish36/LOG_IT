'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Plus, Film, Tv, Sparkles } from 'lucide-react';
import { UnifiedMediaItem } from '@/types/media';
import { MediaActionModal } from '@/components/media/MediaActionModal';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [type, setType] = useState<'all' | 'movie' | 'tv' | 'anime'>('all');
    const [year, setYear] = useState('');
    const [results, setResults] = useState<UnifiedMediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<UnifiedMediaItem | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery('');
            setResults([]);
            setYear('');
        }
    }, [isOpen]);

    // Handle global ⌘K shortcut
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
                else {
                    // Open search modal
                    const btn = document.querySelector('[data-search-trigger]') as HTMLButtonElement;
                    btn?.click();
                }
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Debounced search trigger
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    q: query.trim(),
                    type,
                });
                if (year.trim()) params.set('year', year.trim());

                const res = await fetch(`/api/search?${params.toString()}`);
                const data = await res.json();
                setResults(data.results || []);
            } catch (err) {
                console.error('Search error:', err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, type, year]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 sm:pt-20 bg-black/80 backdrop-blur-sm select-none">
            <div className="sharp-card relative w-full max-w-2xl bg-white dark:bg-black p-4 sm:p-6 font-mono-sharp text-black dark:text-white border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
                {/* Header & Close */}
                <div className="flex items-center justify-between border-b border-black/15 dark:border-white/15 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-black dark:text-white" />
                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                            GLOBAL_DATABASE_SEARCH
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-zinc-500 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Search Inputs */}
                <div className="space-y-3 mb-4">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Type title (e.g. Inception, Attack on Titan, Severance)..."
                            className="w-full border border-black/20 dark:border-white/20 bg-black/5 dark:bg-zinc-950 px-4 py-2.5 text-xs text-black dark:text-white placeholder-zinc-500 focus:border-black dark:focus:border-white focus:outline-none"
                        />
                        {loading && (
                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-zinc-400" />
                        )}
                    </div>

                    {/* Type Filter Pills & Year Filter */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex border border-black/20 dark:border-white/20 bg-white dark:bg-black p-0.5">
                            {[
                                { id: 'all', label: 'ALL' },
                                { id: 'movie', label: 'MOVIES' },
                                { id: 'tv', label: 'TV' },
                                { id: 'anime', label: 'ANIME' },
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setType(t.id as any)}
                                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition ${type === t.id
                                            ? 'bg-black text-white dark:bg-white dark:text-black'
                                            : 'text-zinc-500 hover:text-black dark:hover:text-white'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-zinc-500">YEAR:</span>
                            <input
                                type="text"
                                maxLength={4}
                                value={year}
                                onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))}
                                placeholder="YYYY"
                                className="w-16 border border-black/20 dark:border-white/20 bg-black/5 dark:bg-zinc-950 px-2 py-1 text-[10px] text-center text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Results List */}
                <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {results.length > 0 ? (
                        results.map((item) => (
                            <div
                                key={`${item.source}-${item.externalId}`}
                                className="flex items-center justify-between gap-3 border border-black/15 dark:border-white/15 p-2 bg-black/5 dark:bg-white/5 hover:border-black dark:hover:border-white transition"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative aspect-[3/4] w-10 flex-shrink-0 bg-black border border-black/20 overflow-hidden">
                                        {item.posterUrl ? (
                                            <img
                                                src={item.posterUrl}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[8px] text-zinc-500">
                                                NO_IMG
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className="bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.2 text-[8px] font-bold uppercase">
                                                {item.type}
                                            </span>
                                            <span className="text-[9px] text-zinc-500 uppercase font-bold">
                                                [{item.source}]
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-xs text-black dark:text-white truncate">
                                            {item.title}
                                        </h3>
                                        <p className="text-[10px] text-zinc-500">
                                            {item.releaseDate ? item.releaseDate.split('-')[0] : 'Year N/A'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedMedia(item)}
                                    className="sharp-btn bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-[10px] font-bold uppercase flex items-center gap-1 hover:opacity-80 transition flex-shrink-0"
                                >
                                    <Plus className="h-3 w-3" />
                                    <span>ADD</span>
                                </button>
                            </div>
                        ))
                    ) : query.trim() ? (
                        !loading && (
                            <div className="p-8 border border-dashed border-black/20 dark:border-white/20 text-center text-xs text-zinc-500">
                                [NO_MATCHING_MEDIA_FOUND]
                            </div>
                        )
                    ) : (
                        <div className="p-8 border border-dashed border-black/20 dark:border-white/20 text-center text-xs text-zinc-500">
                            [START TYPING TO SEARCH OMDB & ANILIST]
                        </div>
                    )}
                </div>
            </div>

            {/* Action Modal */}
            {selectedMedia && (
                <MediaActionModal
                    isOpen={!!selectedMedia}
                    media={selectedMedia}
                    onClose={() => setSelectedMedia(null)}
                />
            )}
        </div>
    );
}