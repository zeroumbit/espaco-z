import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Financeiro — Super Admin',
};

export default function AdminFinancePage() {
    return (
        <div>
            <h1>Planos e Receita Global</h1>
            <p>Acompanhamento de assinaturas e faturamento da plataforma.</p>
        </div>
    );
}
