import { ModuleType, NavigationTab, Amenity, SubscriptionPlan } from '@/types';

// ---- Module Navigation ----
export const MODULE_TABS: NavigationTab[] = [
    {
        id: 'hospedagem',
        label: 'Hospedagem',
        icon: '🏨',
        color: '#6366F1',
        lightColor: '#EEF2FF',
    },
    {
        id: 'alugueis',
        label: 'Aluguéis',
        icon: '🏠',
        color: '#0EA5E9',
        lightColor: '#E0F2FE',
    },
    {
        id: 'vendas',
        label: 'Vendas',
        icon: '🏡',
        color: '#10B981',
        lightColor: '#ECFDF5',
    },
];

// ---- Module Search Placeholders ----
export const MODULE_SEARCH_CONFIG: Record<ModuleType, {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    fields: string[];
}> = {
    hospedagem: {
        title: 'Encontre o lugar perfeito para sua estadia',
        subtitle: 'Casas, apartamentos e muito mais — reserve para dias, semanas ou temporada',
        searchPlaceholder: 'Para onde você vai?',
        fields: ['destino', 'check_in', 'check_out', 'hospedes'],
    },
    alugueis: {
        title: 'Encontre seu novo lar',
        subtitle: 'Aluguéis para todos os estilos — mensal, semanal ou anual',
        searchPlaceholder: 'Em que cidade ou bairro?',
        fields: ['cidade', 'min_preco', 'max_preco', 'quartos'],
    },
    vendas: {
        title: 'Encontre o imóvel dos seus sonhos',
        subtitle: 'Casas, apartamentos, terrenos e mais — compre com segurança',
        searchPlaceholder: 'Onde quer comprar?',
        fields: ['cidade', 'tipo_imovel', 'min_preco', 'max_preco'],
    },
};

// ---- Amenities ----
export const AMENITIES: Amenity[] = [
    { id: 'wifi', name: 'Wi-Fi', icon: '📶', category: 'essencial' },
    { id: 'ar_condicionado', name: 'Ar-condicionado', icon: '❄️', category: 'essencial' },
    { id: 'cozinha', name: 'Cozinha', icon: '🍳', category: 'essencial' },
    { id: 'estacionamento', name: 'Estacionamento', icon: '🅿️', category: 'essencial' },
    { id: 'piscina', name: 'Piscina', icon: '🏊', category: 'lazer' },
    { id: 'churrasqueira', name: 'Churrasqueira', icon: '🔥', category: 'lazer' },
    { id: 'academia', name: 'Academia', icon: '💪', category: 'lazer' },
    { id: 'lavanderia', name: 'Lavanderia', icon: '🧺', category: 'conveniencia' },
    { id: 'tv', name: 'TV', icon: '📺', category: 'essencial' },
    { id: 'pet_friendly', name: 'Aceita pets', icon: '🐾', category: 'regras' },
    { id: 'acessibilidade', name: 'Acessibilidade', icon: '♿', category: 'essencial' },
    { id: 'vista_mar', name: 'Vista para o mar', icon: '🌊', category: 'destaque' },
    { id: 'varanda', name: 'Varanda', icon: '🌅', category: 'lazer' },
    { id: 'elevador', name: 'Elevador', icon: '🛗', category: 'conveniencia' },
    { id: 'portaria_24h', name: 'Portaria 24h', icon: '🔒', category: 'seguranca' },
    { id: 'mobiliado', name: 'Mobiliado', icon: '🛋️', category: 'essencial' },
];

// ---- Subscription Plans ----
export const SUBSCRIPTION_PLANS: {
    id: SubscriptionPlan;
    name: string;
    spaces: number | 'ilimitado';
    priceMonthly: number;
    priceYearly: number;
    popular?: boolean;
}[] = [
        { id: 'trial', name: 'Teste Grátis', spaces: 1, priceMonthly: 0, priceYearly: 0 },
        { id: 'plano_1', name: 'Starter', spaces: 1, priceMonthly: 49.90, priceYearly: 479.00 },
        { id: 'plano_3', name: 'Básico', spaces: 3, priceMonthly: 99.90, priceYearly: 959.00 },
        { id: 'plano_5', name: 'Essencial', spaces: 5, priceMonthly: 149.90, priceYearly: 1439.00, popular: true },
        { id: 'plano_10', name: 'Profissional', spaces: 10, priceMonthly: 249.90, priceYearly: 2399.00 },
        { id: 'plano_20', name: 'Avançado', spaces: 20, priceMonthly: 399.90, priceYearly: 3839.00 },
        { id: 'plano_50', name: 'Business', spaces: 50, priceMonthly: 699.90, priceYearly: 6719.00 },
        { id: 'plano_100', name: 'Enterprise', spaces: 100, priceMonthly: 999.90, priceYearly: 9599.00 },
        { id: 'plano_200', name: 'Corporate', spaces: 200, priceMonthly: 1499.90, priceYearly: 14399.00 },
        { id: 'ilimitado', name: 'Ilimitado', spaces: 'ilimitado', priceMonthly: 2499.90, priceYearly: 23999.00 },
    ];

