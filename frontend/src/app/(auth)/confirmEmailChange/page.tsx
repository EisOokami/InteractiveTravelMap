import ConfirmEmailChangeForm from "@/components/ui/confirmEmailChangeForm/ConfirmEmailChangeForm";

interface ConfirmEmailChangePageProps {
    searchParams: Promise<{ token?: string | string[] }>;
}

export default async function ConfirmEmailChangePage({
    searchParams,
}: ConfirmEmailChangePageProps) {
    const { token } = await searchParams;

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <ConfirmEmailChangeForm
                token={typeof token === "string" ? token : ""}
            />
        </div>
    );
}
