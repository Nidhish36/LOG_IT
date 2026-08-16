'use client';

import React, { useState, useEffect } from 'react';

export function ThemeCat() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [mounted, setMounted] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = (localStorage.getItem('logit-theme') as 'dark' | 'light') || 'dark';
        setTheme(savedTheme);
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('logit-theme', nextTheme);

        if (nextTheme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    };

    if (!mounted) return null;

    const isDark = theme === 'dark';

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end select-none">
            {/* Tooltip */}
            <div
                className={`mb-1.5 rounded-md border border-black/20 dark:border-white/20 bg-white/95 dark:bg-black/95 px-2.5 py-1 text-[10px] font-mono shadow-xl transition-all duration-200 pointer-events-none ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
            >
                <span className="font-bold text-black dark:text-white">
                    {isDark ? '[CLICK: LIGHT MODE]' : '[CLICK: DARK MODE]'}
                </span>
            </div>

            {/* Cat Switcher */}
            <button
                onClick={toggleTheme}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                type="button"
                title="Toggle Theme"
                className="group relative flex items-center justify-center p-2 rounded-2xl border border-black/20 dark:border-white/20 bg-white/60 dark:bg-black/60 backdrop-blur-xl hover:border-black dark:hover:border-white transition-all active:scale-90 shadow-2xl cursor-pointer"
            >
                {/* Sleeping Cat GIF / Vector Sprite */}
                <div className="relative h-14 w-20 flex items-center justify-center overflow-hidden">
                    <img
                        src={
                            isDark
                                ? 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3h2ZHBzZGk5b25sZHF0Zmticnp0ZzF3Nmt2N2FkOHRxb2d0bXhyOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/MDJ9IbxxvDUQM/giphy.gif' // Cute sleeping white cat
                                : 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZhcXkzbGJwMG0yOTgxcjI3bnpldGJjcGV4NmMydzE3MTR2cGhyayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/BzyTuYCmvSORqs1ABM/giphy.gif' // Cute black cat
                        }
                        alt="Theme Cat"
                        className="h-full w-full object-contain filter contrast-125 group-hover:scale-110 transition-transform duration-200"
                    />
                </div>

                {/* Minimal dot indicator */}
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-600 shadow-[0_0_6px_#eb0029]" />
            </button>
        </div>
    );
}