// ---- Brazilian States ----
export const BRAZILIAN_STATES = [
    { uf: 'AC', name: 'Acre' },
    { uf: 'AL', name: 'Alagoas' },
    { uf: 'AP', name: 'Amapá' },
    { uf: 'AM', name: 'Amazonas' },
    { uf: 'BA', name: 'Bahia' },
    { uf: 'CE', name: 'Ceará' },
    { uf: 'DF', name: 'Distrito Federal' },
    { uf: 'ES', name: 'Espírito Santo' },
    { uf: 'GO', name: 'Goiás' },
    { uf: 'MA', name: 'Maranhão' },
    { uf: 'MT', name: 'Mato Grosso' },
    { uf: 'MS', name: 'Mato Grosso do Sul' },
    { uf: 'MG', name: 'Minas Gerais' },
    { uf: 'PA', name: 'Pará' },
    { uf: 'PB', name: 'Paraíba' },
    { uf: 'PR', name: 'Paraná' },
    { uf: 'PE', name: 'Pernambuco' },
    { uf: 'PI', name: 'Piauí' },
    { uf: 'RJ', name: 'Rio de Janeiro' },
    { uf: 'RN', name: 'Rio Grande do Norte' },
    { uf: 'RS', name: 'Rio Grande do Sul' },
    { uf: 'RO', name: 'Rondônia' },
    { uf: 'RR', name: 'Roraima' },
    { uf: 'SC', name: 'Santa Catarina' },
    { uf: 'SP', name: 'São Paulo' },
    { uf: 'SE', name: 'Sergipe' },
    { uf: 'TO', name: 'Tocantins' },
];

// ---- Badges ----
export const SPACE_BADGES = [
    { id: 'superhost', label: 'Superhost', icon: '⭐', color: '#F59E0B' },
    { id: 'preferido', label: 'Preferido', icon: '❤️', color: '#EF4444' },
    { id: 'novo', label: 'Novo', icon: '✨', color: '#6366F1' },
    { id: 'vista_mar', label: 'Vista para o mar', icon: '🌊', color: '#0EA5E9' },
    { id: 'reserva_instantanea', label: 'Reserva Instantânea', icon: '⚡', color: '#10B981' },
    { id: 'cancelamento_gratis', label: 'Cancelamento Grátis', icon: '✅', color: '#22C55E' },
];

// ---- Property Types Labels ----
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
    apartamento: 'Apartamento',
    casa: 'Casa',
    kitnet: 'Kitnet',
    flat: 'Flat',
    chacara: 'Chácara',
    sitio: 'Sítio',
    cobertura: 'Cobertura',
    loft: 'Loft',
    studio: 'Studio',
    terreno: 'Terreno',
    sala_comercial: 'Sala Comercial',
    galpao: 'Galpão',
    outro: 'Outro',
};

// ---- Ceará Popular Cities ----
export const CEARA_CITIES = [
    'Fortaleza',
    'Caucaia',
    'Juazeiro do Norte',
    'Maracanaú',
    'Sobral',
    'Crato',
    'Itapipoca',
    'Maranguape',
    'Iguatu',
    'Quixadá',
    'Canindé',
    'Aquiraz',
    'Cascavel',
    'Pacatuba',
    'Beberibe',
    'Jericoacoara',
    'Canoa Quebrada',
    'Cumbuco',
    'Lagoinha',
    'Icaraí de Amontada',
];

// ---- Footer Navigation ----
export const FOOTER_LINKS = {
    sobre: [
        { label: 'Sobre o Espaço Z', href: '/sobre' },
        { label: 'Como funciona', href: '/como-funciona' },
        { label: 'Termos de Uso', href: '/termos' },
        { label: 'Privacidade', href: '/privacidade' },
        { label: 'Cookies', href: '/cookies' },
    ],
    anuncie: [
        { label: 'Anuncie no Espaço Z', href: '/anunciar' },
        { label: 'Recursos', href: '/recursos' },
        { label: 'Guia do Anunciante', href: '/guia' },
        { label: 'Planos e Preços', href: '/planos' },
    ],
    comunidade: [
        { label: 'FAQ', href: '/faq' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contato', href: '/contato' },
    ],
};
