import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, X } from "lucide-react";
import { toast } from "sonner";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-none text-[#d6c4a8]"}
        />
      ))}
    </div>
  );
}

export function ProductReviewsModal({
  productId,
  productName,
  onClose,
  onChanged,
}: {
  productId: string;
  productName: string;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [productId]);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedComment = comment.trim();
    if (trimmedName.length < 1 || trimmedName.length > 60) {
      toast.error("Nama harus 1–60 karakter");
      return;
    }
    if (trimmedComment.length > 500) {
      toast.error("Komentar maksimal 500 karakter");
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error("Pilih rating 1–5");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      customer_name: trimmedName,
      rating,
      comment: trimmedComment || null,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Terima kasih atas ulasannya!");
    setName(""); setComment(""); setRating(5);
    load();
    onChanged?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 flex items-start justify-between border-b border-[#f0e6d2] bg-white p-5">
          <div>
            <h2 className="font-bold text-[#3B2F1E]">Ulasan: {productName}</h2>
            <div className="mt-1 flex items-center gap-2">
              <Stars value={avg} />
              <span className="text-sm text-[#8B5E34]">
                {reviews.length ? `${avg.toFixed(1)} dari ${reviews.length} ulasan` : "Belum ada ulasan"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 text-[#8B5E34] hover:bg-[#f7efe2]" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          {loading ? (
            <p className="text-sm text-[#8B5E34]">Memuat ulasan...</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-[#8B5E34]">Jadilah yang pertama memberi ulasan!</p>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="rounded-lg border border-[#f0e6d2] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#3B2F1E]">{r.customer_name}</span>
                  <Stars value={r.rating} />
                </div>
                {r.comment && <p className="mt-1 text-sm text-[#5b4a35]">{r.comment}</p>}
                <p className="mt-1 text-[10px] text-[#a89070]">
                  {new Date(r.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={submit} className="space-y-3 border-t border-[#f0e6d2] bg-[#fdfaf3] p-5">
          <h3 className="font-semibold text-[#3B2F1E]">Tulis Ulasan</h3>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nama Anda"
            maxLength={60}
            required
            className="w-full rounded-md border border-[#e8dcc8] bg-white px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#5b4a35]">Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} bintang`}>
                  <Star className={`h-6 w-6 ${i <= rating ? "fill-amber-400 text-amber-400" : "fill-none text-[#d6c4a8]"}`} />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Bagaimana rasanya? (opsional)"
            maxLength={500}
            rows={3}
            className="w-full rounded-md border border-[#e8dcc8] bg-white px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-[#8B5E34] py-2 text-sm font-medium text-white hover:bg-[#6f4a28] disabled:opacity-60"
          >
            {submitting ? "Mengirim..." : "Kirim Ulasan"}
          </button>
        </form>
      </div>
    </div>
  );
}
