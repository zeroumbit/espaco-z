export interface AddressResponse {
    cep: string;
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
    complemento?: string;
    neighborhood?: string; // BrasilAPI compatibility
    street?: string;       // BrasilAPI compatibility
    city?: string;         // BrasilAPI compatibility
    state?: string;        // BrasilAPI compatibility
    latitude?: number;
    longitude?: number;
}

export interface IBGEState {
    id: number;
    sigla: string;
    nome: string;
}

export interface IBGECity {
    id: number;
    nome: string;
}

export interface LocationData {
    cep: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    number?: string;
    complement?: string;
    latitude?: number;
    longitude?: number;
}
