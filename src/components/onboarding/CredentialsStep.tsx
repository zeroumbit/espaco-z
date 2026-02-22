'use client';

import { useState } from 'react';
import type { CredentialsData } from '@/types/onboarding';
import { credentialsSchema } from '@/lib/validations/onboarding';
import styles from './CredentialsStep.module.css';

interface CredentialsStepProps {
    data: CredentialsData;
    onChange: (data: CredentialsData) => void;
    errors: Record<string, string>;
}

export default function CredentialsStep({ data, onChange, errors }: CredentialsStepProps) {
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (field: keyof CredentialsData, value: string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className={styles.step}>
            <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>Crie sua conta</h2>
                <p className={styles.stepSubtitle}>
                    Preencha seus dados de acesso para começar.
                </p>
            </div>

            <div className={styles.fields}>
                {/* Nome */}
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="onb-name">
                        Nome de Usuário
                    </label>
                    <input
                        id="onb-name"
                        type="text"
                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        placeholder="Seu nome completo"
                        value={data.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        autoFocus
                    />
                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>

                {/* Email */}
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="onb-email">
                        E-mail
                    </label>
                    <input
                        id="onb-email"
                        type="email"
                        className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                        placeholder="seu@email.com"
                        value={data.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>

                {/* Senha */}
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="onb-password">
                        Senha
                    </label>
                    <div className={styles.passwordWrapper}>
                        <input
                            id="onb-password"
                            type={showPassword ? 'text' : 'password'}
                            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                            placeholder="Mínimo 6 caracteres"
                            value={data.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                        />
                        <button
                            type="button"
                            className={styles.togglePassword}
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
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
                    {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                    <div className={styles.passwordStrength}>
                        <div className={styles.strengthBar}>
                            <div
                                className={styles.strengthFill}
                                data-strength={
                                    data.password.length >= 12 ? 'strong' :
                                        data.password.length >= 8 ? 'medium' :
                                            data.password.length >= 6 ? 'weak' : 'none'
                                }
                                style={{
                                    width: data.password.length >= 12 ? '100%' :
                                        data.password.length >= 8 ? '66%' :
                                            data.password.length >= 6 ? '33%' : '0%'
                                }}
                            />
                        </div>
                        {data.password.length > 0 && (
                            <span className={styles.strengthLabel}>
                                {data.password.length >= 12 ? 'Forte' :
                                    data.password.length >= 8 ? 'Média' :
                                        data.password.length >= 6 ? 'Fraca' : 'Muito curta'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
