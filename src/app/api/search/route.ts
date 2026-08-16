import { NextRequest, NextResponse } from 'next/server';
import { searchOMDb } from '@/lib/omdb';
import { searchTMDB } from '@/lib/tmdb';
import { searchAniList } from '@/lib/anilist';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const year = searchParams.get('year') || '';

    if (!query.trim()) {
        return NextResponse.json({ results: [] });
    }

    try {
        let results: any[] = [];

        if (type === 'anime') {
            results = await searchAniList(query);
        } else if (type === 'movie') {
            // Primary OMDb (IMDb) + fallback TMDB
            const [omdb, tmdb] = await Promise.allSettled([
                searchOMDb(query, 'movie', year),
                searchTMDB(query, 'movie', year),
            ]);
            const omdbList = omdb.status === 'fulfilled' ? omdb.value : [];
            const tmdbList = tmdb.status === 'fulfilled' ? tmdb.value : [];
            results = omdbList.length > 0 ? omdbList : tmdbList;
        } else if (type === 'tv') {
            const [omdb, tmdb] = await Promise.allSettled([
                searchOMDb(query, 'series', year),
                searchTMDB(query, 'tv', year),
            ]);
            const omdbList = omdb.status === 'fulfilled' ? omdb.value : [];
            const tmdbList = tmdb.status === 'fulfilled' ? tmdb.value : [];
            results = omdbList.length > 0 ? omdbList : tmdbList;
        } else {
            // 'ALL': Search OMDb + TMDB + AniList simultaneously
            const [omdbMovies, anime] = await Promise.allSettled([
                searchOMDb(query, undefined, year),
                searchAniList(query),
            ]);

            const moviesList = omdbMovies.status === 'fulfilled' ? omdbMovies.value : [];
            const animeList = anime.status === 'fulfilled' ? anime.value : [];

            results = [...moviesList, ...animeList];
        }

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error('Search API error:', error);
        return NextResponse.json({ results: [] });
    }
}