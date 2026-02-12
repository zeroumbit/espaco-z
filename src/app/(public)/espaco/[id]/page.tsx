import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MOCK_HOSPEDAGEM_SPACES, MOCK_ALUGUEIS_SPACES, MOCK_VENDAS_SPACES } from '@/lib/mock-data';
import AmenityList from '@/components/spaces/AmenityList/AmenityList';
import BookingCard from '@/components/spaces/BookingCard/BookingCard';
import HostProfile from '@/components/spaces/HostProfile/HostProfile';
import { PROPERTY_TYPE_LABELS } from '@/lib/constants';
import styles from './page.module.css';

// Server function helpers
const allSpaces = [
    ...MOCK_HOSPEDAGEM_SPACES,
    ...MOCK_ALUGUEIS_SPACES,
    ...MOCK_VENDAS_SPACES,
];

function getSpaceById(id: string) {
    return allSpaces.find(s => s.id === id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const space = getSpaceById(id);
    if (!space) return { title: 'Espaço não encontrado' };

    return {
        title: `${space.title} — Espaço Z`,
        description: space.description,
    };
}

export default async function SpaceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const space = getSpaceById(id);

    if (!space) {
        notFound();
    }

    const moduleColors = {
        hospedagem: 'var(--hospedagem-color)',
        alugueis: 'var(--alugueis-color)',
        vendas: 'var(--vendas-color)',
    };

    const moduleColor = moduleColors[space.module];

    return (
        <div className={styles.page} style={{ '--module-color': moduleColor } as React.CSSProperties}>
            {/* Title Header */}
            <header className={styles.header}>
                <div className={styles.titleWrapper}>
                    <h1 className={styles.title}>{space.title}</h1>
                    <div className={styles.meta}>
                        <span className={styles.rating}>
                            ★ {space.rating_average?.toFixed(1) || 'Novo'}
                            <span className={styles.ratingCount}>({space.rating_count} avaliações)</span>
                        </span>
                        <span className={styles.dot}>·</span>
                        <span className={styles.location}>
                            {space.neighborhood}, {space.city}, {space.state}
                        </span>
                    </div>
                </div>
                <div className={styles.actions}>
                    <button className={styles.actionBtn}>
                        <span>♡</span> Salvar
                    </button>
                    <button className={styles.actionBtn}>
                        <span>↗</span> Compartilhar
                    </button>
                </div>
            </header>

            {/* Image Gallery */}
            <section className={styles.gallery}>
                <div className={styles.galleryMain}>
                    <div className={styles.galleryPlaceholder}>{space.title.charAt(0)}</div>
                </div>
                <div className={styles.galleryGrid}>
                    <div className={styles.galleryPlaceholder}></div>
                    <div className={styles.galleryPlaceholder}></div>
                    <div className={styles.galleryPlaceholder}></div>
                    <div className={styles.galleryPlaceholder}></div>
                </div>
                <button className={styles.showPhotosBtn}>Mostrar todas as fotos</button>
            </section>

            {/* Content Layout */}
            <div className={styles.container}>
                {/* Left Column */}
                <div className={styles.mainContent}>
                    {/* Overview */}
                    <section className={styles.section}>
                        <div className={styles.hostRow}>
                            <div>
                                <h2 className={styles.sectionTitle}>
                                    {PROPERTY_TYPE_LABELS[space.property_type]} em {space.city}
                                </h2>
                                <p className={styles.specs}>
                                    {space.max_guests && `${space.max_guests} hóspedes · `}
                                    {space.bedrooms && `${space.bedrooms} quartos · `}
                                    {space.bathrooms && `${space.bathrooms} banheiros`}
                                    {space.area_m2 && ` · ${space.area_m2}m²`}
                                </p>
                            </div>
                            <div className={styles.hostAvatar}>
                                {/* Placeholder avatar */}
                                <span>A</span>
                            </div>
                        </div>
                    </section>

                    {/* Highlights */}
                    {space.badges.length > 0 && (
                        <section className={styles.section}>
                            {space.badges.map(badge => (
                                <div key={badge} className={styles.highlight}>
                                    <span className={styles.highlightIcon}>✨</span>
                                    <div>
                                        <h3 className={styles.highlightTitle}>{badge}</h3>
                                        <p className={styles.highlightDesc}>Este é um dos poucos lugares com essa característica na região.</p>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Description */}
                    <section className={styles.section}>
                        <p className={styles.description}>{space.description}</p>
                        <button className={styles.readMoreBtn}>Ler mais</button>
                    </section>

                    {/* Amenities */}
                    <section className={styles.section}>
                        <AmenityList amenities={space.amenities as string[]} />
                    </section>

                    {/* Map Placeholder */}
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Onde você vai estar</h3>
                        <div className={styles.mapPlaceholder}>
                            <span>Mapa da região de {space.neighborhood}</span>
                        </div>
                        <p className={styles.locationDetails}>
                            {space.neighborhood}, {space.city}, {space.state}, Brasil
                        </p>
                    </section>

                    {/* Host Profile */}
                    <section className={styles.section}>
                        <HostProfile
                            name="Anfitrião Exemplo"
                            joinedDate="outubro de 2023"
                            badges={space.badges.includes('Superhost') ? ['Superhost'] : []}
                        />
                    </section>
                </div>

                {/* Right Column - Sticky Card */}
                <div className={styles.sidebar}>
                    <div className={styles.stickyWrapper}>
                        <BookingCard space={space} />
                    </div>
                </div>
            </div>
        </div>
    );
}
