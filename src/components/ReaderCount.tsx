import { Eye } from "lucide-react";
import { getFakeReaderCount, formatReaderCount } from "@/lib/fakeReaders";
import { useLang } from "@/contexts/LangContext";

interface ReaderCountProps {
  id: string;
  publishedAt: string;
  size?: "sm" | "md";
}

const ReaderCount = ({ id, publishedAt, size = "sm" }: ReaderCountProps) => {
  const count = getFakeReaderCount(id, publishedAt);
  const { t } = useLang();

  return (
    <span className={`inline-flex items-center gap-1 text-muted-foreground ${size === "sm" ? "text-xs" : "text-sm"}`}>
      <Eye className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      <span className="font-medium">{formatReaderCount(count)}</span>
      <span className="hidden sm:inline">{t("readers_label")}</span>
    </span>
  );
};

export default ReaderCount;
