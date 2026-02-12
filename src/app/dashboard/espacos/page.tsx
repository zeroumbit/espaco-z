import { Metadata } from 'next';
import Link from 'next/link';
import { MOCK_HOSPEDAGEM_SPACES, MOCK_ALUGUEIS_SPACES, MOCK_VENDAS_SPACES } from '@/lib/mock-data';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Meus Espaços — Dashboard',
};

export default function MySpacesPage() {
    // Combine all mock spaces for demo
    const spaces = [
        ...MOCK_HOSPEDAGEM_SPACES.slice(0, 3),
        ...MOCK_ALUGUEIS_SPACES.slice(0, 2),
        ...MOCK_VENDAS_SPACES.slice(0, 1),
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ativo': return 'var(--success-600)';
            case 'inativo': return 'var(--error-600)';
            case 'rascunho': return 'var(--neutral-500)';
            default: return 'var(--neutral-500)';
        }
    };

    const getModuleLabel = (module: string) => {
        switch (module) {
            case 'hospedagem': return 'Hospedagem';
            case 'alugueis': return 'Aluguel';
            case 'vendas': return 'Venda';
            default: return module;
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Meus Espaços</h1>
                <Link href="/dashboard/novo-espaco" className={styles.createBtn}>
                    + Novo Espaço
                </Link>
            </header>

            {/* Filters (Placeholder) */}
            <div className={styles.filters}>
                <button className={`${styles.filterBtn} ${styles.filterActive}`}>Todos</button>
                <button className={styles.filterBtn}>Ativos</button>
                <button className={styles.filterBtn}>Rascunhos</button>
                <button className={styles.filterBtn}>Hospedagem</button>
                <button className={styles.filterBtn}>Aluguel</button>
                <button className={styles.filterBtn}>Vendas</button>
            </div>

            {/* List */}
            <div className={styles.list}>
                {spaces.map((space) => (
                    <div key={space.id} className={styles.card}>
                        <div className={styles.cardImage}>
                            {/* Image placeholder */}
                            <span>{space.title.charAt(0)}</span>
                        </div>

                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>{space.title}</h3>
                                <span
                                    className={styles.statusBadge}
                                    style={{ color: getStatusColor(space.status), borderColor: getStatusColor(space.status) }}
                                >
                                    {space.status}
                                </span>
                            </div>

                            <p className={styles.cardMeta}>
                                {getModuleLabel(space.module)} · {space.city}, {space.state}
                            </p>

                            <div className={styles.cardStats}>
                                <span>👁️ {space.views_count} visualizações</span>
                                <span>⭐ {space.rating_average?.toFixed(1) || '-'} ({space.rating_count})</span>
                            </div>
                        </div>

                        <div className={styles.cardActions}>
                            <button className={styles.actionBtn}>Editar</button>
                            <button className={styles.actionBtn}>Calendário</button>
                            <button className={styles.moreBtn}>⋮</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
