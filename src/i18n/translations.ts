export type Lang = "es" | "pt";

export const translations = {
  // Navbar
  nav_live: { es: "EN VIVO", pt: "AO VIVO" },
  nav_news: { es: "Noticias", pt: "Notícias" },
  nav_programming: { es: "Programación", pt: "Programação" },
  nav_blog: { es: "Blog", pt: "Blog" },
  nav_ai_assistant: { es: "Asistente IA", pt: "Assistente IA" },
  nav_radio: { es: "Radio Ganadera", pt: "Rádio Pecuária" },
  nav_live_badge: { es: "VIVO", pt: "VIVO" },
  nav_login: { es: "Acceder", pt: "Entrar" },
  nav_logout: { es: "Salir", pt: "Sair" },
  nav_logout_mobile: { es: "Cerrar sesión", pt: "Sair" },
  nav_login_mobile: { es: "Acceder / Registrarse", pt: "Entrar / Cadastrar" },

  // HeroLive
  hero_live: { es: "En Vivo", pt: "Ao Vivo" },
  hero_click_to_watch: { es: "Haz clic para ver Ganaderia.TV en vivo", pt: "Clique para assistir Ganaderia.TV ao vivo" },
  hero_playing_mini: { es: "Reproduciendo en miniatura", pt: "Reproduzindo em miniatura" },
  hero_back_here: { es: "Volver aquí", pt: "Voltar aqui" },
  hero_close_mini: { es: "Cerrar miniatura", pt: "Fechar miniatura" },
  hero_tagline: { es: "La referencia mundial de la ganadería", pt: "A referência mundial da pecuária" },
  hero_subtitle: { es: "Programación 24/7 · Noticias · Genética · Mercados", pt: "Programação 24/7 · Notícias · Genética · Mercados" },

  // News Section
  news_latest: { es: "Últimas noticias", pt: "Últimas notícias" },
  news_title: { es: "Noticias", pt: "Notícias" },
  news_title_highlight: { es: "Ganaderas", pt: "Pecuárias" },
  news_subtitle: { es: "Información actualizada del sector ganadero mundial", pt: "Informações atualizadas do setor pecuário mundial" },
  news_read_more: { es: "Leer más", pt: "Ler mais" },
  news_view_all: { es: "Ver todas las noticias", pt: "Ver todas as notícias" },
  news_no_results: { es: "No hay noticias para estos filtros", pt: "Não há notícias para estes filtros" },
  news_try_another: { es: "Prueba con otra combinación de país o categoría", pt: "Tente outra combinação de país ou categoria" },
  news_showing: { es: "Mostrando", pt: "Mostrando" },
  news_count_label: { es: "noticias", pt: "notícias" },

  // Categories
  cat_lechero: { es: "Ganado Lechero", pt: "Gado Leiteiro" },
  cat_carne: { es: "Ganado de Carne", pt: "Gado de Corte" },
  cat_doble_proposito: { es: "Ganado Doble Propósito", pt: "Gado Dupla Aptidão" },

  // Programming
  prog_title: { es: "Programación del Canal", pt: "Programação do Canal" },
  prog_subtitle: { es: "24 horas de contenido ganadero de clase mundial", pt: "24 horas de conteúdo pecuário de classe mundial" },
  prog_shows: {
    es: [
      { time: "06:00", show: "Amanecer Ganadero", desc: "Noticias del día y precios", region: "Latinoamérica" },
      { time: "08:00", show: "Ruta Ganadera", desc: "Recorrido por fincas del mundo", region: "Global" },
      { time: "10:00", show: "Genética al Día", desc: "Avances en reproducción bovina", region: "Global" },
      { time: "12:00", show: "Mercados en Vivo", desc: "Cotizaciones y subastas", region: "Latinoamérica" },
      { time: "14:00", show: "Campo Abierto", desc: "Documentales de producción", region: "Global" },
      { time: "16:00", show: "Agro Brasil", desc: "Lo mejor de la pecuária brasileña", region: "Brasil 🇧🇷" },
      { time: "18:00", show: "Subastas Premium", desc: "Transmisión en vivo de remates", region: "Global" },
      { time: "20:00", show: "El Ganadero Moderno", desc: "Tecnología y gestión ganadera", region: "Global" },
    ],
    pt: [
      { time: "06:00", show: "Amanhecer Pecuário", desc: "Notícias do dia e preços", region: "América Latina" },
      { time: "08:00", show: "Rota Pecuária", desc: "Visita a fazendas do mundo", region: "Global" },
      { time: "10:00", show: "Genética em Dia", desc: "Avanços em reprodução bovina", region: "Global" },
      { time: "12:00", show: "Mercados ao Vivo", desc: "Cotações e leilões", region: "América Latina" },
      { time: "14:00", show: "Campo Aberto", desc: "Documentários de produção", region: "Global" },
      { time: "16:00", show: "Agro Brasil", desc: "O melhor da pecuária brasileira", region: "Brasil 🇧🇷" },
      { time: "18:00", show: "Leilões Premium", desc: "Transmissão ao vivo de leilões", region: "Global" },
      { time: "20:00", show: "O Pecuarista Moderno", desc: "Tecnologia e gestão pecuária", region: "Global" },
    ],
  },

  // News page
  news_page_title: { es: "Noticias", pt: "Notícias" },
  news_page_highlight: { es: "Ganaderas", pt: "Pecuárias" },
  news_page_subtitle: { es: "Toda la información actualizada del sector ganadero en Latinoamérica y el mundo", pt: "Todas as informações atualizadas do setor pecuário na América Latina e no mundo" },

  // Articles
  articles_title: { es: "Artículos Destacados", pt: "Artigos em Destaque" },
  articles_subtitle: { es: "Contenido especializado para el ganadero moderno", pt: "Conteúdo especializado para o pecuarista moderno" },
  articles_view_all: { es: "Ver todos los artículos", pt: "Ver todos os artigos" },
  articles_blog_title: { es: "Blog", pt: "Blog" },
  articles_blog_highlight: { es: "Ganadero", pt: "Pecuário" },
  articles_blog_subtitle: { es: "Artículos especializados sobre genética, mercados, sostenibilidad y más", pt: "Artigos especializados sobre genética, mercados, sustentabilidade e mais" },
  articles_search: { es: "Buscar artículos...", pt: "Buscar artigos..." },
  articles_showing: { es: "artículos", pt: "artigos" },
  articles_read: { es: "Leer", pt: "Ler" },
  articles_no_results: { es: "No hay artículos para estos filtros", pt: "Não há artigos para estes filtros" },
  articles_try_another: { es: "Prueba con otra combinación", pt: "Tente outra combinação" },
  articles_min_read: { es: "min de lectura", pt: "min de leitura" },
  articles_min: { es: "min", pt: "min" },

  // Detail pages
  detail_back_news: { es: "Volver a noticias", pt: "Voltar às notícias" },
  detail_back_blog: { es: "Volver al blog", pt: "Voltar ao blog" },
  detail_author: { es: "Autor", pt: "Autor" },
  detail_share: { es: "Compartir:", pt: "Compartilhar:" },
  detail_no_content: { es: "El contenido completo aún no está disponible.", pt: "O conteúdo completo ainda não está disponível." },
  detail_not_found_news: { es: "Noticia no encontrada", pt: "Notícia não encontrada" },
  detail_not_found_article: { es: "Artículo no encontrado", pt: "Artigo não encontrado" },

  // Reader count
  readers_label: { es: "lecturas", pt: "leituras" },

  // Social share
  share_copied: { es: "¡Enlace copiado!", pt: "Link copiado!" },
  share_copied_desc: { es: "Ya puedes pegarlo donde quieras.", pt: "Agora pode colar onde quiser." },

  // Footer
  footer_description: { es: "El canal ganadero de referencia mundial. Llegamos a todos los mercados de habla hispana y portuguesa.", pt: "O canal pecuário de referência mundial. Chegamos a todos os mercados de língua espanhola e portuguesa." },
  footer_sections: { es: "Secciones", pt: "Seções" },
  footer_live: { es: "Canal en Vivo", pt: "Canal ao Vivo" },
  footer_content: { es: "Contenido", pt: "Conteúdo" },
  footer_beef: { es: "Ganado de Carne", pt: "Gado de Corte" },
  footer_dairy: { es: "Ganado Lechero", pt: "Gado Leiteiro" },
  footer_genetics: { es: "Genética Bovina", pt: "Genética Bovina" },
  footer_auctions: { es: "Subastas", pt: "Leilões" },
  footer_languages: { es: "Idiomas", pt: "Idiomas" },
  footer_copyright: { es: "© 2026 Ganaderia.TV — Todos los derechos reservados", pt: "© 2026 Ganaderia.TV — Todos os direitos reservados" },

  // Auth
  auth_reset_password: { es: "Restablecer contraseña", pt: "Redefinir senha" },
  auth_login: { es: "Iniciar Sesión", pt: "Entrar" },
  auth_signup: { es: "Crear Cuenta", pt: "Criar Conta" },
  auth_reset_desc: { es: "Ingresa tu email para recibir un enlace", pt: "Digite seu email para receber um link" },
  auth_access_desc: { es: "Accede al Asistente Ganadero Pro", pt: "Acesse o Assistente Pecuário Pro" },
  auth_google: { es: "Continuar con Google", pt: "Continuar com Google" },
  auth_or: { es: "o", pt: "ou" },
  auth_email: { es: "Email", pt: "Email" },
  auth_password: { es: "Contraseña", pt: "Senha" },
  auth_loading: { es: "Cargando...", pt: "Carregando..." },
  auth_send_link: { es: "Enviar enlace", pt: "Enviar link" },
  auth_forgot: { es: "¿Olvidaste tu contraseña?", pt: "Esqueceu sua senha?" },
  auth_back_login: { es: "Volver al login", pt: "Voltar ao login" },
  auth_no_account: { es: "¿No tienes cuenta? ", pt: "Não tem conta? " },
  auth_has_account: { es: "¿Ya tienes cuenta? ", pt: "Já tem conta? " },
  auth_register: { es: "Regístrate", pt: "Cadastre-se" },
  auth_signin: { es: "Inicia sesión", pt: "Faça login" },
  auth_back_home: { es: "Volver al inicio", pt: "Voltar ao início" },
  auth_check_email: { es: "Revisa tu email", pt: "Verifique seu email" },
  auth_check_email_desc: { es: "Te enviamos un enlace para restablecer tu contraseña.", pt: "Enviamos um link para redefinir sua senha." },
  auth_success: { es: "¡Registro exitoso!", pt: "Cadastro realizado!" },
  auth_success_desc: { es: "Revisa tu email para confirmar tu cuenta.", pt: "Verifique seu email para confirmar sua conta." },
  auth_login_save: { es: "Iniciar sesión para guardar chats", pt: "Entrar para salvar chats" },

  // AI Assistant
  ai_welcome: { es: "Bienvenido a Ganader", pt: "Bem-vindo ao Ganader" },
  ai_welcome_desc: { es: "Tu asistente ganadero con inteligencia artificial. Pregúntame sobre precios, razas, nutrición, salud animal y más.", pt: "Seu assistente pecuário com inteligência artificial. Pergunte sobre preços, raças, nutrição, saúde animal e mais." },
  ai_assistant_label: { es: "Asistente Ganadero con IA", pt: "Assistente Pecuário com IA" },
  ai_unlimited: { es: "Consultas ilimitadas • Asesoría personalizada", pt: "Consultas ilimitadas • Assessoria personalizada" },
  ai_free_remaining: { es: "consultas gratuitas restantes hoy", pt: "consultas gratuitas restantes hoje" },
  ai_new_conversation: { es: "Nueva conversación", pt: "Nova conversa" },
  ai_conversations_empty: { es: "Tus conversaciones aparecerán aquí", pt: "Suas conversas aparecerão aqui" },
  ai_pro_plan: { es: "Plan Pro", pt: "Plano Pro" },
  ai_pro_desc: { es: "Consultas ilimitadas y asesoría personalizada", pt: "Consultas ilimitadas e assessoria personalizada" },
  ai_limit_reached: { es: "Límite alcanzado", pt: "Limite atingido" },
  ai_limit_desc: { es: "Has usado tus 5 consultas gratuitas de hoy. ¡Suscríbete a Pro para consultas ilimitadas!", pt: "Você usou suas 5 consultas gratuitas de hoje. Assine o Pro para consultas ilimitadas!" },
  ai_limit_banner: { es: "Has alcanzado tu límite diario.", pt: "Você atingiu seu limite diário." },
  ai_go_pro: { es: "¡Hazte Pro para consultas ilimitadas!", pt: "Assine o Pro para consultas ilimitadas!" },
  ai_placeholder: { es: "Pregunta sobre precios, razas, mercados...", pt: "Pergunte sobre preços, raças, mercados..." },
  ai_placeholder_limited: { es: "Suscríbete a Pro para continuar...", pt: "Assine o Pro para continuar..." },
  ai_subscribe: { es: "Suscribirme", pt: "Assinar" },
  ai_access_subscribe: { es: "Acceder para suscribirte", pt: "Entrar para assinar" },
  ai_pro_title: { es: "GanaderIA Pro", pt: "GanaderIA Pro" },
  ai_pro_unlock: { es: "Desbloquea todo el poder de GanaderIA para llevar tu ganadería al siguiente nivel", pt: "Desbloqueie todo o poder do GanaderIA para levar sua pecuária ao próximo nível" },

  // AI suggestion categories
  ai_cat_prices: { es: "Precios y Mercados", pt: "Preços e Mercados" },
  ai_cat_genetics: { es: "Genética y Razas", pt: "Genética e Raças" },
  ai_cat_health: { es: "Salud Animal", pt: "Saúde Animal" },
  ai_cat_nutrition: { es: "Nutrición y Pasturas", pt: "Nutrição e Pastagens" },
  ai_cat_profitability: { es: "Rentabilidad", pt: "Rentabilidade" },

  ai_q_prices: {
    es: [
      "¿Cuál es el precio actual del novillo en pie en México?",
      "¿Cómo está el mercado de exportación de carne en Brasil?",
      "Tendencias del precio del becerro en Colombia",
    ],
    pt: [
      "Qual é o preço atual do boi em pé no Brasil?",
      "Como está o mercado de exportação de carne no Brasil?",
      "Tendências do preço do bezerro na América Latina",
    ],
  },
  ai_q_genetics: {
    es: [
      "¿Cuál es el mejor cruce para doble propósito en clima tropical?",
      "Características de la raza Brahman vs Nelore",
      "¿Cómo mejorar la genética de mi hato lechero?",
    ],
    pt: [
      "Qual é o melhor cruzamento para dupla aptidão em clima tropical?",
      "Características da raça Brahman vs Nelore",
      "Como melhorar a genética do meu rebanho leiteiro?",
    ],
  },
  ai_q_health: {
    es: [
      "Protocolo de vacunación para ganado bovino en México",
      "¿Cómo prevenir la fiebre aftosa en mi rancho?",
      "Signos de mastitis y tratamiento recomendado",
    ],
    pt: [
      "Protocolo de vacinação para gado bovino no Brasil",
      "Como prevenir a febre aftosa na minha fazenda?",
      "Sinais de mastite e tratamento recomendado",
    ],
  },
  ai_q_nutrition: {
    es: [
      "¿Qué pastos son mejores para engorda en zona tropical?",
      "Plan nutricional para vacas en producción lechera",
      "¿Cómo suplementar ganado en época de sequía?",
    ],
    pt: [
      "Quais pastagens são melhores para engorda em zona tropical?",
      "Plano nutricional para vacas em produção leiteira",
      "Como suplementar gado em época de seca?",
    ],
  },
  ai_q_profitability: {
    es: [
      "¿Cómo calcular el costo de producción por litro de leche?",
      "Análisis de rentabilidad de engorda en corral",
      "¿Cuántas cabezas necesito para que mi rancho sea rentable?",
    ],
    pt: [
      "Como calcular o custo de produção por litro de leite?",
      "Análise de rentabilidade de engorda em confinamento",
      "Quantas cabeças preciso para que minha fazenda seja rentável?",
    ],
  },

  ai_pro_features: {
    es: [
      "Asesoría personalizada según tu ganado y región",
      "Análisis de mercados y precios en tiempo real",
      "Planes de nutrición y manejo de pasturas",
      "Protocolos sanitarios y prevención",
      "Consultas ilimitadas sin restricciones",
      "Gestión financiera y costos de producción",
    ],
    pt: [
      "Assessoria personalizada segundo seu rebanho e região",
      "Análise de mercados e preços em tempo real",
      "Planos de nutrição e manejo de pastagens",
      "Protocolos sanitários e prevenção",
      "Consultas ilimitadas sem restrições",
      "Gestão financeira e custos de produção",
    ],
  },

  // Radio player (mobile)
  radio_name: { es: "Radio Ganadera", pt: "Rádio Pecuária" },
  radio_desc: { es: "Música y noticias del campo 24/7", pt: "Música e notícias do campo 24/7" },

  // Common
  common_back_home: { es: "Volver al inicio", pt: "Voltar ao início" },
  common_loading: { es: "Cargando...", pt: "Carregando..." },
  common_error: { es: "Error", pt: "Erro" },
} as const;

export type TranslationKey = keyof typeof translations;
