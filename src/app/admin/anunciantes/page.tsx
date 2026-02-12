import { createClient } from '@/lib/supabase/server';
import styles from './page.module.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const metadata = {
    title: 'Gestão de Anunciantes — Super Admin',
};

export default async function AdminTenantsPage() {
    const supabase = await createClient();

    // Fetch all tenants with basic info
    const { data: tenants, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tenants:', error);
    }

    // Quick Stats
    const totalTenants = tenants?.length || 0;
    const activeTenants = tenants?.filter(t => t.is_active).length || 0;
    const trialTenants = tenants?.filter(t => t.subscription_plan === 'trial').length || 0;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Anunciantes</h1>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statTitle}>Total de Anunciantes</span>
                    <span className={styles.statValue}>{totalTenants}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statTitle}>Contas Ativas</span>
                    <span className={styles.statValue}>{activeTenants}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statTitle}>Em Período de Teste</span>
                    <span className={styles.statValue}>{trialTenants}</span>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Anunciante</th>
                            <th>Localização</th>
                            <th>Plano</th>
                            <th>Status</th>
                            <th>Cadastro</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants?.map((tenant) => (
                            <tr key={tenant.id}>
                                <td>
                                    <div className={styles.tenantInfo}>
                                        <div className={styles.logo}>
                                            {tenant.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className={styles.tenantName}>{tenant.name}</span>
                                            <span className={styles.tenantEmail}>{tenant.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{tenant.city}, {tenant.state}</td>
                                <td>
                                    <span style={{ textTransform: 'capitalize' }}>
                                        {tenant.subscription_plan}
                                    </span>
                                </td>
                                <td>
                                    <span className={tenant.is_active ? styles.statusActive : styles.statusInactive}>
                                        {tenant.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td>
                                    {format(new Date(tenant.created_at), 'dd MMM yyyy', { locale: ptBR })}
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button className={styles.actionBtn} title="Editar">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </button>
                                        <button className={styles.actionBtn} title="Ver Espaços">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                        </button>
                                        <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} title="Suspender">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {(!tenants || tenants.length === 0) && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--neutral-500)' }}>
                                    Nenhum anunciante cadastrado ainda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
