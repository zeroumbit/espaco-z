import DashboardSidebar from '@/components/dashboard/DashboardSidebar/DashboardSidebar';
import styles from './layout.module.css';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OnboardingWrapper from '@/components/dashboard/OnboardingWrapper';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    try {
        const supabase = await createClient();
        const { data, error: authError } = await supabase.auth.getUser();
        const user = data?.user;

        if (authError || !user) {
            console.log('[Dashboard Layout] Usuário não autenticado ou erro na auth');
            redirect('/login');
        }

        // Fetch profile to verify role and tenant
        let profile = null;
        let tenant = null;
        try {
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('role, tenant_id, tenants(id, address_completed)')
                .eq('user_id', user.id)
                .single();
            
            if (error) {
                console.error('[Dashboard Layout] Error fetching profile:', error);
            } else {
                profile = profileData;
                tenant = (profileData as any).tenants;
            }
        } catch (err) {
            console.error('[Dashboard Layout] Error in profile fetch:', err);
        }

        // Permitir acesso se: é admin, é anunciante, ou tem tenant_id associado
        const hasAccess = profile && (
            profile.role === 'anunciante' ||
            profile.role === 'admin' ||
            profile.tenant_id != null
        );

        if (!hasAccess) {
            console.warn('[Dashboard Layout] Acesso negado para o usuário:', user.id);
            redirect('/');
        }

        return (
            <div className={styles.layout}>
                <DashboardSidebar />
                <main className={styles.main}>
                    <div className={styles.content}>
                        {children}
                    </div>
                </main>
                
                {/* Onboarding Automático no Primeiro Acesso */}
                <OnboardingWrapper tenant={tenant} />
            </div>
        );
    } catch (err) {
        if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
            throw err; // Re-throw redirect errors so Next.js can handle them
        }
        console.error('[Dashboard Layout] Global Crash:', err);
        // Fallback UI or simple error message
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Erro Interno</h1>
                <p>Ocorreu um problema ao carregar o painel. Por favor, tente recarregar.</p>
            </div>
        );
    }
}
