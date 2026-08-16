import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Film, Tv, Sparkles, Star, Clock, Download, BarChart2 } from 'lucide-react';

export default async function StatsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <main className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Please sign in</h2>
                <p className="text-zinc-400 mb-6">Sign in to view your watch stats</p>
                <Link href="/auth/login" className="rounded-xl bg-amber-500 px-6 py-2.5 font-semibold text-black">
                    Sign In
                </Link>
            </main>
        );
    }

    const { data: rawUserMedia } = await supabase
        .from('user_media')
        .select(`
      id,
      status,
      rating,
      watched_at,
      media:media_id (
        type,
        runtime,
        genres
      )
    `)
        .eq('user_id', user.id);

    const list = rawUserMedia || [];
    const watched = list.filter((i) => i.status === 'watched');

    const movieCount = watched.filter((i: any) => i.media?.type === 'movie').length;
    const tvCount = watched.filter((i: any) => i.media?.type === 'tv').length;
    const animeCount = watched.filter((i: any) => i.media?.type === 'anime').length;

    const totalRuntimeMinutes = watched.reduce((acc: number, i: any) => acc + (i.media?.runtime || 0), 0);
    const totalDays = Math.floor(totalRuntimeMinutes / (60 * 24));
    const totalHours = Math.floor((totalRuntimeMinutes % (60 * 24)) / 60);

    const ratedItems = list.filter((i) => i.rating !== null);
    const avgRating = ratedItems.length
        ? (ratedItems.reduce((acc, i) => acc + Number(i.rating), 0) / ratedItems.length).toFixed(2)
        : 'N/A';

    // Genre count tally
    const genreTally: { [key: string]: number } = {};
    watched.forEach((item: any) => {
        (item.media?.genres || []).forEach((g: string) => {
            genreTally[g] = (genreTally[g] || 0) + 1;
        });
    });

    const topGenres = Object.entries(genreTally)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    return (
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            {/* Header with Export buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <BarChart2 className="h-8 w-8 text-amber-500" />
                        Watch Statistics
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">Analytics based on your tracking activity</p>
                </div>

                {/* Data Export Buttons */}
                <div className="flex gap-2">
                    <a
                        href="/api/export?format=json"
                        download
                        className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export JSON
                    </a>
                    <a
                        href="/api/export?format=csv"
                        download
                        className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export CSV
                    </a>
                </div>
            </div>

            {/* Main Stat Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-10">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-1">
                        <Film className="h-4 w-4 text-amber-400" />
                        <span>Movies</span>
                    </div>
                    <p className="text-3xl font-black text-white">{movieCount}</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-1">
                        <Tv className="h-4 w-4 text-blue-400" />
                        <span>TV Shows</span>
                    </div>
                    <p className="text-3xl font-black text-white">{tvCount}</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-1">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <span>Anime</span>
                    </div>
                    <p className="text-3xl font-black text-white">{animeCount}</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>Average Rating</span>
                    </div>
                    <p className="text-3xl font-black text-white">{avgRating}</p>
                </div>
            </div>

            {/* Watch Time Breakdown */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-6 w-6 text-emerald-400" />
                    <h2 className="text-lg font-bold text-white">Estimated Total Watch Time</h2>
                </div>
                <p className="text-3xl font-black text-emerald-400">
                    {totalDays} days, {totalHours} hours
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                    Based on standard episode and movie runtime data
                </p>
            </div>

            {/* Top Genres Breakdown */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Most Watched Genres</h2>
                {topGenres.length > 0 ? (
                    <div className="space-y-3">
                        {topGenres.map(([genre, count]) => {
                            const percentage = Math.round((count / (watched.length || 1)) * 100);
                            return (
                                <div key={genre} className="space-y-1">
                                    <div className="flex justify-between text-xs text-zinc-300">
                                        <span className="font-semibold">{genre}</span>
                                        <span className="text-zinc-500">{count} items</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-zinc-500">Track some watched items to see your genre breakdown.</p>
                )}
            </div>
        </main>
    );
}