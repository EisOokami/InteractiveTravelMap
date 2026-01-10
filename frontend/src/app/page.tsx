import Explore from "@/components/layout/explore/Explore";
import Features from "@/components/layout/features/Features";
import Footer from "@/components/layout/footer/Footer";
import Header from "@/components/layout/header/Header";
import Hero from "@/components/layout/hero/Hero";
import HowItWorks from "@/components/layout/howItWorks/HowItWorks";

export default async function HomePage() {
    return (
        <>
            <Header />
            <Hero />
            <Features />
            <HowItWorks />
            <Explore />
            <Footer />
        </>
    );
}
