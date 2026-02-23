import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeProvider";
import { Toaster } from "@/components/ui/shadcn/sonner";
import "sonner/dist/styles.css";
import "./globals.scss";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
    title: "Interactive Travel Map",
    description: "",
    icons: "/favicon.ico",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
            <body
                className={`${poppins.className} antialiased flex flex-col min-h-svh`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
                <Toaster />
            </body>
        </html>
    );
}
