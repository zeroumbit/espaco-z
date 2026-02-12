import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Espaço Z — Hospedagem, Aluguéis e Vendas de Imóveis",
    description: "A maior plataforma de hospedagem, aluguéis e vendas de imóveis do Ceará. Encontre casas, apartamentos, flats e muito mais.",
    keywords: ["hospedagem", "aluguéis", "vendas", "imóveis", "ceará", "fortaleza", "airbnb", "marketplace"],
    openGraph: {
        title: "Espaço Z — Hospedagem, Aluguéis e Vendas",
        description: "Encontre o lugar perfeito para se hospedar, alugar ou comprar no Ceará.",
        type: "website",
        locale: "pt_BR",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body>
                {children}
            </body>
        </html>
    );
}
