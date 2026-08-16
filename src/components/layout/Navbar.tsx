'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, LogIn } from 'lucide-react';
import { useState } from 'react';
import { SearchModal } from '../search/SearchModal';

export function Navbar() {
    const pathname = usePathname();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/library', label: 'Library' },
        { href: '/library?status=watchlist', label: 'Watchlist' },
        { href: '/stats', label: 'Stats' },
    ];

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b border-black/15 dark:border-white/15 bg-white/90 dark:bg-black/90 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    {/* Bigger, Sharper LOG_IT Logo (No red dot) */}
                    <Link href="/" className="group flex items-center">
                        <span className="font-mono-sharp text-2xl font-black tracking-widest text-black dark:text-white group-hover:tracking-[0.2em] transition-all duration-200">
                            LOG_IT
                        </span>
                    </Link>

                    {/* Centered Sharp Search Bar */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="flex items-center gap-3 w-64 sm:w-80 border border-black/20 dark:border-white/20 bg-black/5 dark:bg-zinc-950 px-4 py-2 text-xs font-mono-sharp text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-white transition-all shadow-sm group"
                    >
                        <Search className="h-4 w-4 text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                        <span className="flex-1 text-left tracking-wide">Search movies, tv, anime...</span>
                        <kbd className="hidden sm:inline-block text-[10px] font-mono-sharp bg-black/10 dark:bg-white/10 px-1.5 py-0.5 text-zinc-700 dark:text-zinc-300 border border-black/10 dark:border-white/10">
                            ⌘K
                        </kbd>
                    </button>

                    {/* Right Navigation */}
                    <nav className="flex items-center gap-1 sm:gap-2">
                        {navLinks.map(({ href, label }) => {
                            const active = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`text-xs font-semibold px-3 py-1.5 transition-all ${active
                                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm font-bold'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {label}
                                </Link>
                            );
                        })}

                        <Link
                            href="/auth/login"
                            className="ml-2 flex items-center gap-1.5 border border-black dark:border-white px-3 py-1.5 text-xs font-mono-sharp font-bold text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                        >
                            <LogIn className="h-3.5 w-3.5" />
                            <span>Auth</span>
                        </Link>
                    </nav>
                </div>
            </header>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}