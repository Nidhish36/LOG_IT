import { createClient } from '@/lib/supabase/server';
import { UserMediaRecord } from '@/types/media';
import { MediaCard } from '@/components/media/MediaCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LibraryPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; status?: string; sort?: string }>;
}) {
    const params = await searchParams;
    const typeFilter = params.type || 'all';
    const statusFilter = params.status || 'all';
    const sortBy = params.sort || 'recent';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <main className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center font-mono-sharp">
                <h2 className="text-2xl font-black mb-2">AUTHENTICATION_REQUIRED</h2>
                <p className="text-zinc-500 mb-6 text-xs">Please sign in to access your tracking database.</p>
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
    `)
        .order('updated_at', { ascending: false });

    let records: UserMediaRecord[] = (rawUserMedia || []).map((item: any) => ({
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
            totalEpisodes: item.media?.total_episodes,
            genres: item.media?.genres || [],
        },
    }));

    if (typeFilter !== 'all') {
        records = records.filter((r) => r.media.type === typeFilter);
    }
    if (statusFilter !== 'all') {
        records = records.filter((r) => r.status === statusFilter);
    }

    if (sortBy === 'rating') {
        records.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'title') {
        records.sort((a, b) => a.media.title.localeCompare(b.media.title));
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 font-mono-sharp">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white uppercase">
                        {statusFilter === 'watchlist' ? 'Watchlist' : 'Your Library'}
                    </h1>
                    <p className="text-xs text-zinc-500 mt-1">[{records.length} ITEMS_TRACKED]</p>
                </div>

                {/* Filter Navigation */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Status */}
                    <div className="flex border border-black/20 dark:border-white/20 bg-white dark:bg-black p-0.5">
                        {['all', 'watching', 'watched', 'watchlist'].map((s) => (
                            <Link
                                key={s}
                                href={`/library?type=${typeFilter}&status=${s}&sort=${sortBy}`}
                                className={`px-3 py-1 font-bold uppercase text-[10px] tracking-wider transition ${statusFilter === s
                                        ? 'bg-black text-white dark:bg-white dark:text-black'
                                        : 'text-zinc-500 hover:text-black dark:hover:text-white'
                                    }`}
                            >
                                {s}
                            </Link>
                        ))}
                    </div>

                    {/* Type */}
                    <div className="flex border border-black/20 dark:border-white/20 bg-white dark:bg-black p-0.5">
                        {[
                            { id: 'all', label: 'ALL' },
                            { id: 'movie', label: 'MOVIES' },
                            { id: 'tv', label: 'TV' },
                            { id: 'anime', label: 'ANIME' },
                        ].map((t) => (
                            <Link
                                key={t.id}
                                href={`/library?type=${t.id}&status=${statusFilter}&sort=${sortBy}`}
                                className={`px-3 py-1 font-bold uppercase text-[10px] tracking-wider transition ${typeFilter === t.id
                                        ? 'bg-black text-white dark:bg-white dark:text-black'
                                        : 'text-zinc-500 hover:text-black dark:hover:text-white'
                                    }`}
                            >
                                {t.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Polaroid Gallery Grid */}
            {records.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 pt-2">
                    {records.map((record, idx) => (
                        <MediaCard key={record.id} record={record} index={idx} />
                    ))}
                </div>
            ) : (
                <div className="border border-dashed border-black/20 dark:border-white/20 p-12 text-center text-xs text-zinc-500">
                    [NO_MATCHING_RECORDS_IN_COLLECTION]
                </div>
            )}
        </main>
    );
}