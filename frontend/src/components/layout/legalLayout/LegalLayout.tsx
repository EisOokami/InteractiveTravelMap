import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "../footer/Footer";
import DarkModeBtn from "@/components/ui/darkModeBtn/DarkModeBtn";

interface LegalLayoutProps {
    title: string;
    updated: string;
    intro?: ReactNode[];
    children: ReactNode;
}

function renderBold(text: string): ReactNode[] {
    return text.split(/\*\*(.+?)\*\*/g).map((part, index) =>
        index % 2 === 1 ? (
            <strong key={index} className="font-semibold text-foreground">
                {part}
            </strong>
        ) : (
            <Fragment key={index}>{part}</Fragment>
        ),
    );
}

export default function LegalLayout({
    title,
    updated,
    intro,
    children,
}: LegalLayoutProps) {
    return (
        <>
            <header className="fixed w-full bg-white dark:bg-dark-mode-black border-b z-50">
                <div className="flex justify-between items-center container mx-auto px-4 py-3">
                    <Link
                        href="/"
                        className="flex items-center gap-3 select-none"
                    >
                        <Image
                            src="/logo.png"
                            alt="logo"
                            width={35}
                            height={35}
                            className="pointer-events-none"
                        />
                        <span className="md:text-lg">
                            Interactive Travel Map
                        </span>
                    </Link>
                    <DarkModeBtn variant="outline" size="icon" />
                </div>
            </header>
            <main id="main" className="flex-1">
                <section className="pt-28 pb-12 md:pt-36 md:pb-16">
                    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
                            {title}
                        </h1>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Last updated: {updated}
                        </p>
                        {intro
                            ? intro.map((paragraph, i) => (
                                  <p
                                      key={i}
                                      className="mt-6 text-[0.9375rem] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                                  >
                                      {typeof paragraph === "string"
                                          ? renderBold(paragraph)
                                          : paragraph}
                                  </p>
                              ))
                            : null}
                        <div className="mt-10 pt-10 space-y-10 border-t">
                            {children}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
