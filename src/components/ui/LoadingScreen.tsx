'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Triangle } from 'lucide-react';

export function LoadingScreen() {
    const [progress, setProgress] = useState(0);
    const [isStuck, setIsStuck] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [visible, setVisible] = useState(true);
    const [dragProgress, setDragProgress] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    // Smooth, visible 1.4s progression from 0% -> 50%
    useEffect(() => {
        const startTime = Date.now();
        const duration = 1400; // 1.4 seconds to reach 50%

        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const calculated = Math.min(50, Math.floor((elapsed / duration) * 50));
            setProgress(calculated);

            if (calculated >= 50) {
                clearInterval(timer);
                setIsStuck(true);
            }
        }, 25);

        return () => clearInterval(timer);
    }, []);

    // Handle Drag logic from 50% -> 100%
    const handleDrag = (clientX: number) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const pos = clientX - rect.left;
        const pct = Math.max(50, Math.min(100, Math.round((pos / rect.width) * 100)));
        setDragProgress(pct);

        if (pct >= 98) {
            setIsUnlocked(true);
            setDragProgress(100);
            setIsDragging(false);
            setTimeout(() => setVisible(false), 350);
        }
    };

    const onMouseDown = (e: React.MouseEvent) => {
        if (!isStuck) return;
        setIsDragging(true);
        handleDrag(e.clientX);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (isDragging) handleDrag(e.clientX);
    };

    const onMouseUp = () => setIsDragging(false);

    const onTouchMove = (e: React.TouchEvent) => {
        if (isDragging && e.touches.length > 0) handleDrag(e.touches[0].clientX);
    };

    const onTouchEnd = () => setIsDragging(false);

    if (!visible) return null;

    const currentVal = isStuck ? dragProgress : progress;

    return (
        <div
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#000000',
                zIndex: 9999999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-space-mono), monospace',
                color: '#ffffff',
                userSelect: 'none',
                transition: 'opacity 0.3s ease',
                opacity: isUnlocked ? 0 : 1,
                pointerEvents: isUnlocked ? 'none' : 'auto',
            }}
        >
            <div className="flex flex-col items-center gap-5 max-w-sm px-6 text-center">
                {/* Emblem */}
                <div className="flex h-12 w-12 items-center justify-center border-2 border-white bg-white/5 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                    <Triangle className="h-5 w-5 fill-white text-white" />
                </div>

                {/* Title */}
                <div>
                    <h1 className="text-2xl font-black tracking-widest uppercase text-white">
                        LOG_IT
                    </h1>
                    <p className="text-xs font-bold tracking-widest text-zinc-400 mt-1 uppercase">
                        {isStuck ? 'LOADER STUCK LOL [PUSH TO COMPLETE]' : 'LOADING....'}
                    </p>
                </div>

                {/* Clean Retro Progress Bar */}
                <div className="w-64 sm:w-72">
                    <div
                        ref={trackRef}
                        onMouseDown={onMouseDown}
                        onTouchStart={(e) => {
                            if (!isStuck) return;
                            setIsDragging(true);
                            if (e.touches.length > 0) handleDrag(e.touches[0].clientX);
                        }}
                        className="relative h-7 w-full border-2 border-white bg-black p-0.5 flex items-center shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] cursor-pointer"
                    >
                        {/* White Fill Animation */}
                        <div
                            className="h-full bg-white transition-all duration-75 ease-linear"
                            style={{ width: `${currentVal}%` }}
                        />

                        {/* Draggable Handle */}
                        {isStuck && !isUnlocked && (
                            <div
                                className="absolute top-0 bottom-0 -ml-3 flex items-center justify-center w-6 bg-white text-black font-black text-xs border border-black shadow-md cursor-grab active:cursor-grabbing hover:scale-105 transition-transform animate-pulse"
                                style={{ left: `${dragProgress}%` }}
                            >
                                ::
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 mt-2">
                        <span>0%</span>
                        <span>{currentVal}%</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* Instructions */}
                {isStuck && !isUnlocked ? (
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest animate-pulse">
                        [DRAG SLIDER &rarr; TO JUMPSTART]
                    </p>
                ) : (
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        [INITIALIZING SYSTEM...]
                    </p>
                )}
            </div>
        </div>
    );
}