'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            if (user) {
                console.log('[Login] Sucesso Auth. User ID:', user.id, 'Email:', user.email);

                // Fetch profile to get role and tenant_id
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role, tenant_id')
                    .eq('user_id', user.id)
                    .single();

                console.log('[Login] Profile:', profile, 'Erro:', profileError);

                if (profileError) {
                    console.error('[Login] Erro ao buscar perfil:', profileError);
                    window.location.replace('/');
                    return;
                }

                // Lógica de Redirecionamento Robusta
                let targetPath = '/';
                const userRole = profile?.role;
                const userEmail = user.email;
                const hasTenant = !!profile?.tenant_id;

                // Se for admin
                if (userRole === 'admin' || userEmail === 'zeroumbit@gmail.com') {
                    targetPath = '/admin';
                } else if (userRole === 'anunciante' || hasTenant) {
                    // Se tem role anunciante OU se tem tenant_id (cadastrou empresa)
                    targetPath = '/dashboard';
                }

                console.log(`[Login] Role: ${userRole}, Email: ${userEmail}, Tenant: ${profile?.tenant_id} -> Destino: ${targetPath}`);

                // Força o redirecionamento com recarregamento completo
                setTimeout(() => {
                    window.location.href = targetPath;
                }, 300);
            }
        } catch (err: any) {
            console.error('Erro completo de autenticação:', err);
            setError(err.message || 'Ocorreu um erro na autenticação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Left side - branding */}
                <div className={styles.brandSide}>
                    <div className={styles.brandContent}>
                        <Link href="/" className={styles.logo}>
                            <div className={styles.logoIcon}>Z</div>
                            <span className={styles.logoText}>espaço<strong>Z</strong></span>
                        </Link>
                        <h1 className={styles.brandTitle}>
                            Bem-vindo de volta!
                        </h1>
                        <p className={styles.brandDescription}>
                            Acesse sua conta para gerenciar seus espaços, reservas e mensagens.
                        </p>
                        <div className={styles.brandFeatures}>
                            <div className={styles.brandFeature}>
                                <span>🏨</span> Hospedagem para temporadas
                            </div>
                            <div className={styles.brandFeature}>
                                <span>🏠</span> Aluguéis mensal e anual
                            </div>
                            <div className={styles.brandFeature}>
                                <span>🏡</span> Compra de imóveis
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - form */}
                <div className={styles.formSide}>
                    <div className={styles.formContainer}>
                        {/* Título do formulário */}
                        <h2 className={styles.formTitle}>Entrar</h2>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="email" className={styles.label}>E-mail</label>
                                <input
                                    id="email"
                                    type="email"
                                    className={styles.input}
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="password" className={styles.label}>Senha</label>
                                <div className={styles.passwordContainer}>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className={styles.input}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
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

                            <div className={styles.forgotRow}>
                                <Link href="/recuperar-senha" className={styles.forgotLink}>
                                    Esqueceu sua senha?
                                </Link>
                            </div>

                            {error && (
                                <div className={styles.error}>{error}</div>
                            )}

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className={styles.spinner} />
                                ) : (
                                    'Entrar'
                                )}
                            </button>
                        </form>

                        {/* Advertiser promotion */}
                        <div className={styles.advertiserPrompt}>
                            <h3>Quer anunciar um imóvel?</h3>
                            <p>Temos um portal exclusivo para anfitriões e corretores.</p>
                            <Link href="/anunciar" className={styles.advertiserLink}>
                                Cadastrar como Anunciante
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
