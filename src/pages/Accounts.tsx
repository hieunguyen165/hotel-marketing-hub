import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  accounts as seedAccounts,
  AccountCategory,
  Importance,
  MarketingAccount,
} from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Shield, ShieldAlert, ShieldCheck, User2, Calendar,
  Eye, Pencil, Trash2, Plus, Copy, ExternalLink, EyeOff, KeyRound, Link2,
} from "lucide-react";

const importanceStyles: Record<Importance, { className: string; icon: any }> = {
  "Nguy hiểm": { className: "bg-destructive/15 text-destructive border-destructive/30", icon: ShieldAlert },
  "Quan trọng": { className: "bg-warning/15 text-warning border-warning/30", icon: Shield },
  "Thường": { className: "bg-success/15 text-success border-success/30", icon: ShieldCheck },
};

const categories: ("Tất cả" | AccountCategory)[] = ["Tất cả", "Website", "Fanpage", "Quảng cáo", "OTA", "Email", "Thiết kế"];
const allCategories: AccountCategory[] = ["Website", "Fanpage", "Quảng cáo", "OTA", "Email", "Thiết kế"];
const allImportance: Importance[] = ["Nguy hiểm", "Quan trọng", "Thường"];

type FormState = Omit<MarketingAccount, "id" | "lastUpdated">;

const emptyForm: FormState = {
  name: "",
  category: "Website",
  importance: "Thường",
  owner: "",
  description: "",
  handoverNote: "",
  loginUrl: "",
  username: "",
  password: "",
  guide: "",
};

const Accounts = () => {
  const { toast } = useToast();
  const [list, setList] = useState<MarketingAccount[]>(seedAccounts);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof categories)[number]>("Tất cả");

  const [editing, setEditing] = useState<MarketingAccount | null>(null);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<MarketingAccount | null>(null);

  const filtered = list.filter(
    (a) =>
      (cat === "Tất cả" || a.category === cat) &&
      (a.name.toLowerCase().includes(q.toLowerCase()) ||
        a.owner.toLowerCase().includes(q.toLowerCase()))
  );

  const counts = {
    danger: list.filter((a) => a.importance === "Nguy hiểm").length,
    important: list.filter((a) => a.importance === "Quan trọng").length,
    normal: list.filter((a) => a.importance === "Thường").length,
  };

  const handleSave = (form: FormState, id?: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (id) {
      setList((prev) => prev.map((a) => (a.id === id ? { ...a, ...form, lastUpdated: today } : a)));
      toast({ title: "Đã cập nhật tài khoản", description: form.name });
    } else {
      setList((prev) => [
        { ...form, id: `a${Date.now()}`, lastUpdated: today },
        ...prev,
      ]);
      toast({ title: "Đã thêm tài khoản mới", description: form.name });
    }
    setEditing(null);
    setCreating(false);
  };

  const handleDelete = (a: MarketingAccount) => {
    setList((prev) => prev.filter((x) => x.id !== a.id));
    toast({ title: "Đã xóa tài khoản", description: a.name, variant: "destructive" });
  };

  return (
    <AppLayout
      title="Trung tâm tài khoản & mật khẩu"
      subtitle="Đây là nơi quản lý tài sản số — không chỉ là chỗ lưu password"
      actions={
        <Button
          onClick={() => setCreating(true)}
          className="bg-gradient-brand text-primary-foreground shadow-elegant hover:opacity-95"
        >
          <Plus className="mr-1 h-4 w-4" /> Thêm tài khoản
        </Button>
      }
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

      {/* List — 3 cols */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => {
          const Style = importanceStyles[a.importance];
          const Icon = Style.icon;
          return (
            <Card
              key={a.id}
              className="group relative flex flex-col overflow-hidden border border-border bg-card p-5 shadow-card-soft transition-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elegant"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge variant="outline" className="mb-2 rounded-full border-border bg-secondary text-[10px] uppercase tracking-wider text-muted-foreground">
                    {a.category}
                  </Badge>
                  <h3 className="font-display text-base font-bold leading-snug tracking-tight text-foreground line-clamp-2">{a.name}</h3>
                </div>
                <Badge className={`shrink-0 rounded-full border text-[10px] uppercase ${Style.className}`}>
                  <Icon className="mr-1 h-3 w-3" /> {a.importance}
                </Badge>
              </div>

              <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{a.description}</p>

              <div className="mt-auto space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User2 className="h-3.5 w-3.5 text-primary" /> <span className="truncate">{a.owner}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> <span className="text-foreground/80">{a.lastUpdated}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => setViewing(a)}
                  className="flex-1 rounded-full bg-gradient-brand text-primary-foreground shadow-sm hover:opacity-95"
                >
                  <Eye className="mr-1.5 h-4 w-4" /> Xem chi tiết
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditing(a)}
                  className="rounded-full"
                  title="Chỉnh sửa"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive" title="Xóa">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xóa tài khoản?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn sắp xóa <strong>{a.name}</strong>. Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(a)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card className="col-span-full p-10 text-center text-muted-foreground">
            Không có tài khoản nào phù hợp.
          </Card>
        )}
      </div>

      {/* DETAIL DIALOG */}
      <DetailDialog account={viewing} onOpenChange={(o) => !o && setViewing(null)} />

      {/* CREATE / EDIT DIALOG */}
      <FormDialog
        open={creating || !!editing}
        initial={editing ?? undefined}
        onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}
        onSubmit={handleSave}
      />
    </AppLayout>
  );
};

