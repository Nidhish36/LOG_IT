'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { UnifiedMediaItem, WatchStatus } from '@/types/media';

export async function upsertUserMedia(
    media: UnifiedMediaItem,
    details: {
        status: WatchStatus;
        rating?: number | null;
        review?: string;
        progress?: number;
        isFavorite?: boolean;
        watchedAt?: string;
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Authentication required' };
    }

    try {
        // 1. Ensure media item exists in 'media' table cache
        const { data: existingMedia, error: selectErr } = await supabase
            .from('media')
            .select('id')
            .eq('external_id', media.externalId)
            .eq('source', media.source)
            .maybeSingle();

        let mediaId = existingMedia?.id;

        if (!mediaId) {
            const { data: insertedMedia, error: insertErr } = await supabase
                .from('media')
                .insert({
                    external_id: media.externalId,
                    source: media.source,
                    type: media.type,
                    title: media.title,
                    poster_url: media.posterUrl,
                    backdrop_url: media.backdropUrl,
                    description: media.description,
                    release_date: media.releaseDate,
                    runtime: media.runtime || 0,
                    total_episodes: media.totalEpisodes || 0,
                    genres: media.genres || [],
                })
                .select('id')
                .single();

            if (insertErr) {
                console.error('Error caching media:', insertErr);
                return { error: 'Failed to register media item in cache' };
            }
            mediaId = insertedMedia.id;
        }

        // 2. Upsert user media tracking record
        const { error: userMediaErr } = await supabase.from('user_media').upsert(
            {
                user_id: user.id,
                media_id: mediaId,
                status: details.status,
                rating: details.rating ?? null,
                review: details.review ?? null,
                progress: details.progress ?? 0,
                is_favorite: details.isFavorite ?? false,
                watched_at: details.status === 'watched' ? (details.watchedAt || new Date().toISOString()) : null,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,media_id' }
        );

        if (userMediaErr) {
            console.error('Error tracking user media:', userMediaErr);
            return { error: userMediaErr.message };
        }

        revalidatePath('/');
        revalidatePath('/library');
        revalidatePath('/stats');
        return { success: true };
    } catch (err: any) {
        console.error('Unexpected upsert error:', err);
        return { error: err.message || 'Server error' };
    }
}

export async function removeUserMedia(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('user_media')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Delete user media error:', error);
        return { error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/library');
    revalidatePath('/stats');
    return { success: true };
}

// Export alias for deleteUserMedia
export const deleteUserMedia = removeUserMedia;