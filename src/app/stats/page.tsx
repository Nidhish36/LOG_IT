import { createClient } from '@/lib/supabase/server';
import { UserMediaRecord } from '@/types/media';
import Link from 'next/link';
import { Film, Tv, Sparkles, Clock, Star, Download, BarChart2, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <main className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center font-mono-sharp">
                <h2 className="text-2xl font-black mb-2">AUTHENTICATION_REQUIRED</h2>
                <p className="text-zinc-500 mb-6 text-xs">Please sign in to view your analytics.</p>
                <Link href="/auth/login" className="sharp-btn bg-black text-white dark:bg-white dark:text-black px-6 py-2 text-xs font-bold uppercase tracking-wider">
                    Sign In
                </Link>
            </main>
        );
    }

    const { data: rawUserMedia } = await supabase
        .from('user_media')
        .select(`
      id,
      user_id,
      media_id,
      status,
      rating,
      review,
      progress,
      is_favorite,
      watched_at,
      created_at,
      updated_at,
      media:media_id (
        id,
        external_id,
        source,
        type,
        title,
        poster_url,
        backdrop_url,
        description,
        release_date,
        runtime,
        total_episodes,
        genres
      )
    `);

    const records: UserMediaRecord[] = (rawUserMedia || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        mediaId: item.media_id,
        status: item.status,
        rating: item.rating ? Number(item.rating) : null,
        review: item.review,
        progress: item.progress || 0,
        isFavorite: item.is_favorite || false,
        watchedAt: item.watched_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        media: {
            id: item.media?.id || '',
            externalId: item.media?.external_id || '',
            source: item.media?.source || 'omdb',
            type: item.media?.type || 'movie',
            title: item.media?.title || 'Untitled',
            posterUrl: item.media?.poster_url || null,
            backdropUrl: item.media?.backdrop_url || null,
            description: item.media?.description || null,
            releaseDate: item.media?.release_date || null,
            runtime: item.media?.runtime || 0,
            totalEpisodes: item.media?.total_episodes || 0,
            genres: item.media?.genres || [],
        },
    }));

    const watchedItems = records.filter((r) => r.status === 'watched');
    const watchingItems = records.filter((r) => r.status === 'watching');
    const watchlistItems = records.filter((r) => r.status === 'watchlist');

    const moviesWatched = watchedItems.filter((r) => r.media.type === 'movie').length;
    const seriesWatched = watchedItems.filter((r) => r.media.type === 'tv').length;
    const animeWatched = watchedItems.filter((r) => r.media.type === 'anime').length;

    // Accurate Watch Time Calculation with smart defaults
    let totalMinutes = 0;

    // 1. Calculate from watched items
    watchedItems.forEach((r) => {
        if (r.media.type === 'movie') {
            totalMinutes += r.media.runtime > 0 ? r.media.runtime : 115; // default 1h 55m for movie
        } else if (r.media.type === 'tv') {
            const epCount = r.progress > 0 ? r.progress : (r.media.totalEpisodes || 10);
            const epRuntime = r.media.runtime > 0 ? r.media.runtime : 45; // default 45m per TV episode
            totalMinutes += epCount * epRuntime;
        } else if (r.media.type === 'anime') {
            const epCount = r.progress > 0 ? r.progress : (r.media.totalEpisodes || 12);
            const epRuntime = r.media.runtime > 0 ? r.media.runtime : 24; // default 24m per anime episode
            totalMinutes += epCount * epRuntime;
        }
    });

    // 2. Add progress from currently watching items
    watchingItems.forEach((r) => {
        if (r.progress > 0) {
            const epRuntime = r.media.type === 'anime' ? 24 : 45;
            totalMinutes += r.progress * (r.media.runtime > 0 ? r.media.runtime : epRuntime);
        }
    });

    const totalDays = Math.floor(totalMinutes / (24 * 60));
    const totalHours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const remainingMinutes = totalMinutes % 60;

    // Average Rating
    const ratedItems = records.filter((r) => r.rating !== null);
    const avgRating = ratedItems.length
        ? (ratedItems.reduce((acc, r) => acc + (r.rating || 0), 0) / ratedItems.length).toFixed(1)
        : '—';

    // Genre Breakdown
    const genreCount: Record<string, number> = {};
    watchedItems.forEach((r) => {
        (r.media.genres || []).forEach((g) => {
            genreCount[g] = (genreCount[g] || 0) + 1;
        });
    });

    const topGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 font-mono-sharp select-none">
            {/* Page Header & Export Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/15 dark:border-white/15 pb-4 mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                        <BarChart2 className="h-4 w-4 text-black dark:text-white" />
                        <span>[ANALYTICS_DASHBOARD]</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white uppercase tracking-tight">
                        Watch Statistics
                    </h1>
                </div>

                {/* Data Export Buttons */}
                <div className="flex items-center gap-2">
                    <a
                        href="/api/export?format=json"
                        download="log_it_export.json"
                        className="sharp-btn bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-90 transition"
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span>EXPORT_JSON</span>
                    </a>
                    <a
                        href="/api/export?format=csv"
                        download="log_it_export.csv"
                        className="sharp-btn border border-black/30 dark:border-white/30 bg-white text-black dark:bg-black dark:text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-80 transition"
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span>EXPORT_CSV</span>
                    </a>
                </div>
            </div>

            {/* Main Watch Time Hero Card */}
            <div className="sharp-card bg-white dark:bg-black p-6 sm:p-8 mb-8 border-2 border-black dark:border-white">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <Clock className="h-4 w-4 text-black dark:text-white" />
                        TOTAL_LIFETIME_WATCH_TIME
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400">[CALCULATED_RUNTIME]</span>
                </div>

                <div className="flex flex-wrap items-baseline gap-3 my-2">
                    {totalDays > 0 && (
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl sm:text-6xl font-black text-black dark:text-white">{totalDays}</span>
                            <span className="text-sm font-bold text-zinc-500 uppercase">DAYS</span>
                        </div>
                    )}
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-6xl font-black text-black dark:text-white">{totalHours}</span>
                        <span className="text-sm font-bold text-zinc-500 uppercase">HOURS</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-6xl font-black text-black dark:text-white">{remainingMinutes}</span>
                        <span className="text-sm font-bold text-zinc-500 uppercase">MINS</span>
                    </div>
                </div>

                <p className="text-xs text-zinc-500 mt-2">
                    Total minutes watched across movies, television series, and anime.
                </p>
            </div>

            {/* Quick Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="sharp-card bg-white dark:bg-black p-5 flex flex-col justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                        MOVIES_WATCHED
                    </span>
                    <p className="text-3xl font-black text-black dark:text-white">{moviesWatched}</p>
                </div>

                <div className="sharp-card bg-white dark:bg-black p-5 flex flex-col justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                        SERIES_COMPLETED
                    </span>
                    <p className="text-3xl font-black text-black dark:text-white">{seriesWatched}</p>
                </div>

                <div className="sharp-card bg-white dark:bg-black p-5 flex flex-col justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                        ANIME_WATCHED
                    </span>
                    <p className="text-3xl font-black text-black dark:text-white">{animeWatched}</p>
                </div>

                <div className="sharp-card bg-white dark:bg-black p-5 flex flex-col justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1">
                        AVG_RATING
                    </span>
                    <p className="text-3xl font-black text-black dark:text-white flex items-center gap-1.5">
                        {avgRating} {avgRating !== '—' && <Star className="h-5 w-5 fill-black dark:fill-white text-black dark:text-white" />}
                    </p>
                </div>
            </div>

            {/* Top Genres Breakdown */}
            <div className="sharp-card bg-white dark:bg-black p-6">
                <h2 className="text-sm font-black uppercase tracking-wider text-black dark:text-white mb-4 border-b border-black/10 dark:border-white/10 pb-2">
                    Top Watched Genres
                </h2>

                {topGenres.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {topGenres.map(([genre, count], idx) => (
                            <div
                                key={genre}
                                className="border border-black/15 dark:border-white/15 p-3 flex items-center justify-between bg-black/5 dark:bg-white/5"
                            >
                                <span className="text-xs font-bold uppercase text-black dark:text-white">
                                    0{idx + 1}. {genre}
                                </span>
                                <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-[10px] font-black">
                                    {count}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 border border-dashed border-black/15 dark:border-white/15 text-center text-xs text-zinc-500">
                        [LOG_MORE_MEDIA_TO_CALCULATE_GENRE_ANALYTICS]
                    </div>
                )}
            </div>
        </main>
    );
}