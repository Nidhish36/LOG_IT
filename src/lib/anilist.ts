import { UnifiedMediaItem } from '@/types/media';

const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';

const SEARCH_ANIME_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 20) {
    media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
      id
      title {
        english
        romaji
        native
      }
      coverImage {
        extraLarge
        large
      }
      bannerImage
      description(asHtml: false)
      startDate {
        year
        month
        day
      }
      episodes
      duration
      genres
    }
  }
}
`;

export async function searchAniList(query: string): Promise<UnifiedMediaItem[]> {
    if (!query.trim()) return [];

    const res = await fetch(ANILIST_GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
            query: SEARCH_ANIME_QUERY,
            variables: { search: query },
        }),
        next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error('Failed to fetch from AniList');
    const json = await res.json();
    const list = json.data?.Page?.media || [];

    return list.map((item: any) => ({
        id: `anilist-${item.id}`,
        externalId: item.id.toString(),
        source: 'anilist' as const,
        type: 'anime' as const,
        title: item.title.english || item.title.romaji || item.title.native,
        posterUrl: item.coverImage?.extraLarge || item.coverImage?.large || null,
        backdropUrl: item.bannerImage || null,
        description: item.description ? item.description.replace(/<[^>]*>?/gm, '') : null,
        releaseDate: item.startDate?.year ? `${item.startDate.year}-${String(item.startDate.month || 1).padStart(2, '0')}` : null,
        runtime: (item.episodes || 12) * (item.duration || 24),
        totalEpisodes: item.episodes || 0,
        genres: item.genres || [],
    }));
}