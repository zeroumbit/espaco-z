import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { MODULO_CONFIG, STATUS_CONFIG } from '@/lib/listings-constants';
import { ListingService } from '@/lib/supabase/services';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Meus Espaços — Dashboard',
    description: 'Gerencie seus imóveis e anúncios na plataforma Espaço Z.',
};

export default async function MySpacesPage() {
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getUser();
    const user = data?.user;

    if (authError || !user) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Acesso Negado</h1>
                <p>Você precisa estar logado para acessar esta página.</p>
            </div>
        );
    }

    // Fetch tenant_id e main_module do user
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, tenants(main_module)')
        .eq('user_id', user?.id)
        .single();

    const tenantId = profile?.tenant_id;
    const mainModule = (profile as any)?.tenants?.main_module;

    // Fetch listings (V3)
    let listings: any[] = [];
    try {
        // Garantir que tenantId existe e não é a string 'null'
        if (tenantId && tenantId !== 'null') {
            listings = await ListingService.getOrgListings(tenantId);
        }
    } catch (err) {
        console.error('[MeusEspacos] Error fetching listings:', err);
    }

    const getStatusStyle = (status: string) => {
        const cfg = STATUS_CONFIG[status];
        if (!cfg) return { label: status, color: '#64748B', bgColor: '#F1F5F9' };
        return cfg;
    };

    const getModuleConfig = (module: string) => {
        return MODULO_CONFIG[module as keyof typeof MODULO_CONFIG];
    };

    // Stats
    const totalSpaces = listings.length;
    const activeSpaces = listings.filter(l => l.status === 'ativo').length;
    const totalViews = 0; // Stats serão implementados em breve

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1>Meus Espaços</h1>
                    <p>Gerencie seus imóveis e anúncios na plataforma.</p>
                </div>
                <Link href="/dashboard/novo-espaco" className={styles.createBtn}>
                    + Novo Espaço
                </Link>
            </header>

            {/* Stats Bar */}
            <div className={styles.statsBar}>
                <div className={styles.statChip}>
                    <span className={styles.statChipIcon}>🏠</span>
                    <div>
                        <div className={styles.statChipLabel}>Total</div>
                        <div className={styles.statChipValue}>{totalSpaces}</div>
                    </div>
                </div>
                <div className={styles.statChip}>
                    <span className={styles.statChipIcon}>✅</span>
                    <div>
                        <div className={styles.statChipLabel}>Ativos</div>
                        <div className={styles.statChipValue}>{activeSpaces}</div>
                    </div>
                </div>
                <div className={styles.statChip}>
                    <span className={styles.statChipIcon}>👁️</span>
                    <div>
                        <div className={styles.statChipLabel}>Visualizações</div>
                        <div className={styles.statChipValue}>{totalViews}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <button className={`${styles.filterBtn} ${styles.filterActive}`}>
                    Todos ({totalSpaces})
                </button>
                <button className={styles.filterBtn}>Ativos ({activeSpaces})</button>
                {(!mainModule || mainModule === 'hospedagem') && (
                    <button className={styles.filterBtn}>🏨 Hospedagem</button>
                )}
                {(!mainModule || mainModule === 'alugueis') && (
                    <button className={styles.filterBtn}>🏠 Aluguel</button>
                )}
                {(!mainModule || mainModule === 'vendas') && (
                    <button className={styles.filterBtn}>🏡 Venda</button>
                )}
            </div>

            {/* Spaces List */}
            <div className={styles.list}>
                {listings.map((item) => {
                    const space = item.property; // Na V3, os dados físicos vêm de property
                    const cfg = getModuleConfig(item.modulo);
                    const statusStyle = getStatusStyle(item.status);
                    
                    if (!space) return null;

                    return (
                        <div key={item.id} className={styles.card}>
                            {/* Image */}
                            <div className={styles.cardImage}>
                                {/* TODO: Buscar fotos de property_media */}
                                <div className={styles.noImage}>
                                    <span>📸</span>
                                </div>
                                
                                <span className={styles.moduleBadge}
                                    style={{ background: cfg?.lightColor || '#f1f5f9', color: cfg?.color || '#64748b' }}>
                                    {cfg?.icon} {cfg?.label}
                                </span>
                                <span className={styles.statusBadge}
                                    style={{ background: statusStyle.bgColor, color: statusStyle.color }}>
                                    {statusStyle.label}
                                </span>
                            </div>

                            {/* Content */}
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{space.titulo}</h3>
                                <div className={styles.cardLocation}>
                                    📍 {space.bairro ? `${space.bairro}, ` : ''}{space.cidade} - {space.estado}
                                </div>

                                <div className={styles.cardFeatures}>
                                    {space.quartos > 0 && (
                                        <span className={styles.cardFeature}>🛏️ {space.quartos} quartos</span>
                                    )}
                                    {space.banheiros_sociais > 0 && (
                                        <span className={styles.cardFeature}>🚿 {space.banheiros_sociais} banheiros</span>
                                    )}
                                    {space.area_total > 0 && (
                                        <span className={styles.cardFeature}>📐 {space.area_total}m²</span>
                                    )}
                                </div>

                                <div className={styles.cardPrice}>
                                    <strong>R$ {(item.preco_base_centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                                    <span> {cfg?.precoPeriodo}</span>
                                </div>

                                <div className={styles.cardStats}>
                                    <span>👁️ 0 views</span>
                                    <span>❤️ 0 favoritos</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className={styles.cardActions}>
                                <button className={styles.editBtn}>
                                    ✏️ Editar
                                </button>
                                {item.modulo === 'hospedagem' && (
                                    <button className={styles.secondaryBtn}>
                                        📅 Calendário
                                    </button>
                                )}
                                <button className={styles.secondaryBtn}>
                                    📊 Estatísticas
                                </button>
                                <button className={styles.dangerBtn}>
                                    {item.status === 'ativo' ? '⏸️ Pausar' : '▶️ Ativar'}
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Empty State */}
                {listings.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🏡</div>
                        <h3>Nenhum espaço cadastrado ainda</h3>
                        <p>Crie seu primeiro anúncio e comece a receber contatos!</p>
                        <Link href="/dashboard/novo-espaco" className={styles.createBtn}>
                            + Criar meu primeiro anúncio
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
