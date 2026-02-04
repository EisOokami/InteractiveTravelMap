"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/shadcn/button";

export default function Hero() {
    const { theme } = useTheme();

    return (
        <section
            id="hero"
            className="mt-12 md:mt-20 scroll-mt-12 md:scroll-mt-20 py-16 md:py-28 lg:py-32"
        >
            <div className="grid place-items-center gap-7 container mx-auto px-4">
                <h1 className="max-w-[920px] text-center text-4xl md:text-6xl lg:text-7xl leading-tight font-semibold">
                    Explore The World On Your Map
                </h1>
                <p className="max-w-[750px] text-center text-base md:text-xl text-muted-foreground leading-relaxed">
                    Plan your perfect journey with our interactive travel map.
                    Discover hidden gems, popular attractions, and create
                    unforgettable experiences.
                </p>
                <Button
                    size="lg"
                    className="text-white bg-bright-blue hover:bg-blue-600 font-semibold"
                    asChild
                >
                    <Link href="/map">Start Exploring</Link>
                </Button>
            </div>
            <div className="overflow-hidden pointer-events-none select-none">
                <div className="container mx-auto px-4">
                    <div className="relative w-full mt-12 md:mt-20 pb-[45%] border-t border-x rounded-t-xl md:rounded-t-3xl shadow-xl overflow-hidden">
                        <div className="absolute inset-0">
                            <Image
                                src={
                                    theme === "dark"
                                        ? "/map-page2.webp"
                                        : "/map-page1.webp"
                                }
                                alt="map"
                                width={1300}
                                height={200}
                                className="size-full object-cover object-top pointer-events-none select-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
