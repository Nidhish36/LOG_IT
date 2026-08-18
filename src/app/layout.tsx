import type { Metadata } from 'next';
import { Space_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { ThemeCat } from '@/components/ui/ThemeCat';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const spaceMono = Space_Mono({
    weight: ['400', '700'],
    subsets: ['latin'],
    variable: '--font-space-mono',
});

export const metadata: Metadata = {
    title: 'LOG_IT // Personal Media Tracker',
    description: 'Minimalist, sharp high-contrast media tracker for movies, TV series, and anime.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${spaceMono.variable} min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-neutral-100 selection:text-neutral-900 bg-grid-dots`}
            >
                <LoadingScreen />
                <CustomCursor />
                <Navbar />
                <div className="min-h-[calc(100vh-4rem)] pb-16">{children}</div>
                <ThemeCat />
            </body>
        </html>
    );
}