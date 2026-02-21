'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';
import Link from 'next/link';

export default function RegisterAdvertiserPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        city: 'Fortaleza',
        state: 'CE',

        termsAccepted: true // Já vem marcado
    });
    
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
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Erro ao criar usuário.');

            // 2. Criar o Tenant (Empresa)
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

            if (tenantError) throw tenantError;

            // 3. Atualizar o Perfil
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    role: 'anunciante',
                    tenant_id: tenant.id
                })
                .eq('user_id', authData.user.id);

            if (profileError) throw profileError;

            // 4. Redirecionar para o Dashboard (Painel do Lojista)
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
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>Estado</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.state}
                                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Cidade</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                />
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