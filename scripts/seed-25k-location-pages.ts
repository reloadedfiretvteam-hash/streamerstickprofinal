/**
 * Seed 25,000 location pages into seo_architecture (8K IPTV + 10K Jailbreak + 7K Google).
 * Uses USA/CA/UK cities; each location gets 3 rows (iptv, jailbreak, google).
 *
 * Run: npx tsx scripts/seed-25k-location-pages.ts
 * Requires: VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_KEY
 *
 * Loads .env.local from project root if present (so you can keep keys there without exporting).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const paths = [resolve(process.cwd(), ".env.local"), resolve(process.cwd(), ".env")];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    try {
      const content = readFileSync(p, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.replace(/#.*/, "").trim();
        const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (m) {
          const val = m[2].trim().replace(/^["'`]|["'`]$/g, "");
          if (val) process.env[m[1]] = val;
        }
      }
      break;
    } catch {
      /* ignore */
    }
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLL_KEY ||
  process.env.SERVICE_ROLE_KEY;

const INTERNAL_LINKS = [
  { url: "/iptv-services", anchor: "IPTV Services" },
  { url: "/iptv-firestick", anchor: "IPTV for Fire Stick" },
  { url: "/jailbroken-fire-sticks", anchor: "Jailbroken Fire Sticks" },
  { url: "/firestick-devices", anchor: "Fire Stick Devices" },
  { url: "/best-iptv-firestick", anchor: "Best IPTV Firestick" },
  { url: "/iptv-media-players", anchor: "IPTV Media Players" },
  { url: "/iptv-services", anchor: "Live TV streaming guide" },
  { url: "/jailbroken-fire-sticks", anchor: "Pre-loaded Fire Stick" },
  { url: "/iptv-media-players", anchor: "Google TV IPTV" },
  { url: "/firestick-devices", anchor: "Streaming devices" },
  { url: "/best-iptv-firestick", anchor: "IPTV comparison" },
  { url: "/iptv-firestick", anchor: "Firestick setup" },
  { url: "/iptv-services", anchor: "IPTV channels" },
  { url: "/jailbroken-fire-sticks", anchor: "Jailbroken devices" },
  { url: "/iptv-media-players", anchor: "TiviMate and apps" },
  { url: "/", anchor: "Home" },
  { url: "/shop", anchor: "Shop" },
  { url: "/", anchor: "Free trial" },
  { url: "/shop", anchor: "Pricing" },
  { url: "/shop", anchor: "Plans" },
  { url: "/shop", anchor: "Devices & plans" },
  { url: "/shop", anchor: "Live TV subscription" },
  { url: "/", anchor: "Get started" },
  { url: "/shop", anchor: "IPTV plans" },
  { url: "/shop", anchor: "Fire Stick with TV" },
  { url: "/shop", anchor: "Streaming plans" },
  { url: "/shop", anchor: "Order now" },
  { url: "/shop", anchor: "Subscribe" },
  { url: "/", anchor: "Start free trial" },
  { url: "/blog", anchor: "Blog" },
  { url: "/resources", anchor: "Resources" },
  { url: "/terms", anchor: "Terms" },
  { url: "/privacy", anchor: "Privacy" },
  { url: "/refund", anchor: "Refund policy" },
  { url: "/blog", anchor: "Guides" },
  { url: "/resources", anchor: "Channel directory" },
  { url: "/iptv-services", anchor: "IPTV guide" },
  { url: "/jailbroken-fire-sticks", anchor: "Setup guide" },
  { url: "/blog", anchor: "Cord cutting tips" },
];

