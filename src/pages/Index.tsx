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
        <Button asChild className="rounded-full bg-gradient-brand text-primary-foreground shadow-gold hover:opacity-95">
          <Link to="/reports">
            Xem báo cáo tuần <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      }
    >
      {/* Hero */}
      <Card className="relative mb-8 overflow-hidden border border-border bg-card p-8 shadow-card-soft md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-primary/15 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-accent/15 blur-[100px]" />
        <div className="relative max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent-soft px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Tuần {last.week} · 2026
          </div>
          <h2 className="font-display text-3xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
            Marketing tuần này <span className="text-gradient-brand">tăng trưởng ổn định</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Đặt phòng từ website tăng <strong className="text-primary">+{bookingDelta}</strong> so với tuần trước.
            Quảng cáo Meta tối ưu hơn, CPA giảm <strong className="text-success">{Math.abs(cpaDelta)}%</strong>.
            Reach Fanpage tiếp tục đi lên <strong className="text-accent">+{reachDelta}%</strong>.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-full bg-gradient-brand text-primary-foreground shadow-gold">
              <Link to="/reports"><Activity className="mr-1.5 h-3.5 w-3.5" /> Báo cáo chi tiết</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full border-border bg-card">
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
    <Card className="group relative overflow-hidden border border-border bg-card p-5 shadow-card-soft transition-smooth hover:-translate-y-0.5 hover:shadow-elegant">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="rounded-xl bg-accent-soft p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">{value}</p>
      <p className={`mt-1 text-xs ${positive ? "text-success" : "text-muted-foreground"}`}>{delta}</p>
    </Card>
  );
}

function NavCard({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to}>
      <Card className="group h-full cursor-pointer border border-border bg-card p-5 shadow-card-soft transition-smooth hover:-translate-y-1 hover:border-primary/30 hover:shadow-elegant">
        <div className="mb-3 inline-flex rounded-2xl bg-gradient-brand p-3 text-primary-foreground shadow-gold">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-display text-base font-bold tracking-tight text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
        <ArrowUpRight className="mt-3 h-4 w-4 text-muted-foreground transition-smooth group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
      </Card>
    </Link>
  );
}

export default Index;
