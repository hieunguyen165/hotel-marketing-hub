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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-gold shadow-gold">
            <Hotel className="h-5 w-5 text-primary" strokeWidth={2.2} />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-semibold text-sidebar-foreground">
                D'lioro
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
                Marketing Hub
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 py-3">
        {groups.map((g) => (
          <SidebarGroup key={g}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/50">
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
                              ? "bg-sidebar-accent text-sidebar-primary font-medium"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                          }`}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-sidebar-primary" />
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
            <p className="text-[11px] text-sidebar-foreground/50">
              © D'lioro Hotel · v1.0
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
