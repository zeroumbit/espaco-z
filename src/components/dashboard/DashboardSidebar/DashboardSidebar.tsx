'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import styles from './DashboardSidebar.module.css';

type NavItem = {
    href: string;
    label: string;
    icon: string;
    modules?: string[]; // Se definido, só aparece nesses módulos. Se vazio/undefined, aparece sempre.
};

const ALL_LINKS: NavItem[] = [
    { href: '/dashboard', label: 'Home', icon: '📊' },
    { href: '/dashboard/espacos', label: 'Meus Espaços', icon: '🏠' },
    { href: '/dashboard/novo-espaco', label: 'Novo Espaço', icon: '➕' },
    { href: '/dashboard/reservas', label: 'Reservas', icon: '📅', modules: ['hospedagem'] },
    { href: '/dashboard/mensagens', label: 'Mensagens', icon: '💬' },
    { href: '/dashboard/financeiro', label: 'Financeiro', icon: '💰' },
    { href: '/dashboard/perfil', label: 'Meu Perfil', icon: '👤' },
];

export default function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [mainModule, setMainModule] = useState<string | null>(null);

    useEffect(() => {
        async function loadModule() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Busca o perfil primeiro
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('tenant_id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (profileError) {
                    console.warn('[Sidebar] Erro ao buscar perfil:', profileError.message);
                    return;
                }

                // Se tiver tenant_id, busca o módulo principal
                if (profile?.tenant_id) {
                    const { data: tenant, error: tenantError } = await supabase
                        .from('tenants')
                        .select('main_module')
                        .eq('id', profile.tenant_id)
                        .maybeSingle();
                    
                    if (!tenantError && tenant) {
                        setMainModule(tenant.main_module || null);
                    }
                } else {
                    setMainModule(null);
                }
            } catch (err) {
                console.error('[Sidebar] Erro inesperado:', err);
            }
        }
        loadModule();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/');
    };

    // Filtra links com base no módulo
    const visibleLinks = ALL_LINKS.filter(link => {
        if (!link.modules) return true;
        if (!mainModule) return true; // Se não tem módulo definido, mostra tudo
        return link.modules.includes(mainModule);
    });

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <Link href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>Z</div>
                    <span className={styles.logoText}>Painel</span>
                </Link>
            </div>

            <nav className={styles.nav}>
                {visibleLinks.map((link) => {
                    const isActive = pathname === link.href ||
                        (link.href !== '/dashboard' && pathname.startsWith(link.href));
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            <span className={styles.icon}>{link.icon}</span>
                            <span className={styles.label}>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {mainModule && (
                <div className={styles.moduleInfo}>
                    <span className={styles.moduleIcon}>
                        {mainModule === 'hospedagem' ? '🏨' : mainModule === 'alugueis' ? '🏠' : '🏡'}
                    </span>
                    <span className={styles.moduleLabel}>
                        {mainModule === 'hospedagem' ? 'Hospedagem' : mainModule === 'alugueis' ? 'Aluguéis' : 'Vendas'}
                    </span>
                </div>
            )}

            <div className={styles.footer}>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <span>🚪</span> Sair
                </button>
            </div>
        </aside>
    );
}
