import { AddressResponse, IBGECity, IBGEState, LocationData } from "@/types/location";

/**
 * Busca endereço por CEP com fallback entre BrasilAPI e ViaCEP.
 * Prioriza BrasilAPI para obter coordenadas geográficas.
 */
export async function buscarEnderecoPorCep(cep: string): Promise<LocationData | null> {
    const rawCep = cep.replace(/\D/g, '');
    if (rawCep.length !== 8) return null;

    try {
        // Tenta BrasilAPI (v2 retorna coordenadas)
        console.log(`[LocationService] Buscando CEP ${rawCep} na BrasilAPI...`);
        const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${rawCep}`);
        
        if (response.ok) {
            const data = await response.json();
            return {
                cep: data.cep,
                street: data.street,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                latitude: data.location?.coordinates?.latitude,
                longitude: data.location?.coordinates?.longitude
            };
        }
    } catch (error) {
        console.warn("[LocationService] Erro na BrasilAPI, tentando ViaCEP...", error);
    }

    try {
        // Fallback ViaCEP
        const response = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await response.json();

        if (data.erro) throw new Error("CEP não encontrado no ViaCEP");

        return {
            cep: data.cep.replace('-', ''),
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
        };
    } catch (error) {
        console.error("[LocationService] Ambas as APIs falharam:", error);
        return null;
    }
}

/**
 * Busca lista de estados no IBGE ordenados por nome.
 */
export async function buscarEstadosIBGE(): Promise<IBGEState[]> {
    try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        if (!response.ok) throw new Error("Erro ao buscar estados");
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

/**
 * Busca cidades de um estado específico no IBGE ordendas por nome.
 */
export async function buscarCidadesPorEstadoIBGE(uf: string): Promise<IBGECity[]> {
    if (!uf) return [];
    try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
        if (!response.ok) throw new Error("Erro ao buscar cidades");
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}
