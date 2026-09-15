import { NavLink, Outlet } from "react-router-dom";
import { Brain, Code2, DollarSign, Megaphone, Users, Wallet, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";

const nav = [
  { to: "/company-os", label: "CEO Dashboard", icon: LayoutDashboard, end: true },
  { to: "/company-os/decisions", label: "Decision Queue", icon: ShieldCheck },
  { to: "/company-os/engineering", label: "Engineering", icon: Code2 },
  { to: "/company-os/sales", label: "Sales", icon: DollarSign },
  { to: "/company-os/marketing", label: "Marketing", icon: Megaphone },
  { to: "/company-os/hr", label: "HR & Hiring", icon: Users },
  { to: "/company-os/finance", label: "Finance", icon: Wallet },
];

export default function CompanyOSLayout() {
  const { userRole, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 text-muted-foreground">Loading Company OS…</div>
    );
  }

  if (userRole?.role !== "super_admin") {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-8 text-center">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="text-2xl font-semibold mb-2">Superuser Access Required</h1>
          <p className="text-muted-foreground">
            The AI Company OS is reserved for the CEO (super admin). Ask your administrator to grant access.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center gap-3 py-4">
          <Brain className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-semibold">AI Company OS</h1>
            <p className="text-xs text-muted-foreground">Virtual CEO • 5 autonomous departments</p>
          </div>
        </div>
      </header>
      <div className="container mx-auto grid grid-cols-1 gap-6 py-6 md:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
