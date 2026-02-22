import { HospedagemCategoria } from '@/types/listings';

export function getHospedagemCategoria(tipo: string): HospedagemCategoria {
    if (['casa_inteira', 'apartamento_inteiro', 'acomodacao_unica'].includes(tipo)) {
        return 'propriedade_inteira';
    }
    if (['quarto_hotel', 'quarto_pousada', 'quarto_resort', 'quarto_privativo'].includes(tipo)) {
        return 'quarto_privado';
    }
    return 'espaco_compartilhado'; // quarto_compartilhado, cama_albergue
}
