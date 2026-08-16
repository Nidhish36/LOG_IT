'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2, Plus, Calendar } from 'lucide-react';
import { UnifiedMediaItem } from '@/types/media';
import { MediaActionModal } from '../media/MediaActionModal';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [year, setYear] = useState('');
    const [type, setType] = useState<'all' | 'movie' | 'tv' | 'anime'>('all');
    const [results, setResults] = useState<UnifiedMediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<UnifiedMediaItem | null>(null);

    const performSearch = useCallback(async (searchQuery: string, searchType: string, searchYear: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                q: searchQuery.trim(),
                type: searchType,
                ...(searchYear.trim() ? { year: searchYear.trim() } : {}),
            });

            const res = await fetch(`/api/search?${params.toString()}`);
            const data = await res.json();
            setResults(data.results || []);
        } catch (err) {
            console.error(err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce query changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                performSearch(query, type, year);
            } else {
                setResults([]);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [query, type, year, performSearch]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            performSearch(query, type, year);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-16 backdrop-blur-md">
                <div className="relative w-full max-w-2xl border border-black/20 dark:border-white/20 bg-white dark:bg-black shadow-2xl overflow-hidden">
                    {/* Main Search Input & Year Filter */}
                    <div className="flex items-center border-b border-black/15 dark:border-white/15 px-4 py-3 gap-2">
                        <Search className="h-4 w-4 text-zinc-500 flex-shrink-0" />

                        {/* Title Input */}
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search movie, show, anime title..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent text-black dark:text-white placeholder-zinc-500 focus:outline-none text-sm font-medium"
                        />

                        {/* Optional Year Input */}
                        <div className="flex items-center gap-1 border-l border-black/15 dark:border-white/15 pl-3">
                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Year (e.g. 2014)"
                                maxLength={4}
                                value={year}
                                onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))}
                                onKeyDown={handleKeyDown}
                                className="w-24 bg-transparent text-xs font-mono-sharp text-black dark:text-white placeholder-zinc-500 focus:outline-none"
                            />
                        </div>

                        {loading && <Loader2 className="h-4 w-4 animate-spin text-zinc-400 flex-shrink-0" />}

                        <button
                            onClick={onClose}
                            className="rounded p-1 text-zinc-500 hover:text-black dark:hover:text-white ml-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Type Filters */}
                    <div className="flex gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border-b border-black/10 dark:border-white/10 text-xs font-mono-sharp font-bold">
                        {[
                            { id: 'all', label: 'ALL' },
                            { id: 'movie', label: 'MOVIES' },
                            { id: 'tv', label: 'TV' },
                            { id: 'anime', label: 'ANIME' },
                        ].map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setType(id as any)}
                                className={`px-3 py-1 border transition ${type === id
                                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                        : 'border-transparent text-zinc-500 hover:text-black dark:hover:text-white'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Results List */}
                    <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-black/5 dark:divide-white/5 font-mono-sharp">
                        {results.length > 0 ? (
                            results.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 transition"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {item.posterUrl ? (
                                            <img
                                                src={item.posterUrl}
                                                alt={item.title}
                                                className="h-14 w-10 object-cover flex-shrink-0 border border-black/10 dark:border-white/10"
                                            />
                                        ) : (
                                            <div className="h-14 w-10 bg-zinc-900 border border-white/10 flex items-center justify-center text-[9px] text-zinc-500">
                                                N/A
                                            </div>
                                        )}
                                        <div className="min-w-0 font-sans">
                                            <p className="font-bold text-sm text-black dark:text-white truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-zinc-500 font-mono-sharp mt-0.5">
                                                [{item.source.toUpperCase()}] • {item.type.toUpperCase()} • {item.releaseDate ? item.releaseDate.split('-')[0] : '????'}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedMedia(item)}
                                        className="sharp-btn flex items-center gap-1 bg-black text-white dark:bg-white dark:text-black px-3 py-1 text-xs font-mono-sharp font-bold"
                                    >
                                        <Plus className="h-3 w-3" />
                                        ADD
                                    </button>
                                </div>
                            ))
                        ) : query.trim() && !loading ? (
                            <div className="p-8 text-center text-xs text-zinc-500 font-mono-sharp">
                                [NO_RESULTS_FOUND_FOR: &quot;{query}&quot;]
                            </div>
                        ) : (
                            <div className="p-8 text-center text-xs text-zinc-500 font-mono-sharp">
                                [START_TYPING_TO_SEARCH...]
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <MediaActionModal
                isOpen={Boolean(selectedMedia)}
                media={selectedMedia}
                onClose={() => setSelectedMedia(null)}
            />
        </>
    );
}