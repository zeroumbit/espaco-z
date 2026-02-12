'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MODULE_TABS } from '@/lib/constants';
import { ModuleType } from '@/types';
import styles from './Header.module.css';

export default function Header() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeModule, setActiveModule] = useState<ModuleType>('hospedagem');

    useEffect(() => {
        // Determine active module from pathname
        if (pathname.startsWith('/alugueis')) setActiveModule('alugueis');
        else if (pathname.startsWith('/vendas')) setActiveModule('vendas');
        else setActiveModule('hospedagem');
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={styles.headerInner}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <span>Z</span>
                    </div>
                    <span className={styles.logoText}>
                        espaço<strong>Z</strong>
                    </span>
                </Link>

                {/* Module Tabs */}
                <nav className={styles.moduleTabs}>
                    {MODULE_TABS.map((tab) => (
                        <Link
                            key={tab.id}
                            href={tab.id === 'hospedagem' ? '/' : `/${tab.id}`}
                            className={`${styles.moduleTab} ${activeModule === tab.id ? styles.activeTab : ''}`}
                            style={{
                                '--tab-color': tab.color,
                                '--tab-light': tab.lightColor,
                            } as React.CSSProperties}
                        >
                            <span className={styles.tabIcon}>{tab.icon}</span>
                            <span className={styles.tabLabel}>{tab.label}</span>
                            {activeModule === tab.id && <div className={styles.tabIndicator} />}
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className={styles.actions}>
                    <Link href="/anunciar" className={styles.announceBtn}>
                        Anunciar no Espaço Z
                    </Link>

                    <button
                        className={styles.menuBtn}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menu"
                        id="header-menu-btn"
                    >
                        <div className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`}>
                            <span />
                            <span />
                            <span />
                        </div>
                        <div className={styles.avatar}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <>
                        <div className={styles.backdrop} onClick={() => setIsMobileMenuOpen(false)} />
                        <div className={styles.dropdown}>
                            <div className={styles.dropdownSection}>
                                <Link href="/login" className={styles.dropdownItem} onClick={() => setIsMobileMenuOpen(false)}>
                                    <span>🔑</span> Entrar
                                </Link>
                                <Link href="/cadastro" className={styles.dropdownItem} onClick={() => setIsMobileMenuOpen(false)}>
                                    <span>📝</span> Cadastrar-se
                                </Link>
                            </div>
                            <div className={styles.dropdownDivider} />
                            <div className={styles.dropdownSection}>
                                <Link href="/anunciar" className={styles.dropdownItem} onClick={() => setIsMobileMenuOpen(false)}>
                                    <span>🏠</span> Anunciar no Espaço Z
                                </Link>
                                <Link href="/faq" className={styles.dropdownItem} onClick={() => setIsMobileMenuOpen(false)}>
                                    <span>❓</span> Central de Ajuda
                                </Link>
                                <Link href="/indicar" className={styles.dropdownItem} onClick={() => setIsMobileMenuOpen(false)}>
                                    <span>💌</span> Indique um anunciante
                                </Link>
                            </div>

                            {/* Mobile module tabs */}
                            <div className={styles.dropdownDivider} />
                            <div className={styles.dropdownSection}>
                                <p className={styles.dropdownSectionTitle}>Navegue por módulo</p>
                                {MODULE_TABS.map((tab) => (
                                    <Link
                                        key={tab.id}
                                        href={tab.id === 'hospedagem' ? '/' : `/${tab.id}`}
                                        className={`${styles.dropdownItem} ${activeModule === tab.id ? styles.dropdownItemActive : ''}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span>{tab.icon}</span> {tab.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
