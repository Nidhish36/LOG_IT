'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { UnifiedMediaItem, WatchStatus } from '@/types/media';

export interface SaveMediaInput {
    media: UnifiedMediaItem;
    status: WatchStatus;
    rating?: number | null;
    review?: string | null;
    progress?: number;
    watchedAt?: string | null;
    isFavorite?: boolean;
}

export async function saveUserMedia(input: SaveMediaInput) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error('You must be logged in to save items to your library.');
    }

    // 1. Cache media details in public.media
    const { data: mediaRecord, error: mediaError } = await supabase
        .from('media')
        .upsert(
            {
                external_id: input.media.externalId,
                source: input.media.source,
                type: input.media.type,
                title: input.media.title,
                poster_url: input.media.posterUrl,
                backdrop_url: input.media.backdropUrl,
                description: input.media.description,
                release_date: input.media.releaseDate,
                runtime: input.media.runtime || 0,
                total_episodes: input.media.totalEpisodes || 0,
                genres: input.media.genres || [],
            },
            { onConflict: 'external_id,source' }
        )
        .select('id')
        .single();

    if (mediaError || !mediaRecord) {
        console.error('Media upsert error:', mediaError);
        throw new Error('Failed to cache media item.');
    }

    // 2. Upsert user's tracking entry
    const { error: userMediaError } = await supabase
        .from('user_media')
        .upsert(
            {
                user_id: user.id,
                media_id: mediaRecord.id,
                status: input.status,
                rating: input.rating || null,
                review: input.review || null,
                progress: input.progress || 0,
                watched_at: input.status === 'watched' ? (input.watchedAt || new Date().toISOString().split('T')[0]) : null,
                is_favorite: input.isFavorite || false,
            },
            { onConflict: 'user_id,media_id' }
        );

    if (userMediaError) {
        console.error('User media upsert error:', userMediaError);
        throw new Error('Failed to update library.');
    }

    revalidatePath('/');
    revalidatePath('/library');
    revalidatePath('/stats');
    return { success: true };
}

export async function removeUserMedia(mediaId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('user_media')
        .delete()
        .eq('user_id', user.id)
        .eq('media_id', mediaId);

    if (error) throw new Error('Failed to remove item');

    revalidatePath('/');
    revalidatePath('/library');
    revalidatePath('/stats');
    return { success: true };
}