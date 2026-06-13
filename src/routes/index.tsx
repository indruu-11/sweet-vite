import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { rupiah } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { toast, Toaster } from "sonner";
import { Sparkles, Leaf, Truck, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

type Product = {
  id: string; name: string; category: string; price: number;
  description: string | null; image_url: string | null; is_active: boolean;
};

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const cart = useCart();

  useEffect(() => {
    supabase.from("products").select("*").eq("is_active", true).order("created_at")
      .then(({ data }) => setProducts((data as Product[]) || []));
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfaf3] text-[#3B2F1E]">
      <Toaster richColors position="top-center" />
      <SiteNav />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Cookies & Brownies<br />Fresh For You
            </h1>
            <p className="mt-4 max-w-md text-[#6b5742]">
              Kami menyediakan cookies dan brownies dengan bahan berkualitas dan rasa terbaik untuk setiap momen spesialmu.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/order" className="rounded-md bg-[#8B5E34] px-6 py-3 font-medium text-white hover:bg-[#6f4a28]">
                Pesan Sekarang
              </Link>
              <Link to="/menu" className="rounded-md border border-[#8B5E34] px-6 py-3 font-medium text-[#8B5E34] hover:bg-[#8B5E34]/10">
                Lihat Menu
              </Link>
            </div>
          </div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-[#f0e6d2]">
          <img
             src="/gambar home page.png"
  alt="Cookies and brownies"
  className="h-full w-full object-cover"
/>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-6 text-center text-2xl font-bold">Produk Favorit</h2>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {products.slice(0, 6).map(p => (
            <div key={p.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="aspect-square bg-[#f0e6d2]">
                {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover"/>}
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-[#8B5E34]">{rupiah(p.price)}</p>
                <button
                  onClick={() => { cart.add({ id: p.id, name: p.name, price: p.price }); toast.success(`${p.name} ditambahkan`); }}
                  className="mt-3 w-full rounded-md border border-[#8B5E34] py-2 text-sm font-medium text-[#8B5E34] hover:bg-[#8B5E34] hover:text-white"
                >
                  Pesan
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto mt-8 max-w-6xl px-4 py-8">
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-white p-6 md:grid-cols-4">
          {[
            { i: Sparkles, t: "Bahan Berkualitas" },
            { i: Leaf, t: "Tanpa Pengawet" },
            { i: ShieldCheck, t: "Diproduksi Fresh" },
            { i: Truck, t: "Pengiriman Cepat" },
          ].map(({i: Icon, t}) => (
            <div key={t} className="flex flex-col items-center gap-2 text-center text-sm">
              <Icon className="h-6 w-6 text-[#8B5E34]" /> {t}
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
