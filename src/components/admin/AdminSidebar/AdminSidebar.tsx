'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './AdminSidebar.module.css';

const ADMIN_LINKS = [
    { href: '/admin', label: 'Dashboard Global', icon: '🌐' },
    { href: '/admin/anunciantes', label: 'Anunciantes (Tenants)', icon: '👥' },
    { href: '/admin/perto-de-voce', label: 'Perto de Você', icon: '📍' },
    { href: '/admin/financeiro', label: 'Planos e Receita', icon: '💎' },
    { href: '/admin/configuracoes', label: 'Configurações', icon: '⚙️' },
];

export default function AdminSidebar() {
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
                    <span className={styles.logoText}>Super Admin</span>
                </Link>
            </div>

            <nav className={styles.nav}>
                {ADMIN_LINKS.map((link) => {
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
