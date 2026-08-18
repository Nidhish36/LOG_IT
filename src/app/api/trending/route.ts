import { NextResponse } from 'next/server';
import { getTrendingMedia } from '@/lib/trending';

export async function GET() {
    try {
        const data = await getTrendingMedia();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error('Trending API error:', err);
        return NextResponse.json({ all: [], movies: [], tv: [], anime: [] });
    }
}