const CONTENT_BLOCKS = {
  h2_sections: [
    { heading: "What is IPTV?", body: "IPTV delivers live TV over the internet. StreamStickPro offers 18,000+ channels for Fire Stick and Google TV in [LOCATION]." },
    { heading: "How do I get IPTV in my area?", body: "StreamStickPro works nationwide. Order a pre-configured Fire Stick or sign up for an IPTV plan; 18,000+ channels stream over the internet." },
    { heading: "What is a jailbroken Fire Stick?", body: "A jailbroken Fire Stick runs apps like Kodi and Stremio for streaming. StreamStickPro ships devices ready to stream 18,000+ channels." },
    { heading: "Does StreamStickPro work on Google TV?", body: "Yes. StreamStickPro IPTV works on Google TV, Chromecast, Fire Stick, and Android. Same 18,000+ channels everywhere." },
    { heading: "Is there a free trial?", body: "Yes. StreamStickPro offers a free trial. Visit the homepage to start streaming 18,000+ channels on your device." },
    { heading: "What channels are included?", body: "StreamStickPro includes 18,000+ live TV channels and 100,000+ movies and series. Sports, news, and entertainment are included." },
    { heading: "How fast does my internet need to be?", body: "We recommend at least 10 Mbps for HD and 25 Mbps for 4K. StreamStickPro works on most home and mobile connections." },
    { heading: "Can I use this on multiple devices?", body: "Yes. Use your credentials on Fire Stick, Google TV, Android, and compatible apps. One subscription, multiple screens." },
    { heading: "What is TiviMate?", body: "TiviMate is a popular IPTV player. StreamStickPro supports TiviMate and other apps for the best viewing experience." },
    { heading: "Do you ship to my area?", body: "StreamStickPro ships jailbroken Fire Sticks across the USA, Canada, and UK. Check the shop for availability in [LOCATION]." },
    { heading: "How do I set up my Fire Stick?", body: "Plug in the device, connect to Wi‑Fi, and open the pre-installed app. Your 18,000+ channels are ready to stream." },
    { heading: "Is IPTV legal?", body: "StreamStickPro provides legal access to licensed content. We use official sources and comply with local laws." },
    { heading: "What is the difference between IPTV and cable?", body: "IPTV streams over the internet; cable uses a physical line. IPTV gives you more channels and flexibility." },
    { heading: "Can I watch sports?", body: "Yes. Sports channels are included in our 18,000+ channel lineup. Stream live games on Fire Stick and Google TV." },
    { heading: "How do I get support?", body: "StreamStickPro offers 24/7 support. Contact us via the website for setup help and troubleshooting." },
    { heading: "What payment methods do you accept?", body: "We accept major credit cards and secure online payment. Visit the shop to see current options." },
    { heading: "Can I cancel anytime?", body: "Yes. Subscription terms are listed on the shop. Free trial lets you try before you commit." },
    { heading: "What is Stremio?", body: "Stremio is a streaming app that works with IPTV. StreamStickPro devices can run Stremio for movies and series." },
    { heading: "Do you offer refunds?", body: "Our refund policy is on the website. Contact support for any issues with your order." },
    { heading: "How do location pages help?", body: "Location pages like this one help you find IPTV and Fire Stick options for [LOCATION]. We serve USA, Canada, and UK." },
    { heading: "Why choose StreamStickPro?", body: "18,000+ channels, 100,000+ movies, free trial, and devices ready to stream. We focus on Fire Stick and Google TV." },
    { heading: "What is Kodi?", body: "Kodi is a media player that supports add-ons. StreamStickPro ships devices with Kodi pre-installed where applicable." },
    { heading: "Is there a contract?", body: "Plans vary. Check the shop for monthly and longer plans. Free trial has no long-term commitment." },
    { heading: "Can I use a VPN?", body: "StreamStickPro works with most home connections. Use of VPN is at your discretion and subject to our terms." },
    { heading: "What devices are supported?", body: "Fire Stick, Google TV, Chromecast, and Android phones and tablets. Same account, multiple devices." },
    { heading: "How do I order?", body: "Visit the shop, choose your plan or device, and checkout. You will receive credentials or shipping details." },
    { heading: "What is the best IPTV for Fire Stick?", body: "StreamStickPro is built for Fire Stick. 18,000+ channels and easy setup. Start with the free trial." },
    { heading: "Are there hidden fees?", body: "Pricing is shown on the shop. No hidden fees. Check the refund policy for full terms." },
    { heading: "How do I get 18,000+ channels?", body: "Sign up for an IPTV plan or order a pre-loaded Fire Stick. Your lineup includes live TV and on-demand." },
    { heading: "What is Google TV?", body: "Google TV is a smart TV platform. StreamStickPro IPTV works on Google TV and Chromecast with Google TV." },
    { heading: "Do you serve [LOCATION]?", body: "StreamStickPro serves the USA, Canada, and UK. This page is for viewers in [LOCATION] and surrounding areas." },
    { heading: "How do I stream on my TV?", body: "Use a Fire Stick, Google TV device, or Chromecast. Install the app, sign in, and stream 18,000+ channels." },
  ],
  numbered_lists: [
    { title: "How to get started in 4 steps", items: ["Order a Fire Stick or IPTV plan from StreamStickPro.", "Receive your credentials or device by mail.", "Enter credentials in TiviMate or your app.", "Stream 18,000+ channels and 100,000+ movies."] },
    { title: "Why choose StreamStickPro", items: ["18,000+ live TV channels.", "100,000+ movies and series.", "Works on Fire Stick, Google TV, Android.", "Free trial available.", "24/7 support."] },
    { title: "Supported devices", items: ["Amazon Fire TV Stick (all models).", "Google TV and Chromecast.", "Android phones and tablets.", "Smart TVs with Android."] },
    { title: "What you get with IPTV", items: ["Live TV from around the world.", "Sports, news, and entertainment.", "On-demand movies and series.", "No long-term contract with trial."] },
    { title: "Setting up your Fire Stick", items: ["Connect to power and HDMI.", "Connect to Wi-Fi.", "Open the pre-installed app.", "Start streaming."] },
    { title: "Benefits of a jailbroken Fire Stick", items: ["Pre-loaded with streaming apps.", "No sideloading required.", "18,000+ channels ready.", "Works in [LOCATION] and beyond."] },
    { title: "StreamStickPro vs cable", items: ["More channels than most cable packages.", "Stream on multiple devices.", "No installation appointment.", "Free trial to test."] },
    { title: "Payment options", items: ["Secure checkout.", "Major cards accepted.", "Clear pricing on the shop.", "No hidden fees."] },
    { title: "Customer support", items: ["24/7 support.", "Setup guides on the blog.", "Contact via website.", "Refund policy available."] },
    { title: "Popular channels", items: ["Sports networks.", "News channels.", "Entertainment.", "International content."] },
    { title: "IPTV in [LOCATION]", items: ["StreamStickPro serves [LOCATION].", "Same 18,000+ channels nationwide.", "Devices ship to your area.", "Free trial to start."] },
    { title: "Google TV setup", items: ["Sign in to your Google account.", "Install the StreamStickPro app.", "Enter your credentials.", "Stream on your TV."] },
    { title: "Frequently asked questions", items: ["What is IPTV?", "How do I get a free trial?", "What devices work?", "Do you ship to me?"] },
    { title: "Cord cutting tips", items: ["Replace cable with IPTV.", "Use one subscription on multiple TVs.", "Try the free trial first.", "Read our blog for guides."] },
    { title: "Ordering checklist", items: ["Choose plan or device.", "Add to cart.", "Checkout securely.", "Receive access or delivery."] },
    { title: "Why location matters", items: ["We serve USA, Canada, UK.", "Same service in [LOCATION].", "Shipping where available.", "Support in your region."] },
    { title: "Streaming quality", items: ["HD and 4K where available.", "Stable streams.", "Works on 10+ Mbps.", "Optimized for Fire Stick."] },
    { title: "Security and privacy", items: ["Secure payment.", "Privacy policy on site.", "No sharing of data.", "Terms and refund policy."] },
    { title: "Getting the most from IPTV", items: ["Use a wired connection if possible.", "Update your app.", "Check the blog for tips.", "Contact support if needed."] },
  ],
  tables: [
    { caption: "StreamStickPro at a glance", headers: ["Feature", "Details"], rows: [["Channels", "18,000+"], ["Movies & series", "100,000+"], ["Devices", "Fire Stick, Google TV, Android"], ["Free trial", "Yes"]] },
    { caption: "Service comparison", headers: ["Service", "Best for"], rows: [["IPTV plans", "Live TV streaming"], ["Jailbroken Fire Stick", "All-in-one device"], ["Google TV", "Chromecast and Google TV users"]] },
    { caption: "Coverage", headers: ["Region", "Availability"], rows: [["USA", "Full"], ["Canada", "Full"], ["UK", "Full"]] },
    { caption: "Devices", headers: ["Device", "Supported"], rows: [["Fire Stick", "Yes"], ["Google TV", "Yes"], ["Android", "Yes"], ["Chromecast", "Yes"]] },
    { caption: "Plans", headers: ["Type", "Details"], rows: [["Free trial", "Available"], ["Monthly", "See shop"], ["Longer plans", "See shop"]] },
    { caption: "Support", headers: ["Channel", "Availability"], rows: [["Website", "24/7"], ["Blog", "Guides"], ["Refund", "Per policy"]] },
    { caption: "Features", headers: ["Feature", "Included"], rows: [["Live TV", "18,000+ channels"], ["VOD", "100,000+"], ["Multi-device", "Yes"]] },
    { caption: "Location", headers: ["Area", "Served"], rows: [["[LOCATION]", "Yes"], ["USA", "Yes"], ["Canada", "Yes"], ["UK", "Yes"]] },
    { caption: "Streaming", headers: ["Topic", "Info"], rows: [["Quality", "HD/4K"], ["Internet", "10+ Mbps"], ["Apps", "TiviMate, Stremio"]] },
    { caption: "Ordering", headers: ["Step", "Action"], rows: [["1", "Visit shop"], ["2", "Choose plan or device"], ["3", "Checkout"], ["4", "Stream or receive device"]] },
    { caption: "FAQ summary", headers: ["Question", "Answer"], rows: [["What is IPTV?", "Live TV over internet"], ["Free trial?", "Yes"], ["Devices?", "Fire Stick, Google TV, Android"]] },
    { caption: "Pillar pages", headers: ["Page", "URL"], rows: [["IPTV Services", "/iptv-services"], ["Jailbroken Fire Sticks", "/jailbroken-fire-sticks"], ["Shop", "/shop"]] },
    { caption: "Resources", headers: ["Resource", "Link"], rows: [["Blog", "/blog"], ["Terms", "/terms"], ["Privacy", "/privacy"]] },
    { caption: "Contact", headers: ["Method", "Details"], rows: [["Website", "streamstickpro.com"], ["Support", "24/7"], ["Refund", "Per policy"]] },
    { caption: "SEO locations", headers: ["Country", "Coverage"], rows: [["USA", "Yes"], ["Canada", "Yes"], ["UK", "Yes"]] },
  ],
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// USA: 50 states × 100 city names = 5000 unique (city-state) slugs
const USA_STATES: { name: string; abbr: string }[] = [
  { name: "Alabama", abbr: "al" }, { name: "Alaska", abbr: "ak" }, { name: "Arizona", abbr: "az" }, { name: "Arkansas", abbr: "ar" },
  { name: "California", abbr: "ca" }, { name: "Colorado", abbr: "co" }, { name: "Connecticut", abbr: "ct" }, { name: "Delaware", abbr: "de" },
  { name: "Florida", abbr: "fl" }, { name: "Georgia", abbr: "ga" }, { name: "Hawaii", abbr: "hi" }, { name: "Idaho", abbr: "id" },
  { name: "Illinois", abbr: "il" }, { name: "Indiana", abbr: "in" }, { name: "Iowa", abbr: "ia" }, { name: "Kansas", abbr: "ks" },
  { name: "Kentucky", abbr: "ky" }, { name: "Louisiana", abbr: "la" }, { name: "Maine", abbr: "me" }, { name: "Maryland", abbr: "md" },
  { name: "Massachusetts", abbr: "ma" }, { name: "Michigan", abbr: "mi" }, { name: "Minnesota", abbr: "mn" }, { name: "Mississippi", abbr: "ms" },
  { name: "Missouri", abbr: "mo" }, { name: "Montana", abbr: "mt" }, { name: "Nebraska", abbr: "ne" }, { name: "Nevada", abbr: "nv" },
  { name: "New Hampshire", abbr: "nh" }, { name: "New Jersey", abbr: "nj" }, { name: "New Mexico", abbr: "nm" }, { name: "New York", abbr: "ny" },
  { name: "North Carolina", abbr: "nc" }, { name: "North Dakota", abbr: "nd" }, { name: "Ohio", abbr: "oh" }, { name: "Oklahoma", abbr: "ok" },
  { name: "Oregon", abbr: "or" }, { name: "Pennsylvania", abbr: "pa" }, { name: "Rhode Island", abbr: "ri" }, { name: "South Carolina", abbr: "sc" },
  { name: "South Dakota", abbr: "sd" }, { name: "Tennessee", abbr: "tn" }, { name: "Texas", abbr: "tx" }, { name: "Utah", abbr: "ut" },
  { name: "Vermont", abbr: "vt" }, { name: "Virginia", abbr: "va" }, { name: "Washington", abbr: "wa" }, { name: "West Virginia", abbr: "wv" },
  { name: "Wisconsin", abbr: "wi" }, { name: "Wyoming", abbr: "wy" },
];

const USA_CITIES = [
  "Houston", "Dallas", "Austin", "San Antonio", "Phoenix", "Los Angeles", "San Diego", "San Jose", "Chicago", "Philadelphia",
  "Jacksonville", "Columbus", "Charlotte", "Indianapolis", "Seattle", "Denver", "Boston", "Nashville", "Detroit", "Portland",
  "Las Vegas", "Memphis", "Louisville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento", "Kansas City",
  "Atlanta", "Miami", "Raleigh", "Omaha", "Cleveland", "Virginia Beach", "Oakland", "Mesa", "Tulsa", "Minneapolis",
  "Arlington", "Tampa", "New Orleans", "Wichita", "Bakersfield", "Honolulu", "Anaheim", "Aurora", "Santa Ana", "St Louis",
  "Riverside", "Corpus Christi", "Pittsburgh", "Lexington", "Anchorage", "Stockton", "Cincinnati", "St Paul", "Toledo", "Newark",
  "Greensboro", "Plano", "Henderson", "Lincoln", "Buffalo", "Fort Wayne", "Jersey City", "St Petersburg", "Chula Vista", "Orlando",
  "Laredo", "Norfolk", "Chandler", "Madison", "Lubbock", "Scottsdale", "Reno", "Durham", "Winston-Salem", "Garland",
  "Gilbert", "Glendale", "North Las Vegas", "Irving", "Hialeah", "Fremont", "Boise", "Richmond", "Baton Rouge", "Spokane",
  "San Bernardino", "Birmingham", "Rochester", "Des Moines", "Modesto", "Fayetteville", "Tacoma", "Oxnard", "Fontana", "Moreno Valley",
];

// Canada: 13 provinces/territories × 155 cities ≈ 2015
const CA_REGIONS: { name: string; abbr: string }[] = [
  { name: "Ontario", abbr: "on" }, { name: "Quebec", abbr: "qc" }, { name: "British Columbia", abbr: "bc" }, { name: "Alberta", abbr: "ab" },
  { name: "Manitoba", abbr: "mb" }, { name: "Saskatchewan", abbr: "sk" }, { name: "Nova Scotia", abbr: "ns" }, { name: "New Brunswick", abbr: "nb" },
  { name: "Newfoundland and Labrador", abbr: "nl" }, { name: "Prince Edward Island", abbr: "pe" }, { name: "Northwest Territories", abbr: "nt" },
  { name: "Yukon", abbr: "yt" }, { name: "Nunavut", abbr: "nu" },
];

const CA_CITIES = [
  "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener",
  "London", "Victoria", "Halifax", "Oshawa", "Windsor", "Saskatoon", "Regina", "Sherbrooke", "Barrie", "Kelowna",
  "Abbotsford", "Kingston", "Guelph", "Kanata", "Trois-Rivieres", "Moncton", "Saint John", "Thunder Bay", "Peterborough", "Red Deer",
  "Saint-Jean-sur-Richelieu", "Lethbridge", "Kamloops", "Nanaimo", "Brantford", "Chatham", "Belleville", "Milton", "Niagara Falls", "Sarnia",
  "Fort McMurray", "Prince George", "Sault Ste Marie", "Medicine Hat", "Grande Prairie", "Saint-Jerome", "Drummondville", "Newmarket", "Woodstock", "Brockville",
  "Fredericton", "Charlottetown", "Saint John's", "Whitehorse", "Yellowknife", "Iqaluit", "Levis", "Terrebonne", "Sherwood Park", "Barrie",
  "Orillia", "Cornwall", "Chilliwack", "Prince Albert", "Lloydminster", "Joliette", "Rimouski", "Victoriaville", "Rouyn-Noranda", "Val-d'Or",
  "Sept-Iles", "Timmins", "North Bay", "Kenora", "Flin Flon", "Thompson", "Brandon", "Portage la Prairie", "Moose Jaw", "Swift Current",
  "Yorkton", "Estevan", "North Battleford", "Meadow Lake", "La Ronge", "Flin Flon", "The Pas", "Dauphin", "Selkirk", "Steinbach",
  "Winkler", "Portage", "Morden", "Ste Anne", "Stonewall", "Gimli", "Drumheller", "Camrose", "Wetaskiwin", "Cold Lake",
  "Fort Saskatchewan", "Spruce Grove", "St Albert", "Airdrie", "Cochrane", "Canmore", "Banff", "Jasper", "Hinton", "Grande Cache",
  "Peace River", "High Level", "Fort Nelson", "Dawson Creek", "Terrace", "Smithers", "Williams Lake", "Quesnel", "Powell River", "Campbell River",
  "Port Alberni", "Courtenay", "Parksville", "Duncan", "Penticton", "Vernon", "Salmon Arm", "Revelstoke", "Nelson", "Trail",
  "Cranbrook", "Fernie", "Invermere", "Creston", "Castlegar", "Grand Forks", "Oliver", "Osoyoos", "Summerland", "Peachland",
  "West Kelowna", "Vernon", "Armstrong", "Enderby", "Sicamous", "Chase", "Clearwater", "Barriere", "Kamloops", "Cache Creek",
  "Ashcroft", "Merritt", "Princeton", "Hope", "Chilliwack", "Agassiz", "Harrison", "Mission", "Maple Ridge", "Pitt Meadows",
  "Coquitlam", "Port Coquitlam", "Burnaby", "New Westminster", "Surrey", "Delta", "Langley", "White Rock", "Abbotsford", "Chilliwack",
  "Kent", "Squamish", "Whistler", "Pemberton", "Lillooet", "Lytton", "Boston Bar", "Merritt", "Princeton", "Manning Park",
];

// UK: 4 countries × 334 cities ≈ 1336 (use 334 unique city names × 4 = 1336)
const UK_REGIONS: { name: string; abbr: string }[] = [
  { name: "England", abbr: "england" }, { name: "Scotland", abbr: "scotland" }, { name: "Wales", abbr: "wales" }, { name: "Northern Ireland", abbr: "ni" },
];

const UK_CITIES = [
  "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Bristol", "Sheffield", "Edinburgh", "Cardiff",
  "Belfast", "Newcastle", "Nottingham", "Southampton", "Brighton", "Leicester", "Coventry", "Hull", "Bradford", "Stoke-on-Trent",
  "Wolverhampton", "Derby", "Plymouth", "Reading", "Northampton", "Luton", "Aberdeen", "Portsmouth", "Milton Keynes", "Swansea",
  "Sunderland", "Warrington", "Bolton", "Slough", "Bournemouth", "Peterborough", "Norwich", "Swindon", "Southend", "Dundee",
  "Middlesbrough", "Oxford", "Blackpool", "Ipswich", "York", "West Bromwich", "Gloucester", "Cambridge", "Exeter", "Lincoln",
  "Chester", "Bath", "Canterbury", "Lancaster", "Carlisle", "Durham", "Salisbury", "Winchester", "Worcester", "Hereford",
  "Lichfield", "Ripon", "Ely", "Truro", "Wells", "St Davids", "Bangor", "St Asaph", "Armagh", "Lisburn",
  "Newry", "Derry", "Newtownabbey", "Bangor", "Craigavon", "Castlereagh", "Ballymena", "Newtownards", "Carrickfergus", "Coleraine",
  "Omagh", "Antrim", "Larne", "Enniskillen", "Downpatrick", "Strabane", "Limavady", "Cookstown", "Dungannon", "Dumfries",
  "Greenock", "Paisley", "East Kilbride", "Livingston", "Cumbernauld", "Hamilton", "Kirkcaldy", "Dunfermline", "Ayr", "Kilmarnock",
  "Inverness", "Perth", "Stirling", "Falkirk", "Arbroath", "Montrose", "Dundee", "Brechin", "Forfar", "Blairgowrie",
  "Dunblane", "Alloa", "St Andrews", "Cupar", "Glenrothes", "Leven", "Buckhaven", "Cowdenbeath", "Burntisland", "Kirkcaldy",
  "Dunfermline", "Rosyth", "Inverkeithing", "Dalgety Bay", "Lochgelly", "Ballingry", "Kelty", "Lochore", "Cardenden", "Burntisland",
  "Newport", "Cwmbran", "Barry", "Neath", "Port Talbot", "Bridgend", "Pontypridd", "Merthyr Tydfil", "Caerphilly", "Ebbw Vale",
  "Rhondda", "Swansea", "Llanelli", "Carmarthen", "Haverfordwest", "Fishguard", "Cardigan", "Aberystwyth", "Bala", "Dolgellau",
  "Barnsley", "Doncaster", "Rotherham", "Chesterfield", "Buxton", "Matlock", "Ilkeston", "Long Eaton", "Ripley", "Alfreton",
  "Mansfield", "Worksop", "Retford", "Gainsborough", "Scunthorpe", "Grimsby", "Cleethorpes", "Louth", "Skegness", "Boston",
  "Spalding", "Stamford", "Grantham", "Sleaford", "Lincoln", "Gainsborough", "Market Rasen", "Louth", "Horncastle", "Woodhall Spa",
  "Beverley", "Bridlington", "Scarborough", "Whitby", "Pickering", "Malton", "Filey", "Driffield", "Pocklington", "Market Weighton",
  "Hull", "Hessle", "Cottingham", "Beverley", "Hornsea", "Withernsea", "Hedon", "Brough", "Goole", "Howden",
  "Selby", "Tadcaster", "York", "Malton", "Pickering", "Whitby", "Scarborough", "Filey", "Bridlington", "Driffield",
  "Harrogate", "Ripon", "Knaresborough", "Richmond", "Leyburn", "Hawes", "Sedbergh", "Kirkby Lonsdale", "Settle", "Skipton",
  "Keighley", "Shipley", "Bingley", "Ilkley", "Otley", "Pudsey", "Morley", "Dewsbury", "Batley", "Wakefield",
  "Pontefract", "Castleford", "Featherstone", "Hemsworth", "South Elmsall", "Normanton", "Knottingley", "Goole", "Thorne", "Doncaster",
  "Rotherham", "Sheffield", "Barnsley", "Mexborough", "Conisbrough", "Tickhill", "Bawtry", "Worksop", "Retford", "East Retford",
  "Tuxford", "Ollerton", "Newark", "Southwell", "Mansfield", "Sutton in Ashfield", "Kirkby in Ashfield", "Hucknall", "Eastwood", "Beeston",
  "Stapleford", "Long Eaton", "Ilkeston", "Ripley", "Alfreton", "Belper", "Derby", "Ashbourne", "Buxton", "Bakewell",
  "Matlock", "Chesterfield", "Bolsover", "Shirebrook", "Clowne", "Eckington", "Dronfield", "Staveley", "Clay Cross", "North Wingfield",
  "Leicester", "Loughborough", "Hinckley", "Melton Mowbray", "Market Harborough", "Lutterworth", "Coalville", "Ashby", "Oakham", "Uppingham",
  "Stamford", "Bourne", "Spalding", "Holbeach", "Crowland", "Peterborough", "Wisbech", "March", "Chatteris", "Huntingdon",
  "St Neots", "Bedford", "Luton", "Dunstable", "Leighton Buzzard", "Aylesbury", "High Wycombe", "Marlow", "Amersham", "Chesham",
  "Hemel Hempstead", "Watford", "St Albans", "Stevenage", "Hitchin", "Letchworth", "Baldock", "Royston", "Bishops Stortford", "Harlow",
  "Epping", "Chigwell", "Romford", "Brentwood", "Basildon", "Southend", "Rayleigh", "Wickford", "Billericay", "Chelmsford",
  "Colchester", "Clacton", "Harwich", "Ipswich", "Bury St Edmunds", "Newmarket", "Mildenhall", "Thetford", "Diss", "Stowmarket",
  "Sudbury", "Hadleigh", "Woodbridge", "Felixstowe", "Lowestoft", "Great Yarmouth", "Norwich", "North Walsham", "Cromer", "Sheringham",
  "Hunstanton", "King's Lynn", "Wisbech", "March", "Ely", "Cambridge", "Newmarket", "Bury St Edmunds", "Stowmarket", "Ipswich",
  "Bury St Edmunds", "Thetford", "Dereham", "Fakenham", "Holt", "Wells-next-the-Sea", "Sheringham", "Cromer", "Mundesley", "North Walsham",
  "Aylsham", "Norwich", "Wymondham", "Attleborough", "Watton", "Swaffham", "Downham Market", "Wisbech", "March", "Chatteris",
  "Ramsey", "St Ives", "Huntingdon", "St Neots", "Bedford", "Kempston", "Flitwick", "Ampthill", "Leighton Buzzard", "Dunstable",
  "Luton", "Harpenden", "Welwyn", "Hatfield", "Potters Bar", "Enfield", "Edmonton", "Tottenham", "Walthamstow", "Leyton",
  "Stratford", "West Ham", "Plaistow", "Barking", "Dagenham", "Romford", "Hornchurch", "Upminster", "Rainham", "Grays",
  "Tilbury", "Stanford-le-Hope", "Basildon", "Pitsea", "Benfleet", "Canvey Island", "Rayleigh", "Rochford", "Southend", "Leigh-on-Sea",
  "Chalkwell", "Westcliff", "Shoeburyness", "Rochford", "Hockley", "Rayleigh", "Wickford", "Billericay", "Brentwood", "Harold Wood",
  "Gidea Park", "Emerson Park", "Hornchurch", "Upminster", "Cranham", "Upminster", "Rainham", "Dagenham", "Barking", "East Ham",
  "Plaistow", "Stratford", "Leyton", "Walthamstow", "Tottenham", "Edmonton", "Enfield", "Southgate", "Oakwood", "Cockfosters",
  "Barnet", "Finchley", "Golders Green", "Hampstead", "Highgate", "Muswell Hill", "Crouch End", "Hornsey", "Wood Green", "Tottenham",
  "Stoke Newington", "Dalston", "Hackney", "Shoreditch", "Bethnal Green", "Stepney", "Limehouse", "Poplar", "Canary Wharf", "Millwall",
  "Surrey Quays", "Rotherhithe", "Bermondsey", "Southwark", "Peckham", "Camberwell", "Brixton", "Clapham", "Battersea", "Wandsworth",
  "Tooting", "Streatham", "Norwood", "Sydenham", "Forest Hill", "Lewisham", "Blackheath", "Greenwich", "Woolwich", "Plumstead",
  "Charlton", "Kidbrooke", "Eltham", "Welling", "Bexleyheath", "Dartford", "Gravesend", "Rochester", "Chatham", "Gillingham",
  "Maidstone", "Canterbury", "Dover", "Folkestone", "Hythe", "Ashford", "Tenterden", "Cranbrook", "Tonbridge", "Sevenoaks",
  "Dartford", "Bexley", "Sidcup", "Welling", "Eltham", "Greenwich", "Woolwich", "Plumstead", "Abbey Wood", "Thamesmead",
  "Erith", "Belvedere", "Bexleyheath", "Crayford", "Dartford", "Swanscombe", "Northfleet", "Gravesend", "Northfleet", "Gravesend",
  "Rochester", "Chatham", "Gillingham", "Sittingbourne", "Faversham", "Whitstable", "Herne Bay", "Margate", "Ramsgate", "Broadstairs",
  "Deal", "Sandwich", "Dover", "Folkestone", "Hythe", "New Romney", "Lydd", "Rye", "Hastings", "Bexhill",
  "Eastbourne", "Seaford", "Newhaven", "Peacehaven", "Brighton", "Hove", "Worthing", "Littlehampton", "Bognor Regis", "Chichester",
  "Portsmouth", "Southsea", "Gosport", "Fareham", "Portchester", "Havant", "Waterlooville", "Petersfield", "Alton", "Basingstoke",
  "Andover", "Winchester", "Eastleigh", "Southampton", "Romsey", "Salisbury", "Amesbury", "Warminster", "Westbury", "Trowbridge",
  "Bradford on Avon", "Bath", "Keynsham", "Bristol", "Clevedon", "Weston-super-Mare", "Burnham-on-Sea", "Bridgwater", "Taunton", "Wellington",
  "Chard", "Yeovil", "Sherborne", "Dorchester", "Weymouth", "Portland", "Bridport", "Lyme Regis", "Exmouth", "Exeter",
  "Crediton", "Okehampton", "Tavistock", "Plymouth", "Ivybridge", "Totnes", "Dartmouth", "Kingsbridge", "Salcombe", "Plymouth",
  "Truro", "Falmouth", "Penzance", "St Ives", "Newquay", "Bodmin", "Launceston", "Bude", "Wadebridge", "St Austell",
  "Redruth", "Camborne", "Helston", "Falmouth", "Penzance", "Mousehole", "Marazion", "St Just", "Lands End", "Sennen",
];

interface LocationRow {
  country: string;
  region: string;
  location: string;
  slug: string;
}

function buildUSALocations(): LocationRow[] {
  const out: LocationRow[] = [];
  const seen = new Set<string>();
  for (const state of USA_STATES) {
    for (let i = 0; i < 100; i++) {
      const city = USA_CITIES[i % USA_CITIES.length];
      const slug = `${slugify(city)}-${state.abbr}`;
      if (seen.has(slug)) continue;
      seen.add(slug);
      out.push({ country: "USA", region: state.name, location: city, slug });
      if (out.length >= 5000) return out;
    }
  }
  return out;
}

function buildCALocations(): LocationRow[] {
  const out: LocationRow[] = [];
  const seen = new Set<string>();
  for (const region of CA_REGIONS) {
    for (let i = 0; i < 155; i++) {
      const city = CA_CITIES[i % CA_CITIES.length];
      const slug = `${slugify(city)}-${region.abbr}`;
      if (seen.has(slug)) continue;
      seen.add(slug);
      out.push({ country: "CA", region: region.name, location: city, slug });
      if (out.length >= 2015) return out;
    }
  }
  return out;
}

function buildUKLocations(max: number): LocationRow[] {
  const out: LocationRow[] = [];
  const seen = new Set<string>();
  for (const region of UK_REGIONS) {
    for (let i = 0; i < 334; i++) {
      const city = UK_CITIES[i % UK_CITIES.length];
      const slug = `${slugify(city)}-${region.abbr}`;
      if (seen.has(slug)) continue;
      seen.add(slug);
      out.push({ country: "UK", region: region.name, location: city, slug });
      if (out.length >= max) return out;
    }
  }
  return out;
}

// Target 24,950 new rows so 50 existing + 24,950 = 25,000 total. 24,950 / 3 = 8316 locations + 2 rows.
const TARGET_NEW_ROWS = 24_950;
const TARGET_LOCATIONS = Math.floor(TARGET_NEW_ROWS / 3); // 8316
const EXTRA_ROWS = TARGET_NEW_ROWS - TARGET_LOCATIONS * 3; // 2

function buildAllLocations(): LocationRow[] {
  const usa = buildUSALocations();
  const ca = buildCALocations().slice(0, 2000);
  const needUk = TARGET_LOCATIONS - usa.length - ca.length;
  const uk = buildUKLocations(Math.max(0, needUk));
  return [...usa, ...ca, ...uk].slice(0, TARGET_LOCATIONS);
}

function contentBlocksWithLocation(location: string): typeof CONTENT_BLOCKS {
  const replace = (s: string) => s.replace(/\[LOCATION\]/g, location);
  return {
    h2_sections: CONTENT_BLOCKS.h2_sections.map((h) => ({
      heading: replace(h.heading),
      body: replace(h.body),
    })),
    numbered_lists: CONTENT_BLOCKS.numbered_lists.map((n) => ({
      title: replace(n.title),
      items: n.items.map((i) => replace(i)),
    })),
    tables: CONTENT_BLOCKS.tables.map((t) => ({
      caption: replace(t.caption),
      headers: t.headers,
      rows: t.rows.map((row) => row.map((c) => replace(c))),
    })),
  };
}

function buildRows(locations: LocationRow[]): any[] {
  const rows: any[] = [];
  const faq = [
    { question: "What is IPTV?", answer: "IPTV delivers live TV over the internet. StreamStickPro offers 18,000+ channels for Fire Stick and Google TV." },
    { question: "Do you serve my area?", answer: "StreamStickPro serves the USA, Canada, and UK. Check the shop for shipping and availability." },
    { question: "Is there a free trial?", answer: "Yes. StreamStickPro offers a free trial. Visit the homepage to start streaming." },
  ];
  for (const loc of locations) {
    const contentBlocks = contentBlocksWithLocation(loc.location);
    const pillarIptv = "/iptv-services";
    const pillarJailbreak = "/jailbroken-fire-sticks";
    const pillarGoogle = "/iptv-media-players";
    const p1 = "StreamStickPro delivers 18,000+ IPTV channels + jailbroken Fire Sticks with Kodi/Stremio pre-installed. Works Google TV/Chromecast. Free trial available.";
    // IPTV
    rows.push({
      page_type: "iptv",
      country: loc.country,
      region: loc.region,
      location: loc.location,
      slug: loc.slug,
      target_keyword: `IPTV ${loc.location}`,
      title: `${loc.location} IPTV + Jailbroken Fire Stick Guide 2026 | StreamStickPro`,
      meta_description: `StreamStickPro: 18,000+ IPTV channels + jailbroken Fire Sticks for ${loc.location}. Google TV ready. Free trial.`,
      h1: `[LOCATION] IPTV + Jailbroken Fire Stick Guide 2026`,
      p1_snippet: p1,
      pillar_url: pillarIptv,
      internal_links: INTERNAL_LINKS,
      content_blocks: contentBlocks,
      faq_json: faq,
      published: true,
    });
    // Jailbreak
    rows.push({
      page_type: "jailbreak",
      country: loc.country,
      region: loc.region,
      location: loc.location,
      slug: loc.slug,
      target_keyword: `jailbroken Fire Stick ${loc.location}`,
      title: `${loc.location} Jailbroken Fire Stick 2026 | StreamStickPro`,
      meta_description: `Pre-jailbroken Fire Stick for ${loc.location}. Kodi/Stremio pre-installed. StreamStickPro. Free trial IPTV.`,
      h1: `[LOCATION] Jailbroken Fire Stick Guide 2026`,
      p1_snippet: p1,
      pillar_url: pillarJailbreak,
      internal_links: INTERNAL_LINKS,
      content_blocks: contentBlocks,
      faq_json: faq,
      published: true,
    });
    // Google
    rows.push({
      page_type: "google",
      country: loc.country,
      region: loc.region,
      location: loc.location,
      slug: loc.slug,
      target_keyword: `Google TV IPTV ${loc.location}`,
      title: `${loc.location} Google TV IPTV 2026 | StreamStickPro`,
      meta_description: `IPTV on Google TV for ${loc.location}. StreamStickPro 18,000+ channels. Chromecast compatible. Free trial.`,
      h1: `[LOCATION] Google TV IPTV Guide 2026`,
      p1_snippet: p1,
      pillar_url: pillarGoogle,
      internal_links: INTERNAL_LINKS,
      content_blocks: contentBlocks,
      faq_json: faq,
      published: true,
    });
  }
  return rows;
}

const BATCH = 200;

/** Returns full array of rows to upsert (for use by seed-via-database-url or tests). */
export function getSeedRows(): any[] {
  const locations = buildAllLocations();
  const allRows = buildRows(locations);
  const faq = [
    { question: "What is IPTV?", answer: "IPTV delivers live TV over the internet. StreamStickPro offers 18,000+ channels for Fire Stick and Google TV." },
    { question: "Do you serve my area?", answer: "StreamStickPro serves the USA, Canada, and UK." },
    { question: "Is there a free trial?", answer: "Yes. StreamStickPro offers a free trial. Visit the homepage to start streaming." },
  ];
  const p1 = "StreamStickPro delivers 18,000+ IPTV channels + jailbroken Fire Sticks with Kodi/Stremio pre-installed. Works Google TV/Chromecast. Free trial available.";
  const contentBlocks = contentBlocksWithLocation("your area");
  for (let e = 0; e < EXTRA_ROWS; e++) {
    const slug = `streamstickpro-coverage-${e + 1}`;
    const pageTypes = ["iptv", "jailbreak", "google"] as const;
    allRows.push({
      page_type: pageTypes[e],
      country: "USA",
      region: "National",
      location: "National",
      slug,
      target_keyword: `IPTV coverage ${e + 1}`,
      title: `IPTV + Fire Stick Coverage Guide 2026 | StreamStickPro`,
      meta_description: `StreamStickPro: 18,000+ IPTV channels + jailbroken Fire Sticks. Google TV ready. Free trial.`,
      h1: "IPTV + Jailbroken Fire Stick Guide 2026",
      p1_snippet: p1,
      pillar_url: "/iptv-services",
      internal_links: INTERNAL_LINKS,
      content_blocks: contentBlocks,
      faq_json: faq,
      published: true,
    });
  }
  return allRows;
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ Missing env. Set VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_KEY.");
    console.error("   From Supabase: Dashboard → Project Settings → API (URL + service_role key).");
    console.error("   Local: export VITE_SUPABASE_URL=... SUPABASE_SERVICE_KEY=... then run this script.");
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const redactedUrl = SUPABASE_URL.replace(/^https?:\/\/([^.]+\.)?/, "https://***.");
  console.log("📍 Supabase project:", redactedUrl);

  const { count: existingCount, error: countError } = await supabase
    .from("seo_architecture")
    .select("id", { count: "exact", head: true });
  if (countError) {
    console.error("❌ Table seo_architecture missing or not readable:", countError.message);
    console.error("   Run migrations first (Deploy workflow runs them, or: npx tsx scripts/run-supabase-migration.ts with DATABASE_URL).");
    process.exit(1);
  }
  console.log("   Existing rows in seo_architecture before seed:", existingCount ?? 0);

  const locations = buildAllLocations();
  const allRows = getSeedRows();
  const totalRows = allRows.length;
  console.log(`📍 Built ${locations.length} locations + ${EXTRA_ROWS} extra → ${totalRows} rows (target ${TARGET_NEW_ROWS} new)`);
  let inserted = 0;
  let skipped = 0;
  for (let i = 0; i < allRows.length; i += BATCH) {
    const batch = allRows.slice(i, i + BATCH);
    const { data, error } = await supabase.from("seo_architecture").upsert(batch, {
      onConflict: "page_type,country,slug",
      ignoreDuplicates: true,
    }).select("id");
    if (error) {
      console.error("Batch error:", error.message);
      throw error;
    }
    const count = data?.length ?? 0;
    inserted += count;
    skipped += batch.length - count;
    process.stdout.write(`\r  Upserted ${i + batch.length}/${allRows.length} (inserted: ${inserted}, skipped: ${skipped})`);
  }
  const { count: finalCount, error: finalError } = await supabase
    .from("seo_architecture")
    .select("id", { count: "exact", head: true });
  if (!finalError) {
    console.log("   Total rows in seo_architecture after seed:", finalCount ?? 0);
  }
  console.log("\n✅ Done. Total inserted:", inserted, "| Skipped (existing):", skipped);

  // Fail if we expected to add many rows but inserted none (e.g. wrong key or RLS blocking)
  const expectedMinInsert = Math.min(TARGET_NEW_ROWS, totalRows);
  if (expectedMinInsert > 1000 && inserted === 0) {
    console.error("\n❌ Seed inserted 0 rows but expected at least", expectedMinInsert, "- check SUPABASE_SERVICE_KEY (service_role, not anon) and RLS.");
    process.exit(1);
  }
}

// Only run main when this file is executed directly (not when imported by seed-25k-via-database-url)
const isEntry = process.argv[1]?.replace(/\\/g, "/").includes("seed-25k-location-pages");
if (isEntry) main().catch((e) => { console.error(e); process.exit(1); });
