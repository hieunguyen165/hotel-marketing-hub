import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resources } from "@/data/mockData";
import { Search, Image as ImageIcon, Video, FileText, Palette, BookMarked, ExternalLink, User2 } from "lucide-react";

const typeMeta: Record<string, { icon: any; color: string }> = {
  "Hình ảnh": { icon: ImageIcon, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  "Video": { icon: Video, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  "Bài viết": { icon: FileText, color: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  "Thiết kế": { icon: Palette, color: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  "Brand": { icon: BookMarked, color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
};

const types = ["Tất cả", "Hình ảnh", "Video", "Bài viết", "Thiết kế", "Brand"] as const;

const Resources = () => {
  const [q, setQ] = useState("");
  const [type, setType] = useState<(typeof types)[number]>("Tất cả");

  const filtered = resources.filter(
    (r) => (type === "Tất cả" || r.type === type) && r.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AppLayout
      title="Kho tài nguyên marketing"
      subtitle="Tất cả hình ảnh, video, bài viết, thiết kế — tập trung một nơi"
    >
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tìm tài nguyên..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <Button
              key={t}
              size="sm"
              variant={type === t ? "default" : "outline"}
              onClick={() => setType(t)}
              className={type === t ? "bg-primary text-primary-foreground" : ""}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filtered.map((r) => {
          const meta = typeMeta[r.type];
          const Icon = meta.icon;
          return (
            <Card key={r.id} className="group flex flex-col overflow-hidden border-border bg-card shadow-card-soft transition-smooth hover:shadow-elegant">
              <div className="relative h-32 bg-gradient-primary">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="h-14 w-14 text-primary-foreground/30" strokeWidth={1.5} />
                </div>
                <Badge className={`absolute left-3 top-3 border ${meta.color}`}>{r.type}</Badge>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-base font-semibold leading-snug text-foreground">{r.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>

                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><User2 className="h-3 w-3" /> {r.owner}</div>
                  <div>Cập nhật: {r.updatedAt}</div>
                </div>

                <Button variant="ghost" size="sm" className="mt-3 justify-start px-0 text-primary hover:bg-transparent hover:text-primary-glow" asChild>
                  <a href={`https://${r.link}`} target="_blank" rel="noreferrer">
                    Mở liên kết <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Resources;
