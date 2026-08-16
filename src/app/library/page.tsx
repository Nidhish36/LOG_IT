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
            <main className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center font-mono">
                <h2 className="text-2xl font-bold mb-2">AUTH_REQUIRED</h2>
                <p className="text-zinc-500 mb-6 text-sm">Please sign in to access your tracking database.</p>
                <Link href="/auth/login" className="rounded-full bg-black text-white dark:bg-white dark:text-black px-6 py-2 text-xs font-bold uppercase tracking-wider">
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
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-dot text-2xl sm:text-3xl font-bold tracking-wider text-zinc-900 dark:text-white">
                        YOUR LIBRARY
                    </h1>
                    <p className="text-xs font-mono text-zinc-500 mt-1">[{records.length} ITEMS_INDEXED]</p>
                </div>

                {/* Filter Navigation */}
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {/* Status */}
                    <div className="flex rounded-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-1">
                        {['all', 'watching', 'watched', 'watchlist'].map((s) => (
                            <Link
                                key={s}
                                href={`/library?type=${typeFilter}&status=${s}&sort=${sortBy}`}
                                className={`rounded-full px-3 py-1 font-bold uppercase text-[10px] tracking-wider transition ${statusFilter === s
                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                                    }`}
                            >
                                {s}
                            </Link>
                        ))}
                    </div>

                    {/* Type */}
                    <div className="flex rounded-full bg-black/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-1">
                        {[
                            { id: 'all', label: 'ALL' },
                            { id: 'movie', label: 'MOVIES' },
                            { id: 'tv', label: 'TV' },
                            { id: 'anime', label: 'ANIME' },
                        ].map((t) => (
                            <Link
                                key={t.id}
                                href={`/library?type=${t.id}&status=${statusFilter}&sort=${sortBy}`}
                                className={`rounded-full px-3 py-1 font-bold uppercase text-[10px] tracking-wider transition ${typeFilter === t.id
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

            {records.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {records.map((record) => (
                        <MediaCard key={record.id} record={record} />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-black/20 dark:border-white/20 p-12 text-center text-xs font-mono text-zinc-500">
                    NO_MATCHING_RECORDS
                </div>
            )}
        </main>
    );
}