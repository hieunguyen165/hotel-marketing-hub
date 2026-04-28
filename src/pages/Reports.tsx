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
  BarChart, Bar, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Lightbulb, Plus,
  Globe, Megaphone, MessageCircle, LayoutGrid, Eye, Heart, Users, Mail,
} from "lucide-react";

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
  const last = data[data.length - 1];
  const prev = data[data.length - 2];

  const series = useMemo(() => data.map((d) => ({ week: d.week, ...d[channel] as any })), [data, channel]);

  const fields = channelFields[channel];
  const [week, setWeek] = useState(`T${parseInt(last.week.replace("T", "")) + 1}`);
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
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <Badge className="mb-1 bg-white/20 text-white hover:bg-white/20">Kênh {meta.title}</Badge>
            <h2 className="font-display text-2xl font-bold">Báo cáo {meta.title} — Tuần {last.week}</h2>
          </div>
        </div>
      </Card>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {fields.map((f) => {
          const now = (last[channel] as any)[f.key] as number;
          const before = (prev[channel] as any)[f.key] as number;
          const delta = pct(now, before);
          const invert = channel === "ads" && (f.key === "spend" || f.key === "cpa");
          const positive = invert ? delta < 0 : delta > 0;
          return (
            <Card key={f.key} className="p-5 shadow-card-soft">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</p>
              <p className="mt-2 font-display text-3xl font-bold">{now.toLocaleString("vi-VN")}</p>
              <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
                {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {fmt(delta)} so với tuần trước
              </div>
            </Card>
          );
        })}
      </div>

      {/* Trend chart */}
      <Card className="p-5 shadow-card-soft">
        <h3 className="mb-4 font-display text-lg font-semibold">Xu hướng {meta.title}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
        <h3 className="mb-4 font-display text-lg font-semibold">Lịch sử báo cáo tuần</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4">Tuần</th>
                {fields.map((f) => <th key={f.key} className="py-2 pr-4">{f.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.week} className="border-b border-border/60">
                  <td className="py-2 pr-4 font-medium">{d.week}</td>
                  {fields.map((f) => (
                    <td key={f.key} className="py-2 pr-4 text-muted-foreground">
                      {((d[channel] as any)[f.key] as number).toLocaleString("vi-VN")}
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

/* ---------------- Helpers ---------------- */
function pct(now: number, before: number) {
  if (!before) return 0;
  return Math.round(((now - before) / before) * 1000) / 10;
}
function fmt(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}%`;
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