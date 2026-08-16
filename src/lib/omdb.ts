import { UnifiedMediaItem } from '@/types/media';

const OMDB_API_URL = 'https://www.omdbapi.com/';

export async function searchOMDb(query: string, type?: 'movie' | 'series', year?: string): Promise<UnifiedMediaItem[]> {
    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
        console.warn('OMDB_API_KEY is not set');
        return [];
    }

    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    let url = `${OMDB_API_URL}?apikey=${apiKey}&s=${encodeURIComponent(cleanQuery)}`;

    if (type) {
        url += `&type=${type}`;
    }
    if (year && year.trim()) {
        url += `&y=${year.trim()}`;
    }

    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return [];

        const data = await res.json();
        if (data.Response === 'False' || !data.Search) {
            return [];
        }

        return data.Search.map((item: any) => ({
            id: `omdb-${item.imdbID}`,
            externalId: item.imdbID,
            source: 'omdb' as any,
            type: item.Type === 'series' ? 'tv' : 'movie',
            title: item.Title,
            posterUrl: item.Poster && item.Poster !== 'N/A' ? item.Poster : null,
            backdropUrl: null,
            description: null,
            releaseDate: item.Year ? item.Year.split('–')[0] : null,
            runtime: 0,
            genres: [],
        }));
    } catch (err) {
        console.error('OMDb search error:', err);
        return [];
    }
}

export async function getOMDbDetails(imdbId: string): Promise<UnifiedMediaItem> {
    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) throw new Error('OMDB_API_KEY is missing');

    const res = await fetch(`${OMDB_API_URL}?apikey=${apiKey}&i=${imdbId}&plot=full`, { cache: 'no-store' });
    const data = await res.json();

    if (data.Response === 'False') {
        throw new Error(data.Error || 'Media not found on OMDb');
    }

    const runtimeMinutes = parseInt(data.Runtime || '0', 10) || 0;
    const genres = data.Genre && data.Genre !== 'N/A' ? data.Genre.split(', ') : [];

    return {
        id: `omdb-${data.imdbID}`,
        externalId: data.imdbID,
        source: 'omdb' as any,
        type: data.Type === 'series' ? 'tv' : 'movie',
        title: data.Title,
        posterUrl: data.Poster && data.Poster !== 'N/A' ? data.Poster : null,
        backdropUrl: null,
        description: data.Plot && data.Plot !== 'N/A' ? data.Plot : null,
        releaseDate: data.Released && data.Released !== 'N/A' ? data.Released : data.Year,
        runtime: runtimeMinutes,
        totalEpisodes: data.totalSeasons ? parseInt(data.totalSeasons, 10) : undefined,
        genres,
    };
}