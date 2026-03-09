import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, Link2, Image, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUpdateNews, type NewsRow } from "@/hooks/useNews";
import { countries } from "@/data/news";

const categories = [
  { value: "global", label: "Global" },
  { value: "lechero", label: "Ganado Lechero" },
  { value: "carne", label: "Ganado de Carne" },
];

interface Props {
  news: NewsRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewsEditDialog = ({ news, open, onOpenChange }: Props) => {
  const updateNews = useUpdateNews();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("global");
  const [country, setCountry] = useState("México");
  const [author, setAuthor] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageMode, setImageMode] = useState<"upload" | "url">("url");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (news) {
      setTitle(news.title);
      setCategory(news.category);
      setCountry(news.country);
      setAuthor(news.author);
      setSummary(news.summary || "");
      setContent(news.content || "");
      setImageUrl(news.image_url);
      setImagePreview(news.image_url);
      setImageMode("url");
      setImageFile(null);
    }
  }, [news]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
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
    if (!news || !title.trim()) return;

    try {
      setUploading(true);
      let finalImageUrl = news.image_url;

      if (imageMode === "upload" && imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      } else if (imageMode === "url" && imageUrl.trim()) {
        finalImageUrl = imageUrl.trim();
      }

      const selectedCountry = countries.find((c) => c.name === country);

      await updateNews.mutateAsync({
        id: news.id,
        title: title.trim(),
        category,
        country,
        flag: selectedCountry?.flag || "🌍",
        image_url: finalImageUrl,
        summary: summary.trim() || null,
        content: content.trim() || null,
        author: author.trim() || "Redacción Ganaderia.TV",
      });

      toast({ title: "Noticia actualizada", description: "Los cambios se guardaron correctamente." });
      onOpenChange(false);
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar la noticia.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Noticia</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>País</Label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {countries.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Autor</Label>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>

          {/* Image */}
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
              </div>
            ) : (
              <>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-md" />}
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>Resumen</Label>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Contenido completo</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
          </div>

          <Button type="submit" className="w-full" disabled={updateNews.isPending || uploading}>
            {(updateNews.isPending || uploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar Cambios
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewsEditDialog;
