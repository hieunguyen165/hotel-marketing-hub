import { useCallback, useMemo, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Upload, FileSpreadsheet, TrendingUp, TrendingDown, Eye, Users, Activity,
  MousePointerClick, Lightbulb, AlertTriangle, CheckCircle2, Sparkles, Clock,
  Trash2, ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ComposedChart, Area, ScatterChart, Scatter, ZAxis, Cell,
} from "recharts";
import { GA4Report, parseGA4Workbook, buildWeeklySeries, pct, formatDuration } from "@/lib/ga4Parser";

/* ---------- Helpers ---------- */
const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n));
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
const trimTitle = (t: string, max = 42) => (t.length > max ? t.slice(0, max - 1) + "…" : t);

/* ---------- KPI Card ---------- */
function KpiCard({
  icon: Icon, label, value, delta, hint, gradient,
}: { icon: any; label: string; value: string; delta?: number; hint?: string; gradient: string }) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="relative overflow-hidden border-0 bg-card p-5 shadow-card-soft">
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
          {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {typeof delta === "number" && (
        <div className={`relative mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          positive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
        }`}>
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(delta).toFixed(1)}% vs tuần trước
        </div>
      )}
    </Card>
  );
}

/* ---------- Empty / Upload ---------- */
function UploadZone({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <Card
      className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed bg-card p-12 text-center transition-smooth ${
        drag ? "border-violet-500 bg-violet-500/5" : "border-border"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files?.[0]; if (f) onFile(f);
      }}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg">
        <FileSpreadsheet className="h-8 w-8" />
      </span>
      <div>
        <h3 className="font-display text-lg font-bold">Tải báo cáo Analytics tuần lên</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Hỗ trợ file <span className="font-semibold">.xlsx</span> xuất từ Google Analytics 4 (Tổng quan nhanh).
        </p>
      </div>
      <input
        ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <Button onClick={() => inputRef.current?.click()} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
        <Upload className="mr-2 h-4 w-4" /> Chọn file Excel
      </Button>
      <p className="text-[11px] text-muted-foreground">Hoặc kéo thả file vào đây</p>
    </Card>
  );
}

/* ---------- Insight panel ---------- */
function InsightLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
      <span>{children}</span>
    </p>
  );
}

