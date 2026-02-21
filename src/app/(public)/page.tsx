import HeroSearch from '@/components/home/HeroSearch/HeroSearch';
import SpaceCarousel from '@/components/home/SpaceCarousel/SpaceCarousel';
import { MOCK_HOSPEDAGEM_SPACES } from '@/lib/mock-data';
import styles from './page.module.css';

export default function HomePage() {
    try {
        const destaques = MOCK_HOSPEDAGEM_SPACES.filter(s => s.badges.length > 0);
        const novos = MOCK_HOSPEDAGEM_SPACES.filter(s => s.badges.includes('Novo'));
        const todos = MOCK_HOSPEDAGEM_SPACES;

        return (
            <div className={styles.page}>
                {/* Hero Search Section */}
                <HeroSearch module="hospedagem" />

                {/* Content Sections */}
                <div className={styles.sections}>
                    {/* Destaques */}
                    <SpaceCarousel
                        title="Destaques"
                        subtitle="Os espaços mais bem avaliados e procurados"
                        spaces={destaques}
                    />

                    {/* Disponível agora */}
                    <SpaceCarousel
                        title="Disponível agora"
                        subtitle="Espaços prontos para reserva imediata"
                        spaces={todos}
                    />

                    {/* Novos anúncios */}
                    {novos.length > 0 && (
                        <SpaceCarousel
                            title="Novos anúncios"
                            subtitle="Acabaram de chegar na plataforma"
                            spaces={novos}
                        />
                    )}

                    {/* Praias do Ceará */}
                    <SpaceCarousel
                        title="Praias do Ceará"
                        subtitle="Explore as melhores praias do estado"
                        spaces={MOCK_HOSPEDAGEM_SPACES.filter(s =>
                            ['Jijoca de Jericoacoara', 'Aracati', 'Caucaia', 'Beberibe'].includes(s.city)
                        )}
                    />

                    {/* Perto de você section */}
                    <section className={styles.nearbySection}>
                        <div className={styles.nearbySectionInner}>
                            <h2 className={styles.nearbyTitle}>📍 Perto de você</h2>
                            <p className={styles.nearbySubtitle}>Serviços e comércios úteis na sua região</p>

                            <div className={styles.nearbyGrid}>
                                {[
                                    { icon: '🛒', name: 'Supermercados', count: 12 },
                                    { icon: '💊', name: 'Farmácias', count: 8 },
                                    { icon: '🍽️', name: 'Restaurantes', count: 24 },
                                    { icon: '🏥', name: 'Hospitais', count: 5 },
                                    { icon: '⛽', name: 'Postos', count: 7 },
                                    { icon: '🏫', name: 'Escolas', count: 15 },
                                ].map((cat) => (
                                    <div key={cat.name} className={styles.nearbyCard}>
                                        <span className={styles.nearbyIcon}>{cat.icon}</span>
                                        <div>
                                            <h3 className={styles.nearbyCardTitle}>{cat.name}</h3>
                                            <p className={styles.nearbyCardCount}>{cat.count} perto de você</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Anunciar */}
                    <section className={styles.ctaSection}>
                        <div className={styles.ctaInner}>
                            <div className={styles.ctaContent}>
                                <h2 className={styles.ctaTitle}>Anuncie seu espaço no Espaço Z</h2>
                                <p className={styles.ctaDescription}>
                                    Alcance milhares de hóspedes, inquilinos e compradores. Comece com 15 dias grátis.
                                </p>
                                <div className={styles.ctaCards}>
                                    <div className={styles.ctaCard}>
                                        <span className={styles.ctaCardIcon}>🏨</span>
                                        <h3>Hospedagem</h3>
                                        <p>Diárias e temporadas</p>
                                    </div>
                                    <div className={styles.ctaCard}>
                                        <span className={styles.ctaCardIcon}>🏠</span>
                                        <h3>Aluguéis</h3>
                                        <p>Mensal e anual</p>
                                    </div>
                                    <div className={styles.ctaCard}>
                                        <span className={styles.ctaCardIcon}>🏡</span>
                                        <h3>Vendas</h3>
                                        <p>Compra de imóveis</p>
                                    </div>
                                </div>
                                <a href="/anunciar" className={styles.ctaButton}>
                                    Começar agora — É grátis por 15 dias
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
    } catch (err) {
        console.error('[Home Page] Crash:', err);
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h1>Ops! Algo deu errado</h1>
                <p>Nossa equipe já foi notificada. Por favor, tente novamente em instantes.</p>
                {process.env.NODE_ENV === 'development' && (
                    <pre style={{ marginTop: '1rem', color: 'red', textAlign: 'left', display: 'inline-block' }}>
                        {err instanceof Error ? err.message : String(err)}
                    </pre>
                )}
            </div>
        );
    }
}
