import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Anunciantes — Super Admin',
};

export default function AdminTenantsPage() {
    return (
        <div>
            <h1>Gestão de Anunciantes (Tenants)</h1>
            <p>Lista e moderação de todos os parceiros da plataforma.</p>
        </div>
    );
}
