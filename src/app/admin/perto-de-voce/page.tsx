import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Perto de Você — Super Admin',
};

export default function AdminLocalAdvertisersPage() {
    return (
        <div>
            <h1>Anunciantes Perto de Você</h1>
            <p>Gerenciamento de estabelecimentos locais parceiros.</p>
        </div>
    );
}
