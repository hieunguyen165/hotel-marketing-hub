import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { accounts, AccountCategory, Importance } from "@/data/mockData";
import { Search, Shield, ShieldAlert, ShieldCheck, User2, ClipboardList, Calendar } from "lucide-react";

const importanceStyles: Record<Importance, { className: string; icon: any }> = {
  "Nguy hiểm": { className: "bg-destructive/10 text-destructive border-destructive/20", icon: ShieldAlert },
  "Quan trọng": { className: "bg-warning/10 text-warning border-warning/20", icon: Shield },
  "Thường": { className: "bg-success/10 text-success border-success/20", icon: ShieldCheck },
};

const categories: ("Tất cả" | AccountCategory)[] = ["Tất cả", "Website", "Fanpage", "Quảng cáo", "OTA", "Email", "Thiết kế"];

const Accounts = () => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof categories)[number]>("Tất cả");

  const filtered = accounts.filter(
    (a) =>
      (cat === "Tất cả" || a.category === cat) &&
      (a.name.toLowerCase().includes(q.toLowerCase()) || a.owner.toLowerCase().includes(q.toLowerCase()))
  );

  const counts = {
    danger: accounts.filter((a) => a.importance === "Nguy hiểm").length,
    important: accounts.filter((a) => a.importance === "Quan trọng").length,
    normal: accounts.filter((a) => a.importance === "Thường").length,
  };

  return (
    <AppLayout
      title="Trung tâm tài khoản & mật khẩu"
      subtitle="Đây là nơi quản lý tài sản số — không chỉ là chỗ lưu password"
    >
      {/* Summary strip */}
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <SummaryStat label="Mức nguy hiểm" value={counts.danger} tone="danger" hint="Mất là mất luôn tài sản" />
        <SummaryStat label="Mức quan trọng" value={counts.important} tone="warning" hint="Cần quy trình bàn giao chặt" />
        <SummaryStat label="Mức thường" value={counts.normal} tone="success" hint="Có thể tạo lại nếu cần" />
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tìm tài khoản, người phụ trách..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={cat} onValueChange={(v) => setCat(v as any)}>
          <TabsList className="bg-secondary">
            {categories.map((c) => (
              <TabsTrigger key={c} value={c} className="text-xs">{c}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((a) => {
          const Style = importanceStyles[a.importance];
          const Icon = Style.icon;
          return (
            <Card key={a.id} className="group flex flex-col border-border bg-card p-5 shadow-card-soft transition-smooth hover:shadow-elegant">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge variant="outline" className="mb-2 text-[10px] uppercase tracking-wider">
                    {a.category}
                  </Badge>
                  <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{a.name}</h3>
                </div>
                <Badge className={`shrink-0 border ${Style.className}`}>
                  <Icon className="mr-1 h-3 w-3" /> {a.importance}
                </Badge>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{a.description}</p>

              <div className="mt-auto space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><User2 className="h-3.5 w-3.5" /> Phụ trách: <span className="font-medium text-foreground">{a.owner}</span></div>
                <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Cập nhật: {a.lastUpdated}</div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-4 w-full border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground">
                    <ClipboardList className="mr-2 h-4 w-4" /> Quy trình bàn giao
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">{a.name}</DialogTitle>
                    <DialogDescription>Hướng dẫn bàn giao khi có nhân sự mới tiếp quản</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mô tả</p>
                      <p className="mt-1">{a.description}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Khi cần bàn giao</p>
                      <p className="mt-1 leading-relaxed">{a.handoverNote}</p>
                    </div>
                    <div className="rounded-md bg-secondary p-3 text-xs text-muted-foreground">
                      💡 Mật khẩu được lưu trong trình quản lý mật khẩu công ty (1Password). Yêu cầu cấp quyền truy cập từ trưởng bộ phận.
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
};

function SummaryStat({ label, value, tone, hint }: { label: string; value: number; tone: "danger" | "warning" | "success"; hint: string }) {
  const toneClass = {
    danger: "border-l-destructive bg-destructive/5",
    warning: "border-l-warning bg-warning/5",
    success: "border-l-success bg-success/5",
  }[tone];
  return (
    <Card className={`border-l-4 p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-foreground">{value} <span className="text-sm font-normal text-muted-foreground">tài khoản</span></p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Card>
  );
}

export default Accounts;
