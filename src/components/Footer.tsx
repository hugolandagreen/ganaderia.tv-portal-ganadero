import logo from "@/assets/logo-ganaderia-tv.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t-2 border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="mb-2 rounded-lg p-2 inline-block bg-transparent">
              <img src={logo} alt="Ganaderia.TV" className="h-[6.6rem] w-auto object-contain" />
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              El canal ganadero de referencia mundial. Llegamos a todos los mercados de habla hispana y portuguesa.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-foreground">Secciones</h4>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li><a href="#en-vivo" className="hover:text-primary transition-colors">Canal en Vivo</a></li>
              <li><a href="#noticias" className="hover:text-primary transition-colors">Noticias</a></li>
              <li><a href="#programacion" className="hover:text-primary transition-colors">Programación</a></li>
              <li><a href="#articulos" className="hover:text-primary transition-colors">Artículos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-foreground">Contenido</h4>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Ganado de Carne</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Ganado Lechero</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Genética Bovina</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Subastas</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-foreground">Idiomas</h4>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li>🇪🇸 Español</li>
              <li>🇧🇷 Português </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-8">
              © 2026 Ganaderia.TV — Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>);

};

export default Footer;