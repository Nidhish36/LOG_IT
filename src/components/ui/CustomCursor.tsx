'use client';

import React, { useEffect, useRef } from 'react';

export function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let mouseX = -100;
        let mouseY = -100;
        let rafId: number;

        const onMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const updatePosition = () => {
            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
            }
            rafId = requestAnimationFrame(updatePosition);
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        rafId = requestAnimationFrame(updatePosition);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div
            ref={dotRef}
            className="pointer-events-none fixed top-0 left-0 z-[9999] hidden md:block -ml-1.5 -mt-1.5 will-change-transform"
        >
            <div className="h-3 w-3 rounded-full bg-white border border-black/80 shadow-md dark:bg-white dark:border-black" />
        </div>
    );
}