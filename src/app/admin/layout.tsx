import { ReactNode } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar/AdminSidebar';
import styles from './layout.module.css';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface AdminLayoutProps {
    children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    console.log('--- ADMIN LAYOUT CHECK ---');
    if (userError || !user) {
        console.log('Sem usuário autenticado, redirecionando para login');
        redirect('/login');
    }

    console.log('Usuário logado:', user.email, user.id);

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

    if (profileError) {
        console.error('Erro ao buscar perfil no servidor:', profileError);
        redirect('/dashboard');
    }

    console.log('Cargo identificado no servidor:', profile?.role);

    const isSuperAdminEmail = user.email === 'zeroumbit@gmail.com';

    if (!profile || (profile.role !== 'admin' && !isSuperAdminEmail)) {
        console.log(`Acesso negado para ${user.email}. Role: ${profile?.role}. Redirecionando para dashboard.`);
        redirect('/dashboard');
    }

    console.log('Acesso concedido ao Super Admin:', user.email);
    console.log('--------------------------');

    return (
        <div className={styles.layout}>
            <AdminSidebar />
            <main className={styles.main}>
                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
