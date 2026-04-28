import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { weeklyReports } from "@/data/mockData";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, AreaChart, Area,
} from "recharts";
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Lightbulb, Plus } from "lucide-react";

const Reports = () => {
  const last = weeklyReports[weeklyReports.length - 1];
  const prev = weeklyReports[weeklyReports.length - 2];

  const sessionsDelta = pct(last.website.sessions, prev.website.sessions);
  const bookingsDelta = pct(last.website.bookings, prev.website.bookings);
  const reachDelta = pct(last.fanpage.reach, prev.fanpage.reach);
  const cpaDelta = pct(last.ads.cpa, prev.ads.cpa);

  return (
    <AppLayout
      title="Báo cáo marketing"
      subtitle={`Tuần ${last.week} · Tổng hợp cho chủ khách sạn`}
      actions={
        <Button className="bg-gradient-gold text-accent-foreground shadow-gold hover:opacity-95">
          <Plus className="mr-1 h-4 w-4" /> Nhập số liệu tuần
        </Button>
      }
    >
      <Tabs defaultValue="report" className="w-full">
        <TabsList className="mb-6 bg-secondary">
          <TabsTrigger value="report">Báo cáo tuần</TabsTrigger>
          <TabsTrigger value="input">Nhập dữ liệu</TabsTrigger>
        </TabsList>

        {/* REPORT VIEW */}
        <TabsContent value="report" className="space-y-6">
          {/* Executive summary */}
          <Card className="border-0 bg-gradient-primary p-6 text-primary-foreground shadow-elegant md:p-8">
            <Badge className="mb-3 bg-accent/20 text-accent-soft hover:bg-accent/20">Tổng quan điều hành</Badge>
            <h2 className="font-display text-2xl font-semibold leading-snug md:text-3xl">
              Tuần {last.week}: Hiệu suất marketing tăng trưởng đồng đều ở cả 3 kênh chính
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/85 md:text-base">
              Website ghi nhận <strong className="text-accent-soft">{last.website.bookings} đặt phòng</strong> ({fmt(bookingsDelta)} so với tuần trước),
              tỷ lệ chuyển đổi đạt <strong className="text-accent-soft">{last.website.conversion}%</strong>.
              Fanpage tiếp tục mở rộng tệp khán giả với reach <strong className="text-accent-soft">{last.fanpage.reach.toLocaleString("vi-VN")}</strong> ({fmt(reachDelta)}).
              Quảng cáo Meta tối ưu tốt, CPA giảm còn <strong className="text-accent-soft">{last.ads.cpa.toLocaleString("vi-VN")}đ</strong> ({fmt(cpaDelta)}).
            </p>
          </Card>

          {/* Channel KPIs */}
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

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5 shadow-card-soft">
              <h3 className="mb-4 font-display text-lg font-semibold">Xu hướng đặt phòng từ Website</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={weeklyReports}>
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
                <LineChart data={weeklyReports}>
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
                <BarChart data={weeklyReports}>
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

          {/* Insight + Action */}
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
        </TabsContent>

        {/* INPUT VIEW */}
        <TabsContent value="input">
          <Card className="p-6 shadow-card-soft">
            <h3 className="mb-1 font-display text-xl font-semibold">Nhập dữ liệu tuần mới</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Mỗi thứ Hai, nhập số liệu của tuần trước cho 3 kênh. Đừng chỉ nhập số — hãy nghĩ kênh nào hiệu quả, kênh nào lãng phí.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              <InputBlock title="Website" fields={["Sessions", "Đặt phòng", "Conversion (%)"]} />
              <InputBlock title="Fanpage" fields={["Reach", "Followers", "Engagement"]} />
              <InputBlock title="Quảng cáo Meta" fields={["Chi phí (VND)", "Đặt phòng", "CPA (VND)"]} />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline">Lưu nháp</Button>
              <Button className="bg-gradient-primary text-primary-foreground">Tạo báo cáo tuần</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

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

function InputBlock({ title, fields }: { title: string; fields: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4">
      <h4 className="mb-3 font-display text-base font-semibold">{title}</h4>
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f}>
            <label className="mb-1 block text-xs text-muted-foreground">{f}</label>
            <input
              type="text"
              placeholder="0"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reports;
