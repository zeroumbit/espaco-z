import DashboardSidebar from '@/components/dashboard/DashboardSidebar/DashboardSidebar';
import styles from './layout.module.css';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch profile to verify role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

    // Only advertisers (or admins helping) can access the dashboard
    if (!profile || (profile.role !== 'anunciante' && profile.role !== 'admin')) {
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
        </div>
    );
}
