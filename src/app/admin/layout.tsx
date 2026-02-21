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

    const isSuperAdminEmail = user.email === 'zeroumbit@gmail.com';
    let profile = null;

    // Retry Logic for Database Synchronization
    for (let attempt = 1; attempt <= 3; attempt++) {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (!error && data) {
            profile = data;
            break;
        }

        if (isSuperAdminEmail) break; // Super Admin não precisa de profile pra passar

        if (attempt < 3) {
            console.log(`[Admin Layout] Sincronizando perfil (tentativa ${attempt})...`);
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }

    // Se é o admin mestre, permite acesso incondicional
    if (isSuperAdminEmail) {
        console.log('Acesso TOTAL concedido via Master Email:', user.email);
    } else {
        // Para outros usuários, faz a checagem rigorosa do cargo 'admin'
        if (!profile || profile.role !== 'admin') {
            console.log(`Bloqueado: ${user.email} tentou acessar admin sem permissão. Role: ${profile?.role}`);
            redirect('/dashboard');
        }
    }

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
