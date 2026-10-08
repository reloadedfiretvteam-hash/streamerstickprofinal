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
    youtube: "9pZOoS-1NHg",
    title: "Set up a Fire Stick you already own",
    heading: "Fire Stick setup",
    body: "Preview how to install a media player on a Fire Stick you already own. After checkout, the order email includes the credentials and the setup video for your plan.",
    steps: [
      "Keep the Fire Stick you already own. Hardware is not sold here.",
      "Install the player app shown in the preview or in your order email.",
      "Enter the login from the email. Do not share passwords in screenshots.",
    ],
  },
  {
    id: "onn-google",
    youtube: "w6s_Tcnnbpo",
    title: "Set up a media player on ONN Google TV",
    heading: "ONN Google TV setup",
    body: "Preview how to install a media player on an ONN Google TV. After a package order, the email includes the educational setup video, credentials, and the 1-year plan.",
    steps: [
      "Plug the ONN into HDMI and finish the Google TV first-run screens.",
      "Open the Play Store and install the player named in your order email.",
      "Add the login from the email. Picture quality still depends on the TV, app, and internet.",
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
