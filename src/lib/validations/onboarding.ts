import { z } from 'zod';

// ---- Step 1: Credenciais ----
export const credentialsSchema = z.object({
    name: z
        .string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    email: z
        .string()
        .email('E-mail inválido'),
    password: z
        .string()
        .min(6, 'Senha deve ter pelo menos 6 caracteres')
        .max(72, 'Senha deve ter no máximo 72 caracteres'),
});

// ---- Step 2: Entidade Legal ----
export const legalEntitySchema = z.object({
    businessType: z.enum(['PF', 'PJ']),
    document: z
        .string()
        .min(1, 'Documento é obrigatório'),
    companyName: z
        .string()
        .min(2, 'Nome fantasia deve ter pelo menos 2 caracteres')
        .max(100, 'Nome fantasia deve ter no máximo 100 caracteres'),
}).superRefine((data, ctx) => {
    const cleanDoc = data.document.replace(/\D/g, '');
    if (data.businessType === 'PF') {
        if (cleanDoc.length !== 11) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'CPF deve ter 11 dígitos',
                path: ['document'],
            });
        }
    } else {
        if (cleanDoc.length !== 14) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'CNPJ deve ter 14 dígitos',
                path: ['document'],
            });
        }
    }
});

// ---- Step 3: Especialização ----
export const specializationSchema = z.object({
    mainModule: z.enum(['hospedagem', 'alugueis', 'vendas']),
    atuacaoEspecifica: z
        .array(z.string())
        .min(1, 'Selecione pelo menos uma atuação específica'),
});

// ---- Schema completo ----
export const onboardingSchema = z.object({
    credentials: credentialsSchema,
    legalEntity: legalEntitySchema,
    specialization: specializationSchema,
    termsAccepted: z.literal(true, {
        message: 'Você deve aceitar os termos de uso',
    }),
});

// ---- Tipo inferido ----
export type OnboardingValidated = z.infer<typeof onboardingSchema>;
