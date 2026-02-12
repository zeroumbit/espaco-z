'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (authError) throw authError;

                if (user) {
                    // Fetch profile to get role
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('user_id', user.id)
                        .single();

                    if (profileError) {
                        console.error('Erro ao buscar perfil:', profileError);
                        window.location.href = '/';
                        return;
                    }

                    // Redirection based on role (Hard redirect to ensure server-side layouts pick up the session)
                    if (profile.role === 'admin') {
                        window.location.href = '/admin';
                    } else if (profile.role === 'anunciante') {
                        window.location.href = '/dashboard';
                    } else {
                        window.location.href = '/';
                    }
                }
            } else {
                // SignUp logic
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });

                if (signUpError) throw signUpError;
                alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
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
                            {isLogin ? 'Bem-vindo de volta!' : 'Junte-se ao Espaço Z'}
                        </h1>
                        <p className={styles.brandDescription}>
                            {isLogin
                                ? 'Acesse sua conta para gerenciar seus espaços, reservas e mensagens.'
                                : 'Crie sua conta e explore hospedagens, aluguéis e imóveis à venda no Ceará.'
                            }
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
                        {/* Tab toggle */}
                        <div className={styles.tabToggle}>
                            <button
                                className={`${styles.tab} ${isLogin ? styles.tabActive : ''}`}
                                onClick={() => setIsLogin(true)}
                            >
                                Entrar
                            </button>
                            <button
                                className={`${styles.tab} ${!isLogin ? styles.tabActive : ''}`}
                                onClick={() => setIsLogin(false)}
                            >
                                Cadastrar
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {!isLogin && (
                                <div className={styles.inputGroup}>
                                    <label htmlFor="fullName" className={styles.label}>Nome completo</label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        className={styles.input}
                                        placeholder="Seu nome"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required={!isLogin}
                                    />
                                </div>
                            )}

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

                            {isLogin && (
                                <div className={styles.forgotRow}>
                                    <Link href="/recuperar-senha" className={styles.forgotLink}>
                                        Esqueceu sua senha?
                                    </Link>
                                </div>
                            )}

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
                                    isLogin ? 'Entrar' : 'Criar conta'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className={styles.divider}>
                            <span>ou continue com</span>
                        </div>

                        {/* Social login */}
                        <div className={styles.socialButtons}>
                            <button className={styles.socialBtn} type="button">
                                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
