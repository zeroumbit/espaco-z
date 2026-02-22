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

        // Fetch profile to verify role and tenant with Retry Logic (Handle Database Latency)
        let profile = null;
        let tenant = null;
        const isSuperAdmin = user.email === 'zeroumbit@gmail.com';

        // Tentar até 5 vezes buscar o perfil em caso de ausência (latência de replicação)
        for (let attempt = 1; attempt <= 5; attempt++) {
            try {
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('role, tenant_id, tenants(id)')
                    .eq('user_id', user.id)
                    .single();

                if (!error && profileData) {
                    profile = profileData;
                    tenant = (profileData as any).tenants;
                    console.log(`[Dashboard Layout] Perfil encontrado na tentativa ${attempt}`);
                    break; // Sucesso! Sai do loop
                }

                if (attempt < 5) {
                    console.log(`[Dashboard Layout] Tentativa ${attempt} falhou. Aguardando sincronização...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Delay progressivo (1s, 2s, 3s...)
                }
            } catch (err) {
                console.error(`[Dashboard Layout] Erro na tentativa ${attempt}:`, err);
            }
        }

        // Tentativa final: buscar tenant diretamente se profile falhou
        if (!tenant && profile) {
            try {
                const { data: tenantData } = await supabase
                    .from('tenants')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();
                
                if (tenantData) {
                    console.log('[Dashboard Layout] Tenant encontrado diretamente, profile sem tenant_id');
                    tenant = tenantData;
                }
            } catch (err) {
                console.warn('[Dashboard Layout] Não foi possível buscar tenant diretamente:', err);
            }
        }

        // Permitir acesso se: é super admin (email), é admin (role), é anunciante, ou tem tenant_id associado
        const hasAccess = isSuperAdmin || (profile && (
            profile.role === 'anunciante' ||
            profile.role === 'admin' ||
            profile.tenant_id != null
        )) || tenant; // Permite acesso se encontrou tenant diretamente

        if (isSuperAdmin) {
            console.log('[Dashboard Layout] Acesso Super Admin concedido via Master Email');
        } else if (!hasAccess) {
            console.warn('[Dashboard Layout] Acesso negado. Perfil não encontrado ou sem permissão após retentativas.');
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
