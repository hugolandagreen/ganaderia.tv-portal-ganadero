import logo from "@/assets/logo-ganaderia-tv.png";
import { useLang } from "@/contexts/LangContext";

const Footer = () => {
  const { lang, setLang, t } = useLang();

  return (
    <footer className="bg-card border-t-2 border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="mb-2 rounded-lg p-2 inline-block bg-transparent">
              <img src={logo} alt="Ganaderia.TV" className="h-[6.6rem] w-auto object-contain" />
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">{t("footer_description")}</p>
          </div>
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-foreground">{t("footer_sections")}</h4>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li><a href="#en-vivo" className="hover:text-primary transition-colors">{t("footer_live")}</a></li>
              <li><a href="#noticias" className="hover:text-primary transition-colors">{t("nav_news")}</a></li>
              <li><a href="#programacion" className="hover:text-primary transition-colors">{t("nav_programming")}</a></li>
              <li><a href="/articulos" className="hover:text-primary transition-colors">{t("nav_blog")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-foreground">{t("footer_content")}</h4>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer_beef")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer_dairy")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer_genetics")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer_auctions")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-foreground">{t("footer_languages")}</h4>
            <div className="flex gap-2 mb-6">
              <button onClick={() => setLang("es")} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-colors ${lang === "es" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                🇪🇸 Español
              </button>
              <button onClick={() => setLang("pt")} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-colors ${lang === "pt" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                🇧🇷 Português
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{t("footer_copyright")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
