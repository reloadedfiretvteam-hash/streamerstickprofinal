/**
 * Fallback CMS store using existing live `site_settings` when cms_* tables
 * are not yet migrated (DATABASE_URL secret currently invalid in Actions).
 * Content-only. No Stripe.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

const KEYS = {
  homepage: "cms_homepage_v1",
  banners: "cms_banners_v1",
  devices: "cms_devices_v1",
  plans: "cms_plans_v1",
  guides: "cms_guides_v1",
  navigation: "cms_navigation_v1",
  brand: "cms_brand_v1",
  media: "cms_media_v1",
  revisions: "cms_revisions_v1",
  audit: "cms_audit_v1",
  subscribers: "cms_subscribers_v1",
} as const;

async function getJson<T>(client: SupabaseClient, key: string, fallback: T): Promise<T> {
  const { data, error } = await client
    .from("site_settings")
    .select("setting_value")
    .eq("setting_key", key)
    .maybeSingle();
  if (error || data?.setting_value == null) return fallback;
  try {
    return JSON.parse(String(data.setting_value)) as T;
  } catch {
    return fallback;
  }
}

async function setJson(client: SupabaseClient, key: string, value: unknown): Promise<void> {
  const setting_value = JSON.stringify(value);
  const { data: existing } = await client
    .from("site_settings")
    .select("id")
    .eq("setting_key", key)
    .maybeSingle();
  if (existing?.id) {
    const { error } = await client
      .from("site_settings")
      .update({
        setting_value,
        updated_at: new Date().toISOString(),
        setting_type: "json",
        setting_category: "owner_cms",
      })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await client.from("site_settings").insert({
      setting_key: key,
      setting_value,
      setting_type: "json",
      setting_category: "owner_cms",
      description: "Owner CMS content document",
    });
    if (error) throw error;
  }
}

export async function tablesReady(client: SupabaseClient): Promise<boolean> {
  const { error } = await client.from("cms_homepage").select("id").limit(1);
  return !error;
}

export const starterSetupGuide = {
  id: "starter-onn-google-tv",
  slug: "set-up-onn-google-tv",
  title: "Set up an ONN Google TV device",
  summary:
    "Connect the device, join Wi-Fi, sign in to Google, then open your streaming app and enter the login from your order email.",
  category: "setup",
  status: "published",
  sort_order: 0,
  prerequisites: [
    "A television with an HDMI port",
    "A working home Wi-Fi network and the password",
    "The order email that contains your streaming login",
  ],
  written_steps: [
    {
      title: "Connect the device",
      body: "Plug the ONN Google TV stick or box into an HDMI port on the TV. Connect power, turn the TV on, and switch the TV input to that HDMI port. Wait until the Google TV welcome screen appears.",
    },
    {
      title: "Join Wi-Fi and sign in",
      body: "Choose your Wi-Fi network and enter the password. Sign in with a Google account when asked. Accept the remote pairing prompt if the on-screen steps show one. Language and region can stay on the defaults unless you need a different country.",
    },
    {
      title: "Open your streaming app",
      body: "From the Google TV home screen, open the app named in your order email. If it is not installed, use the search icon on the home screen, type the app name, and install it from the Google Play listing.",
    },
    {
      title: "Enter your login",
      body: "Use the username and password from the order email. Do not share that login. After it signs in, pick a live channel and let it play for a minute so the picture and sound settle.",
    },
    {
      title: "If it will not play",
      body: "Confirm the TV is on the correct HDMI input, the device has internet (open another app and load a page), and the login matches the email exactly. Restart the device by unplugging power for 10 seconds. If it still fails, use Support and include the device model and the email on the order.",
    },
  ],
  faq: [
    {
      question: "Does this page sell a Fire Stick?",
      answer: "No. This guide is for ONN and Google TV devices. If you already own a Fire TV, use Plans & Services for a plan that fits equipment you already have.",
    },
    {
      question: "Where do I get the login?",
      answer: "It arrives in the order email after checkout. The guide does not create a new login.",
    },
  ],
};

export const settingsCms = {
  KEYS,
  getJson,
  setJson,
  async getHomepage(client: SupabaseClient) {
    return getJson(client, KEYS.homepage, {
      id: "default",
      status: "published",
      version: 1,
      document: defaultHomepageDocument(),
    });
  },
  async saveHomepage(client: SupabaseClient, row: any) {
    await setJson(client, KEYS.homepage, row);
    return row;
  },
  async listBanners(client: SupabaseClient) {
    return getJson<any[]>(client, KEYS.banners, []);
  },
  async saveBanners(client: SupabaseClient, rows: any[]) {
    await setJson(client, KEYS.banners, rows);
    return rows;
  },
  async listDevices(client: SupabaseClient) {
    return getJson<any[]>(client, KEYS.devices, []);
  },
  async saveDevices(client: SupabaseClient, rows: any[]) {
    await setJson(client, KEYS.devices, rows);
    return rows;
  },
  async listPlans(client: SupabaseClient) {
    return getJson<any[]>(client, KEYS.plans, []);
  },
  async savePlans(client: SupabaseClient, rows: any[]) {
    await setJson(client, KEYS.plans, rows);
    return rows;
  },
  async listGuides(client: SupabaseClient) {
    return getJson<any[]>(client, KEYS.guides, []);
  },
  async saveGuides(client: SupabaseClient, rows: any[]) {
    await setJson(client, KEYS.guides, rows);
    return rows;
  },
  async getNavigation(client: SupabaseClient) {
    return getJson(client, KEYS.navigation, {
      id: "main",
      items: [
        { label: "Home", href: "/", order: 1 },
        { label: "Google TV Devices", href: "/devices", order: 2 },
        { label: "Plans & Services", href: "/plans", order: 3 },
        { label: "Setup Guides", href: "/guides", order: 4 },
        { label: "Support", href: "/support", order: 5 },
        { label: "Contact", href: "/contact", order: 6 },
      ],
      footer: {},
    });
  },
  async saveNavigation(client: SupabaseClient, row: any) {
    await setJson(client, KEYS.navigation, row);
    return row;
  },
  async appendAudit(client: SupabaseClient, entry: any) {
    const list = await getJson<any[]>(client, KEYS.audit, []);
    list.unshift({ ...entry, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    await setJson(client, KEYS.audit, list.slice(0, 200));
  },
  async appendRevision(client: SupabaseClient, entry: any) {
    const list = await getJson<any[]>(client, KEYS.revisions, []);
    list.unshift({ ...entry, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    await setJson(client, KEYS.revisions, list.slice(0, 100));
  },
  async listAudit(client: SupabaseClient) {
    return getJson<any[]>(client, KEYS.audit, []);
  },
  async listRevisions(client: SupabaseClient) {
    return getJson<any[]>(client, KEYS.revisions, []);
  },
};

function defaultHomepageDocument() {
  return {
    hero: {
      title: "Preloaded ONN Google TV Devices",
      subtitle:
        "You get the Google TV device, a web tutorial, your login credentials, and live TV service. Subscriptions and a free 36-hour trial are for a Fire Stick or TV you already own.",
      proofline: "18,000+ live channels · 100,000+ movies · broadband-ready setup · secure checkout",
      primaryCta: { label: "Shop ONN Google TV Kits", href: "/devices" },
      secondaryCta: { label: "Plans for a Device You Own", href: "/plans" },
      supportCta: { label: "Surf Guides & City Pages", href: "/locations" },
      backgroundImageUrl: "",
      videoUrl: "",
    },
    pathTiles: [
      {
        id: "need-device",
        title: "Buy an ONN Google TV Kit",
        description: "This is the hardware we sell when someone searches Fire Stick, Downloader, IPTV, jailbroken, or unlocked.",
        href: "/devices",
        ctaLabel: "Shop Google TV Devices",
        imageUrl: "",
      },
      {
        id: "have-device",
        title: "Already Own a Fire Stick or Google TV?",
        description: "Keep that device. A plan adds live TV on equipment you already have.",
        href: "/plans",
        ctaLabel: "Explore Plans & Services",
        imageUrl: "",
      },
      {
        id: "need-help",
        title: "Broadband, Setup, and the Page Library",
        description: "Open written setup, broadband help, and thousands of city and channel pages.",
        href: "/locations",
        ctaLabel: "Open the page library",
        imageUrl: "",
      },
    ],
    meta: {
      title: "ONN Google TV Kits | Fire Stick & IPTV | StreamStickPro",
      description:
        "Searched Fire Stick, Downloader, IPTV, or an unlocked device? Buy an ONN Google TV kit with live price and photo, or open plans, broadband setup, and thousands of guides.",
    },
    cloaked: {
      titleLine1: "Digital Experiences",
      titleLine2: "That Drive Growth",
      subtitle:
        "We build high-performance websites, SEO strategies, and digital campaigns that transform businesses.",
      backgroundImageUrl: "",
      videoUrl: "",
      badge: "Award-Winning Web Design Agency 2026",
      ctaPrimary: "View Packages",
      ctaSecondary: "Our Portfolio",
      serviceCards: [
        { title: "Web Design", description: "Responsive, modern websites built with the latest technologies.", imageUrl: "" },
        { title: "SEO & Marketing", description: "Rank higher and drive more organic traffic to your site.", imageUrl: "" },
        { title: "Custom Development", description: "Tailored solutions for complex business requirements.", imageUrl: "" },
      ],
    },
    theme: {
      primaryColor: "#2563eb",
      accentColor: "#14b8a6",
      backgroundColor: "#0A0A0F",
    },
    trustBar: "2,700+ customers · 99.9% uptime · SSL-secured checkout · 18K+ channels",
    faq: {
      title: "Essential FAQ",
      items: [
        { question: "IPTV subscription vs loaded device?", answer: "IPTV is the streaming service only. A device kit is hardware that includes a 1-year Reloaded Fire TV plan." },
        { question: "Do ONN kits include a subscription?", answer: "Yes. Every ONN kit ships with a 1-year Reloaded Fire TV subscription." },
        { question: "How fast does service start?", answer: "Plan credentials arrive in the order email. Most customers are watching in 1 to 2 hours after payment." },
      ],
    },
    disclaimer:
      "Optimal performance requires 25Mbps+ internet. Device bundles include 1-year service where stated. Users are responsible for local laws and platform terms.",
    footer: {
      tagline: "Premium Live TV streaming with 18,000+ channels and 100,000+ movies & series. ONN Google TV kits available.",
      email: "reloadedfiretvteam@gmail.com",
      copyright: "StreamStickPro",
    },
    support: {
      email: "reloadedfiretvteam@gmail.com",
      availability: "24/7 support",
    },
    emailPromo: {
      enabled: false,
      headline: "Get a first-order promo",
      subheadline: "Leave your email and we will send the current sale code.",
      buttonLabel: "Send my code",
      coupon: "",
      delaySeconds: 12,
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Get started in minutes with our simple 4-step process",
      steps: [
        { step: "1", title: "Choose Your Device", description: "Choose an ONN Google TV kit at the listed price on this page.", icon: "📱" },
        { step: "2", title: "Add a Plan", description: "Choose a Live TV plan if you already have a compatible device.", icon: "📺" },
        { step: "3", title: "We Ship & Setup", description: "Your kit arrives with credentials and clear setup guidance.", icon: "🚀" },
        { step: "4", title: "Start Streaming", description: "Plug in, connect Wi-Fi, and start watching.", icon: "🎬" },
      ],
    },
    ogImage: "",
  };
}
