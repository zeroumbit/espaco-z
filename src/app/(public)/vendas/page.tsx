import { Metadata } from 'next';
import HeroSearch from '@/components/home/HeroSearch/HeroSearch';
import SpaceCarousel from '@/components/home/SpaceCarousel/SpaceCarousel';
import { MOCK_VENDAS_SPACES } from '@/lib/mock-data';

export const metadata: Metadata = {
    title: 'Vendas — Espaço Z',
    description: 'Encontre o imóvel dos seus sonhos. Casas, apartamentos, terrenos e mais — compre com segurança no Ceará.',
};

export default function VendasPage() {
    const todos = MOCK_VENDAS_SPACES;

    return (
        <div style={{ minHeight: '100vh' }}>
            <HeroSearch module="vendas" />

            <div style={{ padding: '1rem 0' }}>
                <SpaceCarousel
                    title="Destaques em Vendas"
                    subtitle="Os imóveis mais procurados para compra"
                    spaces={todos}
                    viewAllHref="/vendas/todos"
                />

                <SpaceCarousel
                    title="Minha Casa Minha Vida"
                    subtitle="Imóveis elegíveis ao programa MCMV"
                    spaces={todos.filter(s => s.badges.includes('MCMV'))}
                />

                <SpaceCarousel
                    title="Fortaleza e Região"
                    subtitle="Oportunidades na capital e cidades vizinhas"
                    spaces={todos.filter(s => ['Fortaleza', 'Eusébio', 'Maracanaú', 'Aquiraz'].includes(s.city))}
                />
            </div>
        </div>
    );
}
