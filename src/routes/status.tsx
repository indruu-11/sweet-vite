import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { rupiah, formatDate } from "@/lib/format";
import { QrisPanel } from "@/components/QrisPanel";

export const Route = createFileRoute("/status")({
  component: StatusPage,
  validateSearch: (s: Record<string, unknown>): { no?: string } =>
    s.no ? { no: String(s.no) } : {},
});

type Order = {
  id: string; order_number: string; customer_name: string; status: string;
  payment_status: string; payment_method: string; total: number; items: any; created_at: string;
};

const STEPS = ["Pesanan Diterima", "Diproses", "Siap Dikirim", "Selesai"];

function StatusPage() {
  const { no } = useSearch({ from: "/status" });
  const [orderNo, setOrderNo] = useState(no || "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  const find = async () => {
    if (!orderNo || !phone) return;
    setSearched(true);
    const { data } = await supabase.rpc("lookup_order", {
      _order_number: orderNo.trim(),
      _phone: phone.trim(),
    });
    const row = Array.isArray(data) && data.length > 0 ? (data[0] as unknown as Order) : null;
    setOrder(row);
  };

  const stepIndex = order ? STEPS.findIndex(s => s.toLowerCase().includes(order.status.toLowerCase())) : -1;

  return (
    <div className="min-h-screen bg-[#fdfaf3] text-[#3B2F1E]">
      <SiteNav />
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold">Status Pesanan</h1>
        <p className="mt-1 text-sm text-[#8B5E34]">Masukkan nomor pesanan dan nomor WhatsApp yang digunakan saat memesan.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input value={orderNo} onChange={e => setOrderNo(e.target.value)}
            placeholder="No. pesanan (LKST-...)"
            className="rounded-md border border-[#e8dcc8] bg-white px-3 py-2 text-sm"/>
          <input value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="Nomor WhatsApp"
            className="rounded-md border border-[#e8dcc8] bg-white px-3 py-2 text-sm"/>
          <button onClick={find} className="rounded-md bg-[#8B5E34] px-4 py-2 text-sm font-medium text-white">Cari</button>
        </div>

        {searched && !order && <p className="mt-8 text-center text-[#8B5E34]">Pesanan tidak ditemukan.</p>}

        {order && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#8B5E34]">No. Pesanan</div>
                  <div className="font-bold">{order.order_number}</div>
                </div>
                <span className="rounded-full bg-[#f0e6d2] px-3 py-1 text-xs font-medium text-[#8B5E34]">{order.status}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div><div className="text-xs text-[#8B5E34]">Tanggal</div>{formatDate(order.created_at)}</div>
                <div><div className="text-xs text-[#8B5E34]">Total</div>{rupiah(order.total)}</div>
              </div>
              <div className="mt-4 border-t border-[#f0e6d2] pt-3">
                <div className="mb-2 text-sm font-semibold">Detail Pesanan</div>
                {(order.items as any[]).map((it, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{it.qty}× {it.name}</span><span>{rupiah(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold">Progres Pesanan</div>
                <ol className="mt-4 space-y-4">
                  {STEPS.map((s, i) => {
                    const active = i <= Math.max(stepIndex, 0);
                    return (
                      <li key={s} className="flex items-start gap-3">
                        <div className={`mt-0.5 h-5 w-5 rounded-full ${active ? "bg-[#8B5E34]" : "bg-[#e8dcc8]"}`}/>
                        <div>
                          <div className={`text-sm font-medium ${active ? "text-[#3B2F1E]" : "text-[#a89b85]"}`}>{s}</div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
              {order.payment_method === "QRIS" && (
                <QrisPanel
                  total={order.total}
                  orderNumber={order.order_number}
                  paid={order.payment_status === "Lunas"}
                />
              )}
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
