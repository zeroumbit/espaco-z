import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
    title: 'Dashboard — Espaço Z',
    description: 'Painel do anunciante no Espaço Z.',
};

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Erro</h1>
                <p>Usuário não autenticado.</p>
            </div>
        );
    }

    // Profile + Tenant
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, tenants(*)')
        .eq('user_id', user.id)
        .single();

    if (profileError) {
        console.error('[Dashboard] Erro ao buscar profile:', profileError);
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Erro</h1>
                <p>Não foi possível carregar seus dados.</p>
            </div>
        );
    }

    const tenant = profile?.tenants;
    const mainModule = tenant?.main_module ?? 'hospedagem';

    // Se não tem tenant, mostrar aviso para completar cadastro
    if (!tenant) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Painel do Anunciante</h1>
                        <p className={styles.welcome}>
                            Bem-vindo de volta, <strong>{profile?.full_name}</strong>
                        </p>
                    </div>
                </header>

                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#FFF3CD', borderRadius: '8px', margin: '2rem 0' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⚠️ Complete seu Cadastro</h2>
                    <p style={{ marginBottom: '1.5rem' }}>Você precisa cadastrar sua empresa para acessar todas as funcionalidades.</p>
                    <Link href="/anunciar" className={styles.createBtn}>
                        Cadastrar Empresa
                    </Link>
                </div>
            </div>
        );
    }

    // Stats
    const { count: spacesCount, error: spacesError } = await supabase
        .from('spaces')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id);

    const { count: activeCount, error: activeError } = await supabase
        .from('spaces')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .eq('status', 'ativo');

    if (spacesError) console.error('[Dashboard] Erro ao buscar spaces:', spacesError);
    if (activeError) console.error('[Dashboard] Erro ao buscar active spaces:', activeError);

    // Module-specific labels
    const moduleConfig: Record<string, { icon: string; label: string; color: string; lightColor: string }> = {
        hospedagem: { icon: '🏨', label: 'Hospedagem', color: '#6366F1', lightColor: '#EEF2FF' },
        alugueis: { icon: '🏠', label: 'Aluguéis', color: '#0EA5E9', lightColor: '#E0F2FE' },
        vendas: { icon: '🏡', label: 'Vendas', color: '#10B981', lightColor: '#ECFDF5' },
    };
    const mod = moduleConfig[mainModule] || moduleConfig.hospedagem;

    // Quick actions based on module
    const quickActions = [
        {
            href: '/dashboard/espacos',
            icon: '🏠',
            title: 'Gerenciar Espaços',
            desc: 'Edite preços, fotos e detalhes',
        },
    ];

    if (mainModule === 'hospedagem') {
        quickActions.push(
            { href: '/dashboard/reservas', icon: '📅', title: 'Reservas', desc: 'Acompanhe suas reservas' },
            { href: '/dashboard/mensagens', icon: '💬', title: 'Mensagens', desc: 'Fale com seus hóspedes' },
        );
    } else if (mainModule === 'alugueis') {
        quickActions.push(
            { href: '/dashboard/mensagens', icon: '💬', title: 'Mensagens', desc: 'Fale com interessados' },
            { href: '/dashboard/financeiro', icon: '💰', title: 'Financeiro', desc: 'Controle de pagamentos' },
        );
    } else if (mainModule === 'vendas') {
        quickActions.push(
            { href: '/dashboard/mensagens', icon: '💬', title: 'Contatos', desc: 'Leads e propostas' },
            { href: '/dashboard/financeiro', icon: '💰', title: 'Financeiro', desc: 'Acompanhe seus resultados' },
        );
    } else {
        quickActions.push(
            { href: '/dashboard/reservas', icon: '📅', title: 'Calendário', desc: 'Acompanhe suas reservas' },
            { href: '/dashboard/mensagens', icon: '💬', title: 'Mensagens', desc: 'Fale com seus clientes' },
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Painel do Anunciante</h1>
                    <p className={styles.welcome}>
                        Bem-vindo de volta, <strong>{profile?.full_name}</strong>
                        {tenant && (
                            <>
                                {' — '}
                                <span style={{ color: mod.color }}>{mod.icon} {tenant.name}</span>
                            </>
                        )}
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
                        <div className={styles.statLabel}>Total de Espaços</div>
                        <div className={styles.statValue}>{spacesCount || 0}</div>
                        <div className={styles.statTrend}>{activeCount || 0} ativos na plataforma</div>
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
                {mainModule === 'hospedagem' && (
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📅</div>
                        <div>
                            <div className={styles.statLabel}>Reservas do Mês</div>
                            <div className={styles.statValue}>0</div>
                            <div className={styles.statTrend}>Nenhuma reserva ainda</div>
                        </div>
                    </div>
                )}
                {mainModule === 'vendas' && (
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🎯</div>
                        <div>
                            <div className={styles.statLabel}>Leads no Mês</div>
                            <div className={styles.statValue}>0</div>
                            <div className={styles.statTrend}>Nenhum lead ainda</div>
                        </div>
                    </div>
                )}
                {mainModule === 'alugueis' && (
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📞</div>
                        <div>
                            <div className={styles.statLabel}>Contatos do Mês</div>
                            <div className={styles.statValue}>0</div>
                            <div className={styles.statTrend}>Nenhum contato ainda</div>
                        </div>
                    </div>
                )}
                {!mainModule && (
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>💬</div>
                        <div>
                            <div className={styles.statLabel}>Mensagens Novas</div>
                            <div className={styles.statValue}>0</div>
                            <div className={styles.statTrend}>Nenhuma conversa hoje</div>
                        </div>
                    </div>
                )}
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💰</div>
                    <div>
                        <div className={styles.statLabel}>
                            {mainModule === 'hospedagem' ? 'Ganhos no Mês' : mainModule === 'vendas' ? 'Comissões' : 'Financeiro'}
                        </div>
                        <div className={styles.statValue}>R$ 0,00</div>
                        <div className={styles.statTrend}>Período de teste</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
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
                    {quickActions.map(action => (
                        <Link key={action.href} href={action.href} className={styles.actionCard}>
                            <div className={styles.actionIcon}>{action.icon}</div>
                            <h3>{action.title}</h3>
                            <p>{action.desc}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
