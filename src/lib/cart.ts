import { useEffect, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

const KEY = "cookify_cart";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-changed"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    setItems(read());
    const h = () => setItems(read());
    window.addEventListener("cart-changed", h);
    return () => window.removeEventListener("cart-changed", h);
  }, []);
  return {
    items,
    add: (p: Omit<CartItem, "qty">) => {
      const cur = read();
      const i = cur.findIndex(x => x.id === p.id);
      if (i >= 0) cur[i].qty += 1;
      else cur.push({ ...p, qty: 1 });
      write(cur);
    },
    setQty: (id: string, qty: number) => {
      let cur = read().map(x => x.id === id ? { ...x, qty } : x).filter(x => x.qty > 0);
      write(cur);
    },
    remove: (id: string) => write(read().filter(x => x.id !== id)),
    clear: () => write([]),
    total: items.reduce((s, x) => s + x.price * x.qty, 0),
    count: items.reduce((s, x) => s + x.qty, 0),
  };
}
