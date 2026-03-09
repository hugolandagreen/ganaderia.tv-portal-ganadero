import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, GripVertical, Pencil, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useReorderNews, useDeleteNews, type NewsRow } from "@/hooks/useNews";
import { toast } from "@/hooks/use-toast";
import { Newspaper } from "lucide-react";

interface Props {
  news: NewsRow[];
  isLoading: boolean;
  onEdit: (item: NewsRow) => void;
}

const DraggableNewsList = ({ news, isLoading, onEdit }: Props) => {
  const deleteNews = useDeleteNews();
  const reorderNews = useReorderNews();
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDragIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      setDragIndex(null);
      return;
    }

    const reordered = [...news];
    const [removed] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, removed);

    const updates = reordered.map((item, idx) => ({ id: item.id, display_order: idx }));

    try {
      await reorderNews.mutateAsync(updates);
      toast({ title: "Orden actualizado", description: "Las noticias se reordenaron correctamente." });
    } catch {
      toast({ title: "Error", description: "No se pudo reordenar.", variant: "destructive" });
    }

    dragItem.current = null;
    dragOverItem.current = null;
    setDragIndex(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNews.mutateAsync(id);
      toast({ title: "Eliminada", description: "La noticia fue eliminada." });
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar la noticia.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!news?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="font-semibold">No hay noticias aún</p>
        <p className="text-sm">Publica tu primera noticia con el formulario</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
      {news.map((item, index) => (
        <Card
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
          className={`flex flex-col sm:flex-row overflow-hidden cursor-grab active:cursor-grabbing transition-opacity ${
            dragIndex === index ? "opacity-50" : ""
          }`}
        >
          <div className="flex items-center pl-2 text-muted-foreground">
            <GripVertical className="h-5 w-5 flex-shrink-0" />
          </div>
          <div className="sm:w-28 h-20 sm:h-auto flex-shrink-0">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          </div>
          <CardContent className="flex-1 p-3 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{item.flag}</span>
                <span className="text-xs text-muted-foreground">{item.country}</span>
              </div>
              <h3 className="font-bold text-sm text-foreground line-clamp-2">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {new Date(item.published_at).toLocaleDateString("es-MX")}
                </span>
                {item.content && (
                  <span className="text-xs text-primary font-medium">• Artículo completo</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Link to={`/noticia/${item.id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}
                disabled={deleteNews.isPending}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DraggableNewsList;
