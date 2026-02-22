/* ============================================
   Espaço Z - Schema v3 Types
   Multi-tenant marketplace types (Listings)
   ============================================ */

// ---- Enums ----
export type TipoModulo = 'hospedagem' | 'aluguel' | 'venda';
export type StatusListing = 'rascunho' | 'ativo' | 'pausado' | 'expirado' | 'vendido' | 'alugado';
export type UserRoleV3 = 'owner' | 'admin' | 'editor' | 'corretor';
export type TipoAnunciante = 'pf' | 'pj';

// ---- Hospedagem: Subcategorias de Unidade Alugável ----
export type HospedagemTipoImovel =
    | 'quarto_hotel'
    | 'quarto_pousada'
    | 'quarto_resort'
    | 'cama_albergue'
    | 'casa_inteira'
    | 'apartamento_inteiro'
    | 'quarto_privativo'
    | 'quarto_compartilhado'
    | 'acomodacao_unica';

// Categorias de comportamento da UI
export type HospedagemCategoria = 'propriedade_inteira' | 'quarto_privado' | 'espaco_compartilhado';

// ---- Organization (Tenant) ----
export interface Organization {
    id: string;
    nome_fantasia: string;
    razao_social?: string;
    cnpj?: string;
    creci?: string;
    slug?: string;
    logo_url?: string;
    descricao?: string;
    site_url?: string;
    instagram?: string;
    cidade?: string;
    estado?: string;
    verified: boolean;
    plano_id: string;
    plano_vence_em?: string;
    trial_ativo: boolean;
    trial_iniciado_em?: string;
    espacos_utilizados: number;
    status: string;
    created_at: string;
    updated_at: string;
}

// ---- User (v3) ----
export interface UserV3 {
    id: string;
    organization_id?: string;
    nome: string;
    email: string;
    telefone?: string;
    cpf?: string;
    tipo_anunciante: TipoAnunciante;
    slug?: string;
    avatar_url?: string;
    bio?: string;
    cidade?: string;
    estado?: string;
    role: UserRoleV3;
    created_at: string;
    updated_at: string;
}

// ---- Property (Imóvel Físico) ----
export interface Property {
    id: string;
    organization_id: string;
    created_by?: string;
    titulo: string;
    descricao?: string;
    tipo_imovel: string;
    subtipo_imovel?: string;

    // Métricas
    area_total?: number;
    area_privativa?: number;
    area_terreno?: number;

    // Composição
    quartos: number;
    suites: number;
    banheiros_sociais: number;
    salas: number;
    vagas_garagem: number;

    // Conservação
    ano_construcao?: number;
    estado_conservacao?: string;

    // Campos condicionais de hospedagem
    banheiro_privativo?: boolean;
    tipo_cama?: string;
    total_camas_quarto?: number;
    locker_disponivel?: boolean;

    // Endereço
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    pais: string;
    zona?: string;

    // Atributos flexíveis
    amenities: Record<string, boolean>;
    proximidades: Record<string, boolean>;
    caracteristicas_extras: Record<string, unknown>;

    created_at: string;
    updated_at: string;
}

// ---- Property Media ----
export interface PropertyMedia {
    id: string;
    property_id: string;
    organization_id: string;
    url: string;
    tipo: 'foto' | 'video' | 'tour_virtual';
    alt_text?: string;
    ordem: number;
    is_main_thumbnail: boolean;
    created_at: string;
}

// ---- Listing (Oferta Comercial) ----
export interface Listing {
    id: string;
    property_id: string;
    organization_id: string;
    modulo: TipoModulo;
    status: StatusListing;
    preco_base_centavos: number;
    valor_m2_centavos?: number;
    slug?: string;
    exclusividade: boolean;
    destaque: boolean;
    destaque_tipo?: string;
    destaque_inicio?: string;
    destaque_fim?: string;
    published_at?: string;
    created_at: string;
    updated_at: string;

    // Joins
    property?: Property;
    listing_hospedagem?: ListingHospedagem;
    listing_aluguel?: ListingAluguel;
    listing_venda?: ListingVenda;
    listing_stats?: ListingStats;
}

