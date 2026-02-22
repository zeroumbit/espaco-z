/* ============================================
   Espaço Z - Onboarding Types
   Multi-step wizard for tenant registration
   ============================================ */

// ---- Step identifiers ----
export type OnboardingStep = 'credentials' | 'legal_entity' | 'specialization';

export const ONBOARDING_STEPS: { id: OnboardingStep; label: string; icon: string }[] = [
    { id: 'credentials', label: 'Acesso', icon: '🔑' },
    { id: 'legal_entity', label: 'Empresa', icon: '🏢' },
    { id: 'specialization', label: 'Atuação', icon: '🎯' },
];

// ---- Business type ----
export type BusinessType = 'PF' | 'PJ';

// ---- Main module (matches schema) ----
export type MainModule = 'hospedagem' | 'alugueis' | 'vendas';

// ---- Sub-categories per module ----
export type AtuacaoEspecifica = string;

export const ATUACAO_OPTIONS: Record<MainModule, { value: string; label: string; icon: string }[]> = {
    hospedagem: [
        { value: 'hotel', label: 'Hotel', icon: '🏨' },
        { value: 'pousada', label: 'Pousada', icon: '🛖' },
        { value: 'resort', label: 'Resort', icon: '🏝️' },
        { value: 'albergue', label: 'Albergue', icon: '🛏️' },
        { value: 'casa', label: 'Casa', icon: '🏠' },
        { value: 'apartamento', label: 'Apartamento', icon: '🏢' },
        { value: 'quarto_privativo', label: 'Quarto Privativo', icon: '🚪' },
        { value: 'quarto_compartilhado', label: 'Quarto Compartilhado', icon: '🛌' },
        { value: 'acomodacao_unica', label: 'Acomodação Única', icon: '⭐' },
    ],
    alugueis: [
        { value: 'casa', label: 'Casa', icon: '🏠' },
        { value: 'apartamento', label: 'Apartamento', icon: '🏢' },
        { value: 'espaco_comercial', label: 'Espaço Comercial', icon: '🏪' },
        { value: 'quarto_privativo', label: 'Quarto Privativo', icon: '🚪' },
    ],
    vendas: [
        { value: 'casa', label: 'Casa', icon: '🏠' },
        { value: 'apartamento', label: 'Apartamento', icon: '🏢' },
        { value: 'espaco_comercial', label: 'Espaço Comercial', icon: '🏪' },
    ],
};

// ---- Form data for each step ----
export interface CredentialsData {
    name: string;
    email: string;
    password: string;
}

export interface LegalEntityData {
    businessType: BusinessType;
    document: string; // CPF or CNPJ
    companyName: string; // Nome Fantasia
}

export interface SpecializationData {
    mainModule: MainModule;
    atuacaoEspecifica: string[];
}

// ---- Full onboarding form data ----
export interface OnboardingFormData {
    credentials: CredentialsData;
    legalEntity: LegalEntityData;
    specialization: SpecializationData;
    termsAccepted: boolean;
}

// ---- Initial state ----
export const INITIAL_ONBOARDING_DATA: OnboardingFormData = {
    credentials: {
        name: '',
        email: '',
        password: '',
    },
    legalEntity: {
        businessType: 'PJ',
        document: '',
        companyName: '',
    },
    specialization: {
        mainModule: 'hospedagem',
        atuacaoEspecifica: [],
    },
    termsAccepted: true,
};
