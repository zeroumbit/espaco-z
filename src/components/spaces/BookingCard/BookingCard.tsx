'use client';

import { Space } from '@/types';
import styles from './BookingCard.module.css';

interface BookingCardProps {
    space: Space;
}

export default function BookingCard({ space }: BookingCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    const getPriceLabel = () => {
        switch (space.module) {
            case 'hospedagem': return ' / noite';
            case 'alugueis':
                return space.price_period === 'semanal' ? ' / semana'
                    : space.price_period === 'anual' ? ' / ano'
                        : ' / mês';
            default: return '';
        }
    };

    const moduleColors: Record<string, string> = {
        hospedagem: 'var(--hospedagem-color)',
        alugueis: 'var(--alugueis-color)',
        vendas: 'var(--vendas-color)',
    };

    const moduleColor = moduleColors[space.module];

    return (
        <div className={styles.card} style={{ '--module-color': moduleColor } as React.CSSProperties}>
            <div className={styles.header}>
                <div className={styles.priceContainer}>
                    <span className={styles.price}>{formatPrice(space.price)}</span>
                    <span className={styles.priceLabel}>{getPriceLabel()}</span>
                </div>
                {space.rating_average && (
                    <div className={styles.rating}>
                        <span className={styles.star}>★</span>
                        <span className={styles.ratingValue}>{space.rating_average.toFixed(1)}</span>
                        <span className={styles.ratingCount}>({space.rating_count} avaliações)</span>
                    </div>
                )}
            </div>

            {/* Body content based on module */}
            {space.module === 'hospedagem' ? (
                <div className={styles.body}>
                    <div className={styles.datePicker}>
                        <div className={styles.dateInputGroup}>
                            <label>CHECK-IN</label>
                            <input type="date" className={styles.dateInput} />
                        </div>
                        <div className={styles.dateInputGroup}>
                            <label>CHECK-OUT</label>
                            <input type="date" className={styles.dateInput} />
                        </div>
                    </div>

                    <div className={styles.guestSelector}>
                        <label>HÓSPEDES</label>
                        <select className={styles.select}>
                            {[...Array(space.max_guests || 1)].map((_, i) => (
                                <option key={i} value={i + 1}>{i + 1} hóspede{i > 0 ? 's' : ''}</option>
                            ))}
                        </select>
                    </div>

                    <button className={styles.ctaButton}>Reservar</button>

                    <p className={styles.disclaimer}>Você ainda não será cobrado</p>

                    <div className={styles.priceBreakdown}>
                        <div className={styles.breakdownRow}>
                            <span>{formatPrice(space.price)} x 5 noites</span>
                            <span>{formatPrice(space.price * 5)}</span>
                        </div>
                        <div className={styles.breakdownRow}>
                            <span>Taxa de limpeza</span>
                            <span>{formatPrice(space.cleaning_fee || 0)}</span>
                        </div>
                        <div className={`${styles.breakdownRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span>{formatPrice((space.price * 5) + (space.cleaning_fee || 0))}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.body}>
                    <div className={styles.infoBox}>
                        <p>Interessado neste imóvel? Entre em contato com o anunciante para tirar dúvidas ou agendar uma visita.</p>
                    </div>
                    <button className={styles.ctaButton}>
                        {space.module === 'vendas' ? 'Agendar Visita' : 'Tenho Interesse'}
                    </button>
                    <button className={styles.secondaryButton}>
                        Enviar Mensagem
                    </button>
                </div>
            )}
        </div>
    );
}
