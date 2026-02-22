import { createClient } from './client';
import { 
    Property, Listing, ListingHospedagem, ListingAluguel, ListingVenda,
    PropertyFormData, ListingFormData 
} from '@/types/listings';
import { parseToCentavos } from '@/lib/listings-constants';

/**
 * Serviço para gerenciar Imóveis e Anúncios (Schema V3)
 */
export const ListingService = {
    /**
     * Cria um novo anúncio completo (Property + Listing + Module Data)
     */
    async createFullListing(
        orgId: string, 
        userId: string, 
        propertyData: PropertyFormData, 
        listingData: ListingFormData
    ) {
        const supabase = createClient();
        
        try {
            // 1. Inserir a Property (Imóvel Físico)
            const { data: property, error: pError } = await supabase
                .from('properties')
                .insert([{
                    organization_id: orgId,
                    created_by: userId,
                    titulo: propertyData.titulo,
                    descricao: propertyData.descricao,
                    tipo_imovel: propertyData.tipo_imovel,
                    subtipo_imovel: propertyData.subtipo_imovel,
                    area_total: propertyData.area_total ? Number(propertyData.area_total) : null,
                    area_privativa: propertyData.area_privativa ? Number(propertyData.area_privativa) : null,
                    area_terreno: propertyData.area_terreno ? Number(propertyData.area_terreno) : null,
                    quartos: propertyData.quartos,
                    suites: propertyData.suites,
                    banheiros_sociais: propertyData.banheiros_sociais,
                    salas: propertyData.salas,
                    vagas_garagem: propertyData.vagas_garagem,
                    ano_construcao: propertyData.ano_construcao ? Number(propertyData.ano_construcao) : null,
                    estado_conservacao: propertyData.estado_conservacao,
                    cep: propertyData.cep,
                    logradouro: propertyData.logradouro,
                    numero: propertyData.numero,
                    complemento: propertyData.complemento,
                    bairro: propertyData.bairro,
                    cidade: propertyData.cidade,
                    estado: propertyData.estado,
                    amenities: propertyData.amenities, // Array string
                    // Campos condicionais de hospedagem
                    banheiro_privativo: propertyData.banheiro_privativo ?? null,
                    tipo_cama: propertyData.tipo_cama || null,
                    total_camas_quarto: propertyData.total_camas_quarto ?? null,
                    locker_disponivel: propertyData.locker_disponivel ?? null,
                }])
                .select()
                .single();

            if (pError) throw pError;
            if (!property) throw new Error("Falha ao criar propriedade");

            // 2. Inserir o Listing (Oferta Comercial)
            const { data: listing, error: lError } = await supabase
                .from('listings')
                .insert([{
                    property_id: property.id,
                    organization_id: orgId,
                    modulo: listingData.modulo,
                    status: 'ativo',
                    preco_base_centavos: parseToCentavos(listingData.preco_base),
                    exclusividade: listingData.exclusividade,
                }])
                .select()
                .single();

            if (lError) throw lError;
            if (!listing) throw new Error("Falha ao criar anúncio");

            // 3. Inserir dados específicos do módulo
            if (listingData.modulo === 'hospedagem') {
                const { error: hError } = await supabase
                    .from('listing_hospedagem')
                    .insert([{
                        listing_id: listing.id,
                        capacidade_maxima: listingData.capacidade_maxima,
                        camas_casal: listingData.camas_casal,
                        camas_solteiro: listingData.camas_solteiro,
                        tipo_checkin: listingData.tipo_checkin,
                        preco_fim_semana_centavos: listingData.preco_fim_semana ? parseToCentavos(listingData.preco_fim_semana) : null,
                        taxa_limpeza_centavos: listingData.taxa_limpeza ? parseToCentavos(listingData.taxa_limpeza) : null,
                        desconto_semanal: listingData.desconto_semanal ? Number(listingData.desconto_semanal) : null,
                        desconto_mensal: listingData.desconto_mensal ? Number(listingData.desconto_mensal) : null,
                        minimo_noites: listingData.minimo_noites,
                    }]);
                if (hError) throw hError;
            } 
            else if (listingData.modulo === 'aluguel') {
                const { error: aError } = await supabase
                    .from('listing_aluguel')
                    .insert([{
                        listing_id: listing.id,
                        valor_condominio_centavos: listingData.valor_condominio ? parseToCentavos(listingData.valor_condominio) : null,
                        valor_iptu_centavos: listingData.valor_iptu ? parseToCentavos(listingData.valor_iptu) : null,
                        valor_caucao_centavos: listingData.valor_caucao ? parseToCentavos(listingData.valor_caucao) : null,
                        garantias_aceitas: listingData.garantias_aceitas,
                        indice_reajuste: listingData.indice_reajuste,
                        prazo_minimo_contrato: listingData.prazo_minimo_contrato ? Number(listingData.prazo_minimo_contrato) : null,
                    }]);
                if (aError) throw aError;
            }
            else if (listingData.modulo === 'venda') {
                const { error: vError } = await supabase
                    .from('listing_venda')
                    .insert([{
                        listing_id: listing.id,
                        aceita_financiamento: listingData.aceita_financiamento,
                        aceita_permuta: listingData.aceita_permuta,
                        fgts: listingData.fgts,
                        entrada_minima_percentual: listingData.entrada_minima_percentual ? Number(listingData.entrada_minima_percentual) : null,
                        status_obra: listingData.status_obra,
                        construtora: listingData.construtora,
                        incorporadora: listingData.incorporadora,
                    }]);
                if (vError) throw vError;
            }

            return { property, listing };

        } catch (error) {
            console.error("[ListingService] Erro ao criar anúncio completo:", error);
            throw error;
        }
    },

    /**
     * Busca os anúncios de uma organização com dados da propriedade
     */
    async getOrgListings(orgId: string) {
        const supabase = createClient();
        
        const { data, error } = await supabase
            .from('listings')
            .select(`
                *,
                property:properties(*)
            `)
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as (Listing & { property: Property })[];
    }
};
