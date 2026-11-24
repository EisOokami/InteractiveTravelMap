import LegalDocument from "@/components/layout/legalDocument/LegalDocument";
import { privacyPolicy } from "@/content/legal/privacyPolicy";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Polityka prywatności",
    description: "Jak Interactive Travel Map przetwarza dane osobowe.",
    alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
    return <LegalDocument source={privacyPolicy} />;
}
