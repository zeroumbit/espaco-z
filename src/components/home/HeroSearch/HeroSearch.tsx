'use client';

import { useState } from 'react';
import { ModuleType } from '@/types';
import { MODULE_SEARCH_CONFIG } from '@/lib/constants';
import styles from './HeroSearch.module.css';

interface HeroSearchProps {
    module: ModuleType;
}

export default function HeroSearch({ module }: HeroSearchProps) {
    const config = MODULE_SEARCH_CONFIG[module];
    const [searchValue, setSearchValue] = useState('');

    const moduleColors: Record<ModuleType, string> = {
        hospedagem: 'var(--hospedagem-color)',
        alugueis: 'var(--alugueis-color)',
        vendas: 'var(--vendas-color)',
    };

    return (
        <section className={styles.hero} style={{ '--module-color': moduleColors[module] } as React.CSSProperties}>
            {/* Background decorations */}
            <div className={styles.bgDecor}>
                <div className={styles.bgOrb1} />
                <div className={styles.bgOrb2} />
                <div className={styles.bgOrb3} />
            </div>

            <div className={styles.heroContent}>
                <h1 className={styles.title}>{config.title}</h1>
                <p className={styles.subtitle}>{config.subtitle}</p>

                {/* Search Bar */}
                <div className={styles.searchBar}>
                    {module === 'hospedagem' ? (
                        <div className={styles.searchFields}>
                            <div className={styles.searchField}>
                                <label className={styles.searchLabel}>Destino</label>
                                <input
                                    type="text"
                                    placeholder={config.searchPlaceholder}
                                    className={styles.searchInput}
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    id="search-destination"
                                />
                            </div>
                            <div className={styles.searchDivider} />
                            <div className={styles.searchField}>
                                <label className={styles.searchLabel}>Check-in</label>
                                <input type="date" className={styles.searchInput} id="search-checkin" />
                            </div>
                            <div className={styles.searchDivider} />
                            <div className={styles.searchField}>
                                <label className={styles.searchLabel}>Check-out</label>
                                <input type="date" className={styles.searchInput} id="search-checkout" />
                            </div>
                            <div className={styles.searchDivider} />
                            <div className={styles.searchField}>
                                <label className={styles.searchLabel}>Hóspedes</label>
                                <input type="number" placeholder="Quantos?" min="1" className={styles.searchInput} id="search-guests" />
                            </div>
                            <button className={styles.searchBtn} id="search-submit-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                                <span>Buscar</span>
                            </button>
                        </div>
                    ) : module === 'alugueis' ? (
                        <div className={styles.searchFields}>
                            <div className={styles.searchField}>
                                <label className={styles.searchLabel}>Cidade ou Bairro</label>
                                <input
                                    type="text"
                                    placeholder={config.searchPlaceholder}
                                    className={styles.searchInput}
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    id="search-location-rent"
                                />
                            </div>
                            <div className={styles.searchDivider} />
                            <div className={styles.searchField}>
                                <label className={styles.searchLabel}>Preço Mín.</label>
                                <input type="number" placeholder="R$ 0" className={styles.searchInput} id="search-min-price" />
                            </div>
                            <div className={styles.searchDivider} />
                            <div className={styles.searchField}>
                                <label className={styles.searchLabel}>Preço Máx.</label>
                                <input type="number" placeholder="Sem limite" className={styles.searchInput} id="search-max-price" />
                            </div>
                            <div className={styles.searchDivider} />
                            <div className={styles.searchField}>
                                <label className={styles.searchLabel}>Quartos</label>
                                <input type="number" placeholder="Qualquer" min="0" className={styles.searchInput} id="search-bedrooms-rent" />
                            </div>
                            <button className={styles.searchBtn} id="search-submit-btn-rent">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                                <span>Buscar</span>
                            </button>
                        </div>
                    ) : (
                        <div className={styles.searchFields}>
                            <div className={styles.searchField}>
                                <label className={styles.searchLabel}>Cidade</label>
                                <input
                                    type="text"
                                    placeholder={config.searchPlaceholder}
                                    className={styles.searchInput}
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    id="search-location-sale"
                                />
                            </div>
                            <div className={styles.searchDivider} />
                            <div className={styles.searchField}>
                                <label className={styles.searchLabel}>Tipo de Imóvel</label>
                                <select className={styles.searchInput} id="search-property-type">
                                    <option value="">Todos</option>
                                    <option value="apartamento">Apartamento</option>
                                    <option value="casa">Casa</option>
                                    <option value="terreno">Terreno</option>
                                    <option value="cobertura">Cobertura</option>
                                    <option value="kitnet">Kitnet</option>
                                </select>
                            </div>
                            <div className={styles.searchDivider} />
                            <div className={styles.searchField}>
                                <label className={styles.searchLabel}>Faixa de Preço</label>
                                <select className={styles.searchInput} id="search-price-range">
                                    <option value="">Qualquer</option>
                                    <option value="0-150000">Até R$ 150 mil</option>
                                    <option value="150000-300000">R$ 150 - 300 mil</option>
                                    <option value="300000-500000">R$ 300 - 500 mil</option>
                                    <option value="500000-1000000">R$ 500 mil - 1 M</option>
                                    <option value="1000000+">Acima de R$ 1 M</option>
                                </select>
                            </div>
                            <button className={styles.searchBtn} id="search-submit-btn-sale">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                                <span>Buscar</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Quick tags */}
                <div className={styles.quickTags}>
                    {module === 'hospedagem' && (
                        <>
                            <button className={styles.quickTag}>🏖️ Praias</button>
                            <button className={styles.quickTag}>🏔️ Serras</button>
                            <button className={styles.quickTag}>🌴 Jericoacoara</button>
                            <button className={styles.quickTag}>🌊 Canoa Quebrada</button>
                            <button className={styles.quickTag}>🏄 Cumbuco</button>
                        </>
                    )}
                    {module === 'alugueis' && (
                        <>
                            <button className={styles.quickTag}>🏙️ Fortaleza</button>
                            <button className={styles.quickTag}>🏠 Casas</button>
                            <button className={styles.quickTag}>🏢 Apartamentos</button>
                            <button className={styles.quickTag}>💰 Até R$ 1.500</button>
                        </>
                    )}
                    {module === 'vendas' && (
                        <>
                            <button className={styles.quickTag}>🏠 MCMV</button>
                            <button className={styles.quickTag}>🏖️ Beira-mar</button>
                            <button className={styles.quickTag}>🏗️ Lançamentos</button>
                            <button className={styles.quickTag}>📍 Fortaleza</button>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
