import { createClient } from '@/lib/supabase/server';
import styles from './page.module.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const metadata = {
    title: 'Perto de Você — Super Admin',
};

export default async function AdminLocalAdvertisersPage() {
    const supabase = await createClient();

    // Fetch all local advertisers
    const { data: advertisers, error } = await supabase
        .from('local_advertisers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching local advertisers:', error);
    }

    // Stats
    const total = advertisers?.length || 0;
    const active = advertisers?.filter(a => a.is_active).length || 0;
    const pending = advertisers?.filter(a => !a.is_active).length || 0;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Perto de Você</h1>
                <button className="btn btn-primary">Adicionar Novo</button>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statTitle}>Total Cadastrados</span>
                    <span className={styles.statValue}>{total}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statTitle}>Em Destaque (Ativos)</span>
                    <span className={styles.statValue}>{active}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statTitle}>Aguardando Moderação</span>
                    <span className={styles.statValue}>{pending}</span>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Estabelecimento</th>
                            <th>Categoria</th>
                            <th>Cidade</th>
                            <th>Status</th>
                            <th>Cadastro</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {advertisers?.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--neutral-500)' }}>{item.email || item.phone}</div>
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${styles.categoryBadge}`}>
                                        {item.category}
                                    </span>
                                </td>
                                <td>{item.city}</td>
                                <td>
                                    <span className={`${styles.badge} ${item.is_active ? styles.statusActive : styles.statusInactive}`}>
                                        {item.is_active ? 'Publicado' : 'Pendente'}
                                    </span>
                                </td>
                                <td>
                                    {format(new Date(item.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button className={styles.actionBtn} title="Editar">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </button>
                                        <button className={styles.actionBtn} title="Localização">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="12" r="3" /></svg>
                                        </button>
                                        <button className={styles.actionBtn} title="Alterar Status">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {(!advertisers || advertisers.length === 0) && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--neutral-500)' }}>
                                    Nenhum parceiro local encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
