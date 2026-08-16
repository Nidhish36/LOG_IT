import { UnifiedMediaItem } from '@/types/media';

const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

function getHeaders(): Record<string, string> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
        throw new Error('TMDB_API_KEY is not configured in .env.local');
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (apiKey.startsWith('ey')) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    return headers;
}

export async function searchTMDB(
    query: string,
    type: 'movie' | 'tv' | 'multi' = 'multi',
    year?: string
): Promise<UnifiedMediaItem[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const apiKey = process.env.TMDB_API_KEY;
    const isV3Key = apiKey && !apiKey.startsWith('ey');

    const endpoint = type === 'multi' ? '/search/multi' : `/search/${type}`;
    let url = `${TMDB_API_URL}${endpoint}?query=${encodeURIComponent(cleanQuery)}&include_adult=false&language=en-US`;

    if (isV3Key) {
        url += `&api_key=${apiKey}`;
    }

    if (year && year.trim()) {
        if (type === 'movie') {
            url += `&primary_release_year=${year.trim()}`;
        } else if (type === 'tv') {
            url += `&first_air_date_year=${year.trim()}`;
        } else {
            url += `&year=${year.trim()}`;
        }
    }

    try {
        const res = await fetch(url, {
            headers: getHeaders(),
            cache: 'no-store', // Always fetch live results without stale empty cache
        });

        if (!res.ok) {
            console.error(`TMDB search error [${res.status}]:`, await res.text());
            return [];
        }

        const data = await res.json();
        const rawResults = data.results || [];

        return rawResults
            .filter((item: any) => {
                if (type === 'movie' || type === 'tv') return true;
                return item.media_type === 'movie' || item.media_type === 'tv';
            })
            .map((item: any) => {
                const isMovie = type === 'movie' ? true : type === 'tv' ? false : item.media_type === 'movie';
                return {
                    id: `tmdb-${item.id}`,
                    externalId: item.id.toString(),
                    source: 'tmdb' as const,
                    type: (isMovie ? 'movie' : 'tv') as 'movie' | 'tv',
                    title: isMovie ? (item.title || item.original_title) : (item.name || item.original_name),
                    posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
                    backdropUrl: item.backdrop_path ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}` : null,
                    description: item.overview || null,
                    releaseDate: isMovie ? item.release_date || null : item.first_air_date || null,
                    runtime: 0,
                    genres: [],
                };
            });
    } catch (error) {
        console.error('TMDB fetch exception:', error);
        return [];
    }
}

export async function getTMDBDetails(id: string, type: 'movie' | 'tv'): Promise<UnifiedMediaItem> {
    const apiKey = process.env.TMDB_API_KEY;
    const isV3Key = apiKey && !apiKey.startsWith('ey');
    const url = `${TMDB_API_URL}/${type}/${id}?append_to_response=credits&language=en-US${isV3Key ? `&api_key=${apiKey}` : ''}`;

    const res = await fetch(url, {
        headers: getHeaders(),
        cache: 'no-store',
    });

    if (!res.ok) throw new Error(`TMDB details failed: ${res.statusText}`);
    const data = await res.json();
    const isMovie = type === 'movie';

    return {
        id: `tmdb-${data.id}`,
        externalId: data.id.toString(),
        source: 'tmdb',
        type,
        title: isMovie ? (data.title || data.original_title) : (data.name || data.original_name),
        posterUrl: data.poster_path ? `${TMDB_IMAGE_BASE}/w500${data.poster_path}` : null,
        backdropUrl: data.backdrop_path ? `${TMDB_IMAGE_BASE}/original${data.backdrop_path}` : null,
        description: data.overview || null,
        releaseDate: isMovie ? data.release_date || null : data.first_air_date || null,
        runtime: isMovie ? (data.runtime || 0) : ((data.episode_run_time?.[0] || 45) * (data.number_of_episodes || 1)),
        totalEpisodes: !isMovie ? data.number_of_episodes : undefined,
        genres: (data.genres || []).map((g: any) => g.name),
    };
}