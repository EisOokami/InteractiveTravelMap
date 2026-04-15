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
            className="relative scroll-pt-12 md:scroll-pt-20 pt-28 md:pt-48 lg:pt-52 overflow-hidden"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_center,rgba(0,150,255,0.3),transparent_70%)] dark:bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.1)_40%,rgba(0,0,0,0)_60%)] bg-no-repeat blur-[80px] dark:blur-none z-0" />
            <div className="grid place-items-center gap-7 container mx-auto px-4">
                <h1 className="max-w-[920px] text-center text-4xl md:text-6xl lg:text-7xl leading-tight font-semibold z-10">
                    Explore The World On Your Map
                </h1>
                <p className="max-w-[750px] text-center text-base md:text-xl text-muted-foreground leading-relaxed z-10">
                    Plan your perfect journey with our interactive travel map.
                    Discover hidden gems, popular attractions, and create
                    unforgettable experiences.
                </p>
                <Button
                    size="lg"
                    className="text-white bg-bright-blue hover:bg-blue-600 font-semibold z-10"
                    asChild
                >
                    <Link href="/map">Start Exploring</Link>
                </Button>
            </div>
            <div className="overflow-hidden pointer-events-none select-none">
                <div className="container mx-auto px-4">
                    <div className="relative w-full mt-12 md:mt-20 h-[600px] md:pb-[45%] md:h-auto border-t border-x rounded-t-xl md:rounded-t-3xl shadow-xl overflow-hidden">
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
                                className="hidden md:block size-full object-cover object-top pointer-events-none select-none z-10"
                            />
                            <Image
                                src={
                                    theme === "dark"
                                        ? "/mobile-map-page2.webp"
                                        : "/mobile-map-page1.webp"
                                }
                                alt="map"
                                width={450}
                                height={600}
                                className="md:hidden size-full object-cover object-top pointer-events-none select-none z-10"
                            />
                            <div className="md:hidden absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-20" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
