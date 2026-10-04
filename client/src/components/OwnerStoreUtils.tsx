import { Link, useLocation } from "wouter";

export const OWNER_WHATSAPP = "https://wa.me/15853037381";

const HIDE_CHAT = ["/admin", "/checkout", "/success", "/secure", "/checkout-secure"];

export function WhatsAppLiveChat() {
  const [path] = useLocation();
  if (HIDE_CHAT.some((route) => path === route || path.startsWith(`${route}/`))) return null;

  return (
    <a
      href={OWNER_WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-5 z-[120] flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl"
      data-testid="link-whatsapp"
      aria-label="Chat with us on WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden>
        <path d="M20.5 3.5A11 11 0 0 0 2.1 17.1L1 23l6-1.6A11 11 0 0 0 20.5 3.5zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.5.9.9-3.4-.2-.3A9 9 0 1 1 12 20.5zm5-6.7c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.1 8.1 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.1-.3a.5.5 0 0 0 0-.5c-.1-.1-.6-1.5-.8-2s-.4-.5-.6-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.5 4 15 15 0 0 0 1.5.6 3.6 3.6 0 0 0 1.6.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z" />
      </svg>
      <span className="sr-only">WhatsApp live chat</span>
    </a>
  );
}

export function HiddenAdminLink() {
  return (
    <a href="/admin" className="text-xs text-[#3A4658] no-underline hover:text-[#6B7788]">
      Admin
    </a>
  );
}

export function FooterAdminSlot() {
  return (
    <Link href="/admin">
      <span className="text-xs text-[#3A4658] hover:text-[#6B7788]">Admin</span>
    </Link>
  );
}
