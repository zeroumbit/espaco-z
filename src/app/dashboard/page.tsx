'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function DashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [spacesCount, setSpacesCount] = useState<number>(0);
    const [activeCount, setActiveCount] = useState<number>(0);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // 1. Busca o perfil
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*, tenants(*)')
                .eq('user_id', user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                
                // Se o join falhou ou não existe vínculo no profile, tenta buscar tenant diretamente
                if (profileData.tenants) {
                    setTenant(profileData.tenants);
                } else {
                    const { data: tenantData } = await supabase
                        .from('tenants')
                        .select('*')
                        .eq('user_id', user.id)
                        .maybeSingle();
                    
                    if (tenantData) {
                        setTenant(tenantData);
                    }
                }
            } else {
                // Caso não tenha perfil (raro), tenta buscar tenant diretamente
                const { data: tenantData } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();
                
                if (tenantData) {
                    setTenant(tenantData);
                }
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    useEffect(() => {
        async function fetchStats() {
            if (!tenant?.id || tenant.id === 'null') return;

            const supabase = createClient();
            const { count } = await supabase
                .from('listings')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', tenant.id);

            const { count: active } = await supabase
                .from('listings')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', tenant.id)
                .eq('status', 'ativo');

            setSpacesCount(count || 0);
            setActiveCount(active || 0);
        }
        fetchStats();
    }, [tenant]);

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Carregando...</p>
            </div>
        );
    }

    const mainModule = tenant?.main_module ?? 'hospedagem';

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
