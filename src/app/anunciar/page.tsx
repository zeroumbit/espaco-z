'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';
import Link from 'next/link';
import { buscarEnderecoPorCep, buscarCidadesPorEstadoIBGE, buscarEstadosIBGE } from '@/lib/location';
import { Loader2 } from 'lucide-react';

export default function RegisterAdvertiserPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [stateLoading, setStateLoading] = useState(false);
    const [cityLoading, setCityLoading] = useState(false);
    const [states, setStates] = useState<{ sigla: string, nome: string }[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [error, setError] = useState('');

    // Busca estados iniciais
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

    const [formData, setFormData] = useState({
        // TIPO DE ANUNCIO
        mainModule: 'hospedagem',

        // DADOS DE ACESSO
        email: '',
        password: '',

        // DADOS DA EMPRESA
        businessType: 'PJ', // PF ou PJ
        document: '', // CPF ou CNPJ
        name: '', // Nome Fantasia

        // LOCALIZAÇÃO
        cep: '',
        city: '',
        state: '',

        termsAccepted: true // Já vem marcado
    });

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').substring(0, 8);
        const formatted = val.replace(/(\d{5})(\d)/, '$1-$2');
        setFormData(prev => ({ ...prev, cep: formatted }));

        if (val.length === 8) {
            setCepLoading(true);
            try {
                const data = await buscarEnderecoPorCep(val);
                if (data) {
                    setFormData(prev => ({
                        ...prev,
                        state: data.state,
                        city: data.city // Será validado pelo render
                    }));
                }
            } catch (err) {
                console.error('Erro ao buscar CEP:', err);
            } finally {
                setCepLoading(false);
            }
        }
    };

    // Carregar cidades quando o estado mudar
    useEffect(() => {
        async function loadCities() {
            if (!formData.state) {
                setCities([]);
                return;
            }
            setCityLoading(true);
            try {
                const data = await buscarCidadesPorEstadoIBGE(formData.state);
                setCities(data.map(c => c.nome));
            } catch (err) {
                console.error('Erro ao carregar cidades:', err);
            } finally {
                setCityLoading(false);
            }
        }
        loadCities();
    }, [formData.state]);
    
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.termsAccepted) {
            setError('Você precisa aceitar os termos de uso para continuar.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Criar o usuário no Auth
            console.log('[Cadastro] Iniciando signUp...');
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                    },
                    emailRedirectTo: undefined, // Desabilita redirect de confirmação
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Erro ao criar usuário.');
            console.log('[Cadastro] Usuário criado:', authData.user.id);

            // Verificar se o usuário tem sessão ativa (email não confirmado = sem sessão)
            if (!authData.session) {
                console.log('[Cadastro] Sessão não ativa. Tentando login automático...');
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (loginError) {
                    console.error('[Cadastro] Erro no login automático:', loginError);
                    throw new Error('Conta criada com sucesso! Porém não foi possível fazer login automático. Por favor, confirme seu e-mail e faça login manualmente.');
                }
                console.log('[Cadastro] Login automático OK:', loginData.user?.id);
            }

            // Aguardar um momento para o trigger handle_new_user criar o profile
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 2. Criar o Tenant (Empresa)
            console.log('[Cadastro] Criando tenant...');
            const { data: tenant, error: tenantError } = await supabase
                .from('tenants')
                .insert({
                    name: formData.name,
                    slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Math.random().toString(36).substring(2, 5),
                    email: formData.email,
                    city: formData.city,
                    state: formData.state,
                    user_id: authData.user.id,
                    business_type: formData.businessType,
                    document: formData.document,
                    main_module: formData.mainModule,
                    subscription_plan: 'trial',
                    is_active: true
                })
                .select()
                .single();

            if (tenantError) {
                console.error('[Cadastro] Erro ao criar tenant:', tenantError);
                throw tenantError;
            }
            console.log('[Cadastro] Tenant criado:', tenant.id);

            // 3. Atualizar o Perfil para anunciante
            console.log('[Cadastro] Atualizando perfil para anunciante...');
            
            // Tenta buscar o perfil primeiro para ver se o trigger já criou
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', authData.user.id)
                .single();

            if (!existingProfile) {
                console.log('[Cadastro] Perfil não encontrado, criando manualmente...');
                await supabase.from('profiles').insert({
                    user_id: authData.user.id,
                    full_name: formData.name,
                    role: 'anunciante',
                    tenant_id: tenant.id
                });
            } else {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: formData.name,
                        role: 'anunciante',
                        tenant_id: tenant.id,
                        city: formData.city,
                        state: formData.state
                    })
                    .eq('user_id', authData.user.id);

                if (profileError) {
                    console.error('[Cadastro] Erro ao atualizar perfil:', profileError);
                    throw profileError;
                }
            }

            console.log('[Cadastro] Perfil processado com sucesso.');

            // 4. Refresh da sessão e redirecionamento
            // Aguardamos a replicação do banco e fazemos refresh dos cookies de auth
            console.log('[Cadastro] Aguardando replicação do banco e refresh da sessão...');
            
            // Delay para replicação do banco (tenant/profile)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Refresh explícito da sessão para garantir cookies atualizados
            try {
                const { data: sessionData } = await supabase.auth.getSession();
                console.log('[Cadastro] Sessão refresh:', sessionData?.session ? 'OK' : 'SEM SESSÃO');
            } catch (err) {
                console.warn('[Cadastro] Erro ao refresh session:', err);
            }
            
            console.log('[Cadastro] Redirecionando para /dashboard...');
            router.push('/dashboard');

        } catch (err: any) {
            console.error('Erro no cadastro:', err);
            setError(err.message || 'Erro ao processar seu cadastro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <header className={styles.header}>
                    <Link href="/" className={styles.logoContainer}>
                        <div className={styles.logoIcon}>
                            <span>Z</span>
                        </div>
                        <span className={styles.logoText}>
                            espaço<strong>Z</strong>
                        </span>
                    </Link>
                    <h1 className={styles.title}>Cadastre sua Empresa</h1>
                    <p className={styles.subtitle}>Siga os passos abaixo para começar a anunciar.</p>
                </header>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    {/* TIPO DE ANUNCIO */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>1. Tipo de Anúncio</h3>
                        <div className={styles.moduleGrid}>
                            <button
                                type="button"
                                className={`${styles.moduleBtn} ${formData.mainModule === 'hospedagem' ? styles.moduleActive : ''}`}
                                onClick={() => setFormData({ ...formData, mainModule: 'hospedagem' })}
                            >
                                <span className={styles.moduleIcon}>🏨</span>
                                <span className={styles.moduleLabel}>Hospedagem</span>
                            </button>
                            <button
                                type="button"
                                className={`${styles.moduleBtn} ${formData.mainModule === 'alugueis' ? styles.moduleActive : ''}`}
                                onClick={() => setFormData({ ...formData, mainModule: 'alugueis' })}
                            >
                                <span className={styles.moduleIcon}>🏠</span>
                                <span className={styles.moduleLabel}>Aluguel</span>
                            </button>
                            <button
                                type="button"
                                className={`${styles.moduleBtn} ${formData.mainModule === 'vendas' ? styles.moduleActive : ''}`}
                                onClick={() => setFormData({ ...formData, mainModule: 'vendas' })}
                            >
                                <span className={styles.moduleIcon}>🏡</span>
                                <span className={styles.moduleLabel}>Vendas</span>
                            </button>
                        </div>
                    </div>

                    {/* DADOS DE ACESSO */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>2. Dados de Acesso</h3>
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>E-mail</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="seu@email.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Senha</label>
                                <div className={styles.passwordContainer}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Mínimo 6 caracteres"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                                    >
                                        {showPassword ? (
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
                        </div>
                    </div>

                    {/* DADOS DA EMPRESA */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>3. Dados da Empresa</h3>

                        <div className={styles.field}>
                            <label>Tipo de Documento</label>
                            <div className={styles.radioGroup}>
                                <label className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="businessType"
                                        value="PF"
                                        checked={formData.businessType === 'PF'}
                                        onChange={() => setFormData({ ...formData, businessType: 'PF' })}
                                    />
                                    Pessoa Física
                                </label>
                                <label className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="businessType"
                                        value="PJ"
                                        checked={formData.businessType === 'PJ'}
                                        onChange={() => setFormData({ ...formData, businessType: 'PJ' })}
                                    />
                                    Pessoa Jurídica
                                </label>
                            </div>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>{formData.businessType === 'PF' ? 'CPF' : 'CNPJ'}</label>
                                <input
                                    type="text"
                                    required
                                    placeholder={formData.businessType === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                                    value={formData.document}
                                    onChange={e => setFormData({ ...formData, document: e.target.value })}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Nome Fantasia / Nome Público</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Pousada Sol & Mar"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* LOCALIZAÇÃO */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>4. Localização</h3>

                        {/* CEP e Estado lado a lado */}
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>CEP (Busca automática)</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="text"
                                        placeholder="00000-000"
                                        value={formData.cep}
                                        onChange={handleCepChange}
                                        className={styles.input}
                                    />
                                    {cepLoading && <Loader2 className={styles.spinner} size={18} />}
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label>Estado (UF)</label>
                                <div className={styles.inputWrapper}>
                                    <select
                                        value={formData.state}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            setFormData(prev => ({ 
                                                ...prev, 
                                                state: newValue, 
                                                city: '' 
                                            }));
                                        }}
                                        className={styles.input}
                                        required
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
                        </div>

                        {/* Cidade como SELECT ocupando toda largura */}
                        <div className={styles.field}>
                            <label>Cidade</label>
                            <div className={styles.inputWrapper}>
                                <select
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className={styles.input}
                                    required
                                    disabled={!formData.state || cityLoading}
                                >
                                    <option value="">
                                        {!formData.state ? 'Selecione um estado primeiro' : (cityLoading ? 'Carregando cidades...' : 'Selecione a cidade...')}
                                    </option>
                                    {/* Adiciona a cidade do CEP se ela não estiver na lista do IBGE ainda */}
                                    {formData.city && !cities.includes(formData.city) && (
                                        <option value={formData.city}>{formData.city}</option>
                                    )}
                                    {cities.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                {cityLoading && <Loader2 className={styles.spinner} size={18} />}
                            </div>
                        </div>
                    </div>

                    <div className={styles.termsWrapper}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={formData.termsAccepted}
                                onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
                                required
                            />
                            <span>
                                Li e aceito os <Link href="/termos" target="_blank" className={styles.termsLink}>Termos de Uso</Link> do Espaço Z.
                            </span>
                        </label>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Salvando cadastro...' : 'SALVAR E ACESSAR PAINEL'}
                    </button>

                    <p className={styles.loginLink}>
                        Já tem um cadastro? <Link href="/login">Fazer login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}