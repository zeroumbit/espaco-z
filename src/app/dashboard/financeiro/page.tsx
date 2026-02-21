'use client';

import React from 'react';
import styles from './page.module.css';

export default function FinanceiroPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Financeiro</h1>
                <p>Acompanhe seus rendimentos e histórico de transações.</p>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Saldo Disponível</span>
                    <h2 className={styles.statValue}>R$ 0,00</h2>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Próximo Repasse</span>
                    <h2 className={styles.statValue}>--</h2>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Recebido</span>
                    <h2 className={styles.statValue}>R$ 0,00</h2>
                </div>
            </div>

            <section className={styles.placeholderSection}>
                <div className={styles.emptyIcon}>💰</div>
                <h3>Sem movimentações recentes</h3>
                <p>Suas transações e repasses aparecerão aqui assim que você realizar sua primeira venda ou reserva.</p>
            </section>
        </div>
    );
}
