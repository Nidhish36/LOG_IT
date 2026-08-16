import { createClient } from '@/lib/supabase/server';
import { UserMediaRecord } from '@/types/media';
import { MediaCard } from '@/components/media/MediaCard';
import Link from 'next/link';
import { Film, Tv, Sparkles, Clock, Star, PlusCircle, ArrowUpRight } from 'lucide-react';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <main className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center border-2 border-black dark:border-white mb-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                    <Film className="h-6 w-6 text-black dark:text-white" />
                </div>
                <h1 className="font-mono-sharp text-4xl font-black tracking-tight mb-2 text-black dark:text-white">
                    LOG_IT
                </h1>
                <p className="max-w-md text-sm text-zinc-500 mb-8">
                    Personal high-contrast tracking engine for movies, series & anime.
                </p>
                <Link
                    href="/auth/login"
                    className="sharp-btn bg-black text-white dark:bg-white dark:text-black px-8 py-3 text-xs font-mono-sharp font-bold uppercase tracking-wider"
                >
                    Get Started [Sign In]
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
    `)
        .order('updated_at', { ascending: false });

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
            id: item.media.id,
            externalId: item.media.external_id,
            source: item.media.source,
            type: item.media.type,
            title: item.media.title,
            posterUrl: item.media.poster_url,
            backdropUrl: item.media.backdrop_url,
            description: item.media.description,
            releaseDate: item.media.release_date,
            runtime: item.media.runtime || 0,
            totalEpisodes: item.media.total_episodes,
            genres: item.media.genres || [],
        },
    }));

    const watchedItems = records.filter((r) => r.status === 'watched');
    const watchingItems = records.filter((r) => r.status === 'watching');
    const watchlistItems = records.filter((r) => r.status === 'watchlist');

    const moviesWatched = watchedItems.filter((r) => r.media.type === 'movie').length;
    const seriesWatched = watchedItems.filter((r) => r.media.type === 'tv').length;
    const animeWatched = watchedItems.filter((r) => r.media.type === 'anime').length;

    const totalRuntimeMinutes = watchedItems.reduce((acc, r) => acc + (r.media.runtime || 0), 0);
    const watchDays = Math.floor(totalRuntimeMinutes / (60 * 24));
    const watchHours = Math.floor((totalRuntimeMinutes % (60 * 24)) / 60);

    const ratedItems = records.filter((r) => r.rating !== null);
    const avgRating = ratedItems.length
        ? (ratedItems.reduce((acc, r) => acc + (r.rating || 0), 0) / ratedItems.length).toFixed(1)
        : '—';

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            {/* Interactive Sharp Rectangular Tiles */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-12">
                <Link
                    href="/library?type=movie&status=watched"
                    className="sharp-card bg-white dark:bg-black p-4 flex flex-col justify-between group"
                >
                    <div className="flex items-center justify-between text-zinc-500 mb-2">
                        <span className="font-mono-sharp text-[11px] font-bold uppercase tracking-wider">Movies</span>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="font-mono-sharp text-3xl font-black text-black dark:text-white">{moviesWatched}</p>
                </Link>

                <Link
                    href="/library?type=tv&status=watched"
                    className="sharp-card bg-white dark:bg-black p-4 flex flex-col justify-between group"
                >
                    <div className="flex items-center justify-between text-zinc-500 mb-2">
                        <span className="font-mono-sharp text-[11px] font-bold uppercase tracking-wider">TV Shows</span>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="font-mono-sharp text-3xl font-black text-black dark:text-white">{seriesWatched}</p>
                </Link>

                <Link
                    href="/library?type=anime&status=watched"
                    className="sharp-card bg-white dark:bg-black p-4 flex flex-col justify-between group"
                >
                    <div className="flex items-center justify-between text-zinc-500 mb-2">
                        <span className="font-mono-sharp text-[11px] font-bold uppercase tracking-wider">Anime</span>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="font-mono-sharp text-3xl font-black text-black dark:text-white">{animeWatched}</p>
                </Link>

                <Link
                    href="/stats"
                    className="sharp-card bg-white dark:bg-black p-4 flex flex-col justify-between group"
                >
                    <div className="flex items-center justify-between text-zinc-500 mb-2">
                        <span className="font-mono-sharp text-[11px] font-bold uppercase tracking-wider">Avg Rating</span>
                        <Star className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                    <p className="font-mono-sharp text-3xl font-black text-black dark:text-white">{avgRating}</p>
                </Link>

                <Link
                    href="/stats"
                    className="sharp-card bg-white dark:bg-black p-4 flex flex-col justify-between group"
                >
                    <div className="flex items-center justify-between text-zinc-500 mb-2">
                        <span className="font-mono-sharp text-[11px] font-bold uppercase tracking-wider">Watch Time</span>
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                    <p className="font-mono-sharp text-2xl font-black text-black dark:text-white">
                        {watchDays}d {watchHours}h
                    </p>
                </Link>

                <Link
                    href="/library?status=watchlist"
                    className="sharp-card bg-white dark:bg-black p-4 flex flex-col justify-between group"
                >
                    <div className="flex items-center justify-between text-zinc-500 mb-2">
                        <span className="font-mono-sharp text-[11px] font-bold uppercase tracking-wider">Watchlist</span>
                        <PlusCircle className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                    <p className="font-mono-sharp text-3xl font-black text-black dark:text-white">{watchlistItems.length}</p>
                </Link>
            </div>

            {/* Currently Watching */}
            {watchingItems.length > 0 && (
                <section className="mb-12">
                    <div className="flex items-center justify-between border-b border-black/15 dark:border-white/15 pb-2 mb-6">
                        <h2 className="font-mono-sharp text-lg font-black uppercase tracking-wider text-black dark:text-white">
                            Currently Watching
                        </h2>
                        <Link
                            href="/library?status=watching"
                            className="font-mono-sharp text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white underline underline-offset-4"
                        >
                            View All ({watchingItems.length}) →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {watchingItems.slice(0, 6).map((record) => (
                            <MediaCard key={record.id} record={record} />
                        ))}
                    </div>
                </section>
            )}

            {/* Recently Watched */}
            <section className="mb-12">
                <div className="flex items-center justify-between border-b border-black/15 dark:border-white/15 pb-2 mb-6">
                    <h2 className="font-mono-sharp text-lg font-black uppercase tracking-wider text-black dark:text-white">
                        Recently Watched
                    </h2>
                    <Link
                        href="/library?status=watched"
                        className="font-mono-sharp text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white underline underline-offset-4"
                    >
                        View All ({watchedItems.length}) →
                    </Link>
                </div>
                {watchedItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {watchedItems.slice(0, 6).map((record) => (
                            <MediaCard key={record.id} record={record} />
                        ))}
                    </div>
                ) : (
                    <div className="border border-dashed border-black/20 dark:border-white/20 p-12 text-center text-xs font-mono-sharp text-zinc-500">
                        [NO_WATCHED_ENTRIES_YET. PRESS ⌘K TO SEARCH & ADD MEDIA]
                    </div>
                )}
            </section>
        </main>
    );
}