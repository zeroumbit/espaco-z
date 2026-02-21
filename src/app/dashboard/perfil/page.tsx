'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function PerfilPage() {
    const supabase = createClient();
    const [profile, setProfile] = useState<any>(null);
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states
    const [profileForm, setProfileForm] = useState({
        full_name: '',
        phone: '',
        city: '',
        state: ''
    });

    const [tenantForm, setTenantForm] = useState({
        name: '',
        business_type: 'PJ',
        document: '',
        main_module: 'hospedagem',
        city: '',
        state: '',
        whatsapp: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchProfileAndTenant = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) throw new Error('Usuário não autenticado');

                // Buscar perfil
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (profileError) throw profileError;
                setProfile(profileData);
                setProfileForm({
                    full_name: profileData.full_name || '',
                    phone: profileData.phone || '',
                    city: profileData.city || '',
                    state: profileData.state || ''
                });

                // Buscar tenant
                if (profileData.tenant_id) {
                    const { data: tenantData, error: tenantError } = await supabase
                        .from('tenants')
                        .select('*')
                        .eq('id', profileData.tenant_id)
                        .single();

                    if (!tenantError && tenantData) {
                        setTenant(tenantData);
                        setTenantForm({
                            name: tenantData.name || '',
                            business_type: tenantData.business_type || 'PJ',
                            document: tenantData.document || '',
                            main_module: tenantData.main_module || 'hospedagem',
                            city: tenantData.city || '',
                            state: tenantData.state || '',
                            whatsapp: tenantData.whatsapp || ''
                        });
                    }
                } else {
                    // Pre-fill location from profile if tenant is missing
                    setTenantForm(prev => ({
                        ...prev,
                        city: profileData.city || '',
                        state: profileData.state || ''
                    }));
                }
            } catch (err: any) {
                console.error('Erro ao carregar dados:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndTenant();
    }, []);

    const handleSaveProfile = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: profileForm.full_name,
                    phone: profileForm.phone,
                    city: profileForm.city,
                    state: profileForm.state
                })
                .eq('id', profile.id);

            if (updateError) throw updateError;
            setSuccess('Dados pessoais atualizados com sucesso!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCreateTenant = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Sessão expirada');

            // 1. Criar Tenant
            const slug = tenantForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Math.random().toString(36).substring(2, 5);
            
            const { data: newTenant, error: tError } = await supabase
                .from('tenants')
                .insert({
                    name: tenantForm.name,
                    slug: slug,
                    email: user.email,
                    city: tenantForm.city,
                    state: tenantForm.state,
                    user_id: user.id,
                    business_type: tenantForm.business_type,
                    document: tenantForm.document,
                    main_module: tenantForm.main_module,
                    whatsapp: tenantForm.whatsapp,
                    subscription_plan: 'trial',
                    is_active: true
                })
                .select()
                .single();

            if (tError) throw tError;

            // 2. Vincular ao Perfil
            const { error: pError } = await supabase
                .from('profiles')
                .update({ 
                    tenant_id: newTenant.id,
                    role: 'anunciante'
                })
                .eq('user_id', user.id);

            if (pError) throw pError;

            setTenant(newTenant);
            setSuccess('Empresa cadastrada com sucesso! Agora você pode gerenciar seus espaços.');
            setTimeout(() => window.location.reload(), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('A nova senha e a confirmação não coincidem.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordForm.newPassword
            });
            if (error) throw error;
            setSuccess('Senha atualizada com sucesso!');
            setPasswordForm({ newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className={styles.loading}>Carregando...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Configurações de Perfil</h1>
                <p className={styles.subtitle}>Gerencie suas informações e credenciais de acesso.</p>
            </header>

            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}

            <div className={styles.sections}>
                {/* DADOS PESSOAIS */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>👤 Dados Pessoais</h2>
                        <p>Informações de contato do responsável pela conta.</p>
                    </div>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Nome Completo</label>
                            <input 
                                type="text" 
                                value={profileForm.full_name}
                                onChange={e => setProfileForm({...profileForm, full_name: e.target.value})}
                                placeholder="Seu nome"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Telefone / WhatsApp</label>
                            <input 
                                type="text" 
                                value={profileForm.phone}
                                onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Cidade</label>
                            <input 
                                type="text" 
                                value={profileForm.city}
                                onChange={e => setProfileForm({...profileForm, city: e.target.value})}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Estado</label>
                            <input 
                                type="text" 
                                value={profileForm.state}
                                onChange={e => setProfileForm({...profileForm, state: e.target.value})}
                            />
                        </div>
                    </div>
                    <button className={styles.saveBtn} onClick={handleSaveProfile} disabled={saving}>
                        {saving ? 'Salvando...' : 'Atualizar Dados Pessoais'}
                    </button>
                </section>

                {/* EMPRESA / ONBOARDING */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>🏢 Empresa / Profissional</h2>
                        <p>{tenant ? 'Gerencie os dados públicos da sua empresa.' : 'Complete seu cadastro para começar a anunciar.'}</p>
                    </div>

                    {!tenant && (
                        <div className={styles.onboardingNotice}>
                            <span className={styles.noticeIcon}>�</span>
                            <p>Preencha os dados abaixo para ativar sua conta de anunciante e começar a postar seus imóveis.</p>
                        </div>
                    )}

                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Módulo Principal</label>
                            <select 
                                value={tenantForm.main_module}
                                onChange={e => setTenantForm({...tenantForm, main_module: e.target.value})}
                            >
                                <option value="hospedagem">🏨 Hospedagem (Diárias/Temporada)</option>
                                <option value="alugueis">🏠 Aluguéis (Mensal/Anual)</option>
                                <option value="vendas">🏡 Vendas (Compra e Venda)</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Nome Fantasia / Nome Público</label>
                            <input 
                                type="text" 
                                value={tenantForm.name}
                                onChange={e => setTenantForm({...tenantForm, name: e.target.value})}
                                placeholder="Ex: Imobiliária Sol"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Tipo de Pessoa</label>
                            <select 
                                value={tenantForm.business_type}
                                onChange={e => setTenantForm({...tenantForm, business_type: e.target.value})}
                            >
                                <option value="PJ">Pessoa Jurídica (CNPJ)</option>
                                <option value="PF">Pessoa Física (CPF)</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>{tenantForm.business_type === 'PJ' ? 'CNPJ' : 'CPF'}</label>
                            <input 
                                type="text" 
                                value={tenantForm.document}
                                onChange={e => setTenantForm({...tenantForm, document: e.target.value})}
                                placeholder="00.000.000/0000-00"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>WhatsApp Público</label>
                            <input 
                                type="text" 
                                value={tenantForm.whatsapp}
                                onChange={e => setTenantForm({...tenantForm, whatsapp: e.target.value})}
                                placeholder="(00) 99999-9999"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Cidade Atuação</label>
                            <input 
                                type="text" 
                                value={tenantForm.city}
                                onChange={e => setTenantForm({...tenantForm, city: e.target.value})}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Estado Atuação</label>
                            <input 
                                type="text" 
                                value={tenantForm.state}
                                onChange={e => setTenantForm({...tenantForm, state: e.target.value})}
                            />
                        </div>
                    </div>

                    {tenant ? (
                        <button className={styles.saveBtn} disabled={true}>
                            Dados da Empresa (Edição em breve)
                        </button>
                    ) : (
                        <button className={styles.createTenantBtn} onClick={handleCreateTenant} disabled={saving}>
                            {saving ? 'Criando...' : 'Ativar Minha Conta de Anunciante'}
                        </button>
                    )}
                </section>

                {/* SEGURANÇA */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>🔐 Segurança</h2>
                        <p>Altere sua senha de acesso.</p>
                    </div>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Nova Senha</label>
                            <input 
                                type="password" 
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Confirmar Senha</label>
                            <input 
                                type="password" 
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            />
                        </div>
                    </div>
                    <button className={styles.changePasswordBtn} onClick={handleChangePassword} disabled={saving}>
                        Alterar Minha Senha
                    </button>
                </section>
            </div>
        </div>
    );
}