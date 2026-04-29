import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  KeyRound,
  FolderOpen,
  LineChart,
  CheckSquare,
  Sparkles,
  Globe,
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
  { title: "Tổng quan",            url: "/",          icon: LayoutDashboard, group: "Điều hành",  color: "from-violet-500 to-fuchsia-500" },
  { title: "Tài khoản & mật khẩu", url: "/accounts",  icon: KeyRound,        group: "Tài sản số", color: "from-amber-500 to-orange-500" },
  { title: "Kho tài nguyên",       url: "/resources", icon: FolderOpen,      group: "Tài sản số", color: "from-sky-500 to-blue-600" },
  { title: "Báo cáo marketing",    url: "/reports",   icon: LineChart,       group: "Vận hành",   color: "from-emerald-500 to-teal-500" },
  { title: "Báo cáo Website",      url: "/website-reports", icon: Globe,    group: "Vận hành",   color: "from-violet-500 to-fuchsia-500" },
  { title: "Checklist công việc",  url: "/checklist", icon: CheckSquare,     group: "Vận hành",   color: "from-pink-500 to-rose-500" },
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
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand shadow-gold">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.4} />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold tracking-tight text-sidebar-foreground">
                D'lioro<span className="text-gradient-brand">Hub</span>
              </span>
              <span className="text-[11px] text-sidebar-foreground/60">
                Marketing Center
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 py-3">
        {groups.map((g) => (
          <SidebarGroup key={g}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">
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
                          className={`group/item relative flex items-center gap-3 rounded-xl px-2 py-2 transition-smooth ${
                            active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} text-white shadow-sm`}>
                            <item.icon className="h-4 w-4" strokeWidth={2.2} />
                          </span>
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
            <div className="flex items-center justify-between text-[11px] text-sidebar-foreground/50">
              <span>v1.0.0</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Online
              </span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
