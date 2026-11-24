import SignUpForm from "@/components/ui/signUpForm/SignUpForm";

interface SignUpPageProps {
    searchParams: Promise<{ error?: string | string[] }>;
}

export default async function SignUpPage({
    searchParams,
}: Readonly<SignUpPageProps>) {
    const { error } = await searchParams;

    return (
        <div className="flex min-h-screen w-full items-center justify-center px-4 py-8">
            <SignUpForm
                oauthError={typeof error === "string" ? error : undefined}
            />
        </div>
    );
}
