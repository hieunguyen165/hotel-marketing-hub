import { useMemo, useState } from "react";
import { useParams, NavLink, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { weeklyReports as seed, WeeklyReport } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Legend, FunnelChart, Funnel, LabelList,
} from "recharts";
import {
  TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Lightbulb, Plus,
  Globe, Megaphone, MessageCircle, LayoutGrid, Eye, Heart, Users, Mail,
} from "lucide-react";
import { Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ChannelKey = "overview" | "website" | "fanpage" | "ads";

const channelMeta: Record<Exclude<ChannelKey, "overview">, { title: string; color: string; icon: any }> = {
  website: { title: "Website", color: "from-violet-500 to-fuchsia-500", icon: Globe },
  fanpage: { title: "Fanpage", color: "from-sky-500 to-blue-600", icon: MessageCircle },
  ads:     { title: "Quảng cáo", color: "from-pink-500 to-rose-500", icon: Megaphone },
};

const tabs: { key: ChannelKey; label: string; icon: any }[] = [
  { key: "overview", label: "Tổng quan", icon: LayoutGrid },
  { key: "website",  label: "Website",  icon: Globe },
  { key: "fanpage",  label: "Fanpage",  icon: MessageCircle },
  { key: "ads",      label: "Quảng cáo", icon: Megaphone },
];

const Reports = () => {
  const { channel } = useParams<{ channel?: string }>();
  const current = (channel ?? "overview") as ChannelKey;
  const { toast } = useToast();
  const [data, setData] = useState<WeeklyReport[]>(seed);

  if (channel && !["overview", "website", "fanpage", "ads"].includes(channel)) {
    return <Navigate to="/reports" replace />;
  }

  const last = data[data.length - 1];
  const prev = data[data.length - 2];

  const titleMap: Record<ChannelKey, string> = {
    overview: "Báo cáo marketing — Tổng quan",
    website: "Báo cáo Website",
    fanpage: "Báo cáo Fanpage",
    ads: "Báo cáo Quảng cáo",
  };

  return (
    <AppLayout
      title={titleMap[current]}
      subtitle={`Tuần gần nhất: ${last.week} · Cập nhật báo cáo hằng tuần`}
    >
      {/* Sub-nav */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-card-soft">
        {tabs.map((t) => (
          <NavLink
            key={t.key}
            to={t.key === "overview" ? "/reports" : `/reports/${t.key}`}
            end
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-smooth ${
                isActive
                  ? "bg-gradient-brand text-primary-foreground shadow-elegant"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`
            }
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </NavLink>
        ))}
      </div>

      {current === "overview" && <OverviewView data={data} last={last} prev={prev} />}
      {current === "website" && (
        <ChannelView
          channel="website"
          data={data}
          onAdd={(week, values) => {
            setData((prev) => [...prev, { ...prev[prev.length - 1], week, website: values as any }]);
            toast({ title: "Đã tạo báo cáo Website", description: `Tuần ${week}` });
          }}
        />
      )}
      {current === "fanpage" && (
        <FanpageView
          data={data}
          onAdd={(week, values) => {
            setData((prev) => [
              ...prev,
              {
                ...prev[prev.length - 1],
                week,
                fanpage: {
                  ...values,
                  // Map về aggregate cũ để Overview vẫn hoạt động
                  reach: values.totalViews,
                  followers: prev[prev.length - 1].fanpage.followers + values.newFollowers - values.unfollows,
                  engagement: values.likes + values.comments + values.shares,
                } as any,
              },
            ]);
            toast({ title: "Đã tạo báo cáo Fanpage", description: `Tuần ${week}` });
          }}
        />
      )}
      {current === "ads" && (
        <ChannelView
          channel="ads"
          data={data}
          onAdd={(week, values) => {
            setData((prev) => [...prev, { ...prev[prev.length - 1], week, ads: values as any }]);
            toast({ title: "Đã tạo báo cáo Quảng cáo", description: `Tuần ${week}` });
          }}
        />
      )}
    </AppLayout>
  );
};

/* ---------------- Overview ---------------- */
function OverviewView({ data, last, prev }: { data: WeeklyReport[]; last: WeeklyReport; prev: WeeklyReport }) {
  const sessionsDelta = pct(last.website.sessions, prev.website.sessions);
  const bookingsDelta = pct(last.website.bookings, prev.website.bookings);
  const reachDelta = pct(last.fanpage.reach, prev.fanpage.reach);
  const cpaDelta = pct(last.ads.cpa, prev.ads.cpa);

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-primary p-6 text-primary-foreground shadow-elegant md:p-8">
        <Badge className="mb-3 bg-white/20 text-white hover:bg-white/20">Tổng quan điều hành</Badge>
        <h2 className="font-display text-2xl font-semibold leading-snug md:text-3xl">
          Tuần {last.week}: Hiệu suất marketing tăng trưởng đồng đều ở cả 3 kênh chính
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-primary-foreground/85 md:text-base">
          Website ghi nhận <strong className="text-white">{last.website.bookings} đặt phòng</strong> ({fmt(bookingsDelta)} so với tuần trước),
          tỷ lệ chuyển đổi đạt <strong className="text-white">{last.website.conversion}%</strong>.
          Fanpage tiếp tục mở rộng tệp khán giả với reach <strong className="text-white">{last.fanpage.reach.toLocaleString("vi-VN")}</strong> ({fmt(reachDelta)}).
          Quảng cáo Meta tối ưu tốt, CPA giảm còn <strong className="text-white">{last.ads.cpa.toLocaleString("vi-VN")}đ</strong> ({fmt(cpaDelta)}).
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <ChannelCard title="Website" data={[
          { label: "Sessions", value: last.website.sessions.toLocaleString("vi-VN"), delta: sessionsDelta },
          { label: "Đặt phòng", value: last.website.bookings, delta: bookingsDelta },
          { label: "Conversion", value: last.website.conversion + "%", delta: pct(last.website.conversion, prev.website.conversion) },
        ]} />
        <ChannelCard title="Fanpage" data={[
          { label: "Reach", value: last.fanpage.reach.toLocaleString("vi-VN"), delta: reachDelta },
          { label: "Followers", value: last.fanpage.followers.toLocaleString("vi-VN"), delta: pct(last.fanpage.followers, prev.fanpage.followers) },
          { label: "Engagement", value: last.fanpage.engagement.toLocaleString("vi-VN"), delta: pct(last.fanpage.engagement, prev.fanpage.engagement) },
        ]} />
        <ChannelCard title="Quảng cáo Meta" data={[
          { label: "Chi phí", value: (last.ads.spend / 1_000_000).toFixed(1) + "M", delta: pct(last.ads.spend, prev.ads.spend) },
          { label: "Đặt phòng", value: last.ads.bookings, delta: pct(last.ads.bookings, prev.ads.bookings) },
          { label: "CPA", value: last.ads.cpa.toLocaleString("vi-VN") + "đ", delta: cpaDelta, invert: true },
        ]} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 shadow-card-soft">
          <h3 className="mb-4 font-display text-lg font-semibold">Xu hướng đặt phòng từ Website</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Area type="monotone" dataKey="website.bookings" stroke="hsl(var(--primary))" fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 shadow-card-soft">
          <h3 className="mb-4 font-display text-lg font-semibold">Reach Fanpage qua các tuần</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="fanpage.reach" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ fill: "hsl(var(--accent))", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 shadow-card-soft lg:col-span-2">
          <h3 className="mb-4 font-display text-lg font-semibold">Hiệu quả quảng cáo: Chi phí vs Đặt phòng</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar yAxisId="left" dataKey="ads.spend" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Chi phí (VND)" />
              <Bar yAxisId="right" dataKey="ads.bookings" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} name="Đặt phòng" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-success bg-card p-5 shadow-card-soft">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <h3 className="font-display text-lg font-semibold">Điểm tốt</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Website tăng trưởng 5 tuần liên tiếp, conversion vượt 1%</li>
            <li>• Quảng cáo Meta tối ưu tốt, CPA giảm 4 tuần liên tiếp</li>
            <li>• Reach Fanpage tăng 69% so với 5 tuần trước</li>
          </ul>
        </Card>

        <Card className="border-l-4 border-l-warning bg-card p-5 shadow-card-soft">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="font-display text-lg font-semibold">Vấn đề cần lưu ý</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Chi phí quảng cáo tăng nhanh hơn tốc độ tăng đặt phòng</li>
            <li>• Engagement Fanpage chưa tương xứng với reach</li>
            <li>• Chưa có dữ liệu từ kênh OTA để so sánh tổng thể</li>
          </ul>
        </Card>

        <Card className="border-l-4 border-l-accent bg-card p-5 shadow-card-soft md:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            <h3 className="font-display text-lg font-semibold">Đề xuất hành động tuần sau</h3>
          </div>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li><strong className="text-foreground">1.</strong> Tách campaign Meta theo loại phòng để đánh giá ROI chính xác hơn.</li>
            <li><strong className="text-foreground">2.</strong> Tăng tần suất đăng video ngắn trên Fanpage để cải thiện engagement.</li>
            <li><strong className="text-foreground">3.</strong> Bắt đầu đưa số liệu Booking.com & Agoda vào báo cáo từ tuần T18.</li>
            <li><strong className="text-foreground">4.</strong> A/B test landing page đặt phòng để đẩy conversion vượt 1.2%.</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Channel View ---------------- */
const channelFields: Record<"website" | "ads", { key: string; label: string }[]> = {
  website: [
    { key: "sessions", label: "Sessions" },
    { key: "bookings", label: "Đặt phòng" },
    { key: "conversion", label: "Conversion (%)" },
  ],
  ads: [
    { key: "spend", label: "Chi phí (VND)" },
    { key: "bookings", label: "Đặt phòng" },
    { key: "cpa", label: "CPA (VND)" },
  ],
};

function ChannelView({
  channel,
  data,
  onAdd,
}: {
  channel: "website" | "ads";
  data: WeeklyReport[];
  onAdd: (week: string, values: Record<string, number>) => void;
}) {
  const meta = channelMeta[channel];
  const Icon = meta.icon;
  const fields = channelFields[channel];

  // Bộ lọc Tuần / Tháng / Năm
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const series = useMemo(
    () => aggregateByPeriod(data, channel, fields, period),
    [data, channel, fields, period]
  );
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  const periodLabel = period === "week" ? "tuần" : period === "month" ? "tháng" : "năm";

  const lastRaw = data[data.length - 1];
  const [week, setWeek] = useState(`T${parseInt(lastRaw.week.replace("T", "")) + 1}`);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, ""]))
  );

  const submit = () => {
    if (!week.trim()) return;
    const numeric: Record<string, number> = {};
    for (const f of fields) numeric[f.key] = Number(values[f.key]) || 0;
    onAdd(week.trim(), numeric);
    setValues(Object.fromEntries(fields.map((f) => [f.key, ""])));
    setWeek(`T${parseInt(week.replace("T", "")) + 1}`);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className={`border-0 p-6 text-white shadow-elegant md:p-7 bg-gradient-to-br ${meta.color}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <Badge className="mb-1 bg-white/20 text-white hover:bg-white/20">Kênh {meta.title}</Badge>
              <h2 className="font-display text-2xl font-bold">Báo cáo {meta.title} — {last.label}</h2>
            </div>
          </div>
          <div className="rounded-xl bg-white/15 p-1 backdrop-blur">
            <Tabs value={period} onValueChange={(v) => setPeriod(v as "week" | "month" | "year")}>
              <TabsList className="bg-transparent">
                <TabsTrigger value="week" className="text-white data-[state=active]:bg-white data-[state=active]:text-foreground">Tuần</TabsTrigger>
                <TabsTrigger value="month" className="text-white data-[state=active]:bg-white data-[state=active]:text-foreground">Tháng</TabsTrigger>
                <TabsTrigger value="year" className="text-white data-[state=active]:bg-white data-[state=active]:text-foreground">Năm</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </Card>

      {/* Filter info bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card-soft">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4 text-primary" />
          Đang xem theo <strong className="text-foreground">{periodLabel}</strong> · {series.length} kỳ · so sánh với {periodLabel} liền trước
        </div>
        <Badge variant="secondary" className="text-xs">{last.label}</Badge>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {fields.map((f) => {
          const now = ((last as any)[f.key] ?? 0) as number;
          const before = prev ? (((prev as any)[f.key] ?? 0) as number) : 0;
          const delta = pct(now, before);
          const invert = channel === "ads" && (f.key === "spend" || f.key === "cpa");
          const positive = invert ? delta < 0 : delta > 0;
          return (
            <Card key={f.key} className="p-5 shadow-card-soft">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</p>
              <p className="mt-2 font-display text-3xl font-bold">{now.toLocaleString("vi-VN")}</p>
              <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
                {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {fmt(delta)} so với {periodLabel} trước
              </div>
            </Card>
          );
        })}
      </div>

      {/* Trend chart */}
      <Card className="p-5 shadow-card-soft">
        <h3 className="mb-4 font-display text-lg font-semibold">Xu hướng {meta.title} (theo {periodLabel})</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            {fields.slice(0, 2).map((f, i) => (
              <Line
                key={f.key}
                type="monotone"
                dataKey={f.key}
                name={f.label}
                stroke={i === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Weekly history */}
      <Card className="p-5 shadow-card-soft">
        <h3 className="mb-4 font-display text-lg font-semibold">Lịch sử báo cáo theo {periodLabel}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4">{period === "week" ? "Tuần" : period === "month" ? "Tháng" : "Năm"}</th>
                {fields.map((f) => <th key={f.key} className="py-2 pr-4">{f.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {[...series].reverse().map((d) => (
                <tr key={d.label} className="border-b border-border/60">
                  <td className="py-2 pr-4 font-medium">{d.label}</td>
                  {fields.map((f) => (
                    <td key={f.key} className="py-2 pr-4 text-muted-foreground">
                      {(((d as any)[f.key] ?? 0) as number).toLocaleString("vi-VN")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add weekly report */}
      <Card className="p-5 shadow-card-soft">
        <div className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Tạo báo cáo tuần mới — {meta.title}</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Label>Tuần</Label>
            <Input value={week} onChange={(e) => setWeek(e.target.value)} placeholder="VD: T18" />
          </div>
          {fields.map((f) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Input
                type="number"
                value={values[f.key]}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                placeholder="0"
              />
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={submit} className="bg-gradient-brand text-primary-foreground shadow-elegant">
            <Plus className="mr-1 h-4 w-4" /> Lưu báo cáo tuần
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Fanpage Analytics Dashboard (chuyên sâu) ---------------- */
function FanpageAnalytics({
  data,
  last,
  prev,
}: {
  data: WeeklyReport[];
  last: WeeklyReport;
  prev: WeeklyReport;
}) {
  // 1. Stacked Area - Lượt Xem theo tuần
  const viewsSeries = data.map((d) => ({
    week: d.week,
    "Video <1 phút": d.fanpage.videoUnder1minViews ?? 0,
    "Video 3s": (d.fanpage.video3sViews ?? 0) - (d.fanpage.videoUnder1minViews ?? 0),
    "View khác": Math.max(0, (d.fanpage.totalViews ?? 0) - (d.fanpage.video3sViews ?? 0)),
  }));

  // 2. Funnel - tỷ lệ giữ chân video
  const funnelViews = [
    { name: "Tổng Lượt Xem", value: last.fanpage.totalViews ?? 0, fill: "hsl(var(--primary))" },
    { name: "Video 3s", value: last.fanpage.video3sViews ?? 0, fill: "hsl(258 88% 72%)" },
    { name: "Video <1 phút", value: last.fanpage.videoUnder1minViews ?? 0, fill: "hsl(330 85% 65%)" },
  ];
  const retain3s = last.fanpage.totalViews ? Math.round(((last.fanpage.video3sViews ?? 0) / last.fanpage.totalViews) * 1000) / 10 : 0;
  const retain1m = last.fanpage.video3sViews ? Math.round(((last.fanpage.videoUnder1minViews ?? 0) / last.fanpage.video3sViews) * 1000) / 10 : 0;

  // 3. Grouped Bar - tương tác theo tuần
  const engageSeries = data.map((d) => ({
    week: d.week,
    Like: d.fanpage.likes ?? 0,
    "Bình luận": d.fanpage.comments ?? 0,
    "Chia sẻ": d.fanpage.shares ?? 0,
  }));

  // 4. Donut - cơ cấu tương tác tuần này
  const engageDonut = [
    { name: "Like", value: last.fanpage.likes ?? 0, fill: "hsl(258 88% 62%)" },
    { name: "Bình luận", value: last.fanpage.comments ?? 0, fill: "hsl(330 85% 60%)" },
    { name: "Chia sẻ", value: last.fanpage.shares ?? 0, fill: "hsl(38 95% 55%)" },
  ];
  const totalEngage = engageDonut.reduce((s, x) => s + x.value, 0);
  const qualityRate = totalEngage ? Math.round((((last.fanpage.comments ?? 0) + (last.fanpage.shares ?? 0)) / totalEngage) * 1000) / 10 : 0;

  // 5. Diverging Bar - Follow vs Unfollow + Net Growth
  const audienceSeries = data.map((d) => ({
    week: d.week,
    "Theo dõi": d.fanpage.newFollowers ?? 0,
    "Bỏ theo dõi": -(d.fanpage.unfollows ?? 0),
    Net: (d.fanpage.newFollowers ?? 0) - (d.fanpage.unfollows ?? 0),
  }));

  // 6. Funnel - Tin nhắn → Chuyển đổi
  const msgFunnel = [
    { name: "Tin nhắn mới", value: last.fanpage.newMessages ?? 0, fill: "hsl(160 75% 45%)" },
    { name: "Chuyển đổi", value: last.fanpage.conversions ?? 0, fill: "hsl(258 88% 62%)" },
  ];
  const convRate = last.fanpage.newMessages ? Math.round(((last.fanpage.conversions ?? 0) / last.fanpage.newMessages) * 1000) / 10 : 0;
  const convRatePrev = prev.fanpage.newMessages ? Math.round(((prev.fanpage.conversions ?? 0) / prev.fanpage.newMessages) * 1000) / 10 : 0;
  const convRateDelta = Math.round((convRate - convRatePrev) * 10) / 10;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pt-2">
        <span className="h-1.5 w-8 rounded-full bg-gradient-brand" />
        <h3 className="font-display text-xl font-semibold">Phân tích chuyên sâu</h3>
        <Badge variant="secondary" className="ml-2">Tự động từ dữ liệu tuần</Badge>
      </div>

      {/* HÀNG 1 — Lượt Xem (3 biểu đồ) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 shadow-card-soft">
          <div className="mb-1 flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <h4 className="font-display text-base font-semibold">Lượt Xem theo tuần</h4>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">Stacked: View khác / 3s / &lt;1 phút.</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={viewsSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="View khác" stackId="1" stroke="hsl(210 80% 70%)" fill="hsl(210 80% 70%)" fillOpacity={0.5} />
              <Area type="monotone" dataKey="Video 3s" stackId="1" stroke="hsl(258 88% 65%)" fill="hsl(258 88% 65%)" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Video <1 phút" stackId="1" stroke="hsl(330 85% 60%)" fill="hsl(330 85% 60%)" fillOpacity={0.7} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 shadow-card-soft">
          <div className="mb-1 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-pink-500" />
            <h4 className="font-display text-base font-semibold">Funnel giữ chân video</h4>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">Tỷ lệ rơi rớt View → 3s → 1 phút.</p>
          <ResponsiveContainer width="100%" height={160}>
            <FunnelChart>
              <Tooltip />
              <Funnel dataKey="value" data={funnelViews} isAnimationActive>
                <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="name" fontSize={10} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-secondary p-2">
              <p className="text-[10px] uppercase text-muted-foreground">View → 3s</p>
              <p className="font-display text-lg font-bold text-primary">{retain3s}%</p>
            </div>
            <div className="rounded-lg bg-secondary p-2">
              <p className="text-[10px] uppercase text-muted-foreground">3s → 1 phút</p>
              <p className="font-display text-lg font-bold text-pink-500">{retain1m}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-card-soft">
          <div className="mb-1 flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-500" />
            <h4 className="font-display text-base font-semibold">Tương Tác theo tuần</h4>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">Like / Bình luận / Chia sẻ.</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={engageSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Like" fill="hsl(258 88% 62%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Bình luận" fill="hsl(330 85% 60%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Chia sẻ" fill="hsl(38 95% 55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* HÀNG 2 — Tương tác / Đối tượng / Tin nhắn (3 biểu đồ) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 shadow-card-soft">
          <div className="mb-1 flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-500" />
            <h4 className="font-display text-base font-semibold">Cơ cấu tương tác</h4>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">Tỷ trọng tuần {last.week}.</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Tooltip />
              <Pie data={engageDonut} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {engageDonut.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 rounded-lg bg-secondary p-2 text-center">
            <p className="text-[10px] uppercase text-muted-foreground">Tương tác chất lượng (Cmt + Share)</p>
            <p className="font-display text-lg font-bold text-foreground">{qualityRate}%</p>
          </div>
        </Card>

        <Card className="p-5 shadow-card-soft">
          <div className="mb-1 flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-500" />
            <h4 className="font-display text-base font-semibold">Theo dõi vs Bỏ theo dõi</h4>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">Dòng vào (xanh) — dòng ra (đỏ).</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={audienceSeries} stackOffset="sign">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Theo dõi" fill="hsl(160 75% 45%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Bỏ theo dõi" fill="hsl(0 75% 60%)" radius={[0, 0, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 shadow-card-soft">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <h4 className="font-display text-base font-semibold">Tăng trưởng ròng (Net)</h4>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">Net = Follow − Unfollow.</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={audienceSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="Net" stroke="hsl(160 75% 45%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(160 75% 45%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* HÀNG 3 — Tin nhắn (3 cột) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 shadow-card-soft">
          <div className="mb-1 flex items-center gap-2">
            <Mail className="h-4 w-4 text-emerald-500" />
            <h4 className="font-display text-base font-semibold">Funnel Inbox → Đơn</h4>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">Hành trình từ inbox đến chuyển đổi.</p>
          <ResponsiveContainer width="100%" height={220}>
            <FunnelChart>
              <Tooltip />
              <Funnel dataKey="value" data={msgFunnel} isAnimationActive>
                <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="name" fontSize={12} />
                <LabelList position="center" fill="#fff" stroke="none" dataKey="value" fontSize={14} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 shadow-card-soft">
          <div className="mb-1 flex items-center gap-2">
            <Mail className="h-4 w-4 text-emerald-500" />
            <h4 className="font-display text-base font-semibold">Tin nhắn theo tuần</h4>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">Inbox mới vs Chuyển đổi.</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.map((d) => ({
              week: d.week,
              "Tin nhắn": d.fanpage.newMessages ?? 0,
              "Chuyển đổi": d.fanpage.conversions ?? 0,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Tin nhắn" fill="hsl(160 75% 55%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Chuyển đổi" fill="hsl(258 88% 62%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border-0 bg-gradient-brand p-5 text-primary-foreground shadow-elegant">
          <p className="text-xs uppercase tracking-wider opacity-90">Conversion Rate</p>
          <p className="mt-2 font-display text-4xl font-bold">{convRate}%</p>
          <div className="mt-2 flex items-center gap-1 text-sm font-medium">
            {convRateDelta >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {convRateDelta >= 0 ? "+" : ""}{convRateDelta}% so với tuần trước
          </div>
          <div className="mt-4 space-y-1 text-xs opacity-90">
            <p>Tin nhắn mới: <strong>{(last.fanpage.newMessages ?? 0).toLocaleString("vi-VN")}</strong></p>
            <p>Chuyển đổi: <strong>{(last.fanpage.conversions ?? 0).toLocaleString("vi-VN")}</strong></p>
            <p className="pt-2 italic opacity-80">Mục tiêu khuyến nghị: ≥ 15%</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Fanpage Metrics Sheet (bảng số liệu kiểu spreadsheet) ---------------- */
function FanpageMetricsSheet({
  data,
  allFields,
  groups,
}: {
  data: WeeklyReport[];
  allFields: { key: string; label: string; invert?: boolean }[];
  groups: { title: string; color: string; fields: { key: string; label: string; invert?: boolean }[] }[];
}) {
  const weeks = data;
  const fieldGroupColor = (key: string) => {
    const g = groups.find((gr) => gr.fields.some((f) => f.key === key));
    return g?.color ?? "from-slate-400 to-slate-500";
  };

  return (
    <Card className="overflow-hidden shadow-card-soft">
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <h3 className="font-display text-base font-semibold">Bảng số liệu Fanpage (theo tuần)</h3>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          ▲ tăng · ▼ giảm so với tuần liền trước
        </Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-card sticky top-0">
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-semibold">Chỉ số</th>
              {weeks.map((w) => (
                <th key={w.week} className="px-3 py-3 text-right font-semibold">{w.week}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <FragmentGroup key={group.title} group={group} weeks={weeks} fieldGroupColor={fieldGroupColor} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function FragmentGroup({
  group,
  weeks,
  fieldGroupColor,
}: {
  group: { title: string; color: string; fields: { key: string; label: string; invert?: boolean }[] };
  weeks: WeeklyReport[];
  fieldGroupColor: (k: string) => string;
}) {
  return (
    <>
      <tr className="bg-secondary/30">
        <td colSpan={weeks.length + 1} className="px-4 py-2">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${group.color}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{group.title}</span>
          </div>
        </td>
      </tr>
      {group.fields.map((f) => (
        <tr key={f.key} className="border-b border-border/50 hover:bg-secondary/20">
          <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-medium text-foreground">
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-br ${fieldGroupColor(f.key)}`} />
              {f.label}
            </div>
          </td>
          {weeks.map((w, idx) => {
            const cur = ((w.fanpage as any)[f.key] ?? 0) as number;
            const prevW = idx > 0 ? (((weeks[idx - 1].fanpage as any)[f.key] ?? 0) as number) : null;
            const delta = prevW !== null ? pct(cur, prevW) : null;
            const positive = delta !== null && (f.invert ? delta < 0 : delta > 0);
            const negative = delta !== null && delta !== 0 && !positive;
            return (
              <td key={w.week} className="px-3 py-2.5 text-right tabular-nums">
                <div className="font-medium text-foreground">{cur.toLocaleString("vi-VN")}</div>
                {delta !== null && delta !== 0 && (
                  <div className={`text-[10px] font-medium ${positive ? "text-success" : "text-destructive"}`}>
                    {positive ? "▲" : "▼"} {Math.abs(delta)}%
                  </div>
                )}
                {delta === 0 && <div className="text-[10px] text-muted-foreground">—</div>}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

/* ---------------- Helpers ---------------- */
function pct(now: number, before: number) {
  if (!before) return 0;
  return Math.round(((now - before) / before) * 1000) / 10;
}
function fmt(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}%`;
}

/**
 * Gộp dữ liệu theo Tuần / Tháng / Năm.
 * Giả định nhãn tuần có dạng "T13"..."T52" trong năm hiện tại (2026).
 * - Tuần: giữ nguyên từng tuần.
 * - Tháng: gộp 4 tuần liên tiếp (T1-T4 = Tháng 1, T5-T8 = Tháng 2, ...).
 * - Năm: cộng dồn toàn bộ tuần.
 * Các chỉ số tỷ lệ (conversion, cpa) được tính lại bằng trung bình có trọng số.
 */
function aggregateByPeriod(
  data: WeeklyReport[],
  channel: "website" | "ads",
  fields: { key: string; label: string }[],
  period: "week" | "month" | "year",
) {
  const year = 2026;
  const rows = data.map((d) => {
    const wk = parseInt(d.week.replace(/\D/g, "")) || 1;
    const month = Math.min(12, Math.ceil(wk / 4));
    return { wk, month, year, raw: (d as any)[channel] as Record<string, number>, week: d.week };
  });

  if (period === "week") {
    return rows.map((r) => ({ label: r.week, ...r.raw }));
  }

  // Group by month or year
  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = period === "month" ? `T${r.month}/${r.year}` : `${r.year}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  return Array.from(groups.entries()).map(([label, items]) => {
    const agg: Record<string, number> = { };
    for (const f of fields) {
      const isRate = f.key === "conversion" || f.key === "cpa";
      if (isRate) {
        // Trung bình có trọng số: cpa theo bookings; conversion theo sessions
        const weightKey = f.key === "cpa" ? "bookings" : "sessions";
        const totalWeight = items.reduce((s, it) => s + (it.raw[weightKey] ?? 0), 0);
        agg[f.key] = totalWeight
          ? Math.round(items.reduce((s, it) => s + (it.raw[f.key] ?? 0) * (it.raw[weightKey] ?? 0), 0) / totalWeight)
          : 0;
        if (f.key === "conversion") agg[f.key] = Math.round(agg[f.key] * 100) / 100;
      } else {
        agg[f.key] = items.reduce((s, it) => s + (it.raw[f.key] ?? 0), 0);
      }
    }
    return { label, ...agg };
  });
}
function ChannelCard({ title, data }: { title: string; data: { label: string; value: any; delta: number; invert?: boolean }[] }) {
  return (
    <Card className="p-5 shadow-card-soft">
      <h3 className="mb-4 font-display text-lg font-semibold text-foreground">{title}</h3>
      <div className="space-y-3">
        {data.map((d) => {
          const positive = d.invert ? d.delta < 0 : d.delta > 0;
          return (
            <div key={d.label} className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{d.label}</p>
                <p className="font-display text-lg font-semibold text-foreground">{d.value}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
                {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {fmt(d.delta)}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default Reports;

/* ---------------- Fanpage View (grouped metrics) ---------------- */
type FanpageValues = {
  totalViews: number;
  video3sViews: number;
  videoUnder1minViews: number;
  likes: number;
  comments: number;
  shares: number;
  newFollowers: number;
  unfollows: number;
  newMessages: number;
  conversions: number;
};

const fanpageGroups: {
  title: string;
  icon: any;
  color: string;
  fields: { key: keyof FanpageValues; label: string; invert?: boolean }[];
}[] = [
  {
    title: "Lượt Xem",
    icon: Eye,
    color: "from-sky-500 to-blue-600",
    fields: [
      { key: "totalViews", label: "Tổng Lượt Xem" },
      { key: "video3sViews", label: "Lượt Xem Video 3s" },
      { key: "videoUnder1minViews", label: "Lượt Xem Video Dưới 1 Phút" },
    ],
  },
  {
    title: "Tương Tác",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    fields: [
      { key: "likes", label: "Like" },
      { key: "comments", label: "Bình Luận" },
      { key: "shares", label: "Chia Sẻ" },
    ],
  },
  {
    title: "Đối Tượng",
    icon: Users,
    color: "from-violet-500 to-fuchsia-500",
    fields: [
      { key: "newFollowers", label: "Theo Dõi" },
      { key: "unfollows", label: "Bỏ Theo Dõi", invert: true },
    ],
  },
  {
    title: "Tin Nhắn",
    icon: Mail,
    color: "from-emerald-500 to-teal-500",
    fields: [
      { key: "newMessages", label: "Tin Nhắn Mới" },
      { key: "conversions", label: "Số Lượng Chuyển Đổi" },
    ],
  },
];

function FanpageView({
  data,
  onAdd,
}: {
  data: WeeklyReport[];
  onAdd: (week: string, values: FanpageValues) => void;
}) {
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const meta = channelMeta.fanpage;
  const Icon = meta.icon;

  const allFields = fanpageGroups.flatMap((g) => g.fields);
  const [week, setWeek] = useState(`T${parseInt(last.week.replace("T", "")) + 1}`);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(allFields.map((f) => [f.key, ""]))
  );

  const submit = () => {
    if (!week.trim()) return;
    const numeric = {} as FanpageValues;
    for (const f of allFields) (numeric as any)[f.key] = Number(values[f.key]) || 0;
    onAdd(week.trim(), numeric);
    setValues(Object.fromEntries(allFields.map((f) => [f.key, ""])));
    setWeek(`T${parseInt(week.replace("T", "")) + 1}`);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className={`border-0 p-6 text-white shadow-elegant md:p-7 bg-gradient-to-br ${meta.color}`}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <Badge className="mb-1 bg-white/20 text-white hover:bg-white/20">Kênh Fanpage</Badge>
            <h2 className="font-display text-2xl font-bold">Báo cáo Fanpage — Tuần {last.week}</h2>
          </div>
        </div>
      </Card>

      {/* === BIỂU ĐỒ PHÂN TÍCH CHUYÊN SÂU (lên đầu, 3 cột) === */}
      <FanpageAnalytics data={data} last={last} prev={prev} />

      {/* === BẢNG SHEET CHỈ SỐ — gọn gàng, hiển thị tăng/giảm === */}
      <FanpageMetricsSheet data={data} allFields={allFields} groups={fanpageGroups} />

      {/* Add weekly report - grouped form */}
      <Card className="p-5 shadow-card-soft">
        <div className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Tạo báo cáo tuần mới — Fanpage</h3>
        </div>
        <div className="mb-5 max-w-xs">
          <Label>Tuần</Label>
          <Input value={week} onChange={(e) => setWeek(e.target.value)} placeholder="VD: T18" />
        </div>
        <div className="space-y-5">
          {fanpageGroups.map((group) => {
            const GIcon = group.icon;
            return (
              <div key={group.title}>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ${group.color} text-white`}>
                    <GIcon className="h-3.5 w-3.5" />
                  </span>
                  <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</h4>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {group.fields.map((f) => (
                    <div key={f.key}>
                      <Label>{f.label}</Label>
                      <Input
                        type="number"
                        value={values[f.key]}
                        onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={submit} className="bg-gradient-brand text-primary-foreground shadow-elegant">
            <Plus className="mr-1 h-4 w-4" /> Lưu báo cáo tuần
          </Button>
        </div>
      </Card>
    </div>
  );
}