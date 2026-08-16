import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // 'json' or 'csv'

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user media records
    const { data, error } = await supabase
        .from('user_media')
        .select(`
      id,
      status,
      rating,
      review,
      progress,
      is_favorite,
      watched_at,
      created_at,
      media:media_id (
        external_id,
        source,
        type,
        title,
        release_date,
        runtime,
        genres
      )
    `)
        .eq('user_id', user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const exportData = (data || []).map((item: any) => ({
        title: item.media?.title || 'Unknown',
        type: item.media?.type || 'unknown',
        source: item.media?.source || 'unknown',
        status: item.status,
        rating: item.rating ? Number(item.rating) : null,
        review: item.review || '',
        watched_at: item.watched_at || '',
        release_date: item.media?.release_date || '',
        runtime_minutes: item.media?.runtime || 0,
        genres: (item.media?.genres || []).join('; '),
        created_at: item.created_at,
    }));

    if (format === 'csv') {
        // Convert to CSV
        const headers = ['Title', 'Type', 'Source', 'Status', 'Rating', 'Review', 'Watched At', 'Release Date', 'Runtime (min)', 'Genres'];
        const rows = exportData.map((d) => [
            `"${d.title.replace(/"/g, '""')}"`,
            d.type,
            d.source,
            d.status,
            d.rating || '',
            `"${d.review.replace(/"/g, '""')}"`,
            d.watched_at,
            d.release_date,
            d.runtime_minutes,
            `"${d.genres}"`,
        ]);

        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="logit_backup_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    }

    // Default JSON format
    return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="logit_backup_${new Date().toISOString().split('T')[0]}.json"`,
        },
    });
}