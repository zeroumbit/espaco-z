'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './page.module.css';

interface Tenant {
    id: string;
    name: string;
    email: string;
    city: string;
    state: string;
    subscription_plan: string;
    is_active: boolean;
    created_at: string;
}

interface TenantTableProps {
    tenants: Tenant[] | null;
}

export default function TenantTable({ tenants }: TenantTableProps) {
    const handleStatusToggle = async (tenant: Tenant) => {
        // Primeira confirmação
        if (confirm(tenant.is_active
            ? "Você está prestes a SUSPENDER este anunciante. Esta ação impedirá que o anunciante acesse sua conta e gerencie seus espaços."
            : "Você está prestes a REATIVAR este anunciante. Esta ação permitirá que o anunciante acesse sua conta e gerencie seus espaços novamente."
        )) {
            // Segunda confirmação com instrução mais explícita
            const confirmationText = tenant.is_active
                ? "CONFIRMAR SUSPENSÃO"
                : "CONFIRMAR REATIVAÇÃO";

            const userInput = prompt(
                `Para confirmar, digite "${confirmationText}" no campo abaixo:\n\n` +
                (tenant.is_active
                    ? "AVISO: Esta ação suspenderá o acesso do anunciante à plataforma."
                    : "AVISO: Esta ação reativará o acesso do anunciante à plataforma.")
            );

            if (userInput === confirmationText) {
                try {
                    const response = await fetch(`/api/admin/tenants/${tenant.id}`, {
                        method: 'PATCH',
                    });

                    if (response.ok) {
                        window.location.reload();
                    } else {
                        alert('Erro ao atualizar o status do anunciante');
                    }
                } catch (error) {
                    console.error('Erro na requisição:', error);
                    alert('Erro ao atualizar o status do anunciante');
                }
            } else {
                alert('Operação cancelada. A confirmação não foi digitada corretamente.');
            }
        }
    };

    return (
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
                                    <button className={styles.actionBtn} title="Ver Espaços">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                    </button>
                                    <button
                                        className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                                        title={tenant.is_active ? "Suspender" : "Reativar"}
                                        onClick={() => handleStatusToggle(tenant)}
                                    >
                                        {tenant.is_active ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                                        )}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {(!tenants || tenants.length === 0) && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--neutral-600)' }}>
                                Nenhum anunciante cadastrado ainda.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
