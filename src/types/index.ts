/* ============================================
   Espaço Z - Database & Application Types
   Multi-tenant marketplace types
   ============================================ */

// ---- Enums ----
export type ModuleType = 'hospedagem' | 'alugueis' | 'vendas';

export type UserRole = 'visitante' | 'usuario' | 'anunciante' | 'admin';

export type BookingStatus = 'pendente' | 'confirmada' | 'cancelada' | 'concluida';

export type SpaceStatus = 'rascunho' | 'ativo' | 'pausado' | 'inativo';

export type SubscriptionPlan =
    | 'trial'
    | 'plano_1'
    | 'plano_3'
    | 'plano_5'
    | 'plano_10'
    | 'plano_20'
    | 'plano_50'
    | 'plano_100'
    | 'plano_200'
    | 'ilimitado';

export type PropertyType =
    | 'apartamento'
    | 'casa'
    | 'kitnet'
    | 'flat'
    | 'chacara'
    | 'sitio'
    | 'cobertura'
    | 'loft'
    | 'studio'
    | 'terreno'
    | 'sala_comercial'
    | 'galpao'
    | 'outro';

export type RentalPeriod = 'semanal' | 'mensal' | 'anual';

export type SaleFunnelStep = 'interesse' | 'visita' | 'proposta' | 'documentacao' | 'fechamento';

export type LocalAdvertiserPlan = 'basico' | 'pro' | 'prime';

export type LocalAdvertiserCategory =
    | 'supermercado'
    | 'farmacia'
    | 'restaurante'
    | 'padaria'
    | 'posto_gasolina'
    | 'hospital'
    | 'escola'
    | 'banco'
    | 'loja'
    | 'servico'
    | 'outro';

// ---- Database Tables ----

export interface Tenant {
    id: string;
    name: string;
    slug: string; // @nomeAnunciante
    logo_url?: string;
    description?: string;
    city: string;
    state: string;
    phone?: string;
    whatsapp?: string;
    email: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    subscription_plan: SubscriptionPlan;
    max_spaces: number;
    trial_ends_at?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserProfile {
    id: string;
    user_id: string;
    tenant_id?: string;
    role: UserRole;
    full_name: string;
    avatar_url?: string;
    phone?: string;
    city?: string;
    state?: string;
    created_at: string;
    updated_at: string;
}

export interface Space {
    id: string;
    tenant_id: string;
    module: ModuleType;
    status: SpaceStatus;
    title: string;
    description: string;
    property_type: PropertyType;

    // Location
    city: string;
    state: string;
    neighborhood: string;
    address?: string;
    zip_code?: string;
    latitude?: number;
    longitude?: number;

    // Details
    bedrooms?: number;
    bathrooms?: number;
    max_guests?: number;
    area_m2?: number;

    // Pricing
    price: number;
    price_period?: RentalPeriod; // for rentals
    cleaning_fee?: number;

    // Hosting specific
    instant_booking?: boolean;
    check_in_time?: string;
    check_out_time?: string;
    min_nights?: number;
    max_nights?: number;

    // Sales specific
    sale_type?: 'classificado' | 'completo';

    // Media & extras
    photos: string[];
    amenities: string[];
    rules?: string[];

    // Badges & boost
    badges: string[];
    is_pinned: boolean;
    is_boosted: boolean;
    boost_expires_at?: string;

    // Stats
    views_count: number;
    favorites_count: number;
    rating_average?: number;
    rating_count: number;

    created_at: string;
    updated_at: string;
}

export interface Booking {
    id: string;
    space_id: string;
    guest_user_id: string;
    tenant_id: string;
    status: BookingStatus;
    check_in: string;
    check_out: string;
    guests_count: number;
    total_price: number;
    message?: string;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface Conversation {
    id: string;
    space_id?: string;
    tenant_id: string;
    user_id: string;
    module: ModuleType;
    last_message?: string;
    last_message_at?: string;
    created_at: string;
}

export interface Review {
    id: string;
    booking_id: string;
    space_id: string;
    reviewer_id: string;
    reviewed_id: string;
    rating: number;
    comment?: string;
    created_at: string;
}

export interface Favorite {
    id: string;
    user_id: string;
    space_id: string;
    created_at: string;
}

export interface CalendarBlock {
    id: string;
    space_id: string;
    date: string;
    is_available: boolean;
    price_override?: number;
    booking_id?: string;
}

export interface LocalAdvertiser {
    id: string;
    name: string;
    category: LocalAdvertiserCategory;
    description?: string;
    logo_url?: string;
    photos: string[];
    phone?: string;
    whatsapp?: string;
    website?: string;
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    radius_km: number;
    plan: LocalAdvertiserPlan;
    show_in_hospedagem: boolean;
    show_in_alugueis: boolean;
    show_in_vendas: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Subscription {
    id: string;
    tenant_id: string;
    plan: SubscriptionPlan;
    price_monthly: number;
    price_yearly?: number;
    is_yearly: boolean;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
    mercadopago_subscription_id?: string;
    created_at: string;
}

export interface CookieConsent {
    id: string;
    user_id?: string;
    session_id: string;
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    consented_at: string;
}

// ---- UI Types ----

export interface SearchFilters {
    module: ModuleType;
    city?: string;
    state?: string;
    neighborhood?: string;
    check_in?: string;
    check_out?: string;
    guests?: number;
    min_price?: number;
    max_price?: number;
    bedrooms?: number;
    property_type?: PropertyType;
    amenities?: string[];
    instant_booking?: boolean;
    sort_by?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'relevance';
}

export interface Amenity {
    id: string;
    name: string;
    icon: string;
    category: string;
}

export interface NavigationTab {
    id: ModuleType;
    label: string;
    icon: string;
    color: string;
    lightColor: string;
}

// ---- API Response Types ----
export interface PaginatedResponse<T> {
    data: T[];
    count: number;
    page: number;
    per_page: number;
    total_pages: number;
}

export interface ApiError {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
}
