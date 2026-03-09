import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useArticles, useCreateArticle, useDeleteArticle, useReorderArticles, type ArticleRow } from "@/hooks/useArticles";
import { supabase } from "@/integrations/supabase/client";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ArticleEditDialog from "@/components/admin/ArticleEditDialog";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, ArrowLeft, BookOpen, Loader2, Trash2, GripVertical, Pencil, Upload, Link2, Image } from "lucide-react";
import { Link } from "react-router-dom";

const iconOptions = [
  { value: "BookOpen", label: "📖 Libro" },
  { value: "Dna", label: "🧬 Genética" },
  { value: "Target", label: "🎯 Selección" },
  { value: "TrendingUp", label: "📈 Mercados" },
  { value: "Leaf", label: "🌿 Sostenibilidad" },
  { value: "Heart", label: "❤️ Bienestar" },
  { value: "Beaker", label: "🧪 Ciencia" },
  { value: "Globe", label: "🌍 Global" },
];

const ADMIN_EMAIL = "landaverde.pagos@gmail.com";

const AdminArticulos = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: articles, isLoading } = useArticles();
  const createArticle = useCreateArticle();
  const deleteArticle = useDeleteArticle();
  const reorderArticles = useReorderArticles();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("General");
  const [icon, setIcon] = useState("BookOpen");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("Redacción Ganaderia.TV");
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleRow | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (!authLoading && user && !isAdmin) navigate("/");
  }, [user, authLoading, navigate, isAdmin]);

  useEffect(() => {
    document.title = "Admin Artículos | Ganaderia.TV";
    return () => { document.title = "Ganaderia.TV"; };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Solo se permiten imágenes.", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const { error } = await supabase.storage.from("news-images").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("news-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setUploading(true);
      let finalImageUrl: string | null = null;

      if (imageMode === "upload" && imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      } else if (imageMode === "url" && imageUrl.trim()) {
        finalImageUrl = imageUrl.trim();
      }

      await createArticle.mutateAsync({
        title: title.trim(),
        tag,
        icon,
        description: description.trim(),
        content: content.trim() || null,
        image_url: finalImageUrl,
        author: author.trim() || "Redacción Ganaderia.TV",
        created_by: user?.id || null,
      });
      toast({ title: "Artículo publicado", description: "El artículo se agregó correctamente." });
      setTitle("");
      setTag("General");
      setIcon("BookOpen");
      setDescription("");
      setContent("");
      setAuthor("Redacción Ganaderia.TV");
      setImageUrl("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast({ title: "Error", description: "No se pudo publicar el artículo.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este artículo?")) return;
    try {
      await deleteArticle.mutateAsync(id);
      toast({ title: "Eliminado", description: "El artículo fue eliminado." });
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
    }
  };

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (targetIdx: number) => {
    if (draggedIdx === null || !articles) return;
    const reordered = [...articles];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    const updates = reordered.map((a, i) => ({ id: a.id, display_order: i }));
    try {
      await reorderArticles.mutateAsync(updates);
    } catch {
      toast({ title: "Error", description: "No se pudo reordenar.", variant: "destructive" });
    }
    setDraggedIdx(null);
  };

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-background pt-14 sm:pt-16 lg:pt-20">
      <section className="pt-8 pb-12 bg-gradient-to-b from-primary/10 via-secondary/20 to-background">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-semibold mb-6 hover:gap-3 transition-all">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Administrar <span className="text-gradient-gold">Artículos</span>
            </h1>
          </div>
          <p className="text-muted-foreground">Publica y gestiona artículos del blog • Los artículos permanecen publicados</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5" /> Nuevo Artículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="art-title">Título *</Label>
                  <Input id="art-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del artículo" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Etiqueta</Label>
                    <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Genética, Mercados..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Icono</Label>
                    <select value={icon} onChange={(e) => setIcon(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {iconOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Autor</Label>
                  <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Nombre del autor" />
                </div>

                {/* Image */}
                <div className="space-y-2">
                  <Label>Imagen de portada</Label>
                  <div className="flex gap-1 rounded-lg border border-input p-1">
                    <button type="button" onClick={() => setImageMode("upload")}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${imageMode === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      <Upload className="h-3.5 w-3.5" /> Subir
                    </button>
                    <button type="button" onClick={() => setImageMode("url")}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${imageMode === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      <Link2 className="h-3.5 w-3.5" /> URL
                    </button>
                  </div>
                  {imageMode === "upload" ? (
                    <div className="space-y-2">
                      <div onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-input rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Image className="h-8 w-8" />
                            <span className="text-sm">Haz clic para seleccionar imagen</span>
                          </div>
                        )}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      {imageFile && <p className="text-xs text-muted-foreground truncate">{imageFile.name}</p>}
                    </div>
                  ) : (
                    <>
                      <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                      {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-md" />}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Descripción breve *</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descripción del artículo..." rows={3} required />
                </div>

                <div className="space-y-2">
                  <Label>Contenido completo</Label>
                  <RichTextEditor content={content} onChange={setContent} />
                </div>

                <Button type="submit" className="w-full" disabled={createArticle.isPending || uploading}>
                  {(createArticle.isPending || uploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Publicar Artículo
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              Artículos publicados ({articles?.length || 0})
            </h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !articles?.length ? (
              <p className="text-muted-foreground text-center py-8">No hay artículos aún.</p>
            ) : (
              <div className="space-y-2">
                {articles.map((article, idx) => (
                  <div
                    key={article.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx)}
                    className={`flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-md transition-shadow ${draggedIdx === idx ? "opacity-50" : ""}`}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                    {article.image_url && (
                      <img src={article.image_url} alt="" className="h-10 w-14 rounded-md object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{article.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{article.tag} · {article.author}</p>
                    </div>
                    <button onClick={() => setEditingArticle(article)} className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(article.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <ArticleEditDialog
        article={editingArticle}
        open={!!editingArticle}
        onOpenChange={(open) => { if (!open) setEditingArticle(null); }}
      />

      <Footer />
    </main>
  );
};

export default AdminArticulos;
