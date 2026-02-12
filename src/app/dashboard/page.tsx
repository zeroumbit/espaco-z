import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
    title: 'Dashboard — Espaço Z',
};

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch profile and tenant info
    const { data: profile } = await supabase
        .from('profiles')
        .select('*, tenants(*)')
        .eq('user_id', user?.id)
        .single();

    const tenant = profile?.tenants;

    // Fetch stats (simplified for now)
    const { count: spacesCount } = await supabase
        .from('spaces')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', profile?.tenant_id);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Painel do Anunciante</h1>
                    <p className={styles.welcome}>
                        Bem-vindo de volta, <strong>{profile?.full_name}</strong>
                        {tenant && ` — ${tenant.name}`}
                    </p>
                </div>
                <Link href="/dashboard/novo-espaco" className={styles.createBtn}>
                    + Novo Espaço
                </Link>
            </header>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🏠</div>
                    <div>
                        <div className={styles.statLabel}>Seus Espaços</div>
                        <div className={styles.statValue}>{spacesCount || 0}</div>
                        <div className={styles.statTrend}>Ativos na plataforma</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>⭐</div>
                    <div>
                        <div className={styles.statLabel}>Avaliação Média</div>
                        <div className={styles.statValue}>--</div>
                        <div className={styles.statTrend}>Sem avaliações ainda</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💬</div>
                    <div>
                        <div className={styles.statLabel}>Mensagens Novas</div>
                        <div className={styles.statValue}>0</div>
                        <div className={styles.statTrend}>Nenhuma conversa hoje</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💰</div>
                    <div>
                        <div className={styles.statLabel}>Ganhos no Mês</div>
                        <div className={styles.statValue}>R$ 0,00</div>
                        <div className={styles.statTrend}>Período de teste</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity (Placeholder for real data later) */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Atividades Recentes</h2>
                <div className={styles.activityList}>
                    <div className={styles.activityItem}>
                        <div className={styles.activityIcon}>✨</div>
                        <div style={{ flex: 1 }}>
                            <p className={styles.activityText}><strong>Bem-vindo ao Espaço Z!</strong></p>
                            <p className={styles.activityMeta}>Sua conta foi configurada com sucesso.</p>
                        </div>
                        <div className={styles.activityStatus}>Início</div>
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
