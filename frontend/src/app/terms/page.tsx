import LegalDocument from "@/components/layout/legalDocument/LegalDocument";
import { termsOfService } from "@/content/legal/termsOfService";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Regulamin",
    description: "Regulamin serwisu Interactive Travel Map.",
    alternates: { canonical: "/terms" },
};

export default function TermsOfServicePage() {
    return <LegalDocument source={termsOfService} />;
}
