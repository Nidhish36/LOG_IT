import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { ThemeCat } from '@/components/ui/ThemeCat';
import { CustomCursor } from '@/components/ui/CustomCursor';

export const metadata: Metadata = {
    title: 'LOG_IT — Track Movies, TV Series & Anime',
    description: 'Minimalist monochrome tracking for movies, TV series, and anime.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen flex flex-col antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
                <CustomCursor />
                <Navbar />
                <div className="flex-1">{children}</div>
                <ThemeCat />
            </body>
        </html>
    );
}