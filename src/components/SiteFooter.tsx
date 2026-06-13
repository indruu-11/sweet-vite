import { Instagram, MessageCircle, Phone, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-[#e8dcc8] bg-[#2a2018] text-[#f0e6d2]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold text-white">Cookify</h3>
          <p className="mt-2 text-sm text-[#c9b39a]">
            Cookies & Brownies fresh untuk setiap momen spesialmu.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Customer Service</h4>
          <ul className="mt-3 space-y-2 text-sm text-[#c9b39a]">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> (021) 57959817
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> WhatsApp: 0877-2217-6742
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> cs@cookify.id
            </li>
            <li className="text-xs text-[#a89070]">Jam operasional: 09.00 - 21.00 WIB</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Ikuti Kami</h4>
          <a
            href="https://www.instagram.com/loockiest_"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#8B5E34] px-4 py-2 text-sm font-medium text-white hover:bg-[#6f4a28]"
          >
            <Instagram className="h-4 w-4" /> @cookify_
          </a>
        </div>
      </div>
      <div className="border-t border-[#3b2f1e] py-4 text-center text-xs text-[#a89070]">
        © {new Date().getFullYear()} Cookify — Cookies & Brownies UMKM
      </div>
    </footer>
  );
}
