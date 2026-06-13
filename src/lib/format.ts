export const rupiah = (n: number) =>
  "Rp " + Number(n || 0).toLocaleString("id-ID");

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
