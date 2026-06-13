import { Link } from "@tanstack/react-router";
import { ShoppingBag, Lock, ClipboardList } from "lucide-react";
import { useCart } from "@/lib/cart";

export function SiteNav() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e8dcc8] bg-[#fdfaf3]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8B5E34] text-white">
            <img src="logo cookify.png"></img>
          </div>
          <div className="leading-tight">
            <div className="font-bold text-[#3B2F1E]">Cookify</div>
            <div className="text-[10px] text-[#8B5E34]">Cookies & Brownies</div>
          </div>
        </Link>
        <nav className="hidden gap-6 md:flex">
          <Link to="/" className="text-sm text-[#3B2F1E] hover:text-[#8B5E34]">Home</Link>
          <Link to="/menu" className="text-sm text-[#3B2F1E] hover:text-[#8B5E34]">Menu</Link>
          <Link to="/order" className="text-sm text-[#3B2F1E] hover:text-[#8B5E34]">Pesanan</Link>
          <Link to="/status" className="text-sm text-[#3B2F1E] hover:text-[#8B5E34]">Status</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/status"
            title="Status Pesanan"
            aria-label="Status Pesanan"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e8dcc8] bg-white text-[#8B5E34] hover:bg-[#8B5E34] hover:text-white md:hidden"
          >
            <ClipboardList className="h-4 w-4" />
          </Link>
          <Link
            to="/admin/login"
            title="Login Admin"
            aria-label="Login Admin"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e8dcc8] bg-white text-[#8B5E34] hover:bg-[#8B5E34] hover:text-white"
          >
            <Lock className="h-4 w-4" />
          </Link>
          <Link
            to="/order"
            className="relative inline-flex items-center gap-2 rounded-md bg-[#8B5E34] px-4 py-2 text-sm font-medium text-white hover:bg-[#6f4a28]"
          >
            <ShoppingBag className="h-4 w-4" /> Pesan Sekarang
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
