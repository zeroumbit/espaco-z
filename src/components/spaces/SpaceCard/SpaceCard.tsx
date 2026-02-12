'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Space } from '@/types';
import { PROPERTY_TYPE_LABELS } from '@/lib/constants';
import styles from './SpaceCard.module.css';

interface SpaceCardProps {
    space: Space;
    showModule?: boolean;
}

export default function SpaceCard({ space, showModule = false }: SpaceCardProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [currentPhoto, setCurrentPhoto] = useState(0);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    const priceLabel = () => {
        switch (space.module) {
            case 'hospedagem':
                return '/noite';
            case 'alugueis':
                return `/${space.price_period === 'semanal' ? 'sem' : space.price_period === 'anual' ? 'ano' : 'mês'}`;
            case 'vendas':
                return '';
        }
    };

    const moduleColors: Record<string, string> = {
        hospedagem: 'var(--hospedagem-color)',
        alugueis: 'var(--alugueis-color)',
        vendas: 'var(--vendas-color)',
    };

    return (
        <article className={styles.card} style={{ '--card-color': moduleColors[space.module] } as React.CSSProperties}>
            {/* Image gallery */}
            <div className={styles.imageContainer}>
                <div
                    className={styles.imageSlider}
                    style={{ transform: `translateX(-${currentPhoto * 100}%)` }}
                >
                    {(space.photos.length > 0 ? space.photos : ['/placeholder.jpg']).map((photo, idx) => (
                        <div key={idx} className={styles.imageSlide}>
                            <div className={styles.imagePlaceholder}>
                                <span>{space.title.charAt(0)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Photo navigation dots */}
                {space.photos.length > 1 && (
                    <div className={styles.photoDots}>
                        {space.photos.slice(0, 5).map((_, idx) => (
                            <button
                                key={idx}
                                className={`${styles.photoDot} ${currentPhoto === idx ? styles.photoDotActive : ''}`}
                                onClick={(e) => { e.preventDefault(); setCurrentPhoto(idx); }}
                            />
                        ))}
                    </div>
                )}

                {/* Favorite */}
                <button
                    className={`${styles.favoriteBtn} ${isFavorited ? styles.favoriteBtnActive : ''}`}
                    onClick={(e) => { e.preventDefault(); setIsFavorited(!isFavorited); }}
                    aria-label="Favoritar"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>

                {/* Badges */}
                {space.badges.length > 0 && (
                    <div className={styles.badgeRow}>
                        {space.badges.slice(0, 2).map((badge) => (
                            <span key={badge} className={styles.badge}>{badge}</span>
                        ))}
                    </div>
                )}

                {/* Module indicator */}
                {showModule && (
                    <span className={styles.moduleTag}>
                        {space.module === 'hospedagem' ? '🏨' : space.module === 'alugueis' ? '🏠' : '🏡'}
                    </span>
                )}
            </div>

            {/* Content */}
            <Link href={`/espaco/${space.id}`} className={styles.content}>
                <div className={styles.contentTop}>
                    <div className={styles.location}>
                        {space.city}, {space.state}
                    </div>
                    {space.rating_average && (
                        <div className={styles.rating}>
                            <span className={styles.ratingStar}>★</span>
                            <span>{space.rating_average.toFixed(1)}</span>
                            {space.rating_count > 0 && (
                                <span className={styles.ratingCount}>({space.rating_count})</span>
                            )}
                        </div>
                    )}
                </div>
                <h3 className={styles.title}>{space.title}</h3>
                <p className={styles.details}>
                    {PROPERTY_TYPE_LABELS[space.property_type]}
                    {space.bedrooms && ` · ${space.bedrooms} quarto${space.bedrooms > 1 ? 's' : ''}`}
                    {space.max_guests && ` · ${space.max_guests} hóspede${space.max_guests > 1 ? 's' : ''}`}
                </p>
                <div className={styles.priceRow}>
                    <span className={styles.price}>{formatPrice(space.price)}</span>
                    <span className={styles.priceLabel}>{priceLabel()}</span>
                </div>
            </Link>
        </article>
    );
}
