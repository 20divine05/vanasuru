import { MessageCircle } from "lucide-react";
import { BRAND } from "@/lib/site-data";

export function WhatsAppFab() {
  const waUrl = `https://wa.me/${BRAND.phoneWhatsapp}?text=${encodeURIComponent(
    "Hello VANASURU Retreats, I would like to inquire about room availability and booking."
  )}`;

  return (
    <aside
      aria-label="WhatsApp Booking Assistance"
      className="fixed bottom-6 right-6 z-50 flex items-center group pointer-events-auto"
    >
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
      >
        <MessageCircle size={22} className="fill-white stroke-none" />
        <span className="text-xs font-semibold tracking-wider uppercase pr-1 hidden sm:inline">
          Book on WhatsApp
        </span>
      </a>
    </aside>
  );
}
