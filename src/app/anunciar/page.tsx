'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import type { OnboardingStep, OnboardingFormData } from '@/types/onboarding';
import { ONBOARDING_STEPS, INITIAL_ONBOARDING_DATA } from '@/types/onboarding';
import { credentialsSchema, legalEntitySchema, specializationSchema } from '@/lib/validations/onboarding';
import CredentialsStep from '@/components/onboarding/CredentialsStep';
import LegalEntityStep from '@/components/onboarding/LegalEntityStep';
import BusinessSpecializationStep from '@/components/onboarding/BusinessSpecializationStep';
import styles from './page.module.css';

export default function RegisterAdvertiserPage() {
    const router = useRouter();
    const supabase = createClient();

    const [currentStep, setCurrentStep] = useState<OnboardingStep>('credentials');
    const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_ONBOARDING_DATA);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

    const stepIndex = ONBOARDING_STEPS.findIndex((s) => s.id === currentStep);

    // ---- Validação por step ----
    const validateStep = (step: OnboardingStep): boolean => {
        setStepErrors({});
        try {
            switch (step) {
                case 'credentials':
                    credentialsSchema.parse(formData.credentials);
                    break;
                case 'legal_entity':
                    legalEntitySchema.parse(formData.legalEntity);
                    break;
                case 'specialization':
                    specializationSchema.parse(formData.specialization);
                    break;
            }
            return true;
        } catch (err: any) {
            if (err.errors) {
                const errors: Record<string, string> = {};
                for (const issue of err.errors) {
                    const path = issue.path.join('.');
                    if (!errors[path]) {
                        errors[path] = issue.message;
                    }
                }
                setStepErrors(errors);
            }
            return false;
        }
    };

    // ---- Navegação ----
    const goNext = () => {
        if (!validateStep(currentStep)) return;
        const nextIdx = stepIndex + 1;
        if (nextIdx < ONBOARDING_STEPS.length) {
            setCurrentStep(ONBOARDING_STEPS[nextIdx].id);
            setError('');
        }
    };

    const goBack = () => {
        const prevIdx = stepIndex - 1;
        if (prevIdx >= 0) {
            setCurrentStep(ONBOARDING_STEPS[prevIdx].id);
            setStepErrors({});
            setError('');
        }
    };

    // ---- Submit final (apenas no último step) ----
    const handleSubmit = async () => {
        if (!validateStep('specialization')) return;
        if (!formData.termsAccepted) {
            setError('Você precisa aceitar os termos de uso para continuar.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { credentials, legalEntity, specialization } = formData;

            // 1. Criar o usuário no Auth
            console.log('[Cadastro] Iniciando signUp...');
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: credentials.email,
                password: credentials.password,
                options: {
                    data: {
                        full_name: credentials.name,
                    },
                    emailRedirectTo: undefined,
                },
            });

            if (authError) {
                console.error('[Cadastro] Erro auth:', authError.message, authError.status);
                if (authError.message.includes('Database error')) {
                    throw new Error(
                        'Erro interno no banco de dados ao criar o usuário. ' +
                        'Isso pode significar que o trigger "handle_new_user" está falhando. ' +
                        'Verifique se a função existe corretamente no Supabase.'
                    );
                }
                if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
                    throw new Error('Este e-mail já está cadastrado. Tente fazer login.');
                }
                throw authError;
            }
            if (!authData.user) throw new Error('Erro ao criar usuário.');
            console.log('[Cadastro] Usuário criado:', authData.user.id);

            // Login automático se sem sessão
            if (!authData.session) {
                console.log('[Cadastro] Sessão não ativa. Tentando login automático...');
                const { error: loginError } = await supabase.auth.signInWithPassword({
                    email: credentials.email,
                    password: credentials.password,
                });
                if (loginError) {
                    throw new Error('Conta criada! Porém não foi possível fazer login automático. Confirme seu e-mail e faça login manualmente.');
                }
            }

            // Aguarda trigger handle_new_user
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // 2. Criar o Tenant (Empresa)
            const companyName = legalEntity.companyName || credentials.name;
            const slug = companyName
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                + '-' + Math.random().toString(36).substring(2, 5);

            console.log('[Cadastro] Criando tenant...');
            const { data: tenant, error: tenantError } = await supabase
                .from('tenants')
                .insert({
                    name: companyName,
                    slug,
                    email: credentials.email,
                    city: 'Fortaleza',
                    state: 'CE',
                    user_id: authData.user.id,
                    business_type: legalEntity.businessType,
                    document: legalEntity.document,
                    main_module: specialization.mainModule,
                    atuacao_especifica: specialization.atuacaoEspecifica,
                    subscription_plan: 'trial',
                    is_active: true,
                })
                .select()
                .single();

            if (tenantError) {
                console.error('[Cadastro] Erro ao criar tenant:', tenantError);
                throw tenantError;
            }
            console.log('[Cadastro] Tenant criado:', tenant.id);

            // 3. Atualizar o Perfil para anunciante
            console.log('[Cadastro] Atualizando perfil...');
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', authData.user.id)
                .single();

            if (!existingProfile) {
                await supabase.from('profiles').insert({
                    user_id: authData.user.id,
                    full_name: credentials.name,
                    role: 'anunciante',
                    tenant_id: tenant.id,
                });
            } else {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: credentials.name,
                        role: 'anunciante',
                        tenant_id: tenant.id,
                    })
                    .eq('user_id', authData.user.id);

                if (profileError) throw profileError;
            }

            console.log('[Cadastro] Perfil processado com sucesso.');

            // 4. Refresh da sessão e redirecionamento
            await new Promise((resolve) => setTimeout(resolve, 2000));
            try {
                await supabase.auth.getSession();
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

    const isLastStep = currentStep === 'specialization';

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                {/* Header */}
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
                    <p className={styles.subtitle}>
                        Siga os passos abaixo para começar a anunciar.
                    </p>
                </header>

                {/* Progress Steps */}
                <div className={styles.progressBar}>
                    {ONBOARDING_STEPS.map((s, i) => (
                        <div key={s.id} className={styles.progressItem}>
                            {i > 0 && (
                                <div
                                    className={`${styles.progressLine} ${i <= stepIndex ? styles.progressLineDone : ''}`}
                                />
                            )}
                            <div
                                className={`${styles.progressDot} ${
                                    s.id === currentStep
                                        ? styles.progressDotActive
                                        : i < stepIndex
                                            ? styles.progressDotDone
                                            : ''
                                }`}
                            >
                                {i < stepIndex ? '✓' : s.icon}
                            </div>
                            <span
                                className={`${styles.progressLabel} ${
                                    s.id === currentStep ? styles.progressLabelActive : ''
                                }`}
                            >
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Error global */}
                {error && <div className={styles.error}>{error}</div>}

                {/* Step Content */}
                <div className={styles.stepContent} key={currentStep}>
                    {currentStep === 'credentials' && (
                        <CredentialsStep
                            data={formData.credentials}
                            onChange={(credentials) =>
                                setFormData((prev) => ({ ...prev, credentials }))
                            }
                            errors={stepErrors}
                        />
                    )}

                    {currentStep === 'legal_entity' && (
                        <LegalEntityStep
                            data={formData.legalEntity}
                            onChange={(legalEntity) =>
                                setFormData((prev) => ({ ...prev, legalEntity }))
                            }
                            errors={stepErrors}
                        />
                    )}

                    {currentStep === 'specialization' && (
                        <BusinessSpecializationStep
                            data={formData.specialization}
                            onChange={(specialization) =>
                                setFormData((prev) => ({ ...prev, specialization }))
                            }
                            errors={stepErrors}
                        />
                    )}
                </div>

                {/* Terms (only on last step) */}
                {isLastStep && (
                    <div className={styles.termsWrapper}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={formData.termsAccepted}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        termsAccepted: e.target.checked,
                                    }))
                                }
                            />
                            <span>
                                Li e aceito os{' '}
                                <Link href="/termos" target="_blank" className={styles.termsLink}>
                                    Termos de Uso
                                </Link>{' '}
                                do Espaço Z.
                            </span>
                        </label>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className={styles.actions}>
                    {stepIndex > 0 && (
                        <button
                            type="button"
                            className={styles.backBtn}
                            onClick={goBack}
                            disabled={loading}
                        >
                            ← Voltar
                        </button>
                    )}

                    {isLastStep ? (
                        <button
                            type="button"
                            className={styles.submitBtn}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Criando sua conta...' : '🚀 CRIAR CONTA E ACESSAR'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={styles.nextBtn}
                            onClick={goNext}
                            disabled={loading}
                        >
                            Continuar →
                        </button>
                    )}
                </div>

                <p className={styles.loginLink}>
                    Já tem um cadastro? <Link href="/login">Fazer login</Link>
                </p>
            </div>
        </div>
    );
}