/* ---------- Page ---------- */
const WebsiteReports = () => {
  const { toast } = useToast();
  const [report, setReport] = useState<GA4Report | null>(null);
  const [loading, setLoading] = useState(false);

  const onFile = useCallback(async (file: File) => {
    try {
      setLoading(true);
      const r = await parseGA4Workbook(file);
      setReport(r);
      toast({ title: "Đã đọc file thành công", description: `${r.pages.length} trang • Kỳ ${r.startDate} → ${r.endDate}` });
    } catch (e: any) {
      toast({ title: "Không đọc được file", description: e?.message ?? "Vui lòng kiểm tra định dạng.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const weekly = useMemo(() => (report ? buildWeeklySeries(report) : []), [report]);
  const lastW = weekly[weekly.length - 1];
  const prevW = weekly[weekly.length - 2];

  const topPages = useMemo(
    () => (report?.pages ?? []).slice().sort((a, b) => b.views - a.views).slice(0, 10),
    [report],
  );
  const problemPages = useMemo(
    () => (report?.pages ?? [])
      .filter((p) => p.views >= 5)
      .slice().sort((a, b) => b.bounceRate - a.bounceRate)
      .slice(0, 8),
    [report],
  );

  const pareto = useMemo(() => {
    if (!report) return [] as { name: string; views: number; cum: number }[];
    const sorted = report.pages.slice().sort((a, b) => b.views - a.views).slice(0, 15);
    const total = sorted.reduce((s, p) => s + p.views, 0) || 1;
    let acc = 0;
    return sorted.map((p) => {
      acc += p.views;
      return { name: trimTitle(p.title, 22), views: p.views, cum: +(acc / total * 100).toFixed(1) };
    });
  }, [report]);

  const scatterData = useMemo(
    () => (report?.pages ?? [])
      .filter((p) => p.views >= 3)
      .map((p) => ({
        x: p.views,
        y: +(p.bounceRate * 100).toFixed(1),
        z: p.events,
        name: trimTitle(p.title, 36),
      })),
    [report],
  );

  /* -------- Insights & Recommendations -------- */
  const insights = useMemo(() => {
    if (!report || !lastW || !prevW) return [];
    const out: { type: "good" | "warn" | "bad"; text: string }[] = [];
    const dUsers = pct(lastW.users, prevW.users);
    const dViews = pct(lastW.views, prevW.views);
    const dBounce = pct(lastW.bounceRate, prevW.bounceRate);
    if (dUsers >= 5) out.push({ type: "good", text: `Người dùng tuần này tăng ${dUsers.toFixed(1)}%, đà tăng trưởng tích cực.` });
    else if (dUsers <= -5) out.push({ type: "bad", text: `Người dùng giảm ${Math.abs(dUsers).toFixed(1)}% — cần kiểm tra nguồn traffic chính.` });
    if (dViews >= 10) out.push({ type: "good", text: `Lượt xem tăng ${dViews.toFixed(1)}% — nội dung tuần này thu hút.` });
    if (dBounce >= 5) out.push({ type: "warn", text: `Bounce rate tăng ${dBounce.toFixed(1)}% — cần rà soát trải nghiệm landing page.` });
    const topShare = topPages[0]?.views ? topPages[0].views / report.kpi.totalViews : 0;
    if (topShare > 0.4) out.push({ type: "warn", text: `Trang chủ chiếm ${(topShare * 100).toFixed(0)}% lượt xem — phụ thuộc quá lớn vào 1 entry-point.` });
    const newRatio = report.kpi.activeUsers ? report.kpi.newUsers / report.kpi.activeUsers : 0;
    if (newRatio > 0.85) out.push({ type: "good", text: `${(newRatio * 100).toFixed(0)}% là user mới — tốt cho mở rộng tệp khách hàng.` });
    if (newRatio < 0.4) out.push({ type: "warn", text: `Tỷ lệ user mới chỉ ${(newRatio * 100).toFixed(0)}% — cần đẩy mạnh kênh thu hút mới.` });
    return out;
  }, [report, lastW, prevW, topPages]);

  const recommendations = useMemo(() => {
    if (!report) return [];
    const recs: string[] = [];
    if (problemPages[0]?.bounceRate > 0.6)
      recs.push(`Tối ưu trang "${trimTitle(problemPages[0].title, 50)}" (bounce ${fmtPct(problemPages[0].bounceRate)}): cải thiện CTA, tốc độ tải, và liên kết nội bộ.`);
    if (report.kpi.avgEngagementSec < 60)
      recs.push("Thời gian tương tác trung bình thấp — bổ sung video, ảnh chất lượng cao và nội dung dài hơn.");
    const topSrc = report.userSources[0];
    if (topSrc) recs.push(`Nguồn dẫn mạnh nhất là ${topSrc.source} (${fmt(topSrc.value)} user) — duy trì SEO/đầu tư mạnh thêm.`);
    if (report.userSources.length >= 2) {
      const second = report.userSources[1];
      recs.push(`Nguồn ${second.source} đứng thứ 2 — có thể chạy chiến dịch tăng cường để đa dạng hoá traffic.`);
    }
    if (problemPages.some((p) => p.title.toLowerCase().includes("not found")))
      recs.push("Phát hiện traffic vào trang 404 — kiểm tra lại internal link và chuyển hướng (301).");
    recs.push("Lên kế hoạch nội dung mới dựa trên top 3 trang hiệu quả nhất để nhân bản công thức thành công.");
    return recs;
  }, [report, problemPages]);

  /* -------- UI -------- */
  return (
    <AppLayout
      title="Báo cáo Website"
      subtitle={report ? `${report.account} • ${report.property} • ${report.startDate} → ${report.endDate}` : "Phân tích Analytics theo tuần"}
      actions={
        report && (
          <Button variant="outline" size="sm" onClick={() => setReport(null)}>
            <Trash2 className="mr-2 h-4 w-4" /> Tải file mới
          </Button>
        )
      }
    >
      {!report ? (
        <div className="mx-auto max-w-3xl">
          {loading ? (
            <Card className="p-12 text-center text-sm text-muted-foreground">Đang đọc dữ liệu…</Card>
          ) : (
            <UploadZone onFile={onFile} />
          )}
          <Card className="mt-6 bg-card p-5">
            <h4 className="flex items-center gap-2 text-sm font-semibold"><Lightbulb className="h-4 w-4 text-amber-500" /> Hướng dẫn nhanh</h4>
            <ol className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>1. Mở Google Analytics 4 → "Tổng quan" → biểu tượng chia sẻ → Tải xuống file Excel.</li>
              <li>2. Kéo thả hoặc chọn file vào khung phía trên.</li>
              <li>3. Hệ thống sẽ tự làm sạch, chia tuần, tạo dashboard và đề xuất hành động.</li>
            </ol>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* === KPI === */}
          <section>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard
                icon={Eye} label="Tổng lượt xem"
                value={fmt(report.kpi.totalViews)}
                delta={lastW && prevW ? pct(lastW.views, prevW.views) : undefined}
                gradient="from-violet-500 to-fuchsia-500"
              />
              <KpiCard
                icon={Users} label="Người dùng"
                value={fmt(report.kpi.activeUsers)}
                hint={`${fmt(report.kpi.newUsers)} người dùng mới`}
                delta={lastW && prevW ? pct(lastW.users, prevW.users) : undefined}
                gradient="from-sky-500 to-blue-600"
              />
              <KpiCard
                icon={Activity} label="Sự kiện"
                value={fmt(report.kpi.events)}
                delta={lastW && prevW ? pct(lastW.events, prevW.events) : undefined}
                gradient="from-emerald-500 to-teal-500"
              />
              <KpiCard
                icon={Clock} label="TG tương tác TB"
                value={formatDuration(report.kpi.avgEngagementSec)}
                hint={`Bounce TB ${fmtPct(report.kpi.avgBounceRate)}`}
                gradient="from-amber-500 to-orange-500"
              />
            </div>
          </section>

          {/* === Insight + warning === */}
          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="bg-card p-5 lg:col-span-2">
              <h3 className="flex items-center gap-2 font-display text-base font-bold">
                <Lightbulb className="h-4 w-4 text-amber-500" /> Nhận định tự động
              </h3>
              <div className="mt-3 space-y-2">
                {insights.length === 0 && (
                  <p className="text-sm text-muted-foreground">Hiệu suất tuần này ở mức ổn định, chưa có biến động lớn.</p>
                )}
                {insights.map((i, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      i.type === "good" ? "bg-emerald-500/15 text-emerald-600"
                        : i.type === "warn" ? "bg-amber-500/15 text-amber-600"
                        : "bg-rose-500/15 text-rose-600"
                    }`}>
                      {i.type === "good" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    </span>
                    <p className="text-sm">{i.text}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-card p-5">
              <h3 className="flex items-center gap-2 font-display text-base font-bold">
                <Sparkles className="h-4 w-4 text-violet-500" /> Tóm tắt KPI
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between"><span className="text-muted-foreground">Lượt xem</span><span className="font-semibold">{fmt(report.kpi.totalViews)}</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Người dùng</span><span className="font-semibold">{fmt(report.kpi.activeUsers)}</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">User mới</span><span className="font-semibold">{fmt(report.kpi.newUsers)}</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Sự kiện</span><span className="font-semibold">{fmt(report.kpi.events)}</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Bounce rate</span><span className="font-semibold">{fmtPct(report.kpi.avgBounceRate)}</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">TG tương tác</span><span className="font-semibold">{formatDuration(report.kpi.avgEngagementSec)}</span></li>
              </ul>
            </Card>
          </section>

          {/* === Trend & Combo === */}
          <section className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-card p-5">
              <h3 className="font-display text-base font-bold">Xu hướng theo tuần</h3>
              <p className="text-xs text-muted-foreground">Diễn biến 4 tuần gần nhất của lượt xem, user và sự kiện.</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <LineChart data={weekly}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" name="Lượt xem" stroke="hsl(280 70% 55%)" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="users" name="Người dùng" stroke="hsl(210 80% 55%)" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="events" name="Sự kiện" stroke="hsl(160 70% 45%)" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <InsightLine>
                Tuần đỉnh là <b>{weekly.reduce((a, b) => (a.views > b.views ? a : b)).week}</b> với {fmt(Math.max(...weekly.map((w) => w.views)))} lượt xem — cân nhắc phân tích nội dung publish trong tuần này để nhân rộng.
              </InsightLine>
            </Card>

            <Card className="bg-card p-5">
              <h3 className="font-display text-base font-bold">Lượt xem vs Người dùng (Combo)</h3>
              <p className="text-xs text-muted-foreground">Đối chiếu để thấy hiệu suất "view trên đầu user".</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <ComposedChart data={weekly}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis yAxisId="l" className="text-xs" />
                    <YAxis yAxisId="r" orientation="right" className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="l" dataKey="views" name="Lượt xem" fill="hsl(280 70% 60%)" radius={[6, 6, 0, 0]} />
                    <Line yAxisId="r" type="monotone" dataKey="users" name="Người dùng" stroke="hsl(330 80% 55%)" strokeWidth={2.5} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <InsightLine>
                Trung bình mỗi user xem <b>{(report.kpi.totalViews / Math.max(1, report.kpi.activeUsers)).toFixed(2)}</b> trang — chỉ số càng cao càng cho thấy nội dung hấp dẫn.
              </InsightLine>
            </Card>
          </section>

          {/* === Top pages bar + Pareto === */}
          <section className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-card p-5">
              <h3 className="font-display text-base font-bold">Top 10 trang theo lượt xem</h3>
              <p className="text-xs text-muted-foreground">Trang đem lại nhiều traffic nhất.</p>
              <div className="mt-4 h-[360px]">
                <ResponsiveContainer>
                  <BarChart data={topPages.map((p) => ({ name: trimTitle(p.title, 30), views: p.views }))} layout="vertical" margin={{ left: 10, right: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="name" width={170} className="text-[10px]" />
                    <Tooltip />
                    <Bar dataKey="views" name="Lượt xem" fill="hsl(280 70% 60%)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <InsightLine>
                Top 1 (<b>{trimTitle(topPages[0]?.title ?? "", 40)}</b>) đóng góp <b>{((topPages[0]?.views ?? 0) / Math.max(1, report.kpi.totalViews) * 100).toFixed(1)}%</b> tổng lượt xem.
              </InsightLine>
            </Card>

            <Card className="bg-card p-5">
              <h3 className="font-display text-base font-bold">Pareto — nhóm trang tạo phần lớn traffic</h3>
              <p className="text-xs text-muted-foreground">Bao nhiêu % trang tạo ra 80% traffic?</p>
              <div className="mt-4 h-[360px]">
                <ResponsiveContainer>
                  <ComposedChart data={pareto} margin={{ left: 0, right: 16, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" className="text-[10px]" height={70} />
                    <YAxis yAxisId="l" className="text-xs" />
                    <YAxis yAxisId="r" orientation="right" unit="%" domain={[0, 100]} className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="l" dataKey="views" name="Lượt xem" fill="hsl(210 80% 60%)" radius={[6, 6, 0, 0]} />
                    <Line yAxisId="r" type="monotone" dataKey="cum" name="% luỹ kế" stroke="hsl(0 75% 55%)" strokeWidth={2.5} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <InsightLine>
                Nhóm top {Math.max(1, pareto.findIndex((p) => p.cum >= 80) + 1)} trang đã tạo ra ~80% tổng lượt xem — ưu tiên nguồn lực tối ưu nhóm này.
              </InsightLine>
            </Card>
          </section>

          {/* === Scatter + Bounce === */}
          <section className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-card p-5">
              <h3 className="font-display text-base font-bold">Phân tích Views × Bounce × Events</h3>
              <p className="text-xs text-muted-foreground">Bong bóng càng to = nhiều sự kiện. Góc phải-dưới là vùng "vàng".</p>
              <div className="mt-4 h-[320px]">
                <ResponsiveContainer>
                  <ScatterChart margin={{ left: 0, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" dataKey="x" name="Lượt xem" className="text-xs" />
                    <YAxis type="number" dataKey="y" name="Bounce %" unit="%" className="text-xs" />
                    <ZAxis type="number" dataKey="z" range={[40, 320]} name="Sự kiện" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v: any, n: any) => [v, n]} labelFormatter={(_, items: any) => items?.[0]?.payload?.name} />
                    <Scatter data={scatterData} fill="hsl(280 70% 60%)">
                      {scatterData.map((d, i) => (
                        <Cell key={i} fill={d.y > 50 ? "hsl(0 75% 60%)" : d.y > 25 ? "hsl(35 90% 60%)" : "hsl(160 70% 50%)"} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <InsightLine>
                Trang có nhiều view nhưng bounce cao = ưu tiên tối ưu UX/CTA; trang ít view nhưng bounce thấp = đầu tư SEO để mở rộng.
              </InsightLine>
            </Card>

            <Card className="bg-card p-5">
              <h3 className="font-display text-base font-bold">Trang có Bounce Rate cao nhất</h3>
              <p className="text-xs text-muted-foreground">Top trang cần được tối ưu trải nghiệm.</p>
              <div className="mt-4 h-[320px]">
                <ResponsiveContainer>
                  <BarChart data={problemPages.map((p) => ({ name: trimTitle(p.title, 28), bounce: +(p.bounceRate * 100).toFixed(1), views: p.views }))} layout="vertical" margin={{ left: 10, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" unit="%" domain={[0, 100]} className="text-xs" />
                    <YAxis type="category" dataKey="name" width={170} className="text-[10px]" />
                    <Tooltip />
                    <Bar dataKey="bounce" name="Bounce %" fill="hsl(0 75% 60%)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <InsightLine>
                Ưu tiên xử lý top 3 trang trên — chỉ cần giảm bounce 10% có thể tăng đáng kể engagement chung.
              </InsightLine>
            </Card>
          </section>

          {/* === User behaviour: new vs returning + sources === */}
          <section className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-card p-5">
              <h3 className="font-display text-base font-bold">Hành vi người dùng — User mới vs quay lại</h3>
              <p className="text-xs text-muted-foreground">Tổng hợp theo tuần từ dữ liệu hằng ngày.</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <BarChart data={weekly}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="newUsers" name="User mới" stackId="a" fill="hsl(280 70% 60%)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="returningUsers" name="Quay lại" stackId="a" fill="hsl(330 80% 60%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <InsightLine>
                Tỷ lệ user mới chiếm <b>{((report.kpi.newUsers / Math.max(1, report.kpi.activeUsers)) * 100).toFixed(0)}%</b> — phản ánh khả năng thu hút khách lạ.
              </InsightLine>
            </Card>

            <Card className="bg-card p-5">
              <h3 className="font-display text-base font-bold">Top nguồn truy cập</h3>
              <p className="text-xs text-muted-foreground">Theo "Nguồn / Phương tiện" của người dùng.</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <BarChart data={report.userSources.slice(0, 8).map((s) => ({ name: s.source, value: s.value }))} layout="vertical" margin={{ left: 10, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="name" width={150} className="text-[11px]" />
                    <Tooltip />
                    <Bar dataKey="value" name="Người dùng" fill="hsl(210 80% 60%)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <InsightLine>
                {report.userSources[0]?.source} đang là nguồn dẫn chính (<b>{fmt(report.userSources[0]?.value ?? 0)}</b> user) — cần duy trì và đa dạng hoá.
              </InsightLine>
            </Card>
          </section>

          {/* === Recommendations === */}
          <section>
            <Card className="bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-sky-500/10 p-5">
              <h3 className="flex items-center gap-2 font-display text-base font-bold">
                <MousePointerClick className="h-4 w-4 text-fuchsia-500" /> Đề xuất hành động cho tuần tiếp theo
              </h3>
              <ol className="mt-3 space-y-2">
                {recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-lg bg-card/70 p-3 text-sm shadow-sm">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span>{r}</span>
                    <ArrowRight className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  </li>
                ))}
              </ol>
            </Card>
          </section>
        </div>
      )}
    </AppLayout>
  );
};

export default WebsiteReports;