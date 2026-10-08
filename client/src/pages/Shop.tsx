import { useEffect } from "react";
import { Link } from "wouter";
import { setPageMeta } from "@/lib/seo";
import { useCart } from "@/lib/store";
import { V4Footer, V4Header } from "@/components/v4/V4Chrome";
import { publicDevicePath } from "@/lib/device-skus";
import { HD_ALT, HD_ID, K4_ALT, K4_ID, packageImage } from "@/lib/package-art";
import { useShopCatalog } from "@/lib/use-shop-catalog";
import "@/styles/v4.css";

export default function Shop() {
  const { addItem, openCart } = useCart();
  const { products, status, retry, hd, k4, money, stockLabel } = useShopCatalog();
  const plans = products.filter((p) => String(p.id).startsWith("iptv-"));

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setPageMeta({
      title: "Shop Google TV packages and live TV plans | StreamStickPro",
      description:
        "Shop ONN Google TV packages or a live TV plan for a device you already own. Prices come from the live catalog.",
      path: "/shop",
    });
  }, []);

  return (
    <div className="v4 min-h-screen">
      <V4Header />
      <main id="main-content">
        <section className="bg-[#08111F] text-[#F8FAFC]">
          <div className="v4-shell py-16">
            <h1 className="max-w-3xl text-[40px] font-bold leading-tight lg:text-[48px]">Shop StreamStickPro</h1>
            <p className="mt-4 max-w-2xl text-[#C9D4DF]">
              Two paths: a shipped ONN Google TV package, or a live TV plan for equipment you already own. Fire Stick hardware is not sold here.
            </p>
          </div>
        </section>

        <section className="bg-[#FCFBF7]">
          <div className="v4-shell py-16">
            <h2 className="text-[34px] font-bold">Google TV packages</h2>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {[hd, k4].map((product) =>
                product ? (
                  <article key={product.id} className="overflow-hidden rounded-[22px] border border-[#D7DFE7] bg-white">
                    <div className="v4-device-stage">
                      <img
                        src={packageImage(product.id, product.image)}
                        alt={product.id === HD_ID ? HD_ALT : product.id === K4_ID ? K4_ALT : product.name}
                        className="h-72 w-full object-contain p-6"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-[24px] font-bold">{product.name}</h3>
                      <p className="mt-3 text-[#536275]">{product.description}</p>
                      <p className="mt-4 text-[32px] font-bold">{money(product.price)}</p>
                      <p className="mt-2 text-sm">{stockLabel(product.availability)}</p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="v4-btn v4-btn-primary"
                          onClick={() => {
                            addItem({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: packageImage(product.id, product.image),
                              category: "firestick",
                              description: product.description,
                            });
                            openCart();
                          }}
                        >
                          Add to cart
                        </button>
                        <Link href={publicDevicePath(product.id)}>
                          <span className="v4-btn v4-btn-secondary-light">Package details</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ) : null,
              )}
            </div>
            {status === "loading" ? <p className="mt-6">Loading current packages…</p> : null}
            {status === "error" ? (
              <p className="mt-6">
                Packages could not load.{" "}
                <button type="button" className="underline" onClick={retry}>
                  Retry
                </button>
              </p>
            ) : null}
          </div>
        </section>

        <section className="bg-[#F5F2EA]">
          <div className="v4-shell py-16">
            <h2 className="text-[34px] font-bold">Live TV plans</h2>
            <p className="mt-4 max-w-3xl text-[#536275]">No hardware ships. Totals come from the live catalog.</p>
            {status === "loading" ? <p className="mt-6">Loading current plans…</p> : null}
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <article key={plan.id} className="rounded-[18px] border border-[#D7DFE7] bg-white p-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-3 text-[#536275]">{plan.description}</p>
                  <p className="mt-4 text-[28px] font-bold">{money(plan.price)}</p>
                  <button
                    type="button"
                    className="v4-btn v4-btn-primary mt-5 w-full"
                    onClick={() => {
                      addItem({
                        id: plan.id,
                        name: plan.name,
                        price: plan.price,
                        image: packageImage(plan.id, plan.image),
                        category: "iptv",
                        description: plan.description,
                      });
                      openCart();
                    }}
                  >
                    Add this plan
                  </button>
                </article>
              ))}
            </div>
            {!plans.length && status === "ready" ? <p className="mt-6">No live TV plans are in the catalog right now.</p> : null}
          </div>
        </section>
      </main>
      <V4Footer />
    </div>
  );
}
