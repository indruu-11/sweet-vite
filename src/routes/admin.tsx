import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, ShoppingCart, Package, LogOut, Cookie } from "lucide-react";
import { Toaster } from "sonner";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const [checking, setChecking] = useState(true);

  const isLoginRoute = loc.pathname === "/admin/login";

  useEffect(() => {
    if (isLoginRoute) { setChecking(false); return; }
    let active = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { nav({ to: "/admin/login" }); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      const isAdmin = roles?.some((r: any) => r.role === "admin");
      if (!active) return;
      if (!isAdmin) { await supabase.auth.signOut(); nav({ to: "/admin/login" }); return; }
      setChecking(false);
    }).catch(() => {
      if (!active) return;
      setChecking(false);
      nav({ to: "/admin/login" });
    });
    return () => { active = false; };
  }, [nav, isLoginRoute]);

  const logout = async () => { await supabase.auth.signOut(); nav({ to: "/admin/login" }); };

  if (isLoginRoute) return <><Toaster richColors position="top-center" /><Outlet /></>;

  if (checking) return <div className="flex min-h-screen items-center justify-center bg-[#fdfaf3] text-[#8B5E34]">Memuat...</div>;

  const items = [
    { to: "/admin", l: "Dashboard", i: LayoutDashboard, exact: true },
    { to: "/admin/orders", l: "Data Pesanan", i: ShoppingCart },
    { to: "/admin/products", l: "Manajemen Produk", i: Package },
  ];

  return (
    <div className="flex min-h-screen bg-[#fdfaf3]">
      <Toaster richColors position="top-center" />
      <aside className="hidden w-60 flex-col border-r border-[#e8dcc8] bg-[#2a2018] p-4 text-white md:flex">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B5E34]">
            <img src="/logo cookify.png"></img>
          </div>
          <div>
            <div className="text-sm font-bold">Cookify</div>
            <div className="text-[10px] text-[#c9b39a]">Dashboard</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {items.map(it => {
            const active = it.exact ? loc.pathname === it.to : loc.pathname.startsWith(it.to);
            return (
              <Link key={it.to} to={it.to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${active ? "bg-[#8B5E34]" : "hover:bg-[#3b2f1e]"}`}>
                <it.i className="h-4 w-4" /> {it.l}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="mt-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[#3b2f1e]">
          <LogOut className="h-4 w-4"/> Logout
        </button>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <div className="md:hidden mb-4 flex gap-2 overflow-x-auto">
          {items.map(it => (
            <Link key={it.to} to={it.to} className="rounded-md bg-white px-3 py-2 text-xs shadow-sm">{it.l}</Link>
          ))}
          <button onClick={logout} className="rounded-md bg-white px-3 py-2 text-xs shadow-sm">Logout</button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
