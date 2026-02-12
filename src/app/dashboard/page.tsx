import { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Dashboard — Espaço Z',
};

export default function DashboardPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Painel do Anunciante</h1>
                    <p className={styles.welcome}>Bem-vindo de volta, Anfitrião Exemplo.</p>
                </div>
                <Link href="/dashboard/novo-espaco" className={styles.createBtn}>
                    + Novo Espaço
                </Link>
            </header>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>👁️</div>
                    <div>
                        <div className={styles.statLabel}>Visualizações Totais</div>
                        <div className={styles.statValue}>1,245</div>
                        <div className={styles.statTrend}>+12.5% este mês</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>⭐</div>
                    <div>
                        <div className={styles.statLabel}>Avaliação Média</div>
                        <div className={styles.statValue}>4.9/5</div>
                        <div className={styles.statTrend}>Baseado em 32 reviews</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💬</div>
                    <div>
                        <div className={styles.statLabel}>Mensagens Novas</div>
                        <div className={styles.statValue}>3</div>
                        <div className={styles.statAlert}>Responda rápido!</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💰</div>
                    <div>
                        <div className={styles.statLabel}>Ganhos no Mês</div>
                        <div className={styles.statValue}>R$ 4.250</div>
                        <div className={styles.statTrend}>+5% vs mês anterior</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Atividades Recentes</h2>
                <div className={styles.activityList}>
                    <div className={styles.activityItem}>
                        <div className={styles.activityIcon}>📅</div>
                        <div style={{ flex: 1 }}>
                            <p className={styles.activityText}><strong>Reserva confirmada</strong> para "Apartamento Vista Mar"</p>
                            <p className={styles.activityMeta}>Hoje, 14:30 · João Silva (3 noites)</p>
                        </div>
                        <div className={styles.activityStatus}>Confirmada</div>
                    </div>
                    <div className={styles.activityItem}>
                        <div className={styles.activityIcon}>💬</div>
                        <div style={{ flex: 1 }}>
                            <p className={styles.activityText}>Nova mensagem de <strong>Maria Oliveira</strong></p>
                            <p className={styles.activityMeta}>Ontem, 09:15 · Sobre "Casa de Praia em Canoa"</p>
                        </div>
                        <button className={styles.activityAction}>Responder</button>
                    </div>
                    <div className={styles.activityItem}>
                        <div className={styles.activityIcon}>⭐</div>
                        <div style={{ flex: 1 }}>
                            <p className={styles.activityText}>Nova avaliação 5 estrelas em "Flat Completo"</p>
                            <p className={styles.activityMeta}>2 dias atrás · Por Carlos Santos</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Ações Rápidas</h2>
                <div className={styles.actionsGrid}>
                    <Link href="/dashboard/espacos" className={styles.actionCard}>
                        <div className={styles.actionIcon}>🏠</div>
                        <h3>Gerenciar Espaços</h3>
                        <p>Edite preços, fotos e disponibilidade</p>
                    </Link>
                    <Link href="/dashboard/reservas" className={styles.actionCard}>
                        <div className={styles.actionIcon}>📅</div>
                        <h3>Ver Calendário</h3>
                        <p>Acompanhe suas reservas confirmadas</p>
                    </Link>
                    <Link href="/dashboard/mensagens" className={styles.actionCard}>
                        <div className={styles.actionIcon}>💬</div>
                        <h3>Caixa de Entrada</h3>
                        <p>Fale com seus hóspedes e clientes</p>
                    </Link>
                </div>
            </section>
        </div>
    );
}
