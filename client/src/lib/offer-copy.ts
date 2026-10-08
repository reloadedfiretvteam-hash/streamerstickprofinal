export const PLAN_INCLUDES = {
  watch: ["Live TV on the plan you buy", "Movies and series in the on-demand library", "Sports that are part of that live TV offer"],
  afterOrder: ["Login credentials by email", "Educational setup video by email", "Written setup path for the device you already own"],
  limits: ["No hardware ships with a plan", "Checkout is United States and Canada", "Renewal details are in Terms"],
} as const;

export const PACKAGE_INCLUDES = {
  hardware: ["ONN Google TV hardware in the product photo", "Voice remote"],
  afterOrder: ["Educational setup video by email", "Login credentials by email", "1-year live TV plan"],
  limits: ["Fire Stick hardware is not sold", "Checkout is United States and Canada"],
} as const;

export const SETUP_VIDEOS = [
  {
    id: "firestick",
    youtube: "DYSOp6mUzDU",
    title: "How to set up a Fire Stick",
    heading: "The video we email",
    body: "This is the same setup video that goes out with a free trial and with a live TV plan. It is for a Fire Stick you already own.",
    steps: [
      "Use the Fire Stick you already own.",
      "Follow the video, then install the player named in your email.",
      "Sign in with the login from that same email.",
    ],
  },
  {
    id: "onn-google",
    youtube: "lrGIVFV-QIg",
    title: "How to set up a media player on ONN Google TV",
    heading: "ONN Google TV",
    body: "A walkthrough filmed on an ONN 4K Google TV box. It shows how to install a media player that is not already in the Play Store. Use the player named in your order email.",
    steps: [
      "Plug the ONN into the TV and finish the Google TV screens.",
      "Open the Play Store and install the downloader shown in the video.",
      "Install the media player from your email, then sign in.",
    ],
  },
] as const;

export function publicPlanName(name?: string | null) {
  return String(name || "")
    .replace(/IPTV/gi, "Live TV")
    .replace(/\s+/g, " ")
    .trim();
}

export function publicPlanDescription(text?: string | null) {
  const cleaned = publicPlanName(text)
    .replace(/\b18,?000\+?\s*channels?\b/gi, "live TV")
    .replace(/\b\d{2,},?\d{3}\+?\s*(channels?|movies|vod)\b/gi, "the library on your plan")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || /real product mapped/i.test(cleaned)) {
    return "Live TV plan for a Fire Stick, ONN, or Google TV you already own. Includes an educational setup video and login credentials by email.";
  }
  return cleaned;
}
