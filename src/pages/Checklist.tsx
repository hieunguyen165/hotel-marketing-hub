import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { checklist as initial, ChecklistItem } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { User2, Clock } from "lucide-react";

const frequencies = ["Tất cả", "Hàng ngày", "Hàng tuần", "Hàng tháng"] as const;

const Checklist = () => {
  const [items, setItems] = useState<ChecklistItem[]>(initial);
  const [filter, setFilter] = useState<(typeof frequencies)[number]>("Tất cả");

  const toggle = (id: string) =>
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  const filtered = items.filter((i) => filter === "Tất cả" || i.frequency === filter);
  const doneCount = items.filter((i) => i.done).length;
  const progress = Math.round((doneCount / items.length) * 100);

  const groupedByArea = filtered.reduce<Record<string, ChecklistItem[]>>((acc, i) => {
    (acc[i.area] ||= []).push(i);
    return acc;
  }, {});

  return (
    <AppLayout
      title="Checklist công việc marketing"
      subtitle="Việc lặp lại — để team không phụ thuộc vào trí nhớ cá nhân"
    >
      {/* Progress overview */}
      <Card className="mb-6 overflow-hidden border-0 bg-gradient-primary p-6 text-primary-foreground shadow-elegant">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-primary-foreground/70">Tiến độ tuần này</p>
            <p className="font-display text-3xl font-semibold">
              {doneCount}<span className="text-primary-foreground/60">/{items.length}</span> việc đã hoàn thành
            </p>
          </div>
          <div className="md:w-1/2">
            <Progress value={progress} className="h-3 bg-primary-foreground/15" />
            <p className="mt-2 text-right text-xs text-primary-foreground/70">{progress}%</p>
          </div>
        </div>
      </Card>

      {/* Filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {frequencies.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-smooth ${
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grouped lists */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(groupedByArea).map(([area, arr]) => (
          <Card key={area} className="p-5 shadow-card-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">{area}</h3>
              <Badge variant="outline">{arr.filter((i) => i.done).length}/{arr.length}</Badge>
            </div>
            <ul className="space-y-3">
              {arr.map((i) => (
                <li
                  key={i.id}
                  className={`flex items-start gap-3 rounded-md border p-3 transition-smooth ${
                    i.done ? "border-success/20 bg-success/5" : "border-border bg-secondary/30 hover:border-primary/20"
                  }`}
                >
                  <Checkbox checked={i.done} onCheckedChange={() => toggle(i.id)} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${i.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {i.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {i.frequency}</span>
                      <span className="flex items-center gap-1"><User2 className="h-3 w-3" /> {i.owner}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
};

export default Checklist;
