import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, FunnelChart, Funnel, LabelList, Tooltip,
} from "recharts";
import {
  TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Sparkles,
  Eye, Heart, Users, Mail, Target, Activity, ArrowDown,
} from "lucide-react";

export type FanpageAggRow = {
  label: string;
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

type Period = "week" | "month" | "year";

/* ===== Calculated metrics ===== */
function derive(d: FanpageAggRow) {
  const engagement = d.likes + d.comments + d.shares;
  const engagementRate = d.totalViews ? (engagement / d.totalViews) * 100 : 0;
  const netFollow = d.newFollowers - d.unfollows;
  const conversionRate = d.newMessages ? (d.conversions / d.newMessages) * 100 : 0;
  const rate3s = d.totalViews ? (d.video3sViews / d.totalViews) * 100 : 0;
  const rate1m = d.video3sViews ? (d.videoUnder1minViews / d.video3sViews) * 100 : 0;
  return { engagement, engagementRate, netFollow, conversionRate, rate3s, rate1m };
}

function pctChange(now: number, before: number) {
  if (!before) return now > 0 ? 100 : 0;
  return Math.round(((now - before) / before) * 1000) / 10;
}
const fmtPct = (n: number) => `${n > 0 ? "+" : ""}${n}%`;
const fmtNum = (n: number) => n.toLocaleString("vi-VN");
const round1 = (n: number) => Math.round(n * 10) / 10;

/* ===== KPI Summary ===== */
function KPISummary({ last, prev, periodLabel }: { last: FanpageAggRow; prev: FanpageAggRow; periodLabel: string }) {
  const dNow = derive(last);
  const dPrev = derive(prev);

  const items = [
    { label: "Tổng lượt xem", value: fmtNum(last.totalViews), delta: pctChange(last.totalViews, prev.totalViews), icon: Eye, invert: false },
    { label: "Engagement", value: fmtNum(dNow.engagement), delta: pctChange(dNow.engagement, dPrev.engagement), icon: Heart, invert: false },
    { label: "Net follow", value: (dNow.netFollow >= 0 ? "+" : "") + fmtNum(dNow.netFollow), delta: pctChange(dNow.netFollow, dPrev.netFollow), icon: Users, invert: false, raw: dNow.netFollow },
    { label: "Tin nhắn mới", value: fmtNum(last.newMessages), delta: pctChange(last.newMessages, prev.newMessages), icon: Mail, invert: false },
    { label: "Chuyển đổi", value: fmtNum(last.conversions), delta: pctChange(last.conversions, prev.conversions), icon: Target, invert: false },
    { label: "Conversion rate", value: round1(dNow.conversionRate) + "%", delta: round1(dNow.conversionRate - dPrev.conversionRate), icon: Activity, invert: false, isAbsolute: true },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="h-1.5 w-8 rounded-full bg-gradient-brand" />
        <h3 className="font-display text-xl font-semibold">KPI tổng quan</h3>
        <Badge variant="secondary" className="ml-1 text-[10px]">So với {periodLabel} liền trước</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {items.map((it) => {
          const Ic = it.icon;
          const positive = (it as any).raw !== undefined ? (it as any).raw >= 0 && it.delta >= 0 : it.delta >= 0;
          const isNetFollowNeg = it.label === "Net follow" && (it as any).raw < 0;
          const good = isNetFollowNeg ? false : positive;
          return (
            <Card key={it.label} className="relative overflow-hidden p-4 shadow-card-soft">
              <div className={`absolute inset-x-0 top-0 h-1 ${good ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-rose-400 to-pink-500"}`} />
              <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                <Ic className="h-3.5 w-3.5" />
                <p className="text-[11px] uppercase tracking-wider">{it.label}</p>
              </div>
              <p className="font-display text-2xl font-bold leading-tight">{it.value}</p>
              <div className={`mt-1 flex items-center gap-1 text-xs font-semibold ${good ? "text-emerald-600" : "text-rose-600"}`}>
                {good ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {(it as any).isAbsolute ? `${it.delta > 0 ? "+" : ""}${it.delta} điểm` : fmtPct(it.delta)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ===== Insights & Warnings ===== */
function generateInsights(last: FanpageAggRow, prev: FanpageAggRow, periodLabel: string): string[] {
  const dNow = derive(last);
  const dPrev = derive(prev);
  const insights: { score: number; text: string }[] = [];

  const viewDelta = pctChange(last.totalViews, prev.totalViews);
  const inboxDelta = pctChange(last.newMessages, prev.newMessages);
  const convDelta = pctChange(last.conversions, prev.conversions);
  const engDelta = pctChange(dNow.engagement, dPrev.engagement);
  const netDelta = dNow.netFollow - dPrev.netFollow;

  // Strongest mover
  const movers = [
    { name: "Lượt xem", v: viewDelta },
    { name: "Tin nhắn", v: inboxDelta },
    { name: "Chuyển đổi", v: convDelta },
    { name: "Engagement", v: engDelta },
  ].sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
  if (movers[0] && Math.abs(movers[0].v) >= 5) {
    insights.push({
      score: 10,
      text: `${movers[0].name} ${movers[0].v >= 0 ? "tăng mạnh" : "giảm mạnh"} ${fmtPct(movers[0].v)} so với ${periodLabel} trước — đây là biến động lớn nhất kỳ này.`,
    });
  }

  // View up but inbox not up
  if (viewDelta > 10 && inboxDelta < 5) {
    insights.push({ score: 9, text: `View tăng ${fmtPct(viewDelta)} nhưng tin nhắn chỉ ${fmtPct(inboxDelta)} — nội dung thu hút nhưng CTA chưa đủ mạnh để khách nhắn tin.` });
  }

  // Funnel bottleneck
  if (dNow.rate3s < 40) {
    insights.push({ score: 8, text: `Chỉ ${round1(dNow.rate3s)}% người xem dừng lại 3 giây đầu — funnel nghẽn ngay khâu đầu video.` });
  } else if (dNow.rate1m < 30) {
    insights.push({ score: 8, text: `Chỉ ${round1(dNow.rate1m)}% giữ chân tới <1 phút — nội dung mất hấp dẫn ở đoạn giữa.` });
  }

  // Conversion comparison
  const convRateDelta = round1(dNow.conversionRate - dPrev.conversionRate);
  if (Math.abs(convRateDelta) >= 1) {
    insights.push({
      score: 7,
      text: `Conversion rate ${convRateDelta >= 0 ? "cải thiện" : "giảm"} ${convRateDelta >= 0 ? "+" : ""}${convRateDelta} điểm (${round1(dNow.conversionRate)}% vs ${round1(dPrev.conversionRate)}%) — ${convRateDelta >= 0 ? "kịch bản chốt đang hiệu quả hơn." : "cần xem lại kịch bản trả lời inbox."}`,
    });
  }

  // Net follow trend
  if (netDelta !== 0) {
    insights.push({
      score: 6,
      text: `Tăng trưởng ròng đạt ${dNow.netFollow >= 0 ? "+" : ""}${fmtNum(dNow.netFollow)} (${netDelta >= 0 ? "tốt hơn" : "kém hơn"} ${periodLabel} trước ${Math.abs(netDelta)} người).`,
    });
  }

  // Share virality
  if (last.shares > prev.shares * 1.3 && prev.shares > 0) {
    insights.push({ score: 7, text: `Lượt chia sẻ tăng đột biến ${fmtPct(pctChange(last.shares, prev.shares))} — có nội dung đang lan toả tự nhiên, nên nhân rộng.` });
  }

  return insights.sort((a, b) => b.score - a.score).slice(0, 5).map((x) => x.text);
}

function generateWarnings(last: FanpageAggRow, prev: FanpageAggRow): { text: string }[] {
  const dNow = derive(last);
  const dPrev = derive(prev);
  const warnings: { text: string }[] = [];

  if (dNow.engagementRate < 3) {
    warnings.push({ text: `Engagement rate chỉ ${round1(dNow.engagementRate)}% (khuyến nghị ≥ 3%) — nội dung chưa tạo được cảm xúc.` });
  }
  if (dNow.rate1m < 30 && last.video3sViews > 0) {
    warnings.push({ text: `Tỷ lệ xem <1 phút chỉ ${round1(dNow.rate1m)}% — drop mạnh sau 3s, cần cải thiện hook và phần thân video.` });
  }
  if (last.newMessages > prev.newMessages && last.conversions < prev.conversions) {
    warnings.push({ text: `Inbox tăng nhưng chuyển đổi giảm — kịch bản chốt sale có thể đang gặp vấn đề.` });
  }
  if (dNow.netFollow < 0) {
    warnings.push({ text: `Net follow âm (${dNow.netFollow}) — số người bỏ theo dõi nhiều hơn người mới, cần rà soát nội dung gần đây.` });
  }
  if (dNow.conversionRate < 10 && last.newMessages >= 50) {
    warnings.push({ text: `Conversion rate ${round1(dNow.conversionRate)}% dưới ngưỡng 10% trong khi inbox không thấp — chốt đơn yếu.` });
  }
  return warnings;
}

function generateRecommendations(last: FanpageAggRow, prev: FanpageAggRow, period: Period): string[] {
  const dNow = derive(last);
  const dPrev = derive(prev);
  const recs: string[] = [];
  const viewDelta = pctChange(last.totalViews, prev.totalViews);
  const inboxDelta = pctChange(last.newMessages, prev.newMessages);

  if (viewDelta > 10 && inboxDelta < 5) {
    recs.push("Tối ưu CTA cuối bài/video: thêm câu hỏi mở, nút Inbox, ưu đãi giới hạn để khách hành động ngay.");
  }
  if (dNow.rate3s < 50) {
    recs.push("Cải thiện 3 giây đầu video: dùng hook giật, hình ảnh động, câu hỏi gây tò mò ngay khung hình đầu tiên.");
  }
  if (dNow.rate1m < 35) {
    recs.push("Rút gọn phần giữa video, thêm cut nhanh hoặc text overlay để giữ chân người xem dưới 1 phút.");
  }
  if (last.shares > prev.shares && prev.shares > 0) {
    recs.push("Phân tích các bài có share cao và nhân rộng định dạng/chủ đề tương tự trong kỳ tới.");
  }
  if (dNow.conversionRate < dPrev.conversionRate) {
    recs.push("Rà soát kịch bản chốt đơn: phản hồi nhanh < 5 phút, gửi bảng giá kèm hình ảnh, đề xuất combo cụ thể.");
  }
  if (dNow.netFollow < 0) {
    recs.push("Giảm tần suất bài bán hàng cứng; tăng nội dung giá trị (tips, behind-the-scene) để giữ follower.");
  }
  if (dNow.engagementRate < 3) {
    recs.push("Thử nghiệm format mới: poll, carousel, mini-game để tăng tương tác chủ động từ cộng đồng.");
  }

  // Period-specific framing
  const horizon =
    period === "week" ? "Hành động ngắn hạn ngay tuần tới"
      : period === "month" ? "Tối ưu chiến lược nội dung tháng tới"
      : "Định hướng tăng trưởng dài hạn cho năm sau";
  // Ensure 3-5 items
  while (recs.length < 3) {
    recs.push(period === "week"
      ? "Lên lịch test A/B 2 thumbnail và 2 CTA khác nhau ngay tuần này."
      : period === "month"
        ? "Tổng hợp top 5 bài tốt nhất tháng và xây content pillar dựa trên insight đó."
        : "Đầu tư vào sản xuất video chuyên nghiệp + chiến dịch branding dài hơi.");
  }
  return [horizon, ...recs.slice(0, 5)];
}

/* ===== Funnel tổng hợp ===== */
function ConsolidatedFunnel({ last }: { last: FanpageAggRow }) {
  const d = derive(last);
  const steps = [
    { name: "Lượt xem", value: last.totalViews, fill: "hsl(258 88% 62%)" },
    { name: "Video 3s", value: last.video3sViews, fill: "hsl(280 85% 65%)" },
    { name: "Video <1 phút", value: last.videoUnder1minViews, fill: "hsl(310 85% 62%)" },
    { name: "Engagement", value: d.engagement, fill: "hsl(330 85% 60%)" },
    { name: "Tin nhắn", value: last.newMessages, fill: "hsl(350 80% 58%)" },
    { name: "Chuyển đổi", value: last.conversions, fill: "hsl(160 75% 45%)" },
  ];

  // Step-to-step conversion rates and biggest drop
  const transitions = steps.slice(1).map((s, i) => {
    const prev = steps[i];
    const rate = prev.value ? (s.value / prev.value) * 100 : 0;
    const drop = 100 - rate;
    return { from: prev.name, to: s.name, rate: round1(rate), drop: round1(drop), prevValue: prev.value, value: s.value };
  });
  const worst = [...transitions].sort((a, b) => b.drop - a.drop)[0];

  let insight = "Funnel cân đối, không có khâu nào bị nghẽn nghiêm trọng.";
  if (worst && worst.drop > 60) {
    insight = `Điểm nghẽn lớn nhất: ${worst.from} → ${worst.to} mất ${worst.drop}% — cần ưu tiên cải thiện khâu này.`;
  }

  return (
    <Card className="p-5 shadow-card-soft">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-display text-base font-semibold">Funnel tổng hợp: View → Chuyển đổi</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="mx-auto w-full max-w-[420px]">
          <ResponsiveContainer width="100%" height={240}>
            <FunnelChart>
              <Tooltip />
              <Funnel dataKey="value" data={steps} isAnimationActive>
                <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="name" fontSize={11} />
                <LabelList position="center" fill="#fff" stroke="none" dataKey="value" fontSize={12} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {transitions.map((t) => {
            const isWorst = worst && t.from === worst.from && t.to === worst.to;
            return (
              <div
                key={t.from + t.to}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                  isWorst ? "border-rose-300 bg-rose-50 dark:bg-rose-950/30" : "border-border bg-secondary/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ArrowDown className={`h-3.5 w-3.5 ${isWorst ? "text-rose-600" : "text-muted-foreground"}`} />
                  <span className="font-medium text-foreground">{t.from} → {t.to}</span>
                </div>
                <div className="text-right tabular-nums">
                  <div className={`font-semibold ${isWorst ? "text-rose-600" : "text-foreground"}`}>
                    {t.rate}% giữ lại
                  </div>
                  <div className="text-[10px] text-muted-foreground">rơi {t.drop}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
        <span className="font-semibold text-primary">Insight: </span>{insight}
      </div>
    </Card>
  );
}

/* ===== Insight + Warning panel ===== */
function InsightWarningPanel({ insights, warnings }: { insights: string[]; warnings: { text: string }[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-l-4 border-l-primary p-5 shadow-card-soft">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-display text-base font-semibold">Insight tự động</h3>
          <Badge variant="secondary" className="ml-auto text-[10px]">{insights.length} insight</Badge>
        </div>
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">Dữ liệu ổn định — chưa có biến động đáng chú ý.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {insights.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-brand" />
                <span className="text-foreground">{t}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="border-l-4 border-l-rose-500 p-5 shadow-card-soft">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          <h3 className="font-display text-base font-semibold">Cảnh báo</h3>
          <Badge variant="secondary" className="ml-auto text-[10px]">{warnings.length} cảnh báo</Badge>
        </div>
        {warnings.length === 0 ? (
          <p className="text-sm text-muted-foreground">✅ Không có chỉ số nào vượt ngưỡng cảnh báo.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {warnings.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-rose-500">⚠️</span>
                <span className="text-foreground">{w.text}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/* ===== Recommendations ===== */
function Recommendations({ recs }: { recs: string[] }) {
  const [horizon, ...items] = recs;
  return (
    <Card className="border-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-5 text-white shadow-elegant">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb className="h-5 w-5" />
        <h3 className="font-display text-base font-semibold">Khuyến nghị hành động</h3>
        <Badge className="ml-auto bg-white/20 text-white hover:bg-white/20">{horizon}</Badge>
      </div>
      <ol className="space-y-2 text-sm">
        {items.map((r, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">{i + 1}</span>
            <span className="leading-relaxed">{r}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/* ===== Main export ===== */
export function FanpageDecisionDashboard({
  aggregated,
  period,
  periodLabel,
}: {
  aggregated: FanpageAggRow[];
  period: Period;
  periodLabel: string;
}) {
  const last = aggregated[aggregated.length - 1];
  const prev = aggregated[aggregated.length - 2] ?? last;

  const insights = generateInsights(last, prev, periodLabel);
  const warnings = generateWarnings(last, prev);
  const recs = generateRecommendations(last, prev, period);

  return (
    <div className="space-y-6">
      <KPISummary last={last} prev={prev} periodLabel={periodLabel} />
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <ConsolidatedFunnel last={last} />
        </div>
        <div className="xl:col-span-5">
          <InsightWarningPanel insights={insights} warnings={warnings} />
        </div>
      </div>
      {/* Khuyến nghị sẽ render sau biểu đồ chi tiết, ở component cha */}
      <RecommendationsHidden recs={recs} />
    </div>
  );
}

// Trick để cha có thể đặt Recommendations sau biểu đồ chi tiết:
// Xuất riêng để cha gọi sau cùng.
function RecommendationsHidden(_: { recs: string[] }) {
  return null;
}

export function FanpageRecommendations({
  aggregated,
  period,
  periodLabel: _periodLabel,
}: {
  aggregated: FanpageAggRow[];
  period: Period;
  periodLabel: string;
}) {
  const last = aggregated[aggregated.length - 1];
  const prev = aggregated[aggregated.length - 2] ?? last;
  const recs = generateRecommendations(last, prev, period);
  return <Recommendations recs={recs} />;
}