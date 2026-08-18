import { UnifiedMediaItem } from '@/types/media';

const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';
const OMDB_API_URL = 'https://www.omdbapi.com/';

// Expanded popular lists as fallback
const POPULAR_MOVIES_LIST = [
    'Dune: Part Two',
    'Oppenheimer',
    'Interstellar',
    'Inception',
    'Blade Runner 2049',
    'Parasite',
    'Spider-Man: Across the Spider-Verse',
    'The Batman',
    'Everything Everywhere All at Once',
    'Whiplash',
    'Fight Club',
    'Spirited Away',
];

const POPULAR_SHOWS_LIST = [
    'Severance',
    'Shogun',
    'Breaking Bad',
    'The Last of Us',
    'Stranger Things',
    'Dark',
    'Succession',
    'Arcane',
    'Chernobyl',
    'Better Call Saul',
    'Fargo',
    'Mindhunter',
];

export async function getTrendingMedia(): Promise<{
    all: UnifiedMediaItem[];
    movies: UnifiedMediaItem[];
    tv: UnifiedMediaItem[];
    anime: UnifiedMediaItem[];
}> {
    const tmdbKey = process.env.TMDB_API_KEY;
    const omdbKey = process.env.OMDB_API_KEY;
    const isV3Key = tmdbKey && !tmdbKey.startsWith('ey');

    let movies: UnifiedMediaItem[] = [];
    let tv: UnifiedMediaItem[] = [];
    let anime: UnifiedMediaItem[] = [];

    // 1. Fetch Trending Anime (Up to 15)
    try {
        const anilistRes = await fetch(ANILIST_GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                query: `
          query {
            Page(page: 1, perPage: 15) {
              media(type: ANIME, sort: TRENDING_DESC) {
                id
                title { english romaji }
                coverImage { extraLarge }
                startDate { year }
                genres
              }
            }
          }
        `,
            }),
            next: { revalidate: 21600 },
        });

        if (anilistRes.ok) {
            const animeData = await anilistRes.json();
            anime = (animeData.data?.Page?.media || []).map((item: any) => ({
                id: `anilist-${item.id}`,
                externalId: item.id.toString(),
                source: 'anilist' as const,
                type: 'anime' as const,
                title: item.title?.english || item.title?.romaji || 'Trending Anime',
                posterUrl: item.coverImage?.extraLarge || null,
                backdropUrl: null,
                description: null,
                releaseDate: item.startDate?.year ? `${item.startDate.year}` : null,
                runtime: 24,
                genres: item.genres || [],
            }));
        }
    } catch (e) {
        console.error('AniList trending error:', e);
    }

    // 2. Try TMDB Trending Movies & TV (Up to 15 each)
    try {
        let movieUrl = `${TMDB_API_URL}/trending/movie/week?language=en-US`;
        let tvUrl = `${TMDB_API_URL}/trending/tv/week?language=en-US`;
        if (isV3Key) {
            movieUrl += `&api_key=${tmdbKey}`;
            tvUrl += `&api_key=${tmdbKey}`;
        }

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (tmdbKey && tmdbKey.startsWith('ey')) {
            headers['Authorization'] = `Bearer ${tmdbKey}`;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);

        const [tmdbMovieRes, tmdbTvRes] = await Promise.allSettled([
            fetch(movieUrl, { headers, signal: controller.signal, next: { revalidate: 21600 } }),
            fetch(tvUrl, { headers, signal: controller.signal, next: { revalidate: 21600 } }),
        ]);

        clearTimeout(timeout);

        if (tmdbMovieRes.status === 'fulfilled' && tmdbMovieRes.value.ok) {
            const data = await tmdbMovieRes.value.json();
            movies = (data.results || []).slice(0, 15).map((item: any) => ({
                id: `tmdb-${item.id}`,
                externalId: item.id.toString(),
                source: 'tmdb' as const,
                type: 'movie' as const,
                title: item.title || item.original_title,
                posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
                backdropUrl: item.backdrop_path ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}` : null,
                description: item.overview || null,
                releaseDate: item.release_date || null,
                runtime: 120,
                genres: [],
            }));
        }

        if (tmdbTvRes.status === 'fulfilled' && tmdbTvRes.value.ok) {
            const data = await tmdbTvRes.value.json();
            tv = (data.results || []).slice(0, 15).map((item: any) => ({
                id: `tmdb-${item.id}`,
                externalId: item.id.toString(),
                source: 'tmdb' as const,
                type: 'tv' as const,
                title: item.name || item.original_name,
                posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
                backdropUrl: item.backdrop_path ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}` : null,
                description: item.overview || null,
                releaseDate: item.first_air_date || null,
                runtime: 45,
                genres: [],
            }));
        }
    } catch (e) {
        console.warn('TMDB trending error, using fallback');
    }

    // 3. Fallback to OMDb list if TMDB was unreachable
    if (movies.length === 0 && omdbKey) {
        try {
            const promises = POPULAR_MOVIES_LIST.map(async (title) => {
                const res = await fetch(`${OMDB_API_URL}?apikey=${omdbKey}&t=${encodeURIComponent(title)}&type=movie`, {
                    next: { revalidate: 86400 },
                });
                const d = await res.json();
                if (d.Response === 'True') {
                    return {
                        id: `omdb-${d.imdbID}`,
                        externalId: d.imdbID,
                        source: 'omdb' as const,
                        type: 'movie' as const,
                        title: d.Title,
                        posterUrl: d.Poster && d.Poster !== 'N/A' ? d.Poster : null,
                        backdropUrl: null,
                        description: d.Plot || null,
                        releaseDate: d.Year || null,
                        runtime: parseInt(d.Runtime || '120', 10) || 120,
                        genres: d.Genre ? d.Genre.split(', ') : [],
                    };
                }
                return null;
            });
            const fetched = await Promise.all(promises);
            movies = fetched.filter(Boolean) as UnifiedMediaItem[];
        } catch (err) {
            console.error('OMDb popular movies error:', err);
        }
    }

    if (tv.length === 0 && omdbKey) {
        try {
            const promises = POPULAR_SHOWS_LIST.map(async (title) => {
                const res = await fetch(`${OMDB_API_URL}?apikey=${omdbKey}&t=${encodeURIComponent(title)}&type=series`, {
                    next: { revalidate: 86400 },
                });
                const d = await res.json();
                if (d.Response === 'True') {
                    return {
                        id: `omdb-${d.imdbID}`,
                        externalId: d.imdbID,
                        source: 'omdb' as const,
                        type: 'tv' as const,
                        title: d.Title,
                        posterUrl: d.Poster && d.Poster !== 'N/A' ? d.Poster : null,
                        backdropUrl: null,
                        description: d.Plot || null,
                        releaseDate: d.Year || null,
                        runtime: 50,
                        genres: d.Genre ? d.Genre.split(', ') : [],
                    };
                }
                return null;
            });
            const fetched = await Promise.all(promises);
            tv = fetched.filter(Boolean) as UnifiedMediaItem[];
        } catch (err) {
            console.error('OMDb popular tv error:', err);
        }
    }

    // Interleave for 'ALL'
    const all: UnifiedMediaItem[] = [];
    const maxLen = Math.max(movies.length, tv.length, anime.length);
    for (let i = 0; i < maxLen; i++) {
        if (movies[i]) all.push(movies[i]);
        if (tv[i]) all.push(tv[i]);
        if (anime[i]) all.push(anime[i]);
    }

    return { all, movies, tv, anime };
}