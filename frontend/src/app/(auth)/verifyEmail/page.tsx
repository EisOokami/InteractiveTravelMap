import { getVerifyEmailData } from "@/data/loaders";
import { CircleCheck, CircleX } from "lucide-react";
import Link from "next/link";

interface VerifyEmailPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
    searchParams,
}: VerifyEmailPageProps) {
    const { token } = await searchParams;

    const result = token
        ? await getVerifyEmailData(token)
        : { status: "error", message: "Token missing from link" };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="flex flex-col items-center gap-4 w-full max-w-md p-8 text-center bg-card border rounded-lg z-50">
                {result.status === "success" ? (
                    <CircleCheck className="size-16 text-green-500" />
                ) : (
                    <CircleX className="size-16 text-destructive" />
                )}
                <h1 className="text-xl font-semibold">
                    {result.status === "success"
                        ? "Email Verified"
                        : "Failed to Verify Email"}
                </h1>
                <p className="text-muted-foreground">{result.message}</p>
                <Link
                    href={
                        result.status === "success"
                            ? "/signIn"
                            : "/resendVerification"
                    }
                    className="inline-flex justify-center items-center h-10 mt-2 px-4 text-sm font-medium text-white bg-bright-blue rounded-md"
                >
                    {result.status === "success"
                        ? "Go to Login"
                        : "Resend Email"}
                </Link>
            </div>
        </div>
    );
}
