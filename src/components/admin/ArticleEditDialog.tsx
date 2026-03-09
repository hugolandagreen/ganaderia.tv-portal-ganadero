import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { useUpdateArticle, type ArticleRow } from "@/hooks/useArticles";

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

interface Props {
  article: ArticleRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ArticleEditDialog = ({ article, open, onOpenChange }: Props) => {
  const updateArticle = useUpdateArticle();

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("General");
  const [icon, setIcon] = useState("BookOpen");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setTag(article.tag);
      setIcon(article.icon);
      setDescription(article.description);
      setContent(article.content || "");
      setAuthor(article.author);
    }
  }, [article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !title.trim()) return;

    try {
      await updateArticle.mutateAsync({
        id: article.id,
        title: title.trim(),
        tag,
        icon,
        description: description.trim(),
        content: content.trim() || null,
        author: author.trim() || "Redacción Ganaderia.TV",
      });

      toast({ title: "Artículo actualizado", description: "Los cambios se guardaron correctamente." });
      onOpenChange(false);
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar el artículo.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Artículo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Etiqueta / Categoría</Label>
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
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Descripción breve</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Contenido completo</Label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          <Button type="submit" className="w-full" disabled={updateArticle.isPending}>
            {updateArticle.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar Cambios
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleEditDialog;
