import Header from "@/components/layout/header/Header";
import Hero from "@/components/layout/hero/Hero";
import Features from "@/components/layout/features/Features";
import HowItWorks from "@/components/layout/howItWorks/HowItWorks";
import Explore from "@/components/layout/explore/Explore";
import Footer from "@/components/layout/footer/Footer";

export default async function HomePage() {
    return (
        <>
            <Header />
            <main>
                <Hero />
                <Features />
                <HowItWorks />
                <Explore />
            </main>
            <Footer />
        </>
    );
}
