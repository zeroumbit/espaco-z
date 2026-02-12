import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Configurações — Super Admin',
};

export default function AdminSettingsPage() {
    return (
        <div>
            <h1>Configurações da Plataforma</h1>
            <p>Ajustes globais, taxas, e políticas do sistema.</p>
        </div>
    );
}
