import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppLayout({ title, subtitle, actions, children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-background">
        {/* ambient mesh */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-mesh" />
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-8">
            <SidebarTrigger className="text-foreground" />
            <div className="flex flex-1 items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="truncate font-display text-lg font-bold tracking-tight text-foreground md:text-xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="truncate text-xs text-muted-foreground md:text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground shadow-card-soft md:flex">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  Hệ thống đang hoạt động
                </div>
                {actions}
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 animate-fade-in">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
