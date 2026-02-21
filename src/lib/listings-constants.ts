import { TipoModulo } from '@/types/listings';

// ---- Tipos de Imóvel por Módulo ----
export const TIPOS_IMOVEL: Record<TipoModulo, { value: string; label: string }[]> = {
    hospedagem: [
        { value: 'apartamento', label: 'Apartamento' },
        { value: 'casa', label: 'Casa' },
        { value: 'flat', label: 'Flat / Studio' },
        { value: 'quarto', label: 'Quarto Privativo' },
        { value: 'chale', label: 'Chalé' },
        { value: 'pousada', label: 'Pousada' },
        { value: 'hotel', label: 'Hotel' },
        { value: 'sitio', label: 'Sítio / Chácara' },
        { value: 'resort', label: 'Resort' },
    ],
    aluguel: [
        { value: 'apartamento', label: 'Apartamento' },
        { value: 'casa', label: 'Casa' },
        { value: 'kitnet', label: 'Kitnet' },
        { value: 'cobertura', label: 'Cobertura' },
        { value: 'loft', label: 'Loft' },
        { value: 'sala_comercial', label: 'Sala Comercial' },
        { value: 'galpao', label: 'Galpão' },
        { value: 'loja', label: 'Loja / Ponto Comercial' },
    ],
    venda: [
        { value: 'apartamento', label: 'Apartamento' },
        { value: 'casa', label: 'Casa' },
        { value: 'cobertura', label: 'Cobertura' },
        { value: 'terreno', label: 'Terreno' },
        { value: 'lote', label: 'Lote' },
        { value: 'sala_comercial', label: 'Sala Comercial' },
        { value: 'galpao', label: 'Galpão' },
        { value: 'fazenda', label: 'Fazenda / Sítio' },
        { value: 'sobrado', label: 'Sobrado' },
        { value: 'lancamento', label: 'Lançamento Imobiliário' },
    ],
};

// ---- Labels dos Módulos ----
export const MODULO_CONFIG: Record<TipoModulo, {
    label: string;
    icon: string;
    color: string;
    lightColor: string;
    precoLabel: string;
    precoPeriodo: string;
    descricao: string;
}> = {
    hospedagem: {
        label: 'Hospedagem',
        icon: '🏨',
        color: '#6366F1',
        lightColor: '#EEF2FF',
        precoLabel: 'Preço por noite',
        precoPeriodo: '/noite',
        descricao: 'Anuncie diárias para hóspedes e turistas',
    },
    aluguel: {
        label: 'Aluguel',
        icon: '🏠',
        color: '#0EA5E9',
        lightColor: '#E0F2FE',
        precoLabel: 'Valor do aluguel mensal',
        precoPeriodo: '/mês',
        descricao: 'Anuncie imóveis para aluguel residencial ou comercial',
    },
    venda: {
        label: 'Venda',
        icon: '🏡',
        color: '#10B981',
        lightColor: '#ECFDF5',
        precoLabel: 'Preço de venda',
        precoPeriodo: '',
        descricao: 'Anuncie imóveis à venda para compradores',
    },
};

// ---- Status Labels ----
export const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    rascunho: { label: 'Rascunho', color: '#64748B', bgColor: '#F1F5F9' },
    ativo: { label: 'Ativo', color: '#16A34A', bgColor: '#DCFCE7' },
    pausado: { label: 'Pausado', color: '#D97706', bgColor: '#FEF3C7' },
    expirado: { label: 'Expirado', color: '#DC2626', bgColor: '#FEE2E2' },
    vendido: { label: 'Vendido', color: '#7C3AED', bgColor: '#F3E8FF' },
    alugado: { label: 'Alugado', color: '#0284C7', bgColor: '#E0F2FE' },
};

