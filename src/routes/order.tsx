import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { rupiah } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { Toaster, toast } from "sonner";
import { Trash2, Plus, Minus } from "lucide-react";
import { QrisPanel } from "@/components/QrisPanel";

export const Route = createFileRoute("/order")({ component: OrderPage });

function OrderPage() {
  const cart = useCart();
  const nav = useNavigate();
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", address: "", notes: "" });
  const [paymentMethod, setPaymentMethod] = useState("Bayar di Toko");
  const [loading, setLoading] = useState(false);

  const PAYMENTS = ["QRIS", "Bayar di Toko"];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) return toast.error("Keranjang kosong, pilih produk dulu");
    if (!form.customer_name || !form.customer_phone || !form.address) return toast.error("Lengkapi data pemesan");
    setLoading(true);
    const d = new Date();
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const rnd = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    const orderNumber = `LKST-${yy}${mm}${dd}-${rnd}`;
    const { error } = await supabase.from("orders").insert({
      order_number: orderNumber,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      address: form.address,
      notes: form.notes || null,
      items: cart.items,
      total: cart.total,
      payment_method: paymentMethod,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Pesanan berhasil dibuat!");
    cart.clear();
    nav({ to: "/status", search: { no: orderNumber } as any });
  };

  return (
    <div className="min-h-screen bg-[#fdfaf3] text-[#3B2F1E]">
      <Toaster richColors position="top-center" />
      <SiteNav />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Keranjang</h2>
          <p className="mt-1 text-sm text-[#8B5E34]">Item yang akan dipesan</p>
          <div className="mt-4 space-y-3">
            {cart.items.length === 0 && <p className="text-sm text-[#8B5E34]">Keranjang kosong. Tambahkan dari menu.</p>}
            {cart.items.map(it => (
              <div key={it.id} className="flex items-center justify-between border-b border-[#f0e6d2] pb-3">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-[#8B5E34]">{rupiah(it.price)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => cart.setQty(it.id, it.qty - 1)} className="rounded border border-[#e8dcc8] p-1"><Minus className="h-4 w-4"/></button>
                  <span className="w-6 text-center">{it.qty}</span>
                  <button onClick={() => cart.setQty(it.id, it.qty + 1)} className="rounded border border-[#e8dcc8] p-1"><Plus className="h-4 w-4"/></button>
                  <button onClick={() => cart.remove(it.id)} className="ml-2 rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4"/></button>
                </div>
              </div>
            ))}
          </div>
          {cart.items.length > 0 && (
            <div className="mt-4 flex justify-between border-t border-[#e8dcc8] pt-3 font-semibold">
              <span>Total</span><span>{rupiah(cart.total)}</span>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Form Pemesanan</h2>
          <p className="mt-1 text-sm text-[#8B5E34]">Isi data di bawah untuk melakukan pemesanan</p>
          <div className="mt-4 space-y-4">
            {[
              { k: "customer_name", l: "Nama Lengkap", p: "Masukkan nama lengkap" },
              { k: "customer_phone", l: "Nomor WhatsApp", p: "08xxxxxxxxxx" },
              { k: "address", l: "Alamat Pengiriman", p: "Masukkan alamat lengkap", area: true },
              { k: "notes", l: "Catatan (Opsional)", p: "Catatan tambahan", area: true },
            ].map(f => (
              <div key={f.k}>
                <label className="text-sm font-medium">{f.l}</label>
                {f.area ? (
                  <textarea
                    value={(form as any)[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })}
                    placeholder={f.p} rows={3}
                    className="mt-1 w-full rounded-md border border-[#e8dcc8] bg-white px-3 py-2 text-sm outline-none focus:border-[#8B5E34]"
                  />
                ) : (
                  <input
                    value={(form as any)[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })}
                    placeholder={f.p}
                    className="mt-1 w-full rounded-md border border-[#e8dcc8] bg-white px-3 py-2 text-sm outline-none focus:border-[#8B5E34]"
                  />
                )}
              </div>
            ))}
            <div>
              <label className="text-sm font-medium">Metode Pembayaran</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {PAYMENTS.map(p => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPaymentMethod(p)}
                    className={`rounded-md border px-3 py-2 text-sm ${paymentMethod === p ? "border-[#8B5E34] bg-[#8B5E34] text-white" : "border-[#e8dcc8] bg-white text-[#3B2F1E] hover:border-[#8B5E34]"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {paymentMethod === "QRIS" && cart.items.length > 0 && (
            <div className="mt-4">
              <QrisPanel total={cart.total} />
            </div>
          )}
          <button disabled={loading} className="mt-6 w-full rounded-md bg-[#8B5E34] py-3 font-medium text-white hover:bg-[#6f4a28] disabled:opacity-60">
            {loading ? "Mengirim..." : "Kirim Pesanan"}
          </button>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}
