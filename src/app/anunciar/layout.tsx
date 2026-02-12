import CookieBanner from "@/components/common/CookieBanner/CookieBanner";

export default function AnnounceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <main>{children}</main>
            <CookieBanner />
        </>
    );
}