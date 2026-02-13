import { createClient } from '@/lib/supabase/server';
import styles from './page.module.css';
import TenantTable from './TenantTable';

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

            <TenantTable tenants={tenants} />
        </div>
    );
}
