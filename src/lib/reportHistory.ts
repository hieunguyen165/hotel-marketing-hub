import type { GA4Report } from "./ga4Parser";

const STORAGE_KEY = "website-report-history-v1";

export type StoredReport = GA4Report & {
  id: string;       // unique
  savedAt: string;  // ISO timestamp
};

export type PeriodMode = "week" | "month" | "year";

/* ---------- Storage ---------- */
export function loadReports(): StoredReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as StoredReport[];
    return arr.sort((a, b) => a.endDate.localeCompare(b.endDate));
  } catch {
    return [];
  }
}

export function saveReports(list: StoredReport[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Insert or replace by (startDate,endDate) — same kỳ ghi đè. */
export function upsertReport(r: GA4Report): StoredReport[] {
  const list = loadReports();
  const key = `${r.startDate}__${r.endDate}`;
  const existingIdx = list.findIndex((x) => `${x.startDate}__${x.endDate}` === key);
  const stored: StoredReport = {
    ...r,
    id: existingIdx >= 0 ? list[existingIdx].id : `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: new Date().toISOString(),
  };
  if (existingIdx >= 0) list[existingIdx] = stored;
  else list.push(stored);
  list.sort((a, b) => a.endDate.localeCompare(b.endDate));
  saveReports(list);
  return list;
}

export function deleteReport(id: string): StoredReport[] {
  const list = loadReports().filter((r) => r.id !== id);
  saveReports(list);
  return list;
}

/* ---------- Period helpers ---------- */
function parseISO(d: string): Date {
  const [y, m, dd] = d.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, dd ?? 1);
}

/** ISO week number (1..53) */
function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

/** Return the period key + label of a report based on its endDate */
export function periodOf(r: { endDate: string }, mode: PeriodMode): { key: string; label: string } {
  const d = parseISO(r.endDate);
  if (mode === "week") {
    const { year, week } = isoWeek(d);
    return { key: `${year}-W${String(week).padStart(2, "0")}`, label: `Tuần ${week}/${year}` };
  }
  if (mode === "month") {
    const m = d.getMonth() + 1;
    return { key: `${d.getFullYear()}-${String(m).padStart(2, "0")}`, label: `T${String(m).padStart(2, "0")}/${d.getFullYear()}` };
  }
  return { key: `${d.getFullYear()}`, label: `Năm ${d.getFullYear()}` };
}

export type PeriodBucket = {
  key: string;
  label: string;
  reports: StoredReport[];
  views: number;
  users: number;
  newUsers: number;
  events: number;
  bounceRate: number;       // weighted by views
  engagementSec: number;    // weighted by users
};

/** Aggregate stored reports into period buckets, sorted ascending by key. */
export function aggregateByPeriod(list: StoredReport[], mode: PeriodMode): PeriodBucket[] {
  const map = new Map<string, PeriodBucket>();
  for (const r of list) {
    const { key, label } = periodOf(r, mode);
    let b = map.get(key);
    if (!b) {
      b = { key, label, reports: [], views: 0, users: 0, newUsers: 0, events: 0, bounceRate: 0, engagementSec: 0 };
      map.set(key, b);
    }
    b.reports.push(r);
    b.views += r.kpi.totalViews;
    b.users += r.kpi.activeUsers;
    b.newUsers += r.kpi.newUsers;
    b.events += r.kpi.events;
  }
  // Weighted averages for rates
  for (const b of map.values()) {
    const totalViews = b.reports.reduce((s, r) => s + r.kpi.totalViews, 0) || 1;
    const totalUsers = b.reports.reduce((s, r) => s + r.kpi.activeUsers, 0) || 1;
    b.bounceRate =
      b.reports.reduce((s, r) => s + r.kpi.avgBounceRate * r.kpi.totalViews, 0) / totalViews;
    b.engagementSec = Math.round(
      b.reports.reduce((s, r) => s + r.kpi.avgEngagementSec * r.kpi.activeUsers, 0) / totalUsers,
    );
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}