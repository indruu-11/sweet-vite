import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rupiah, formatDate } from "@/lib/format";
import { Toaster, toast } from "sonner";
import { Eye, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

const STATUS = ["Diproses", "Siap Dikirim", "Selesai", "Dibatalkan"];
const PAY = ["Belum Bayar", "Lunas"];

function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [view, setView] = useState<any | null>(null);

  const load = () => supabase.from("orders").select("*").order("created_at", { ascending: false })
    .then(({ data }) => setOrders(data || []));

  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Pesanan diperbarui");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus pesanan ini?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Pesanan dihapus");
    load();
  };

  return (
    <div className="space-y-4">
      <Toaster richColors position="top-center" />
      <h1 className="text-2xl font-bold text-[#3B2F1E]">Data Pesanan</h1>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f7efe2] text-left text-xs uppercase text-[#8B5E34]">
              <tr>
                <th className="p-3">No. Pesanan</th><th className="p-3">Pelanggan</th>
                <th className="p-3">Tanggal</th><th className="p-3">Total</th>
                <th className="p-3">Status</th><th className="p-3">Bayar</th><th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-[#f0e6d2]">
                  <td className="p-3 font-medium">{o.order_number}</td>
                  <td className="p-3">{o.customer_name}<div className="text-xs text-[#8B5E34]">{o.customer_phone}</div></td>
                  <td className="p-3">{formatDate(o.created_at)}</td>
                  <td className="p-3">{rupiah(o.total)}</td>
                  <td className="p-3">
                    <select value={o.status} onChange={e => update(o.id, { status: e.target.value })}
                      className="rounded border border-[#e8dcc8] px-2 py-1 text-xs">
                      {STATUS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <select value={o.payment_status} onChange={e => update(o.id, { payment_status: e.target.value })}
                      className="rounded border border-[#e8dcc8] px-2 py-1 text-xs">
                      {PAY.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => setView(o)} className="rounded p-1.5 text-[#8B5E34] hover:bg-[#f7efe2]"><Eye className="h-4 w-4"/></button>
                      <button onClick={() => remove(o.id)} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-[#8B5E34]">Belum ada pesanan.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setView(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Detail {view.order_number}</h3>
            <div className="mt-3 space-y-1 text-sm">
              <div><b>Pelanggan:</b> {view.customer_name} ({view.customer_phone})</div>
              <div><b>Alamat:</b> {view.address}</div>
              <div><b>Metode Pembayaran:</b> {view.payment_method || "-"}</div>
              {view.notes && <div><b>Catatan:</b> {view.notes}</div>}
              <div className="mt-3 border-t pt-2"><b>Items:</b></div>
              {(view.items as any[]).map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span>{it.qty}× {it.name}</span><span>{rupiah(it.price * it.qty)}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
                <span>Total</span><span>{rupiah(view.total)}</span>
              </div>
            </div>
            <button onClick={() => setView(null)} className="mt-4 w-full rounded-md bg-[#8B5E34] py-2 text-white">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
