import { useEffect } from "react";
import { Link } from "wouter";
import { StorefrontChrome } from "@/components/StorefrontChrome";
import { setPageMeta } from "@/lib/seo";

export default function SupportContactPage() {
  useEffect(() => {
    setPageMeta({
      title: "Support & Contact | StreamStickPro",
      description:
        "Setup help, compatibility questions, and order support. Email the team, or open guides, devices, and plans from this page.",
      path: "/support",
    });
  }, []);

  return (
    <StorefrontChrome>
    <div className="bg-[#f4f6f8]">
      <div className="bg-[#0b1220] text-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <h1 className="text-4xl font-semibold">Support and contact</h1>
          <p className="mt-4 text-slate-300">
            Use a guide first. Email us if the steps do not fix it. Include the email address on your order.
          </p>
        </div>
      </div>
      <div className="mx-auto grid max-w-4xl gap-6 px-4 py-12 md:grid-cols-2">
        <Link href="/guides" className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">
          <h2 className="text-xl font-semibold">Setup guides</h2>
          <p className="mt-2 text-slate-600">Written steps, authorized videos, and troubleshooting.</p>
        </Link>
        <Link href="/setup" className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">
          <h2 className="text-xl font-semibold">Setup videos</h2>
          <p className="mt-2 text-slate-600">Watch a walkthrough, then use a written guide for the steps.</p>
        </Link>
        <Link href="/devices" className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">
          <h2 className="text-xl font-semibold">Google TV devices</h2>
          <p className="mt-2 text-slate-600">Shop physical ONN / Google TV products.</p>
        </Link>
        <Link href="/plans" className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">
          <h2 className="text-xl font-semibold">Plans &amp; services</h2>
          <p className="mt-2 text-slate-600">For equipment you already own.</p>
        </Link>
        <a href="mailto:reloadedfiretvteam@gmail.com" className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md md:col-span-2">
          <h2 className="text-xl font-semibold">Email support</h2>
          <p className="mt-2 text-slate-600">reloadedfiretvteam@gmail.com — include your order email so we can find the purchase.</p>
        </a>
        <div className="rounded-2xl border bg-white p-6 md:col-span-2">
          <h2 className="text-xl font-semibold">Policies</h2>
          <div className="mt-3 flex flex-wrap gap-4 text-blue-700">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/refund">Refunds</Link>
            <Link href="/track-order">Track order</Link>
          </div>
        </div>
      </div>
    </div>
    </StorefrontChrome>
  );
}
