import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeroLive from "@/components/HeroLive";
import NewsSection from "@/components/NewsSection";
import ProgrammingSection from "@/components/ProgrammingSection";
import ArticlesSection from "@/components/ArticlesSection";
import AdBanner from "@/components/AdBanner";
import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location.hash]);
  return (
    <main className="min-h-screen bg-background pb-14 lg:pb-0 pt-14 sm:pt-16 lg:pt-20">
      <HeroLive />
      {/* Leaderboard ad after hero */}
      <div className="container mx-auto px-4 py-4">
        <AdBanner placement="global_leaderboard" variant="leaderboard" />
      </div>
      <NewsSection />
      {/* Banner ad after news */}
      <div className="container mx-auto px-4 py-6">
        <AdBanner placement="home_after_news" variant="banner" />
      </div>
      <ProgrammingSection />
      {/* Inline ad after programming */}
      <div className="container mx-auto px-4 py-6">
        <AdBanner placement="home_after_programming" variant="banner" />
      </div>
      <ArticlesSection />
      {/* Banner ad after articles */}
      <div className="container mx-auto px-4 py-6">
        <AdBanner placement="home_after_articles" variant="inline" />
      </div>
      <Footer />
    </main>
  );
};

export default Index;
