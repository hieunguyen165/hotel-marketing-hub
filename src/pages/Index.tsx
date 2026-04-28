import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  KeyRound,
  FolderOpen,
  LineChart,
  CheckSquare,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Activity,
} from "lucide-react";
import { accounts, weeklyReports, checklist, resources } from "@/data/mockData";

const Index = () => {
  const last = weeklyReports[weeklyReports.length - 1];
  const prev = weeklyReports[weeklyReports.length - 2];
  const bookingDelta = last.website.bookings - prev.website.bookings;
  const reachDelta = Math.round(((last.fanpage.reach - prev.fanpage.reach) / prev.fanpage.reach) * 100);
  const cpaDelta = Math.round(((last.ads.cpa - prev.ads.cpa) / prev.ads.cpa) * 100);

  const criticalAccounts = accounts.filter((a) => a.importance === "Nguy hiểm").length;
  const pendingTasks = checklist.filter((c) => !c.done).length;

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <AppLayout
      title="Marketing Command Center"
      subtitle={today}
      actions={
        <Button asChild className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95">
          <Link to="/reports">
            Xem báo cáo tuần <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      }
    >
      {/* Hero */}
      <Card className="relative mb-8 overflow-hidden border border-border/60 glass-strong p-8 md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-primary/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-accent/15 blur-[100px]" />
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> Week {last.week} · 2026 · Auto-sync
          </div>
          <h2 className="font-display text-3xl font-semibold leading-[1.15] tracking-tight text-foreground md:text-5xl">
            Marketing tuần này:<br />
            <span className="text-gradient-gold">tăng trưởng ổn định.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Đặt phòng website <span className="font-mono font-semibold text-primary">+{bookingDelta}</span> so với tuần trước.
            Meta Ads tối ưu, CPA giảm <span className="font-mono font-semibold text-success">{Math.abs(cpaDelta)}%</span>.
            Reach Fanpage <span className="font-mono font-semibold text-accent">+{reachDelta}%</span>.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild size="sm" className="bg-gradient-gold text-primary-foreground shadow-gold">
              <Link to="/reports"><Activity className="mr-1.5 h-3.5 w-3.5" /> Báo cáo chi tiết</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-border/60 bg-card/40 backdrop-blur">
              <Link to="/checklist">Checklist tuần →</Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Đặt phòng từ Website" value={last.website.bookings} delta={`+${bookingDelta} vs tuần trước`} positive icon={TrendingUp} />
        <KpiCard label="Reach Fanpage" value={last.fanpage.reach.toLocaleString("vi-VN")} delta={`+${reachDelta}%`} positive icon={TrendingUp} />
        <KpiCard label="CPA Quảng cáo" value={last.ads.cpa.toLocaleString("vi-VN") + "đ"} delta={`${cpaDelta}%`} positive icon={TrendingUp} />
        <KpiCard label="Việc cần làm tuần này" value={pendingTasks} delta={`${checklist.length - pendingTasks}/${checklist.length} đã hoàn thành`} icon={CheckSquare} />
      </div>

      {/* Quick navigation */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <NavCard to="/accounts" icon={KeyRound} title="Tài khoản & mật khẩu" desc={`${accounts.length} tài sản số · ${criticalAccounts} mức nguy hiểm`} />
        <NavCard to="/resources" icon={FolderOpen} title="Kho tài nguyên" desc={`${resources.length} bộ tài nguyên sẵn dùng`} />
        <NavCard to="/reports" icon={LineChart} title="Báo cáo marketing" desc="Tổng quan tuần · Biểu đồ · Đề xuất" />
        <NavCard to="/checklist" icon={CheckSquare} title="Checklist công việc" desc={`${pendingTasks} việc đang chờ xử lý`} />
      </div>

      {/* Insight strip */}
      <Card className="relative overflow-hidden border border-warning/30 bg-warning/5 p-5 shadow-card-soft">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-warning to-warning/40" />
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">Cần lưu ý tuần này</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Có <strong className="text-foreground">{criticalAccounts} tài khoản mức "Nguy hiểm"</strong> chưa cập nhật quy trình bàn giao trong 30 ngày qua.
              Nên rà soát để đảm bảo không phụ thuộc vào một cá nhân.
            </p>
            <Button asChild variant="link" className="h-auto p-0 text-primary hover:text-primary-glow">
              <Link to="/accounts">Mở trung tâm tài khoản →</Link>
            </Button>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
};

function KpiCard({
  label, value, delta, positive, icon: Icon,
}: { label: string; value: string | number; delta: string; positive?: boolean; icon: any }) {
  return (
    <Card className="group relative overflow-hidden border border-border/60 glass p-5 transition-smooth hover:border-primary/40 hover:shadow-glow">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/0 blur-2xl transition-smooth group-hover:bg-primary/15" />
      <div className="relative flex items-start justify-between">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <div className="rounded-md border border-primary/20 bg-primary/10 p-1.5 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="relative mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className={`relative mt-1 font-mono text-[11px] ${positive ? "text-success" : "text-muted-foreground"}`}>{delta}</p>
    </Card>
  );
}

function NavCard({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to}>
      <Card className="group h-full cursor-pointer border border-border/60 glass p-5 transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
        <div className="mb-3 inline-flex rounded-lg border border-primary/20 bg-gradient-gold p-2.5 text-primary-foreground shadow-gold">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-display text-base font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
        <ArrowUpRight className="mt-3 h-4 w-4 text-muted-foreground transition-smooth group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
      </Card>
    </Link>
  );
}

export default Index;