// ---- Comodidades ----
export const AMENIDADES = [
    { id: 'wifi', label: 'Wi-Fi', icon: '📶', category: 'essencial' },
    { id: 'ar_condicionado', label: 'Ar-condicionado', icon: '❄️', category: 'essencial' },
    { id: 'cozinha', label: 'Cozinha completa', icon: '🍳', category: 'essencial' },
    { id: 'estacionamento', label: 'Estacionamento', icon: '🅿️', category: 'essencial' },
    { id: 'piscina', label: 'Piscina', icon: '🏊', category: 'lazer' },
    { id: 'churrasqueira', label: 'Churrasqueira', icon: '🔥', category: 'lazer' },
    { id: 'academia', label: 'Academia', icon: '💪', category: 'lazer' },
    { id: 'lavanderia', label: 'Lavanderia', icon: '🧺', category: 'conveniencia' },
    { id: 'tv', label: 'TV / Smart TV', icon: '📺', category: 'essencial' },
    { id: 'pet_friendly', label: 'Aceita pets', icon: '🐾', category: 'regras' },
    { id: 'acessibilidade', label: 'Acessibilidade', icon: '♿', category: 'essencial' },
    { id: 'vista_mar', label: 'Vista para o mar', icon: '🌊', category: 'destaque' },
    { id: 'varanda', label: 'Varanda', icon: '🌅', category: 'lazer' },
    { id: 'elevador', label: 'Elevador', icon: '🛗', category: 'conveniencia' },
    { id: 'portaria_24h', label: 'Portaria 24h', icon: '🔒', category: 'seguranca' },
    { id: 'mobiliado', label: 'Mobiliado', icon: '🛋️', category: 'essencial' },
    { id: 'area_servico', label: 'Área de serviço', icon: '🧹', category: 'conveniencia' },
    { id: 'playground', label: 'Playground', icon: '🎠', category: 'lazer' },
    { id: 'salao_festas', label: 'Salão de festas', icon: '🎉', category: 'lazer' },
    { id: 'sacada_gourmet', label: 'Sacada gourmet', icon: '🍷', category: 'lazer' },
];

// ---- Garantias aceitas (Aluguel) ----
export const GARANTIAS_ALUGUEL = [
    { value: 'caucao', label: 'Caução (3 meses)' },
    { value: 'fiador', label: 'Fiador' },
    { value: 'seguro_fianca', label: 'Seguro Fiança' },
    { value: 'titulo_capitalizacao', label: 'Título de Capitalização' },
];

// ---- Índices de Reajuste (Aluguel) ----
export const INDICES_REAJUSTE = [
    { value: 'IGPM', label: 'IGP-M' },
    { value: 'IPCA', label: 'IPCA' },
    { value: 'INPC', label: 'INPC' },
];

// ---- Status da Obra (Venda) ----
export const STATUS_OBRA = [
    { value: 'pronto', label: 'Pronto para morar' },
    { value: 'em_construcao', label: 'Em construção' },
    { value: 'lancamento', label: 'Lançamento' },
    { value: 'na_planta', label: 'Na planta' },
];

// ---- Tipo de Checkin (Hospedagem) ----
export const TIPOS_CHECKIN = [
    { value: 'flexivel', label: 'Flexível' },
    { value: 'horario_fixo', label: 'Horário fixo' },
    { value: 'self_checkin', label: 'Self check-in' },
    { value: 'portaria', label: 'Via portaria' },
];

// ---- Estados de Conservação ----
export const ESTADOS_CONSERVACAO = [
    { value: 'novo', label: 'Novo' },
    { value: 'excelente', label: 'Excelente' },
    { value: 'bom', label: 'Bom' },
    { value: 'regular', label: 'Regular' },
    { value: 'para_reformar', label: 'Para reformar' },
];

// ---- Formatação ----
export function formatCentavos(centavos: number): string {
    return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function parseToCentavos(valor: string): number {
    const clean = valor.replace(/[^\d,]/g, '').replace(',', '.');
    return Math.round(parseFloat(clean || '0') * 100);
}
