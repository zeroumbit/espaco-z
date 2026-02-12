'use client';

import styles from './HostProfile.module.css';

interface HostProfileProps {
    name: string;
    joinedDate: string;
    avatarUrl?: string;
    badges?: string[];
    responseRate?: number;
    responseTime?: string;
}

export default function HostProfile({
    name,
    joinedDate,
    avatarUrl,
    badges = [],
    responseRate = 100,
    responseTime = '1 hora'
}: HostProfileProps) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.avatar}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={name} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>{name.charAt(0)}</div>
                    )}
                    {badges.includes('Superhost') && (
                        <div className={styles.badgeIcon}>🛡️</div>
                    )}
                </div>
                <div>
                    <h3 className={styles.name}>Anfitrião: {name}</h3>
                    <p className={styles.meta}>Membro desde {joinedDate}</p>
                </div>
            </div>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span>⭐</span>
                    <span>{badges.length} badges</span>
                </div>
                <div className={styles.statItem}>
                    <span>💬</span>
                    <span>Responde em {responseTime}</span>
                </div>
                <div className={styles.statItem}>
                    <span>⚡</span>
                    <span>{responseRate}% de resposta</span>
                </div>
            </div>

            <div className={styles.bio}>
                <p>Olá! Sou apaixonado por receber pessoas e mostrar o melhor do Ceará.
                    Estou sempre disponível para tirar dúvidas e dar dicas locais.</p>
            </div>

            <button className={styles.contactBtn}>Falar com o anfitrião</button>
        </div>
    );
}
