'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';
import { buscarEstadosIBGE, buscarCidadesPorEstadoIBGE } from '@/lib/location';
import { Loader2 } from 'lucide-react';

export default function PerfilPage() {
    const supabase = createClient();
    const [profile, setProfile] = useState<any>(null);
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stateLoading, setStateLoading] = useState(false);
    const [cityLoading, setCityLoading] = useState(false);
    const [states, setStates] = useState<{ sigla: string, nome: string }[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [tenantForm, setTenantForm] = useState({
        name: '',
        business_type: 'PJ',
        document: '',
        main_module: 'hospedagem',
        city: '',
        state: '',
        whatsapp: '',
        cep: '',
        address: '',
        number: '',
        neighborhood: '',
        complement: '',
        atuacao_especifica: [] as string[]
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
                            whatsapp: tenantData.whatsapp || '',
                            cep: tenantData.cep ? tenantData.cep.replace(/(\d{5})(\d)/, '$1-$2') : '',
                            address: tenantData.address || '',
                            number: tenantData.number || '',
                            neighborhood: tenantData.neighborhood || '',
                            complement: tenantData.complement || '',
                            atuacao_especifica: tenantData.atuacao_especifica || []
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

    // Carregar estados (IBGE)
    useEffect(() => {
        async function loadStates() {
            setStateLoading(true);
            try {
                const data = await buscarEstadosIBGE();
                setStates(data);
            } catch (err) {
                console.error('Erro ao carregar estados:', err);
            } finally {
                setStateLoading(false);
            }
        }
        loadStates();
    }, []);

    // Carregar cidades quando o estado do tenant mudar
    useEffect(() => {
        async function loadCities() {
            if (!tenantForm.state) {
                setCities([]);
                return;
            }
            setCityLoading(true);
            try {
                const data = await buscarCidadesPorEstadoIBGE(tenantForm.state);
                setCities(data.map(c => c.nome));
            } catch (err) {
                console.error('Erro ao carregar cidades:', err);
            } finally {
                setCityLoading(false);
            }
        }
        loadCities();
    }, [tenantForm.state]);

    const handleUpdateTenant = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const { error: updateError } = await supabase
                .from('tenants')
                .update({
                    name: tenantForm.name,
                    business_type: tenantForm.business_type,
                    document: tenantForm.document,
                    main_module: tenantForm.main_module,
                    city: tenantForm.city,
                    state: tenantForm.state,
                    whatsapp: tenantForm.whatsapp,
                    cep: tenantForm.cep.replace(/\D/g, ''),
                    address: tenantForm.address,
                    number: tenantForm.number,
                    neighborhood: tenantForm.neighborhood,
                    complement: tenantForm.complement,
                    atuacao_especifica: tenantForm.atuacao_especifica
                })
                .eq('id', tenant.id);

            if (updateError) throw updateError;
            setSuccess('Dados da empresa atualizados com sucesso!');
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
                    cep: tenantForm.cep.replace(/\D/g, ''),
                    address: tenantForm.address,
                    number: tenantForm.number,
                    neighborhood: tenantForm.neighborhood,
                    complement: tenantForm.complement,
                    atuacao_especifica: tenantForm.atuacao_especifica,
                    subscription_plan: 'trial',
                    is_active: true
                })
                .select()
                .single();

            if (tError) throw tError;

            // 2. Vincular ao Perfil e sincronizar dados básicos
            const { error: pError } = await supabase
                .from('profiles')
                .update({
                    tenant_id: newTenant.id,
                    role: 'anunciante',
                    phone: tenantForm.whatsapp,
                    city: tenantForm.city,
                    state: tenantForm.state
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

    // Constantes para as opções de atuação (Sincronizado com onboarding e constants)
    const ATUACAO_OPTIONS_MAP: Record<string, { value: string, label: string }[]> = {
        hospedagem: [
            { value: 'quarto_hotel', label: 'Quarto de Hotel' },
            { value: 'quarto_pousada', label: 'Quarto de Pousada' },
            { value: 'quarto_resort', label: 'Quarto de Resort' },
            { value: 'cama_albergue', label: 'Cama em Albergue' },
            { value: 'casa_inteira', label: 'Casa Inteira' },
            { value: 'apartamento_inteiro', label: 'Apartamento Inteiro' },
            { value: 'quarto_privativo', label: 'Quarto Privativo' },
            { value: 'quarto_compartilhado', label: 'Quarto Compartilhado' },
            { value: 'acomodacao_unica', label: 'Acomodação Única' },
        ],
        alugueis: [
            { value: 'casa', label: 'Casa' },
            { value: 'apartamento', label: 'Apartamento' },
            { value: 'espaco_comercial', label: 'Espaço Comercial' },
            { value: 'quarto_privativo', label: 'Quarto Privativo' },
        ],
        vendas: [
            { value: 'casa', label: 'Casa' },
            { value: 'apartamento', label: 'Apartamento' },
            { value: 'espaco_comercial', label: 'Espaço Comercial' },
        ]
    };

    const currentAtuacaoOptions = ATUACAO_OPTIONS_MAP[tenantForm.main_module] || [];

    const handleAtuacaoToggle = (value: string) => {
        const current = tenantForm.atuacao_especifica;
        const next = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        setTenantForm({ ...tenantForm, atuacao_especifica: next });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Configurações de Perfil</h1>
                <p className={styles.subtitle}>Gerencie suas informações e credenciais de acesso.</p>
            </header>

            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}

            <div className={styles.sections}>
                {/* DADOS DE ACESSO */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>📧 Dados de Acesso</h2>
                        <p>Seu e-mail de acesso à plataforma.</p>
                    </div>
                    <div className={styles.grid}>
                        <div className={styles.field} style={{ gridColumn: 'span 2' }}>
                            <label>E-mail</label>
                            <input
                                type="email"
                                value={profile?.email || ''}
                                disabled
                                className={styles.inputDisabled}
                            />
                        </div>
                    </div>
                </section>

                {/* TIPO DE ANÚNCIO */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>📢 Tipo de Anúncio</h2>
                        <p>Defina como você deseja anunciar na plataforma.</p>
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.field} style={{ gridColumn: 'span 2' }}>
                            <label>Módulo Principal</label>
                            <select
                                value={tenantForm.main_module}
                                onChange={e => setTenantForm({...tenantForm, main_module: e.target.value})}
                                className={styles.input}
                            >
                                <option value="hospedagem">🏨 Hospedagem (Diárias/Temporada)</option>
                                <option value="alugueis">🏠 Aluguéis (Mensal/Anual)</option>
                                <option value="vendas">🏡 Vendas (Compra e Venda)</option>
                            </select>
                        </div>
                    </div>
                </section>
                
                {/* ÁREAS DE ATUAÇÃO */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>🎯 Áreas de Atuação</h2>
                        <p>Selecione os tipos de imóveis que você trabalha. Isso filtrará as opções na criação de anúncios.</p>
                    </div>

                    <div className={styles.atuacaoGrid}>
                        {currentAtuacaoOptions.map(opt => (
                            <label key={opt.value} className={styles.atuacaoItem}>
                                <input 
                                    type="checkbox"
                                    checked={tenantForm.atuacao_especifica.includes(opt.value)}
                                    onChange={() => handleAtuacaoToggle(opt.value)}
                                />
                                <span>{opt.label}</span>
                            </label>
                        ))}
                    </div>
                    {currentAtuacaoOptions.length === 0 && (
                        <p className={styles.hint}>Escolha um Módulo Principal para ver as opções.</p>
                    )}
                </section>

                {/* DADOS DA EMPRESA */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>🏢 Dados da Empresa</h2>
                        <p>{tenant ? 'Gerencie os dados públicos da sua empresa.' : 'Complete seu cadastro para começar a anunciar.'}</p>
                    </div>

                    {!tenant && (
                        <div className={styles.onboardingNotice}>
                            <span className={styles.noticeIcon}>💡</span>
                            <p>Preencha os dados abaixo para ativar sua conta de anunciante e começar a postar seus imóveis.</p>
                        </div>
                    )}

                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Nome Fantasia / Nome Público</label>
                            <input
                                type="text"
                                value={tenantForm.name}
                                onChange={e => setTenantForm({...tenantForm, name: e.target.value})}
                                placeholder="Ex: Imobiliária Sol"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Tipo de Pessoa</label>
                            <select
                                value={tenantForm.business_type}
                                onChange={e => setTenantForm({...tenantForm, business_type: e.target.value})}
                                className={styles.input}
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
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>WhatsApp Público</label>
                            <input
                                type="text"
                                value={tenantForm.whatsapp}
                                onChange={e => setTenantForm({...tenantForm, whatsapp: e.target.value})}
                                placeholder="(00) 99999-9999"
                                className={styles.input}
                            />
                        </div>
                    </div>
                </section>

                {/* LOCALIZAÇÃO */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>📍 Localização</h2>
                        <p>Endereço completo da sua empresa.</p>
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Estado</label>
                            <div className={styles.inputWrapper}>
                                <select
                                    value={tenantForm.state}
                                    onChange={e => setTenantForm({...tenantForm, state: e.target.value, city: ''})}
                                    className={styles.input}
                                    disabled={stateLoading}
                                >
                                    <option value="">{stateLoading ? 'Carregando...' : 'Selecione...'}</option>
                                    {states.map(s => (
                                        <option key={s.sigla} value={s.sigla}>{s.nome}</option>
                                    ))}
                                </select>
                                {stateLoading && <Loader2 className={styles.spinner} size={18} />}
                            </div>
                        </div>
                        <div className={styles.field}>
                            <label>Cidade</label>
                            <div className={styles.inputWrapper}>
                                <select
                                    value={tenantForm.city}
                                    onChange={e => setTenantForm({...tenantForm, city: e.target.value})}
                                    className={styles.input}
                                    disabled={!tenantForm.state || cityLoading}
                                >
                                    <option value="">
                                        {!tenantForm.state ? 'Selecione o estado primeiro' : (cityLoading ? 'Carregando...' : 'Selecione a cidade...')}
                                    </option>
                                    {tenantForm.city && !cities.includes(tenantForm.city) && (
                                        <option value={tenantForm.city}>{tenantForm.city}</option>
                                    )}
                                    {cities.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                {cityLoading && <Loader2 className={styles.spinner} size={18} />}
                            </div>
                        </div>
                        <div className={styles.field}>
                            <label>CEP</label>
                            <input
                                type="text"
                                value={tenantForm.cep ? tenantForm.cep.replace(/(\d{5})(\d)/, '$1-$2') : ''}
                                onChange={e => setTenantForm({...tenantForm, cep: e.target.value.replace(/\D/g, '').substring(0, 8)})}
                                placeholder="00000-000"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field} style={{ gridColumn: 'span 2' }}>
                            <label>Logradouro / Rua</label>
                            <input
                                type="text"
                                value={tenantForm.address}
                                onChange={e => setTenantForm({...tenantForm, address: e.target.value})}
                                placeholder="Digite o nome da rua..."
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Número</label>
                            <input
                                type="text"
                                value={tenantForm.number}
                                onChange={e => setTenantForm({...tenantForm, number: e.target.value})}
                                placeholder="Digite o número..."
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Bairro</label>
                            <input
                                type="text"
                                value={tenantForm.neighborhood}
                                onChange={e => setTenantForm({...tenantForm, neighborhood: e.target.value})}
                                placeholder="Digite o bairro..."
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field} style={{ gridColumn: 'span 2' }}>
                            <label>Complemento (opcional)</label>
                            <input
                                type="text"
                                value={tenantForm.complement}
                                onChange={e => setTenantForm({...tenantForm, complement: e.target.value})}
                                placeholder="Ex: Sala 101, Ao lado do mercado..."
                                className={styles.input}
                            />
                        </div>
                    </div>

                    {tenant ? (
                        <button className={styles.saveBtn} onClick={handleUpdateTenant} disabled={saving}>
                            {saving ? 'Salvando...' : 'Salvar Dados da Empresa'}
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
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Confirmar Senha</label>
                            <input 
                                type="password" 
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                className={styles.input}
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