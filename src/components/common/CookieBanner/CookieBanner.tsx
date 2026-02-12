'use client';

import { useState, useEffect } from 'react';
import styles from './CookieBanner.module.css';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [preferences, setPreferences] = useState({
        essential: true,
        analytics: false,
        marketing: false,
    });

    useEffect(() => {
        const consent = localStorage.getItem('ez_cookie_consent');
        if (!consent) {
            // Show after a short delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        const consent = { essential: true, analytics: true, marketing: true, date: new Date().toISOString() };
        localStorage.setItem('ez_cookie_consent', JSON.stringify(consent));
        setIsVisible(false);
    };

    const handleRejectNonEssential = () => {
        const consent = { essential: true, analytics: false, marketing: false, date: new Date().toISOString() };
        localStorage.setItem('ez_cookie_consent', JSON.stringify(consent));
        setIsVisible(false);
    };

    const handleSavePreferences = () => {
        const consent = { ...preferences, date: new Date().toISOString() };
        localStorage.setItem('ez_cookie_consent', JSON.stringify(consent));
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.banner}>
                <div className={styles.content}>
                    <div className={styles.icon}>🍪</div>
                    <div className={styles.text}>
                        <h3 className={styles.title}>Usamos cookies</h3>
                        <p className={styles.description}>
                            Utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{' '}
                            <a href="/cookies" className={styles.link}>Política de Cookies</a>.
                        </p>
                    </div>
                </div>

                {showPreferences && (
                    <div className={styles.preferences}>
                        <label className={styles.prefItem}>
                            <input type="checkbox" checked disabled className={styles.checkbox} />
                            <div>
                                <strong>Essenciais</strong>
                                <p>Necessários para o funcionamento do site.</p>
                            </div>
                        </label>
                        <label className={styles.prefItem}>
                            <input
                                type="checkbox"
                                checked={preferences.analytics}
                                onChange={(e) => setPreferences(p => ({ ...p, analytics: e.target.checked }))}
                                className={styles.checkbox}
                            />
                            <div>
                                <strong>Analíticos</strong>
                                <p>Ajudam a entender como você usa o site.</p>
                            </div>
                        </label>
                        <label className={styles.prefItem}>
                            <input
                                type="checkbox"
                                checked={preferences.marketing}
                                onChange={(e) => setPreferences(p => ({ ...p, marketing: e.target.checked }))}
                                className={styles.checkbox}
                            />
                            <div>
                                <strong>Marketing</strong>
                                <p>Usados para mostrar anúncios relevantes.</p>
                            </div>
                        </label>
                    </div>
                )}

                <div className={styles.actions}>
                    {!showPreferences ? (
                        <>
                            <button className={styles.btnManage} onClick={() => setShowPreferences(true)}>
                                Gerenciar preferências
                            </button>
                            <button className={styles.btnReject} onClick={handleRejectNonEssential}>
                                Rejeitar não essenciais
                            </button>
                            <button className={styles.btnAccept} onClick={handleAcceptAll}>
                                Aceitar todos
                            </button>
                        </>
                    ) : (
                        <>
                            <button className={styles.btnManage} onClick={() => setShowPreferences(false)}>
                                Voltar
                            </button>
                            <button className={styles.btnAccept} onClick={handleSavePreferences}>
                                Salvar preferências
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
