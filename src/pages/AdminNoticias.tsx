import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNews, useCreateNews, useDeleteNews } from "@/hooks/useNews";
import { countries } from "@/data/news";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Trash2, Plus, ArrowLeft, Newspaper, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { value: "global", label: "Global" },
  { value: "lechero", label: "Ganado Lechero" },
  { value: "carne", label: "Ganado de Carne" },
];

const ADMIN_EMAIL = "landaverde.pagos@gmail.com";

const AdminNoticias = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: news, isLoading } = useNews();
  const createNews = useCreateNews();
  const deleteNews = useDeleteNews();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("global");
  const [country, setCountry] = useState("México");
  const [imageUrl, setImageUrl] = useState("");
  const [summary, setSummary] = useState("");

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (!authLoading && user && !isAdmin) navigate("/");
  }, [user, authLoading, navigate, isAdmin]);

  const selectedCountry = countries.find((c) => c.name === country);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createNews.mutateAsync({
        title: title.trim(),
        category,
        country,
        flag: selectedCountry?.flag || "🌍",
        image_url: imageUrl.trim() || "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=350&fit=crop",
        summary: summary.trim() || null,
        created_by: user?.id || null,
      });
      toast({ title: "Noticia publicada", description: "La noticia se agregó correctamente." });
      setTitle("");
      setImageUrl("");
      setSummary("");
    } catch {
      toast({ title: "Error", description: "No se pudo publicar la noticia.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNews.mutateAsync(id);
      toast({ title: "Eliminada", description: "La noticia fue eliminada." });
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar la noticia.", variant: "destructive" });
    }
  };

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
          <p className="text-muted-foreground">Publica y gestiona las noticias ganaderas</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <Card className="lg:col-span-1">
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

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {countries.map((c) => (
                      <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">URL de imagen</Label>
                  <Input id="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Resumen</Label>
                  <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Breve descripción..." rows={3} />
                </div>

                <Button type="submit" className="w-full" disabled={createNews.isPending}>
                  {createNews.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Publicar Noticia
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              Noticias publicadas ({news?.length || 0})
            </h2>

            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {news?.map((item) => (
              <Card key={item.id} className="flex flex-col sm:flex-row overflow-hidden">
                <div className="sm:w-40 h-28 sm:h-auto flex-shrink-0">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="flex-1 p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{item.flag}</span>
                      <span className="text-xs text-muted-foreground">{item.country} · {item.category}</span>
                    </div>
                    <h3 className="font-bold text-foreground line-clamp-2">{item.title}</h3>
                    {item.summary && <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{item.summary}</p>}
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {new Date(item.published_at).toLocaleDateString("es-MX")}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteNews.isPending}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}

            {!isLoading && news?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-semibold">No hay noticias aún</p>
                <p className="text-sm">Publica tu primera noticia con el formulario</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default AdminNoticias;
