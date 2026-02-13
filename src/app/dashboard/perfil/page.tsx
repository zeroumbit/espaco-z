'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function PerfilPage() {
    const supabase = createClient();
    const [profile, setProfile] = useState<any>(null);
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchProfileAndTenant = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                
                if (userError || !user) {
                    setError('Usuário não autenticado');
                    return;
                }

                // Buscar perfil
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (profileError) throw profileError;
                setProfile(profileData);

                // Buscar tenant
                if (profileData.tenant_id) {
                    const { data: tenantData, error: tenantError } = await supabase
                        .from('tenants')
                        .select('*')
                        .eq('id', profileData.tenant_id)
                        .single();

                    if (tenantError) throw tenantError;
                    setTenant(tenantData);
                }
            } catch (err: any) {
                console.error('Erro ao carregar dados do perfil:', err);
                setError(err.message || 'Erro ao carregar dados do perfil');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndTenant();
    }, []);

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('A nova senha e a confirmação de senha não coincidem.');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        try {
            // Obtém o email do usuário atual
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('Usuário não autenticado.');
                return;
            }

            // Faz login com a senha atual para verificar
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: passwordForm.currentPassword,
            });

            if (signInError) {
                setError('Senha atual incorreta.');
                return;
            }

            // Atualiza a senha
            const { error: updateError } = await supabase.auth.updateUser({
                password: passwordForm.newPassword
            });

            if (updateError) {
                setError('Erro ao atualizar a senha: ' + updateError.message);
                return;
            }

            // Limpa o formulário e exibe mensagem de sucesso
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            alert('Senha atualizada com sucesso!');
            setError('');
        } catch (err: any) {
            console.error('Erro ao alterar senha:', err);
            setError('Erro ao alterar a senha. Por favor, tente novamente.');
        }
    };

    const handleDeleteAccount = async () => {
        // Primeira confirmação
        if (confirm("⚠️ ATENÇÃO: Você está prestes a excluir sua conta. Esta ação é irreversível e removerá todos os seus dados e anúncios da plataforma.")) {
            // Segunda confirmação com instrução mais explícita
            const confirmationText = "EXCLUIR MINHA CONTA";
            const userInput = prompt(
                `Para confirmar a exclusão da sua conta, digite "${confirmationText}" no campo abaixo:\n\n` +
                "AVISO: Esta ação removerá permanentemente todos os seus dados, anúncios e informações da plataforma."
            );

            if (userInput === confirmationText) {
                try {
                    const { data: { user }, error: userError } = await supabase.auth.getUser();

                    if (userError || !user) {
                        alert('Erro: Usuário não autenticado');
                        return;
                    }

                    // Primeiro, desative o tenant
                    if (profile?.tenant_id) {
                        const { error: tenantUpdateError } = await supabase
                            .from('tenants')
                            .update({ is_active: false })
                            .eq('id', profile.tenant_id);

                        if (tenantUpdateError) {
                            console.error('Erro ao desativar tenant:', tenantUpdateError);
                            alert('Erro ao desativar sua conta. Por favor, entre em contato com o suporte.');
                            return;
                        }
                    }

                    // Em seguida, exclua o usuário do auth
                    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);

                    if (deleteUserError) {
                        console.error('Erro ao excluir usuário:', deleteUserError);
                        alert('Erro ao excluir sua conta. Por favor, entre em contato com o suporte.');
                        return;
                    }

                    // Redirecione para a página inicial após a exclusão
                    window.location.href = '/';
                } catch (err: any) {
                    console.error('Erro ao excluir conta:', err);
                    alert('Erro ao excluir sua conta. Por favor, entre em contato com o suporte.');
                }
            } else {
                alert('Operação cancelada. A confirmação não foi digitada corretamente.');
            }
        }
    };

    if (loading) return <div className={styles.loading}>Carregando...</div>;
    if (error) return <div className={styles.error}>Erro: {error}</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Meu Perfil</h1>
            <p className={styles.subtitle}>Gerencie suas informações pessoais e de empresa.</p>

            <div className={styles.profileSection}>
                <h2>Dados Pessoais</h2>
                <div className={styles.formGroup}>
                    <label>Nome Completo</label>
                    <input 
                        type="text" 
                        value={profile?.full_name || ''} 
                        readOnly 
                        className={styles.readOnlyInput}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Email</label>
                    <input 
                        type="email" 
                        value={profile?.user_id ? 'Email protegido' : ''} 
                        readOnly 
                        className={styles.readOnlyInput}
                    />
                </div>
            </div>

            {tenant && (
                <div className={styles.profileSection}>
                    <h2>Dados da Empresa</h2>
                    <div className={styles.formGroup}>
                        <label>Nome da Empresa</label>
                        <input
                            type="text"
                            value={tenant?.name || ''}
                            readOnly
                            className={styles.readOnlyInput}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Plano Atual</label>
                        <input
                            type="text"
                            value={tenant?.subscription_plan || ''}
                            readOnly
                            className={styles.readOnlyInput}
                        />
                    </div>
                </div>
            )}

            <div className={styles.securitySection}>
                <h2>Segurança da Conta</h2>
                <div className={styles.passwordChangeForm}>
                    <div className={styles.formGroup}>
                        <label>Senha Atual</label>
                        <div className={styles.passwordContainer}>
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                className={styles.input}
                                placeholder="Digite sua senha atual"
                            />
                            <button
                                type="button"
                                className={styles.togglePassword}
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                aria-label={showCurrentPassword ? "Esconder senha" : "Mostrar senha"}
                            >
                                {showCurrentPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Nova Senha</label>
                        <div className={styles.passwordContainer}>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                className={styles.input}
                                placeholder="Digite sua nova senha"
                            />
                            <button
                                type="button"
                                className={styles.togglePassword}
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                aria-label={showNewPassword ? "Esconder senha" : "Mostrar senha"}
                            >
                                {showNewPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Confirmar Nova Senha</label>
                        <div className={styles.passwordContainer}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                className={styles.input}
                                placeholder="Confirme sua nova senha"
                            />
                            <button
                                type="button"
                                className={styles.togglePassword}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Esconder senha" : "Mostrar senha"}
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <button
                        className={styles.changePasswordBtn}
                        onClick={handleChangePassword}
                    >
                        Alterar Senha
                    </button>
                </div>
            </div>

            <div className={styles.dangerZone}>
                <h2>Zona de Perigo</h2>
                <div className={styles.warningMessage}>
                    <p>⚠️ Excluir sua conta removerá permanentemente todos os seus dados e anúncios da plataforma.</p>
                    <p>Não será possível recuperar nenhuma informação após a exclusão.</p>
                </div>
                <button
                    className={styles.deleteAccountBtn}
                    onClick={handleDeleteAccount}
                >
                    Excluir Minha Conta
                </button>
            </div>
        </div>
    );
}