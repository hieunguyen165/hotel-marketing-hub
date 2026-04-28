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
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md md:px-8">
            <SidebarTrigger className="text-foreground" />
            <div className="flex flex-1 items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="truncate font-display text-xl font-semibold text-foreground md:text-2xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="truncate text-xs text-muted-foreground md:text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
