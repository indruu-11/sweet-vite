import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { rupiah } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { Toaster, toast } from "sonner";
import { ProductReviewsModal, Stars } from "@/components/ProductReviews";

export const Route = createFileRoute("/menu")({ component: Menu });

type Product = { id: string; name: string; category: string; price: number; image_url: string | null; is_active: boolean };
type RatingAgg = { avg: number; count: number };

const CATS = [
  { v: "all", l: "Semua" },
  { v: "cookies", l: "Cookies" },
  { v: "brownies", l: "Brownies" },
  { v: "dessert_box", l: "Special Menu" },
];

function Menu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cat, setCat] = useState("all");
  const [ratings, setRatings] = useState<Record<string, RatingAgg>>({});
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const cart = useCart();

  const loadRatings = async () => {
    const { data } = await supabase.from("reviews").select("product_id, rating");
    const agg: Record<string, { sum: number; count: number }> = {};
    (data || []).forEach((r: any) => {
      if (!agg[r.product_id]) agg[r.product_id] = { sum: 0, count: 0 };
      agg[r.product_id].sum += r.rating;
      agg[r.product_id].count += 1;
    });
    const out: Record<string, RatingAgg> = {};
    Object.entries(agg).forEach(([k, v]) => { out[k] = { avg: v.sum / v.count, count: v.count }; });
    setRatings(out);
  };

  useEffect(() => {
    supabase.from("products").select("*").eq("is_active", true).order("created_at")
      .then(({ data }) => setProducts((data as Product[]) || []));
    loadRatings();
  }, []);

  const filtered = cat === "all" ? products : products.filter(p => p.category === cat);

  return (
    <div className="min-h-screen bg-[#fdfaf3] text-[#3B2F1E]">
      <Toaster richColors position="top-center" />
      <SiteNav />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-6 text-3xl font-bold">Menu Produk</h1>
        <div className="mb-6 flex flex-wrap gap-2">
          {CATS.map(c => (
            <button key={c.v} onClick={() => setCat(c.v)}
              className={`rounded-full border px-4 py-1.5 text-sm ${cat===c.v ? "bg-[#8B5E34] text-white border-[#8B5E34]" : "border-[#e8dcc8] bg-white"}`}>
              {c.l}
            </button>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map(p => {
            const r = ratings[p.id];
            return (
              <div key={p.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="aspect-square bg-[#f0e6d2]">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover"/>}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-[#8B5E34]">{rupiah(p.price)}</p>
                  <button
                    onClick={() => setReviewProduct(p)}
                    className="mt-2 flex items-center gap-1.5 text-xs text-[#8B5E34] hover:underline"
                  >
                    <Stars value={r?.avg ?? 0} />
                    <span>{r ? `${r.avg.toFixed(1)} (${r.count})` : "Belum ada ulasan"}</span>
                  </button>
                  <button
                    onClick={() => { cart.add({ id: p.id, name: p.name, price: p.price }); toast.success(`${p.name} ditambahkan`); }}
                    className="mt-3 w-full rounded-md border border-[#8B5E34] py-2 text-sm font-medium text-[#8B5E34] hover:bg-[#8B5E34] hover:text-white"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="col-span-full text-center text-[#8B5E34]">Belum ada produk.</p>}
        </div>
        <div className="mt-8 text-center">
          <Link to="/order" className="rounded-md bg-[#8B5E34] px-6 py-3 font-medium text-white">Lanjut ke Pemesanan</Link>
        </div>
      </section>
      <SiteFooter />
      {reviewProduct && (
        <ProductReviewsModal
          productId={reviewProduct.id}
          productName={reviewProduct.name}
          onClose={() => setReviewProduct(null)}
          onChanged={loadRatings}
        />
      )}
    </div>
  );
}
