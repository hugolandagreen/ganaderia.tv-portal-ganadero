import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNews, useCreateNews } from "@/hooks/useNews";
import type { NewsRow } from "@/hooks/useNews";
import { countries } from "@/data/news";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import RichTextEditor from "@/components/admin/RichTextEditor";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, ArrowLeft, Newspaper, Loader2, Upload, Link2, Image } from "lucide-react";
import { Link } from "react-router-dom";
import DraggableNewsList from "@/components/admin/DraggableNewsList";
import NewsEditDialog from "@/components/admin/NewsEditDialog";

const categories = [
  { value: "lechero", label: "Ganado Lechero" },
  { value: "carne", label: "Ganado de Carne" },
  { value: "doble_proposito", label: "Ganado Doble Propósito" },
];

const ADMIN_EMAIL = "landaverde.pagos@gmail.com";

const AdminNoticias = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: news, isLoading } = useNews();
  const createNews = useCreateNews();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("lechero");
  const [country, setCountry] = useState("México");
  const [imageUrl, setImageUrl] = useState("");
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("Redacción Ganaderia.TV");
  const [uploading, setUploading] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsRow | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (!authLoading && user && !isAdmin) navigate("/");
  }, [user, authLoading, navigate, isAdmin]);

  const selectedCountry = countries.find((c) => c.name === country);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
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
      let finalImageUrl = "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=350&fit=crop";

      if (imageMode === "upload" && imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      } else if (imageMode === "url" && imageUrl.trim()) {
        finalImageUrl = imageUrl.trim();
      }

      await createNews.mutateAsync({
        title: title.trim(),
        category,
        country,
        flag: selectedCountry?.flag || "🌍",
        image_url: finalImageUrl,
        summary: summary.trim() || null,
        content: content.trim() || null,
        author: author.trim() || "Redacción Ganaderia.TV",
        created_by: user?.id || null,
      });
      toast({ title: "Noticia publicada", description: "La noticia se agregó correctamente." });
      setTitle("");
      setImageUrl("");
      setImageFile(null);
      setImagePreview(null);
      setSummary("");
      setContent("");
      setAuthor("Redacción Ganaderia.TV");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast({ title: "Error", description: "No se pudo publicar la noticia.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    document.title = "Admin Noticias | Ganaderia.TV";
    return () => { document.title = "Ganaderia.TV"; };
  }, []);

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-12 bg-gradient-to-b from-primary/10 via-secondary/20 to-background">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-semibold mb-6 hover:gap-3 transition-all">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Newspaper className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Administrar <span className="text-gradient-gold">Noticias</span>
            </h1>
          </div>
          <p className="text-muted-foreground">Publica y gestiona las noticias ganaderas • Arrastra para reordenar</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5" /> Nueva Noticia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título de la noticia" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {countries.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Autor</Label>
                  <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Nombre del autor" />
                </div>

                {/* Image mode toggle */}
                <div className="space-y-2">
                  <Label>Imagen</Label>
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
                    <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Resumen</Label>
                  <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Breve descripción..." rows={2} />
                </div>

                <div className="space-y-2">
                  <Label>Contenido completo</Label>
                  <RichTextEditor content={content} onChange={setContent} />
                </div>

                <Button type="submit" className="w-full" disabled={createNews.isPending || uploading}>
                  {(createNews.isPending || uploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Publicar Noticia
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              Noticias publicadas ({news?.length || 0})
            </h2>
            <DraggableNewsList
              news={news || []}
              isLoading={isLoading}
              onEdit={(item) => setEditingNews(item)}
            />
          </div>
        </div>
      </section>

      <NewsEditDialog
        news={editingNews}
        open={!!editingNews}
        onOpenChange={(open) => { if (!open) setEditingNews(null); }}
      />

      <Footer />
    </main>
  );
};

export default AdminNoticias;
