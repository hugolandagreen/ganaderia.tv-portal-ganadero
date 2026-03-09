import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Users, Newspaper, BookOpen, ChevronLeft, ChevronRight, Crown, Shield, Bot, Globe
} from "lucide-react";

const AdminPanel = () => {
  const { user, isAdmin, isNewsEditor, isCorrespondent, isSuperAdmin, isPro } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // No panel for users without special roles
  if (!user || (!isAdmin && !isNewsEditor && !isCorrespondent)) return null;

  const menuItems = [
    ...(isAdmin
      ? [{ label: "Usuarios", icon: Users, path: "/admin/usuarios", description: "Gestionar roles y usuarios" }]
      : []),
    ...(isNewsEditor || isCorrespondent
      ? [{ label: "Noticias", icon: Newspaper, path: "/admin/noticias", description: "Crear y editar noticias" }]
      : []),
    { label: "GanaderIA", icon: Bot, path: "/asistente-ia", description: isPro ? "Acceso Pro ilimitado" : "Asistente IA" },
  ];

  return (
    <>
      {/* Toggle button - always visible on right edge */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 h-12 w-6 bg-primary text-primary-foreground rounded-l-lg shadow-lg hover:w-8 transition-all flex items-center justify-center"
        title="Panel de administración"
      >
        {open ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    {isSuperAdmin ? (
                      <Crown className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Settings className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-foreground text-sm">Panel de Control</h2>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {isSuperAdmin ? "Super Administrador" : isAdmin ? "Administrador" : isNewsEditor ? "Editor" : "Corresponsal"}
                    </p>
                  </div>
                </div>
                {isSuperAdmin && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs">
                    <Crown className="h-3 w-3 text-yellow-500" />
                    <span className="text-yellow-600 font-semibold">Pro incluido</span>
                  </div>
                )}
              </div>

              {/* Menu items */}
              <nav className="flex-1 p-3 space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Role badges */}
              <div className="p-4 border-t border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">Tus roles</p>
                <div className="flex flex-wrap gap-1.5">
                  {isSuperAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-yellow-600 text-white font-medium">
                      <Crown className="h-2.5 w-2.5" /> Super Admin
                    </span>
                  )}
                  {isAdmin && !isSuperAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-destructive text-destructive-foreground font-medium">
                      <Shield className="h-2.5 w-2.5" /> Admin
                    </span>
                  )}
                  {isNewsEditor && !isAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-primary text-primary-foreground font-medium">
                      <Newspaper className="h-2.5 w-2.5" /> Editor
                    </span>
                  )}
                  {isCorrespondent && !isAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-accent text-accent-foreground font-medium">
                      <Globe className="h-2.5 w-2.5" /> Corresponsal
                    </span>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminPanel;
