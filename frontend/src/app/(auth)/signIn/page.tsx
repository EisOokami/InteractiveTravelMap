import { cookies } from "next/headers";
import LoginForm from "@/components/ui/loginForm/LoginForm";

interface SignInPageProps {
    searchParams: Promise<{ error?: string | string[] }>;
}

export default async function SignInPage({
    searchParams,
}: Readonly<SignInPageProps>) {
    const [{ error }, cookieStore] = await Promise.all([
        searchParams,
        cookies(),
    ]);

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <LoginForm
                oauthError={typeof error === "string" ? error : undefined}
                pendingMfaToken={cookieStore.get("google_mfa_challenge")?.value}
            />
        </div>
    );
}
