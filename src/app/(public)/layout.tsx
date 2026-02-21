import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import CookieBanner from "@/components/common/CookieBanner/CookieBanner";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    try {
        return (
            <>
                <Header />
                <main>{children}</main>
                <Footer />
                <CookieBanner />
            </>
        );
    } catch (err) {
        console.error('[Public Layout] Crash:', err);
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Erro de Carregamento</h1>
                <p>Não foi possível carregar os componentes de navegação.</p>
                {process.env.NODE_ENV === 'development' && (
                    <pre style={{ color: 'red', marginTop: '1rem' }}>
                        {err instanceof Error ? err.message : String(err)}
                    </pre>
                )}
            </div>
        );
    }
}
