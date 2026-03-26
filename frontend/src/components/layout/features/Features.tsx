import { Map, Search, Bookmark, Filter, Navigation, Star } from "lucide-react";

const features = [
    {
        id: 1,
        icon: Map,
        title: "Interactive Map",
        description:
            "Explore destinations with our beautiful, easy-to-use interactive map interface.",
    },
    {
        id: 2,
        icon: Search,
        title: "Smart Search",
        description:
            "Find places by name or location with powerful search filters.",
    },
    {
        id: 3,
        icon: Bookmark,
        title: "Save Favorites",
        description:
            "Bookmark your favorite spots and create custom travel collections.",
    },
    {
        id: 4,
        icon: Filter,
        title: "Advanced Filters",
        description:
            "Filter by categories, ratings, price range, and more to find exactly what you need.",
    },
    {
        id: 5,
        icon: Navigation,
        title: "Route Planning",
        description:
            "Plan your journey and get directions to all your saved destinations.",
    },
    {
        id: 6,
        icon: Star,
        title: "Ratings",
        description: "See ratings from travelers to make informed decisions.",
    },
];

export default function Features() {
    return (
        <div className="relative w-full min-h-screen grid place-content-center overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,150,255,0.3)_0%,rgba(0,150,255,0.15)_0%,rgba(0,0,0,0)_40%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_10%,rgba(0,0,0,0)_30%)]" />
            <section
                id="features"
                className="grid place-items-center gap-5 container mx-auto px-4 py-16 md:py-28 lg:py-32"
            >
                <h2 className="max-w-[820px] text-center text-4xl md:text-5xl lg:text-6xl leading-tight font-semibold z-10">
                    Everything You Need to Plan Your Trip
                </h2>
                <p className="max-w-[750px] text-center text-base md:text-xl text-muted-foreground leading-relaxed z-10">
                    Powerful features designed to make travel planning
                    effortless and enjoyable
                </p>
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 mt-10 z-10">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={feature.id}
                                className="group p-8 bg-white dark:bg-dark-mode-black border-2 hover:border-bright-blue rounded-xl hover:shadow-xl transition duration-300"
                            >
                                <div className="inline-flex mb-6 p-4 bg-bright-blue rounded-xl group-hover:scale-110 transition duration-300">
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="mb-4 text-2xl dark:text-white font-bold">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
