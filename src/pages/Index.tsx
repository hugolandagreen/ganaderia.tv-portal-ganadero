import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroLive from "@/components/HeroLive";

import NewsSection from "@/components/NewsSection";
import ProgrammingSection from "@/components/ProgrammingSection";
import ArticlesSection from "@/components/ArticlesSection";

import ProSection from "@/components/ProSection";
import Footer from "@/components/Footer";
import RadioPlayer from "@/components/RadioPlayer";

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
    <main className="min-h-screen bg-background pb-14 lg:pb-0">
      <Navbar />
      <HeroLive />
      <NewsSection />
      <ProgrammingSection />
      <ArticlesSection />
      <AiAssistant />
      <ProSection />
      <Footer />
      <RadioPlayer />
    </main>
  );
};

export default Index;