function SummaryStat({ label, value, tone, hint }: { label: string; value: number; tone: "danger" | "warning" | "success"; hint: string }) {
  const toneClass = {
    danger:  { bg: "bg-destructive/10", text: "text-destructive", bar: "bg-destructive" },
    warning: { bg: "bg-warning/10",     text: "text-warning",     bar: "bg-warning" },
    success: { bg: "bg-success/10",     text: "text-success",     bar: "bg-success" },
  }[tone];
  return (
    <Card className="relative overflow-hidden border border-border bg-card p-4 shadow-card-soft">
      <div className={`absolute left-0 top-0 h-full w-1 ${toneClass.bar}`} />
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
        {value} <span className="text-sm font-normal text-muted-foreground">tài khoản</span>
      </p>
      <p className={`mt-1 text-xs ${toneClass.text}`}>{hint}</p>
    </Card>
  );
}

/* ---------------- Detail Dialog ---------------- */
function DetailDialog({
  account,
  onOpenChange,
}: {
  account: MarketingAccount | null;
  onOpenChange: (o: boolean) => void;
}) {
  const { toast } = useToast();
  const [showPwd, setShowPwd] = useState(false);

  const copy = (label: string, value?: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast({ title: "Đã sao chép", description: label });
  };

  if (!account) return null;
  const Style = importanceStyles[account.importance];
  const Icon = Style.icon;

  return (
    <Dialog open={!!account} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full bg-secondary text-[10px] uppercase tracking-wider text-muted-foreground">
              {account.category}
            </Badge>
            <Badge className={`rounded-full border text-[10px] uppercase ${Style.className}`}>
              <Icon className="mr-1 h-3 w-3" /> {account.importance}
            </Badge>
          </div>
          <DialogTitle className="font-display text-xl">{account.name}</DialogTitle>
          <DialogDescription>{account.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <DetailRow icon={<Link2 className="h-4 w-4" />} label="Link đăng nhập">
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md bg-secondary px-3 py-2 text-xs">{account.loginUrl || "—"}</code>
              {account.loginUrl && (
                <>
                  <Button size="icon" variant="outline" onClick={() => copy("Link đăng nhập", account.loginUrl)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="outline" asChild>
                    <a href={account.loginUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                  </Button>
                </>
              )}
            </div>
          </DetailRow>

          <DetailRow icon={<User2 className="h-4 w-4" />} label="Tên đăng nhập">
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md bg-secondary px-3 py-2 text-xs">{account.username || "—"}</code>
              {account.username && (
                <Button size="icon" variant="outline" onClick={() => copy("Tên đăng nhập", account.username)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </DetailRow>

          <DetailRow icon={<KeyRound className="h-4 w-4" />} label="Mật khẩu">
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md bg-secondary px-3 py-2 text-xs">
                {account.password ? (showPwd ? account.password : "•".repeat(Math.min(12, account.password.length))) : "—"}
              </code>
              {account.password && (
                <>
                  <Button size="icon" variant="outline" onClick={() => setShowPwd((s) => !s)}>
                    {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => copy("Mật khẩu", account.password)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </DetailRow>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Hướng dẫn sử dụng</p>
            <p className="rounded-md bg-secondary/60 p-3 text-sm leading-relaxed">{account.guide || "Chưa có hướng dẫn."}</p>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Quy trình bàn giao</p>
            <p className="rounded-md bg-secondary/60 p-3 text-sm leading-relaxed">{account.handoverNote}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="rounded-md border border-border p-2">
              <span className="block text-[10px] uppercase tracking-wider">Phụ trách</span>
              <span className="font-medium text-foreground">{account.owner}</span>
            </div>
            <div className="rounded-md border border-border p-2">
              <span className="block text-[10px] uppercase tracking-wider">Cập nhật</span>
              <span className="font-medium text-foreground">{account.lastUpdated}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span> {label}
      </div>
      {children}
    </div>
  );
}

/* ---------------- Form Dialog (Create / Edit) ---------------- */
function FormDialog({
  open,
  initial,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  initial?: MarketingAccount;
  onOpenChange: (o: boolean) => void;
  onSubmit: (form: FormState, id?: string) => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);

  // Sync when initial/open changes
  useState(() => {});
  // we rely on key-change via JSX below

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) setForm(initial ? { ...initial } : emptyForm);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {initial ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
          </DialogTitle>
          <DialogDescription>
            Điền đầy đủ thông tin để dễ bàn giao khi có nhân sự mới.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Tên tài khoản *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Vd: Fanpage Facebook D'lioro" />
          </div>

          <div>
            <Label>Danh mục</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as AccountCategory })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {allCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Mức quan trọng</Label>
            <Select value={form.importance} onValueChange={(v) => setForm({ ...form, importance: v as Importance })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {allImportance.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label>Mô tả</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="md:col-span-2">
            <Label>Link đăng nhập</Label>
            <Input value={form.loginUrl ?? ""} onChange={(e) => setForm({ ...form, loginUrl: e.target.value })} placeholder="https://..." />
          </div>

          <div>
            <Label>Tên đăng nhập / Email</Label>
            <Input value={form.username ?? ""} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>

          <div>
            <Label>Mật khẩu</Label>
            <Input type="text" value={form.password ?? ""} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          <div>
            <Label>Người phụ trách</Label>
            <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
          </div>

          <div className="md:col-span-2">
            <Label>Hướng dẫn sử dụng</Label>
            <Textarea rows={3} value={form.guide ?? ""} onChange={(e) => setForm({ ...form, guide: e.target.value })} />
          </div>

          <div className="md:col-span-2">
            <Label>Quy trình bàn giao</Label>
            <Textarea rows={3} value={form.handoverNote} onChange={(e) => setForm({ ...form, handoverNote: e.target.value })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button
            onClick={() => {
              if (!form.name.trim()) return;
              onSubmit(form, initial?.id);
            }}
            className="bg-gradient-brand text-primary-foreground"
          >
            {initial ? "Lưu thay đổi" : "Thêm tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Accounts;