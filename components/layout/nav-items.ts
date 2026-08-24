import { BarChart3, BookOpen, History, LayoutDashboard, ListChecks } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/estudar", label: "Questões", icon: BookOpen },
  { href: "/simulados", label: "Simulados", icon: ListChecks },
  { href: "/desempenho", label: "Desempenho", icon: BarChart3 },
  { href: "/historico", label: "Histórico", icon: History },
] as const;
