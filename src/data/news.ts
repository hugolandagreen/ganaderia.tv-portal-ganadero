import expoGanaderaImg from "@/assets/expo-ganadera-jalisco.jpg";

export type Category = "global" | "lechero" | "carne";

export interface NewsItem {
  id: number;
  title: string;
  category: Category;
  country: string;
  date: string;
  flag: string;
  image: string;
  summary?: string;
}

export const countries = [
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Brasil", flag: "🇧🇷" },
  { name: "Colombia", flag: "🇨🇴" },
  { name: "México", flag: "🇲🇽" },
  { name: "Uruguay", flag: "🇺🇾" },
  { name: "Paraguay", flag: "🇵🇾" },
  { name: "Chile", flag: "🇨🇱" },
  { name: "España", flag: "🇪🇸" },
  { name: "Perú", flag: "🇵🇪" },
  { name: "Venezuela", flag: "🇻🇪" },
];

export const newsItems: NewsItem[] = [
  { id: 1, title: "Argentina lidera exportaciones de carne vacuna en el primer trimestre", category: "carne", country: "Argentina", date: "27 Feb 2026", flag: "🇦🇷", image: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=600&h=350&fit=crop", summary: "Las exportaciones argentinas de carne vacuna alcanzaron cifras récord durante el primer trimestre del año, consolidando al país como líder regional en el sector cárnico." },
  { id: 2, title: "Brasil alcanza récord en producción lechera con nuevas técnicas genéticas", category: "lechero", country: "Brasil", date: "26 Feb 2026", flag: "🇧🇷", image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&h=350&fit=crop", summary: "La implementación de técnicas genéticas avanzadas ha permitido a Brasil superar sus propios récords de producción lechera, posicionándose como referente en innovación ganadera." },
  { id: 3, title: "Feria ganadera de Guadalajara reúne a más de 500 expositores internacionales", category: "carne", country: "México", date: "25 Feb 2026", flag: "🇲🇽", image: expoGanaderaImg, summary: "La feria más importante de México en el sector ganadero atrajo a expositores de todo el mundo, con novedades en genética, alimentación y tecnología para el campo." },
  { id: 4, title: "Nuevas regulaciones europeas impulsan la ganadería sostenible en España", category: "global", country: "España", date: "25 Feb 2026", flag: "🇪🇸", image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=350&fit=crop", summary: "España se adapta a las nuevas normativas de la Unión Europea que promueven prácticas ganaderas más sostenibles y respetuosas con el medio ambiente." },
  { id: 5, title: "Uruguay implementa trazabilidad digital en el 100% de su ganado", category: "carne", country: "Uruguay", date: "24 Feb 2026", flag: "🇺🇾", image: "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=600&h=350&fit=crop", summary: "Uruguay se convierte en el primer país del mundo en implementar un sistema de trazabilidad digital completo para todo su ganado vacuno." },
  { id: 6, title: "Colombia avanza en genética bovina con inseminación de alta calidad", category: "lechero", country: "Colombia", date: "24 Feb 2026", flag: "🇨🇴", image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=350&fit=crop", summary: "Programas de mejoramiento genético en Colombia están transformando la producción lechera del país con técnicas de inseminación de última generación." },
  { id: 7, title: "Chile fortalece su industria cárnica con acuerdos comerciales en Asia", category: "carne", country: "Chile", date: "23 Feb 2026", flag: "🇨🇱", image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=350&fit=crop", summary: "Nuevos tratados comerciales con países asiáticos abren mercados prometedores para la carne chilena de alta calidad." },
  { id: 8, title: "Paraguay duplica exportaciones de ganado en pie hacia mercados árabes", category: "carne", country: "Paraguay", date: "22 Feb 2026", flag: "🇵🇾", image: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=600&h=350&fit=crop", summary: "El sector ganadero paraguayo experimenta un crecimiento histórico en sus exportaciones de ganado en pie hacia Oriente Medio." },
  { id: 9, title: "Perú invierte en modernización de plantas lecheras a nivel nacional", category: "lechero", country: "Perú", date: "21 Feb 2026", flag: "🇵🇪", image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&h=350&fit=crop", summary: "El gobierno peruano destina fondos significativos para modernizar la infraestructura lechera del país y mejorar la competitividad del sector." },
];

export const categoryFilters = [
  { key: "global" as Category, label: "Todas", color: "from-primary to-burgundy-light" },
  { key: "lechero" as Category, label: "Ganado Lechero", color: "from-pasture to-emerald-600" },
  { key: "carne" as Category, label: "Ganado de Carne", color: "from-accent to-gold-light" },
];

export const categoryBadge: Record<Category, { label: string; classes: string }> = {
  global: { label: "Global", classes: "bg-card text-primary font-bold shadow-sm" },
  lechero: { label: "Lechero", classes: "bg-card text-pasture font-bold shadow-sm" },
  carne: { label: "Carne", classes: "bg-card text-primary font-bold shadow-sm" },
};