// ---- Listing Hospedagem ----
export interface ListingHospedagem {
    listing_id: string;
    tipo_anuncio?: string;
    capacidade_maxima?: number;
    camas_casal: number;
    camas_solteiro: number;
    tipo_checkin?: string;
    idiomas_anfitriao?: string[];
    preco_fim_semana_centavos?: number;
    taxa_limpeza_centavos?: number;
    caucao_centavos?: number;
    desconto_semanal?: number;
    desconto_mensal?: number;
    minimo_noites: number;
    maximo_noites?: number;
    preparacao_entre_reservas: number;
    regras_hospedagem: Record<string, unknown>;
}

// ---- Listing Aluguel ----
export interface ListingAluguel {
    listing_id: string;
    valor_condominio_centavos?: number;
    valor_iptu_centavos?: number;
    valor_seguro_incendio_centavos?: number;
    valor_caucao_centavos?: number;
    garantias_aceitas?: string[];
    indice_reajuste?: string;
    periodo_reajuste?: string;
    prazo_minimo_contrato?: number;
    prazo_maximo_contrato?: number;
    multa_rescisoria?: string;
    mobilia: Record<string, unknown>;
}

// ---- Listing Venda ----
export interface ListingVenda {
    listing_id: string;
    matricula_imovel?: string;
    cartorio_registro?: string;
    escritura: boolean;
    certidao_onus_reais: boolean;
    inventario: boolean;
    aceita_financiamento: boolean;
    bancos_conveniados?: string[];
    aceita_permuta: boolean;
    fgts: boolean;
    entrada_minima_percentual?: number;
    status_obra?: string;
    previsao_entrega?: string;
    porcentagem_obra?: number;
    incorporadora?: string;
    construtora?: string;
}

// ---- Listing Stats ----
export interface ListingStats {
    listing_id: string;
    views_count: number;
    favorites_count: number;
    leads_count: number;
    last_view_at?: string;
}

// ---- Lead ----
export interface Lead {
    id: string;
    listing_id?: string;
    organization_id: string;
    user_id?: string;
    nome: string;
    email?: string;
    telefone: string;
    mensagem?: string;
    origem: string;
    status: string;
    created_at: string;
    updated_at: string;
}

// ---- Form Data Types (para o wizard) ----

export interface PropertyFormData {
    titulo: string;
    descricao: string;
    tipo_imovel: string;
    subtipo_imovel: string;

    // Métricas
    area_total: string;
    area_privativa: string;
    area_terreno: string;

    // Composição
    quartos: number;
    suites: number;
    banheiros_sociais: number;
    salas: number;
    vagas_garagem: number;

    // Conservação
    ano_construcao: string;
    estado_conservacao: string;

    // Endereço
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;

    // Comodidades
    amenities: string[];

    // Campos condicionais de hospedagem (salvos no banco junto com a property)
    banheiro_privativo: boolean;
    tipo_cama: string; // 'king' | 'queen' | 'casal' | 'solteiro' | 'beliche'
    total_camas_quarto: number; // para quarto_compartilhado / cama_albergue
    locker_disponivel: boolean; // para albergue
}

export interface ListingFormData {
    modulo: TipoModulo;
    preco_base: string;
    exclusividade: boolean;

    // Hospedagem
    capacidade_maxima: number;
    camas_casal: number;
    camas_solteiro: number;
    tipo_checkin: string;
    preco_fim_semana: string;
    taxa_limpeza: string;
    desconto_semanal: string;
    desconto_mensal: string;
    minimo_noites: number;
    maximo_noites: string;

    // Aluguel
    valor_condominio: string;
    valor_iptu: string;
    valor_caucao: string;
    garantias_aceitas: string[];
    indice_reajuste: string;
    prazo_minimo_contrato: string;

    // Venda
    aceita_financiamento: boolean;
    aceita_permuta: boolean;
    fgts: boolean;
    entrada_minima_percentual: string;
    status_obra: string;
    construtora: string;
    incorporadora: string;
}

export type WizardStep = 'modulo' | 'imovel' | 'endereco' | 'detalhes' | 'valores' | 'fotos' | 'revisao';

export const WIZARD_STEPS: { id: WizardStep; label: string; icon: string }[] = [
    { id: 'modulo', label: 'Tipo', icon: '📋' },
    { id: 'imovel', label: 'Imóvel', icon: '🏠' },
    { id: 'endereco', label: 'Endereço', icon: '📍' },
    { id: 'detalhes', label: 'Detalhes', icon: '📝' },
    { id: 'valores', label: 'Valores', icon: '💰' },
    { id: 'fotos', label: 'Fotos', icon: '📸' },
    { id: 'revisao', label: 'Revisão', icon: '✅' },
];
