import React from "react";
import { Home, LayoutDashboard, ListOrdered, Sparkles, MessageSquare, PiggyBank, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", path: "/transactions", icon: ListOrdered },
  { label: "Budgets", path: "/budgets", icon: PiggyBank },
  { label: "AI Advisor", path: "/insights", icon: Sparkles },
  { label: "Chat Support", path: "/ai-chat", icon: MessageSquare },
  { label: "Settings", path: "/settings", icon: Settings },
];
export function AppSidebar(): JSX.Element {
  const { pathname } = useLocation();
  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-900 to-emerald-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">FinSight AI</h1>
            <p className="text-2xs text-muted-foreground uppercase tracking-widest font-semibold">Premium Finance</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.path}
                  className={pathname === item.path ? "bg-accent/50 text-foreground" : "text-muted-foreground hover:text-foreground"}
                >
                  <Link to={item.path}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6 border-t border-border/50">
        <div className="flex flex-col gap-1">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
            Premium Support Active
          </div>
          <div className="text-2xs text-muted-foreground/60">
            &copy; 2025 FinSight Systems
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}