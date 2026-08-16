'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    value: number | null;
    onChange?: (val: number) => void;
    readonly?: boolean;
    size?: number;
}

export function StarRating({ value = 0, onChange, readonly = false, size = 18 }: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const rating = hoverRating ?? value ?? 0;

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((starIndex) => {
                const full = rating >= starIndex;
                const half = !full && rating >= starIndex - 0.5;

                return (
                    <div
                        key={starIndex}
                        className={`relative ${!readonly ? 'cursor-pointer' : ''}`}
                        onMouseLeave={() => !readonly && setHoverRating(null)}
                    >
                        {!readonly && (
                            <span
                                className="absolute left-0 top-0 w-1/2 h-full z-10"
                                onMouseEnter={() => setHoverRating(starIndex - 0.5)}
                                onClick={() => onChange?.(starIndex - 0.5)}
                            />
                        )}
                        {!readonly && (
                            <span
                                className="absolute right-0 top-0 w-1/2 h-full z-10"
                                onMouseEnter={() => setHoverRating(starIndex)}
                                onClick={() => onChange?.(starIndex)}
                            />
                        )}

                        <Star
                            size={size}
                            className={`transition-colors ${full
                                    ? 'fill-zinc-900 text-zinc-900 dark:fill-white dark:text-white'
                                    : half
                                        ? 'fill-zinc-900/50 text-zinc-900 dark:fill-white/50 dark:text-white'
                                        : 'text-zinc-300 dark:text-zinc-700'
                                }`}
                        />
                    </div>
                );
            })}
            {value ? (
                <span className="ml-2 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    [{value.toFixed(1)}]
                </span>
            ) : null}
        </div>
    );
}