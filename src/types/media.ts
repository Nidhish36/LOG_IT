export type MediaType = 'movie' | 'tv' | 'anime';
export type MediaSource = 'tmdb' | 'anilist' | 'omdb';
export type WatchStatus = 'watching' | 'watched' | 'watchlist';

export interface UnifiedMediaItem {
    id: string;
    externalId: string;
    source: MediaSource;
    type: MediaType;
    title: string;
    posterUrl: string | null;
    backdropUrl: string | null;
    description: string | null;
    releaseDate: string | null;
    runtime: number;
    totalEpisodes?: number;
    genres: string[];
}

export interface UserMediaRecord {
    id: string;
    userId: string;
    mediaId: string;
    status: WatchStatus;
    rating: number | null;
    review: string | null;
    progress: number;
    isFavorite: boolean;
    watchedAt: string | null;
    createdAt: string;
    updatedAt: string;
    media: UnifiedMediaItem;
}

export interface DashboardStats {
    moviesWatched: number;
    seriesWatched: number;
    animeWatched: number;
    totalWatched: number;
    watchlistCount: number;
    currentlyWatchingCount: number;
    averageRating: number;
    totalWatchTimeMinutes: number;
    topGenres: { genre: string; count: number }[];
}