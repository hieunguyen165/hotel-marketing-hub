import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  KeyRound,
  FolderOpen,
  LineChart,
  CheckSquare,
  Sparkles,
  Users as UsersIcon,
  LogOut,
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
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

type Item = { title: string; url: string; icon: any; group: string; color: string; adminOnly?: boolean };

const items: Item[] = [
  { title: "Tổng quan",            url: "/",          icon: LayoutDashboard, group: "Điều hành",  color: "from-violet-500 to-fuchsia-500" },
  { title: "Tài khoản & mật khẩu", url: "/accounts",  icon: KeyRound,        group: "Tài sản số", color: "from-amber-500 to-orange-500", adminOnly: true },
  { title: "Kho tài nguyên",       url: "/resources", icon: FolderOpen,      group: "Tài sản số", color: "from-sky-500 to-blue-600" },
  { title: "Báo cáo marketing",    url: "/reports",   icon: LineChart,       group: "Vận hành",   color: "from-emerald-500 to-teal-500" },
  { title: "Checklist công việc",  url: "/checklist", icon: CheckSquare,     group: "Vận hành",   color: "from-pink-500 to-rose-500" },
  { title: "Người dùng",           url: "/users",     icon: UsersIcon,       group: "Quản trị",   color: "from-red-500 to-rose-600", adminOnly: true },
];

const groups = ["Điều hành", "Tài sản số", "Vận hành", "Quản trị"] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { isAdmin, user, role, signOut } = useAuth();

  const visibleItems = items.filter((i) => !i.adminOnly || isAdmin);
  const visibleGroups = groups.filter((g) => visibleItems.some((i) => i.group === g));

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
        {visibleGroups.map((g) => (
          <SidebarGroup key={g}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">
                {g}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleItems.filter((i) => i.group === g).map((item) => {
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
        {!collapsed ? (
          <div className="px-2 py-2 space-y-2">
            {user && (
              <div className="rounded-lg bg-sidebar-accent/40 px-2.5 py-2">
                <div className="truncate text-xs font-medium text-sidebar-foreground">
                  {user.user_metadata?.full_name || user.email}
                </div>
                <div className="truncate text-[10px] text-sidebar-foreground/60">
                  {role === "admin" ? "Quản trị viên" : role === "manager" ? "Quản lý" : "Thành viên"}
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" /> Đăng xuất
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => signOut()} title="Đăng xuất">
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
