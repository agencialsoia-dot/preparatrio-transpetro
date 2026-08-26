import {
  BarChart3, BookOpen, GraduationCap, History, LayoutDashboard,
  ListChecks, ListTree, TriangleAlert,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, primary: true },
  { href: "/edital", label: "Meu Edital", icon: ListTree, primary: true },
  { href: "/conteudos", label: "Conteúdos", icon: GraduationCap, primary: false },
  { href: "/questoes", label: "Questões", icon: BookOpen, primary: true },
  { href: "/simulados", label: "Simulados", icon: ListChecks, primary: true },
  { href: "/desempenho", label: "Desempenho", icon: BarChart3, primary: false },
  { href: "/erros", label: "Meus Erros", icon: TriangleAlert, primary: false },
  { href: "/historico", label: "Histórico", icon: History, primary: false },
] as const;
