import { Space, ModuleType } from '@/types';

// Mock spaces for development
const createMockSpace = (
    id: string,
    module: ModuleType,
    title: string,
    city: string,
    price: number,
    overrides: Partial<Space> = {}
): Space => ({
    id,
    tenant_id: 'tenant-1',
    module,
    status: 'ativo',
    title,
    description: `Excelente ${title} localizado em ${city}. Ótima localização e comodidades.`,
    property_type: 'apartamento',
    city,
    state: 'CE',
    neighborhood: 'Centro',
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    area_m2: 65,
    price,
    photos: ['/placeholder.jpg'],
    amenities: ['wifi', 'ar_condicionado', 'cozinha'],
    badges: [],
    is_pinned: false,
    is_boosted: false,
    views_count: Math.floor(Math.random() * 500),
    favorites_count: Math.floor(Math.random() * 50),
    rating_average: 4 + Math.random(),
    rating_count: Math.floor(Math.random() * 100),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
});

export const MOCK_HOSPEDAGEM_SPACES: Space[] = [
    createMockSpace('h1', 'hospedagem', 'Apartamento Vista Mar em Fortaleza', 'Fortaleza', 280, {
        property_type: 'apartamento',
        bedrooms: 3,
        max_guests: 6,
        badges: ['Superhost', '⚡ Instantânea'],
        instant_booking: true,
        neighborhood: 'Meireles',
    }),
    createMockSpace('h2', 'hospedagem', 'Casa de Praia em Canoa Quebrada', 'Aracati', 350, {
        property_type: 'casa',
        bedrooms: 4,
        max_guests: 8,
        badges: ['Vista Mar'],
        neighborhood: 'Canoa Quebrada',
    }),
    createMockSpace('h3', 'hospedagem', 'Flat Completo em Cumbuco', 'Caucaia', 220, {
        property_type: 'flat',
        bedrooms: 1,
        max_guests: 2,
        badges: ['Novo'],
        neighborhood: 'Cumbuco',
    }),
    createMockSpace('h4', 'hospedagem', 'Chalé na Serra de Guaramiranga', 'Guaramiranga', 180, {
        property_type: 'casa',
        bedrooms: 2,
        max_guests: 4,
        neighborhood: 'Centro',
    }),
    createMockSpace('h5', 'hospedagem', 'Kitnet no Aldeota', 'Fortaleza', 120, {
        property_type: 'kitnet',
        bedrooms: 1,
        max_guests: 2,
        neighborhood: 'Aldeota',
    }),
    createMockSpace('h6', 'hospedagem', 'Pousada em Jericoacoara', 'Jijoca de Jericoacoara', 450, {
        property_type: 'casa',
        bedrooms: 2,
        max_guests: 4,
        badges: ['Preferido', 'Superhost'],
        neighborhood: 'Jericoacoara',
    }),
    createMockSpace('h7', 'hospedagem', 'Sítio com Piscina em Beberibe', 'Beberibe', 500, {
        property_type: 'sitio',
        bedrooms: 5,
        max_guests: 12,
        badges: ['Vista Mar'],
        neighborhood: 'Morro Branco',
    }),
    createMockSpace('h8', 'hospedagem', 'Studio Moderno em Fortaleza', 'Fortaleza', 150, {
        property_type: 'studio',
        bedrooms: 1,
        max_guests: 2,
        badges: ['Novo'],
        neighborhood: 'Cocó',
    }),
];

export const MOCK_ALUGUEIS_SPACES: Space[] = [
    createMockSpace('a1', 'alugueis', 'Apartamento 2 Quartos no Cocó', 'Fortaleza', 2200, {
        price_period: 'mensal',
        bedrooms: 2,
        neighborhood: 'Cocó',
        badges: ['Mobiliado'],
    }),
    createMockSpace('a2', 'alugueis', 'Casa 3 Quartos na Messejana', 'Fortaleza', 1800, {
        property_type: 'casa',
        price_period: 'mensal',
        bedrooms: 3,
        neighborhood: 'Messejana',
    }),
    createMockSpace('a3', 'alugueis', 'Kitnet Mobiliada no Centro', 'Fortaleza', 900, {
        property_type: 'kitnet',
        price_period: 'mensal',
        bedrooms: 1,
        neighborhood: 'Centro',
        badges: ['Novo'],
    }),
    createMockSpace('a4', 'alugueis', 'Apartamento Alto Padrão no Meireles', 'Fortaleza', 4500, {
        price_period: 'mensal',
        bedrooms: 3,
        neighborhood: 'Meireles',
    }),
    createMockSpace('a5', 'alugueis', 'Casa em Eusébio - Condomínio', 'Eusébio', 3200, {
        property_type: 'casa',
        price_period: 'mensal',
        bedrooms: 4,
        neighborhood: 'Precabura',
    }),
    createMockSpace('a6', 'alugueis', 'Flat por Temporada no Mucuripe', 'Fortaleza', 600, {
        property_type: 'flat',
        price_period: 'semanal',
        bedrooms: 1,
        neighborhood: 'Mucuripe',
    }),
];

export const MOCK_VENDAS_SPACES: Space[] = [
    createMockSpace('v1', 'vendas', 'Apartamento MCMV - Maracanaú', 'Maracanaú', 185000, {
        property_type: 'apartamento',
        bedrooms: 2,
        neighborhood: 'Pajuçara',
        badges: ['MCMV'],
        sale_type: 'completo',
    }),
    createMockSpace('v2', 'vendas', 'Casa Nova no Eusébio', 'Eusébio', 380000, {
        property_type: 'casa',
        bedrooms: 3,
        neighborhood: 'Coaçu',
        sale_type: 'completo',
    }),
    createMockSpace('v3', 'vendas', 'Terreno em Aquiraz - 300m²', 'Aquiraz', 95000, {
        property_type: 'terreno',
        area_m2: 300,
        neighborhood: 'Porto das Dunas',
    }),
    createMockSpace('v4', 'vendas', 'Cobertura Duplex - Aldeota', 'Fortaleza', 1200000, {
        property_type: 'cobertura',
        bedrooms: 4,
        area_m2: 200,
        neighborhood: 'Aldeota',
        badges: ['Destaque'],
    }),
    createMockSpace('v5', 'vendas', 'Casa no Cambeba', 'Fortaleza', 450000, {
        property_type: 'casa',
        bedrooms: 3,
        neighborhood: 'Cambeba',
        sale_type: 'classificado',
    }),
    createMockSpace('v6', 'vendas', 'Sala Comercial - Centro', 'Fortaleza', 220000, {
        property_type: 'sala_comercial',
        area_m2: 45,
        neighborhood: 'Centro',
    }),
];

export function getMockSpaces(module: ModuleType): Space[] {
    switch (module) {
        case 'hospedagem': return MOCK_HOSPEDAGEM_SPACES;
        case 'alugueis': return MOCK_ALUGUEIS_SPACES;
        case 'vendas': return MOCK_VENDAS_SPACES;
    }
}
