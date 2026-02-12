import { Metadata } from 'next';
import HeroSearch from '@/components/home/HeroSearch/HeroSearch';
import SpaceCarousel from '@/components/home/SpaceCarousel/SpaceCarousel';
import { MOCK_ALUGUEIS_SPACES } from '@/lib/mock-data';

export const metadata: Metadata = {
    title: 'Aluguéis — Espaço Z',
    description: 'Encontre seu novo lar. Aluguéis para todos os estilos — mensal, semanal ou anual no Ceará.',
};

export default function AlugueisPage() {
    const todos = MOCK_ALUGUEIS_SPACES;
    const novos = todos.filter(s => s.badges.includes('Novo'));
    const mobiliados = todos.filter(s => s.badges.includes('Mobiliado'));

    return (
        <div style={{ minHeight: '100vh' }}>
            <HeroSearch module="alugueis" />

            <div style={{ padding: '1rem 0' }}>
                <SpaceCarousel
                    title="Destaques em Aluguéis"
                    subtitle="Os imóveis mais procurados para locação"
                    spaces={todos}
                    viewAllHref="/alugueis/todos"
                />

                {novos.length > 0 && (
                    <SpaceCarousel
                        title="Novos anúncios"
                        subtitle="Acabaram de chegar na plataforma"
                        spaces={novos}
                    />
                )}

                {mobiliados.length > 0 && (
                    <SpaceCarousel
                        title="Mobiliados"
                        subtitle="Prontos para morar"
                        spaces={mobiliados}
                    />
                )}

                <SpaceCarousel
                    title="Fortaleza"
                    subtitle="Aluguéis na capital cearense"
                    spaces={todos.filter(s => s.city === 'Fortaleza')}
                />
            </div>
        </div>
    );
}
