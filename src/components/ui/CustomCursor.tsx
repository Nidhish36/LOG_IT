'use client';

import React, { useEffect, useState } from 'react';

export function CustomCursor() {
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isPointer, setIsPointer] = useState(false);
    const [hidden, setHidden] = useState(true);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setHidden(false);

            const target = e.target as HTMLElement;
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.closest('button') ||
                target.closest('a') ||
                target.getAttribute('role') === 'button'
            ) {
                setIsPointer(true);
            } else {
                setIsPointer(false);
            }
        };

        const onMouseLeave = () => setHidden(true);

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mouseleave', onMouseLeave);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseleave', onMouseLeave);
        };
    }, []);

    if (hidden) return null;

    return (
        <div
            className="pointer-events-none fixed z-[9999] transition-transform duration-75 ease-out hidden md:block"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-50%, -50%)',
            }}
        >
            {/* Crisp Solid Dot with High-Contrast Border */}
            <div
                className={`rounded-full border transition-all duration-150 ${isPointer
                        ? 'h-4 w-4 bg-white border-black shadow-[0_0_8px_rgba(255,255,255,0.9)] dark:bg-white dark:border-black'
                        : 'h-2.5 w-2.5 bg-white border-black/80 shadow-[0_0_6px_rgba(255,255,255,0.7)] dark:bg-white dark:border-black/80'
                    }`}
            />
        </div>
    );
}