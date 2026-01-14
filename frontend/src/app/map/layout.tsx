import { StoreProvider } from "../StoreProvider";

export default function MapLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <StoreProvider>{children}</StoreProvider>;
}
