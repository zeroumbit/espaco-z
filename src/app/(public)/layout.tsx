import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import CookieBanner from "@/components/common/CookieBanner/CookieBanner";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main>{children}</main>
            <Footer />
            <CookieBanner />
        </>
    );
}
