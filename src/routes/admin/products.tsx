import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rupiah } from "@/lib/format";
import { Toaster, toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

type Product = {
  id?: string; name: string; category: string; price: number;
  description: string | null; image_url: string | null; is_active: boolean;
};

const EMPTY: Product = { name: "", category: "cookies", price: 0, description: "", image_url: "", is_active: true };

function AdminProducts() {
  const [list, setList] = useState<Product[]>([]);
  const [edit, setEdit] = useState<Product | null>(null);

  const load = () => supabase.from("products").select("*").order("created_at")
    .then(({ data }) => setList((data as Product[]) || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!edit) return;
    if (!edit.name) return toast.error("Nama wajib diisi");
    const payload = { ...edit, price: Number(edit.price) };
    const { error } = edit.id
      ? await supabase.from("products").update(payload).eq("id", edit.id)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Produk tersimpan"); setEdit(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus produk?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dihapus"); load();
  };

  return (
    <div className="space-y-4">
      <Toaster richColors position="top-center" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3B2F1E]">Manajemen Produk</h1>
        <button onClick={() => setEdit({ ...EMPTY })} className="flex items-center gap-2 rounded-md bg-[#8B5E34] px-4 py-2 text-sm text-white">
          <Plus className="h-4 w-4"/> Tambah Produk
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(p => (
          <div key={p.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="aspect-video bg-[#f0e6d2]">
              {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover"/>}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-[#8B5E34]">{p.category}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                  {p.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className="mt-2 font-bold text-[#8B5E34]">{rupiah(p.price)}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setEdit(p)} className="flex flex-1 items-center justify-center gap-1 rounded-md border border-[#8B5E34] py-1.5 text-xs text-[#8B5E34]">
                  <Pencil className="h-3 w-3"/> Edit
                </button>
                <button onClick={() => remove(p.id!)} className="flex items-center justify-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-xs text-red-500">
                  <Trash2 className="h-3 w-3"/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEdit(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold">{edit.id ? "Edit" : "Tambah"} Produk</h3>
            <div className="mt-4 space-y-3 text-sm">
              <input placeholder="Nama" value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })}
                className="w-full rounded-md border border-[#e8dcc8] px-3 py-2"/>
              <select value={edit.category} onChange={e => setEdit({ ...edit, category: e.target.value })}
                className="w-full rounded-md border border-[#e8dcc8] px-3 py-2">
                <option value="cookies">Cookies</option>
                <option value="brownies">Brownies</option>
                <option value="dessert_box">Dessert Box</option>
              </select>
              <input type="number" placeholder="Harga" value={edit.price} onChange={e => setEdit({ ...edit, price: Number(e.target.value) })}
                className="w-full rounded-md border border-[#e8dcc8] px-3 py-2"/>
              <input placeholder="URL Gambar" value={edit.image_url || ""} onChange={e => setEdit({ ...edit, image_url: e.target.value })}
                className="w-full rounded-md border border-[#e8dcc8] px-3 py-2"/>
              <textarea placeholder="Deskripsi" value={edit.description || ""} onChange={e => setEdit({ ...edit, description: e.target.value })}
                rows={3} className="w-full rounded-md border border-[#e8dcc8] px-3 py-2"/>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={edit.is_active} onChange={e => setEdit({ ...edit, is_active: e.target.checked })}/>
                Aktif (ditampilkan ke pelanggan)
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setEdit(null)} className="flex-1 rounded-md border border-[#e8dcc8] py-2">Batal</button>
              <button onClick={save} className="flex-1 rounded-md bg-[#8B5E34] py-2 text-white">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
