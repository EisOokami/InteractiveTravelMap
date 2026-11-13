import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t py-12 z-10">
            <div className="grid place-content-center gap-8 container mx-auto px-4">
                <div className="grid gap-3 z-10">
                    <a
                        href="#hero"
                        className="flex justify-center items-center gap-3 select-none"
                    >
                        <Image
                            src="/logo.png"
                            alt="logo"
                            width={35}
                            height={35}
                            className="pointer-events-none"
                        />
                        <span className="text-lg">Interactive Travel Map</span>
                    </a>
                    <p className="max-w-md text-center text-sm text-muted-foreground leading-relaxed">
                        Discover the world&apos;s best destinations with our
                        interactive travel map. Plan, explore, and create
                        unforgettable memories.
                    </p>
                </div>
                <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 z-10">
                    <a
                        href="#features"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Features
                    </a>
                    <a
                        href="#how-it-works"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        How It Works
                    </a>
                    <a
                        href="#explore"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Explore
                    </a>
                </nav>
                <div className="flex justify-center items-center space-x-4 z-10">
                    <Link
                        href="https://github.com/EisOokami"
                        className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors group"
                    >
                        <Github className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </Link>
                    <Link
                        href="/"
                        className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors group"
                    >
                        <Linkedin className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </Link>
                </div>
                <div className="text-center text-xs text-muted-foreground z-10">
                    © {new Date().getFullYear()} EisOokami. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
