import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Toaster, toast } from "sonner";

export const Route = createFileRoute("/admin/login")({ component: AdminLogin });

const USERNAME_EMAIL_DOMAIN = "admin.cookify.local";

function AdminLogin() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      toast.error("Username hanya boleh huruf, angka, titik, garis, underscore");
      return;
    }
    const syntheticEmail = `${cleanUsername}@${USERNAME_EMAIL_DOMAIN}`;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password,
      });
      if (error) return toast.error("Username atau password salah");
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      if (roleError) {
        await supabase.auth.signOut();
        return toast.error("Gagal memeriksa akses admin. Coba lagi sebentar.");
      }

      const isAdmin = roles?.some((r: { role: string }) => r.role === "admin");
      if (!isAdmin) {
        await supabase.auth.signOut();
        return toast.error("Akun ini bukan admin");
      }
      toast.success("Login berhasil");
      nav({ to: "/admin" });
    } catch (error) {
      const message =
        error instanceof Error && error.message === "Failed to fetch"
          ? "Koneksi backend belum siap. Tunggu sebentar lalu coba login lagi."
          : "Login gagal. Periksa koneksi lalu coba lagi.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfaf3] px-4">
      <Toaster richColors position="top-center" />
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8B5E34] text-white">
            <img src="/logo cookify.png" alt="Cookify" />
          </div>
          <h1 className="mt-3 text-xl font-bold text-[#3B2F1E]">Admin Cookify</h1>
          <p className="text-sm text-[#8B5E34]">Masuk ke dashboard</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-md border border-[#e8dcc8] px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-[#e8dcc8] px-3 py-2 text-sm"
          />
          <button
            disabled={loading}
            className="w-full rounded-md bg-[#8B5E34] py-2.5 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
