'use client';

import { useRef } from 'react';
import { Space } from '@/types';
import SpaceCard from '@/components/spaces/SpaceCard/SpaceCard';
import styles from './SpaceCarousel.module.css';

interface SpaceCarouselProps {
    title: string;
    subtitle?: string;
    spaces: Space[];
    viewAllHref?: string;
}

export default function SpaceCarousel({ title, subtitle, spaces, viewAllHref }: SpaceCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 320;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    if (spaces.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>{title}</h2>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
                <div className={styles.controls}>
                    <button className={styles.arrowBtn} onClick={() => scroll('left')} aria-label="Anterior">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>
                    <button className={styles.arrowBtn} onClick={() => scroll('right')} aria-label="Próximo">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>
                    {viewAllHref && (
                        <a href={viewAllHref} className={styles.viewAll}>Ver todos →</a>
                    )}
                </div>
            </div>

            <div className={styles.carousel} ref={scrollRef}>
                {spaces.map((space) => (
                    <div key={space.id} className={styles.carouselItem}>
                        <SpaceCard space={space} />
                    </div>
                ))}
            </div>
        </section>
    );
}
