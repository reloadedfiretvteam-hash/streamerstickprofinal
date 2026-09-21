import { Link } from "wouter";

export default function SupportContactPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <div className="bg-[#0b1220] text-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <h1 className="text-4xl font-semibold">Support &amp; Contact</h1>
          <p className="mt-4 text-slate-300">
            Setup help, compatibility questions, and order support — without the noise.
          </p>
        </div>
      </div>
      <div className="mx-auto grid max-w-4xl gap-6 px-4 py-12 md:grid-cols-2">
        <Link href="/guides" className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">
          <h2 className="text-xl font-semibold">Setup guides</h2>
          <p className="mt-2 text-slate-600">Written steps, authorized videos, and troubleshooting.</p>
        </Link>
        <Link href="/tutorials" className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">
          <h2 className="text-xl font-semibold">Video tutorials</h2>
          <p className="mt-2 text-slate-600">Existing tutorial library while CMS guides grow.</p>
        </Link>
        <Link href="/devices" className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">
          <h2 className="text-xl font-semibold">Google TV devices</h2>
          <p className="mt-2 text-slate-600">Shop physical ONN / Google TV products.</p>
        </Link>
        <Link href="/plans" className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">
          <h2 className="text-xl font-semibold">Plans &amp; services</h2>
          <p className="mt-2 text-slate-600">For equipment you already own.</p>
        </Link>
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
  );
}
