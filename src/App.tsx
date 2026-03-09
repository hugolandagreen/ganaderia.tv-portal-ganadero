import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MediaProvider } from "@/hooks/useRadioPlayer";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import RadioPlayer from "@/components/RadioPlayer";
import AdminPanel from "@/components/AdminPanel";
import Index from "./pages/Index";
import Noticias from "./pages/Noticias";
import NoticiaDetalle from "./pages/NoticiaDetalle";
import AdminNoticias from "./pages/AdminNoticias";
import AdminArticulos from "./pages/AdminArticulos";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AsistenteIA from "./pages/AsistenteIA";
import AdminUsuarios from "./pages/AdminUsuarios";
import Articulos from "./pages/Articulos";
import ArticuloDetalle from "./pages/ArticuloDetalle";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <MediaProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <AdminPanel />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/noticias" element={<Noticias />} />
              <Route path="/noticia/:id" element={<NoticiaDetalle />} />
              <Route path="/asistente-ia" element={<AsistenteIA />} />
              <Route path="/admin/noticias" element={<AdminNoticias />} />
              <Route path="/admin/usuarios" element={<AdminUsuarios />} />
              <Route path="/admin/articulos" element={<AdminArticulos />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <RadioPlayer />
          </BrowserRouter>
        </MediaProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
