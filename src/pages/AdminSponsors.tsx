import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAllSponsors, type Sponsor, type AdPlacement } from "@/hooks/useSponsors";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Pencil, Trash2, Image, ExternalLink, Megaphone, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const PLACEMENTS: { value: AdPlacement; label: string }[] = [
  { value: "global_leaderboard", label: "🌐 Leaderboard global (top)" },
  { value: "home_after_news", label: "🏠 Home — después de noticias" },
  { value: "home_after_programming", label: "🏠 Home — después de programación" },
  { value: "home_after_articles", label: "🏠 Home — después de artículos" },
  { value: "news_top", label: "📰 Noticias — banner superior" },
  { value: "news_inline", label: "📰 Noticias — inline inferior" },
  { value: "articles_top", label: "📝 Artículos — banner superior" },
  { value: "articles_inline", label: "📝 Artículos — inline inferior" },
  { value: "detail_after_content", label: "📄 Detalle — después del contenido" },
  { value: "assistant_sidebar", label: "🤖 Asistente IA — sidebar" },
];

type SponsorForm = {
  name: string;
  description: string;
  image_url: string;
  link_url: string;
  placement: AdPlacement;
  is_active: boolean;
  display_order: number;
  cta_text: string;
  badge_text: string;
};

const emptyForm: SponsorForm = {
  name: "",
  description: "",
  image_url: "",
  link_url: "",
  placement: "home_after_news",
  is_active: true,
  display_order: 0,
  cta_text: "Conocer más",
  badge_text: "",
};

const AdminSponsors = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: sponsors, isLoading } = useAllSponsors();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SponsorForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!user || !isAdmin) {
    return (
      <main className="min-h-screen bg-background pt-14 sm:pt-16 lg:pt-20">
        <div className="pt-28 pb-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acceso restringido</h1>
          <Link to="/" className="text-primary hover:underline">Volver al inicio</Link>
        </div>
      </main>
    );
  }

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (sponsor: Sponsor) => {
    setEditingId(sponsor.id);
    setForm({
      name: sponsor.name,
      description: sponsor.description || "",
      image_url: sponsor.image_url,
      link_url: sponsor.link_url,
      placement: sponsor.placement,
      is_active: sponsor.is_active,
      display_order: sponsor.display_order,
      cta_text: sponsor.cta_text,
      badge_text: sponsor.badge_text || "",
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("sponsor-images").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("sponsor-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: urlData.publicUrl }));
      toast({ title: "Imagen subida" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.image_url.trim()) {
      toast({ title: "Error", description: "Nombre e imagen son obligatorios", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        image_url: form.image_url,
        link_url: form.link_url || "#",
        placement: form.placement,
        is_active: form.is_active,
        display_order: form.display_order,
        cta_text: form.cta_text || "Conocer más",
        badge_text: form.badge_text || null,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase.from("sponsors").update(payload).eq("id", editingId);
        if (error) throw error;
        toast({ title: "Anuncio actualizado" });
      } else {
        const { error } = await supabase.from("sponsors").insert(payload);
        if (error) throw error;
        toast({ title: "Anuncio creado" });
      }

      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este anuncio?")) return;
    const { error } = await supabase.from("sponsors").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Anuncio eliminado" });
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
    }
  };

  const toggleActive = async (sponsor: Sponsor) => {
    const { error } = await supabase
      .from("sponsors")
      .update({ is_active: !sponsor.is_active, updated_at: new Date().toISOString() })
      .eq("id", sponsor.id);
    if (!error) queryClient.invalidateQueries({ queryKey: ["sponsors"] });
  };

  const placementLabel = (p: AdPlacement) => PLACEMENTS.find((x) => x.value === p)?.label || p;

  return (
    <main className="min-h-screen bg-background pt-14 sm:pt-16 lg:pt-20 pb-14 lg:pb-0">
      {/* Hero */}
      <section className="pt-8 pb-8 bg-gradient-to-b from-primary/10 via-secondary/20 to-background">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-semibold mb-6 hover:gap-3 transition-all">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Megaphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  Anuncios y Patrocinadores
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Administra los espacios publicitarios del sitio</p>
              </div>
            </div>
            <Button onClick={openNew} className="gap-2">
              <Plus className="h-4 w-4" /> Nuevo anuncio
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && (!sponsors || sponsors.length === 0) && (
            <div className="text-center py-16 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-semibold">No hay anuncios aún</p>
              <p className="text-sm mb-4">Los espacios publicitarios mostrarán una invitación para anunciarse</p>
              <Button onClick={openNew} className="gap-2">
                <Plus className="h-4 w-4" /> Crear primer anuncio
              </Button>
            </div>
          )}

          <div className="grid gap-4">
            {(sponsors || []).map((sponsor) => (
              <div
                key={sponsor.id}
                className={`flex items-center gap-4 p-4 rounded-xl border bg-card transition-all ${
                  sponsor.is_active ? "border-border" : "border-border/50 opacity-60"
                }`}
              >
                {/* Image preview */}
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src={sponsor.image_url} alt={sponsor.name} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-foreground text-sm truncate">{sponsor.name}</h3>
                    {sponsor.badge_text && (
                      <span className="text-[9px] uppercase tracking-wider font-bold bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full">
                        {sponsor.badge_text}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{placementLabel(sponsor.placement)}</p>
                  {sponsor.link_url && sponsor.link_url !== "#" && (
                    <a
                      href={sponsor.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary flex items-center gap-1 mt-0.5 hover:underline"
                    >
                      <ExternalLink className="h-2.5 w-2.5" /> {sponsor.link_url.slice(0, 50)}
                    </a>
                  )}
                </div>

                {/* Order */}
                <span className="text-xs text-muted-foreground font-mono shrink-0">#{sponsor.display_order}</span>

                {/* Toggle active */}
                <Switch
                  checked={sponsor.is_active}
                  onCheckedChange={() => toggleActive(sponsor)}
                />

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(sponsor)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(sponsor.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Placement guide */}
          <div className="mt-12 bg-card border border-border rounded-xl p-6">
            <h2 className="font-display font-bold text-lg text-foreground mb-4">📍 Guía de ubicaciones</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PLACEMENTS.map((p) => (
                <div key={p.value} className="flex items-start gap-2 text-sm">
                  <span className="text-lg leading-none">{p.label.split(" ")[0]}</span>
                  <div>
                    <p className="font-medium text-foreground text-xs">{p.label.slice(p.label.indexOf(" ") + 1)}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{p.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar anuncio" : "Nuevo anuncio"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Nombre del patrocinador *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="ej. Laboratorios Vetcorp"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Descripción</label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="ej. Productos veterinarios premium"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Imagen *</label>
              <div className="flex items-center gap-3">
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="URL de imagen o sube una"
                  className="flex-1"
                />
                <label className="shrink-0 cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors">
                    <Image className="h-4 w-4" />
                    {uploading ? "Subiendo..." : "Subir"}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="mt-2 h-24 rounded-lg object-cover" />
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">URL de destino</label>
              <Input
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                placeholder="https://ejemplo.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Ubicación</label>
              <Select value={form.placement} onValueChange={(v) => setForm({ ...form, placement: v as AdPlacement })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLACEMENTS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Texto del botón</label>
                <Input
                  value={form.cta_text}
                  onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                  placeholder="Conocer más"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Badge (opcional)</label>
                <Input
                  value={form.badge_text}
                  onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
                  placeholder="ej. Patrocinador"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Orden</label>
                <Input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
                <span className="text-sm font-medium text-foreground">Activo</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear anuncio"}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
};

export default AdminSponsors;
