import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import { Shield, Trash2, UserPlus, UserMinus, Users, Crown, Newspaper, Globe, Loader2 } from "lucide-react";

type UserProfile = {
  id: string;
  email: string;
  display_name: string;
  country: string;
  created_at: string;
  roles: string[];
};

const ROLE_LABELS: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  super_admin: { label: "Super Admin", icon: Crown, color: "bg-yellow-600 text-white" },
  admin: { label: "Administrador", icon: Shield, color: "bg-destructive text-destructive-foreground" },
  news_editor: { label: "Editor de Noticias", icon: Newspaper, color: "bg-primary text-primary-foreground" },
  correspondent: { label: "Corresponsal", icon: Globe, color: "bg-accent text-accent-foreground" },
};

const ALL_ROLES = ["super_admin", "admin", "news_editor", "correspondent"] as const;

const AdminUsuarios = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "list_users" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setUsers(data.users || []);
      setIsAdmin(true);
    } catch (e: any) {
      if (e.message?.includes("admin")) {
        setIsAdmin(false);
        toast({ title: "Acceso denegado", description: "No tienes permisos de administrador", variant: "destructive" });
        navigate("/");
      } else {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchUsers();
  }, [user, fetchUsers, navigate]);

  const handleAction = async (action: string, params: any, successMsg: string) => {
    setActionLoading(`${action}-${params.userId}`);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action, ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Éxito", description: successMsg });
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const addRole = (userId: string, role: string) =>
    handleAction("add_role", { userId, role }, `Rol asignado correctamente`);

  const removeRole = (userId: string, role: string) =>
    handleAction("remove_role", { userId, role }, `Rol removido correctamente`);

  const deleteUser = (userId: string, email: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${email}? Esta acción no se puede deshacer.`)) return;
    handleAction("delete_user", { userId }, `Usuario ${email} eliminado`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-10 container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Administración de Usuarios</h1>
            <p className="text-muted-foreground text-sm">{users.length} usuarios registrados</p>
          </div>
        </div>

        <div className="space-y-4">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4"
            >
              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground truncate">{u.display_name || u.email}</span>
                  {u.id === user?.id && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Tú</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{u.country}</span>
                  <span>•</span>
                  <span>{new Date(u.created_at).toLocaleDateString("es-MX")}</span>
                </div>
              </div>

              {/* Current roles */}
              <div className="flex flex-wrap gap-1.5">
                {u.roles.length === 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">Usuario</span>
                )}
                {u.roles.map((role) => {
                  const info = ROLE_LABELS[role];
                  if (!info) return null;
                  const Icon = info.icon;
                  return (
                    <span
                      key={role}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${info.color}`}
                    >
                      <Icon className="h-3 w-3" />
                      {info.label}
                      {!(u.id === user?.id && role === "admin") && (
                        <button
                          onClick={() => removeRole(u.id, role)}
                          disabled={actionLoading === `remove_role-${u.id}`}
                          className="ml-1 hover:opacity-70"
                          title="Quitar rol"
                        >
                          <UserMinus className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Add role dropdown */}
                {ALL_ROLES.filter((r) => !u.roles.includes(r)).length > 0 && (
                  <select
                    className="text-xs bg-background border border-border rounded-lg px-2 py-1.5 text-foreground"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) addRole(u.id, e.target.value);
                    }}
                    disabled={!!actionLoading}
                  >
                    <option value="">+ Asignar rol</option>
                    {ALL_ROLES.filter((r) => !u.roles.includes(r)).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]?.label || r}
                      </option>
                    ))}
                  </select>
                )}

                {/* Delete user */}
                {u.id !== user?.id && (
                  <button
                    onClick={() => deleteUser(u.id, u.email)}
                    disabled={!!actionLoading}
                    className="h-8 w-8 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors disabled:opacity-50"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminUsuarios;
