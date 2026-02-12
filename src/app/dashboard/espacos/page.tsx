import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import styles from './page.module.css';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Meus Espaços — Dashboard',
};

export default async function MySpacesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch tenant_id for the user
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user?.id)
        .single();

    // Fetch real spaces
    const { data: spaces, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching spaces:', error);
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ativo': return 'var(--success-500)';
            case 'inativo': return 'var(--error-500)';
            case 'rascunho': return 'var(--neutral-400)';
            case 'pausado': return 'var(--warning-500)';
            default: return 'var(--neutral-500)';
        }
    };

    const getModuleLabel = (module: string) => {
        const labels: Record<string, string> = {
            'hospedagem': '🏨 Hospedagem',
            'alugueis': '🏠 Aluguel',
            'vendas': '🏡 Venda'
        };
        return labels[module] || module;
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Meus Espaços</h1>
                    <p className={styles.subtitle}>Gerencie suas propriedades e anúncios na plataforma.</p>
                </div>
                <Link href="/dashboard/novo-espaco" className={styles.createBtn}>
                    + Novo Espaço
                </Link>
            </header>

            {/* Filters */}
            <div className={styles.filters}>
                <button className={`${styles.filterBtn} ${styles.filterActive}`}>Todos ({spaces?.length || 0})</button>
                <button className={styles.filterBtn}>Ativos</button>
                <button className={styles.filterBtn}>Hospedagem</button>
                <button className={styles.filterBtn}>Aluguel</button>
            </div>

            {/* List */}
            <div className={styles.list}>
                {spaces?.map((space) => (
                    <div key={space.id} className={styles.card}>
                        <div className={styles.cardImage}>
                            {space.photos && space.photos.length > 0 ? (
                                <img src={space.photos[0]} alt={space.title} />
                            ) : (
                                <div className={styles.noImage}>
                                    <span>📸</span>
                                </div>
                            )}
                            <div className={styles.moduleBadge}>
                                {getModuleLabel(space.module)}
                            </div>
                        </div>

                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>{space.title}</h3>
                                <div className={styles.statusRow}>
                                    <span
                                        className={styles.statusDot}
                                        style={{ backgroundColor: getStatusColor(space.status) }}
                                    />
                                    <span className={styles.statusText}>{space.status}</span>
                                </div>
                            </div>

                            <p className={styles.cardLocation}>
                                📍 {space.city}, {space.state} · {space.neighborhood || 'Bairro não inf.'}
                            </p>

                            <div className={styles.cardPrice}>
                                <strong>R$ {Number(space.price).toLocaleString('pt-BR')}</strong>
                                <span>{space.module === 'hospedagem' ? '/ noite' : space.module === 'vendas' ? '' : '/ mês'}</span>
                            </div>

                            <div className={styles.cardStats}>
                                <div className={styles.statItem}>
                                    <span>👁️ {space.views_count || 0}</span>
                                    <span>votos: {space.rating_count || 0}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span>🛏️ {space.bedrooms || 0}</span>
                                    <span>👥 {space.max_guests || 1}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.cardActions}>
                            <button className={styles.editBtn}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                Editar
                            </button>
                            <button className={styles.secondaryBtn}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /></svg>
                                Calendário
                            </button>
                        </div>
                    </div>
                ))}

                {(!spaces || spaces.length === 0) && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🏠</div>
                        <h3>Você ainda não tem espaços cadastrados</h3>
                        <p>Crie seu primeiro anúncio para começar a receber reservas!</p>
                        <Link href="/dashboard/novo-espaco" className={styles.createBtn}>
                            Criar meu primeiro anúncio
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
