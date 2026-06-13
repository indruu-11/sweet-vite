import { rupiah } from "@/lib/format";
import { CheckCircle2 } from "lucide-react";

// Placeholder QRIS image & Google Form link — ganti nanti dengan asset asli
export const QRIS_IMAGE_URL = "/contoh qris loockiest.png";
export const QRIS_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfCCi3KE_MCndTCLkiWNkO0KyLeau4RfGFV45kcuKA_hoCecQ/viewform?usp=publish-editor";

export function QrisPanel({
  total,
  orderNumber,
  paid = false,
}: {
  total: number;
  orderNumber?: string;
  paid?: boolean;
}) {
  if (paid) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
        <h3 className="mt-3 text-lg font-bold text-green-800">Terima Kasih!</h3>
        <p className="mt-1 text-sm text-green-700">
          Pembayaran Anda sudah kami terima.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e8dcc8] bg-white p-5 text-center">
      <h3 className="text-base font-semibold text-[#3B2F1E]">Scan QRIS untuk Membayar</h3>
      {orderNumber && (
        <p className="mt-1 text-xs text-[#8B5E34]">No. Pesanan: {orderNumber}</p>
      )}
      <img
        src={QRIS_IMAGE_URL}
        alt="QRIS Cookify"
        className="mx-auto mt-3 h-56 w-56 rounded-md border border-[#f0e6d2] object-contain"
      />
      <div className="mt-3 text-sm text-[#8B5E34]">Total Pembayaran</div>
      <div className="text-xl font-bold text-[#3B2F1E]">{rupiah(total)}</div>
      <a
        href={QRIS_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block w-full rounded-md bg-[#8B5E34] py-2 text-sm font-medium text-white hover:bg-[#6f4a28]"
      >
        Kirim Bukti Pembayaran
      </a>
      <p className="mt-2 text-xs text-[#8B5E34]">
        Setelah bayar, kirim bukti via form di atas. Status akan diperbarui admin.
      </p>
    </div>
  );
}
