import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  KeyRound,
  FolderOpen,
  LineChart,
  CheckSquare,
  Hotel,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Tổng quan", url: "/", icon: LayoutDashboard, group: "Điều hành" },
  { title: "Tài khoản & mật khẩu", url: "/accounts", icon: KeyRound, group: "Tài sản số" },
  { title: "Kho tài nguyên", url: "/resources", icon: FolderOpen, group: "Tài sản số" },
  { title: "Báo cáo marketing", url: "/reports", icon: LineChart, group: "Vận hành" },
  { title: "Checklist công việc", url: "/checklist", icon: CheckSquare, group: "Vận hành" },
];

const groups = ["Điều hành", "Tài sản số", "Vận hành"] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-gold shadow-gold">
            <span className="font-display text-base font-bold text-primary-foreground">D</span>
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-sidebar" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-semibold tracking-tight text-sidebar-foreground">
                D'lioro<span className="text-sidebar-primary">.</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/50">
                Marketing · Hub
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 py-3">
        {groups.map((g) => (
          <SidebarGroup key={g}>
            {!collapsed && (
              <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/40">
                {g}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {items.filter((i) => i.group === g).map((item) => {
                  const active = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink
                          to={item.url}
                          end
                          className={`group/item relative flex items-center gap-3 rounded-md transition-smooth ${
                            active
                              ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-[inset_0_1px_0_hsl(40_20%_90%/0.04)]"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                          }`}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-sidebar-primary shadow-[0_0_12px_hsl(38_80%_55%/0.6)]" />
                          )}
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-2 py-2">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-sidebar-foreground/40">
              <span>v1.0.0</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                online
              </span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
