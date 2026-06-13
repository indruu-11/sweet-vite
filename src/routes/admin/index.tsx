import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rupiah } from "@/lib/format";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("orders").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data || []));
  }, []);

  const total = orders.length;
  const processing = orders.filter(o => o.status === "Diproses").length;
  const done = orders.filter(o => o.status === "Selesai").length;
  const revenue = orders.filter(o => o.payment_status === "Lunas").reduce((s, o) => s + Number(o.total), 0);

  // Sales chart by day (last 7 days)
  const days: { d: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(); date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const sum = orders.filter(o => o.created_at.slice(0, 10) === key).reduce((s, o) => s + Number(o.total), 0);
    days.push({ d: date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }), total: sum });
  }

  const statusData = [
    { name: "Selesai", value: done, color: "#4ade80" },
    { name: "Diproses", value: processing, color: "#fbbf24" },
    { name: "Belum Bayar", value: orders.filter(o => o.payment_status === "Belum Bayar").length, color: "#f87171" },
    { name: "Dibatalkan", value: orders.filter(o => o.status === "Dibatalkan").length, color: "#94a3b8" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#3B2F1E]">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Total Pesanan", v: total },
          { l: "Pesanan Diproses", v: processing },
          { l: "Selesai", v: done },
          { l: "Pendapatan", v: rupiah(revenue) },
        ].map(s => (
          <div key={s.l} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-sm text-[#8B5E34]">{s.l}</div>
            <div className="mt-2 text-2xl font-bold text-[#3B2F1E]">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="mb-3 font-semibold">Grafik Penjualan (7 hari)</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={days}>
                <XAxis dataKey="d" />
                <YAxis />
                <Tooltip formatter={(v: number) => rupiah(v)} />
                <Line type="monotone" dataKey="total" stroke="#8B5E34" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">Status Pesanan</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                  {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
