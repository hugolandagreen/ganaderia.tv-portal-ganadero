import { Facebook, Twitter, Send, LinkIcon, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLang } from "@/contexts/LangContext";

interface SocialShareProps {
  title: string;
  text?: string;
  url?: string;
  size?: "sm" | "md";
  className?: string;
}

const SocialShare = ({ title, text, url, size = "sm", className = "" }: SocialShareProps) => {
  const { t } = useLang();
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = text || title;
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const btnSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";

  const shareLinks = [
    { name: "WhatsApp", icon: <MessageCircle className={iconSize} />, href: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, color: "hover:bg-[hsl(142_70%_40%)] hover:text-white" },
    { name: "Facebook", icon: <Facebook className={iconSize} />, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, color: "hover:bg-[hsl(220_46%_48%)] hover:text-white" },
    { name: "X (Twitter)", icon: <Twitter className={iconSize} />, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, color: "hover:bg-foreground hover:text-background" },
    { name: "Telegram", icon: <Send className={iconSize} />, href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, color: "hover:bg-[hsl(200_70%_50%)] hover:text-white" },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: t("share_copied"), description: t("share_copied_desc") });
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {shareLinks.map((link) => (
        <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" title={link.name} className={`${btnSize} rounded-full bg-muted flex items-center justify-center text-muted-foreground transition-all duration-200 ${link.color}`} onClick={(e) => e.stopPropagation()}>
          {link.icon}
        </a>
      ))}
      <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); copyLink(); }} title="Copy" className={`${btnSize} rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200`}>
        <LinkIcon className={iconSize} />
      </button>
    </div>
  );
};

export default SocialShare;
