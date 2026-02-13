'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './DashboardSidebar.module.css';

const DASHBOARD_LINKS = [
    { href: '/dashboard', label: 'Visão Geral', icon: '📊' },
    { href: '/dashboard/espacos', label: 'Meus Espaços', icon: '🏠' },
    { href: '/dashboard/reservas', label: 'Reservas e Vendas', icon: '📅' },
    { href: '/dashboard/mensagens', label: 'Mensagens', icon: '💬' },
    { href: '/dashboard/financeiro', label: 'Financeiro', icon: '💰' },
    { href: '/dashboard/perfil', label: 'Meu Perfil', icon: '👤' },
];

export default function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/');
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <Link href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>Z</div>
                    <span className={styles.logoText}>Painel</span>
                </Link>
            </div>

            <nav className={styles.nav}>
                {DASHBOARD_LINKS.map((link) => {
                    const isActive = pathname === link.href;
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

            <div className={styles.footer}>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <span>🚪</span> Sair
                </button>
            </div>
        </aside>
    );
}
