export interface VideoScript {
  id: number;
  title: string;
  duration: string;
  voiceGender: 'male' | 'female';
  platform: string[];
  hook: string;
  script: string[];
  cta: string;
  visualStyle: string;
  hashtags: string[];
  targetAudience: string;
  keyMessage: string;
}

export const promotionalVideos: VideoScript[] = [
  {
    id: 1,
    title: "Stop Paying Cable Bills",
    duration: "30 seconds",
    voiceGender: "female",
    platform: ["TikTok", "Instagram Reels", "YouTube Shorts"],
    hook: "Still paying $150 per month for cable? Let me show you something better.",
    script: [
      "I used to pay $150 every single month for cable TV.",
      "Until I discovered StreamUnlimited.tv",
      "For less than one month of cable, I got a fully loaded Fire Stick with 18,000 live channels.",
      "That's every movie, every sport, every pay-per-view event - all included.",
      "Setup took me 5 minutes. Just plug it in and start watching.",
      "I'm saving over $1,500 per year and getting way more content."
    ],
    cta: "Visit StreamUnlimited.tv - Stop throwing money away on cable.",
    visualStyle: "Split screen showing cable bill shrinking vs growing content library. Modern motion graphics with price comparisons.",
    hashtags: ["#CutTheCord", "#StreamingLife", "#FireStick", "#SaveMoney", "#NoMoreCable", "#StreamUnlimited"],
    targetAudience: "Adults 25-55 paying for cable",
    keyMessage: "Save money while getting more content"
  },
  {
    id: 2,
    title: "Fire Stick Revolution",
    duration: "45 seconds",
    voiceGender: "male",
    platform: ["TikTok", "Facebook", "Google Ads", "YouTube"],
    hook: "This little device changed everything about how I watch TV.",
    script: [
      "This is a Fire Stick from StreamUnlimited.tv, and it's not like the ones you buy in stores.",
      "This one comes pre-configured with everything you need already installed.",
      "18,000 live TV channels from around the world.",
      "Every major sporting event, including UFC, boxing, NFL, NBA - all the pay-per-view you want.",
      "60,000 movies and TV shows, updated daily with the latest releases.",
      "International channels in every language.",
      "The best part? It takes 5 minutes to set up. Plug it in, connect to WiFi, and you're streaming.",
      "No complicated jailbreaking, no confusing apps, no hassle."
    ],
    cta: "StreamUnlimited.tv - The future of streaming is here.",
    visualStyle: "Product showcase with sleek unboxing animations, feature highlights, and smooth transitions.",
    hashtags: ["#FireStick", "#Streaming", "#CordCutter", "#TechReview", "#StreamUnlimited"],
    targetAudience: "Tech-savvy adults looking for streaming solutions",
    keyMessage: "Pre-configured and ready to use - no hassle"
  },
  {
    id: 3,
    title: "18,000 Channels vs Cable",
    duration: "25 seconds",
    voiceGender: "female",
    platform: ["TikTok", "Twitter/X", "Instagram"],
    hook: "Your cable package: 200 channels you don't watch. StreamUnlimited: 18,000 channels you will.",
    script: [
      "Cable companies want $150 a month for 200 channels.",
      "StreamUnlimited.tv gives you 18,000 channels.",
      "Every sport. Every movie. Every show.",
      "Live TV from every country.",
      "All the pay-per-view events without the pay-per-view prices.",
      "And it's all in 4K quality."
    ],
    cta: "StreamUnlimited.tv - Unlock everything.",
    visualStyle: "Fast-paced channel grid display with animated logos cascading across screen. Energy and excitement.",
    hashtags: ["#StreamingWars", "#CableFree", "#LiveTV", "#StreamUnlimited", "#18000Channels"],
    targetAudience: "Frustrated cable subscribers",
    keyMessage: "Massive content library at fraction of cable cost"
  },
  {
    id: 4,
    title: "No More Buffering",
    duration: "20 seconds",
    voiceGender: "male",
    platform: ["TikTok", "Instagram Stories", "Google Display Ads"],
    hook: "Tired of the spinning wheel of death ruining every show?",
    script: [
      "Other streaming services buffer constantly.",
      "StreamUnlimited.tv streams in crystal clear 4K with zero buffering.",
      "Our servers are optimized for speed and reliability.",
      "No more watching that spinning circle.",
      "Just smooth, uninterrupted streaming every single time."
    ],
    cta: "StreamUnlimited.tv - Buffer-free streaming guaranteed.",
    visualStyle: "Split screen: left side shows frustrating buffering wheel, right side shows smooth high-quality playback.",
    hashtags: ["#NoBuffering", "#SmoothStreaming", "#4KStreaming", "#StreamUnlimited"],
    targetAudience: "Users frustrated with current streaming quality",
    keyMessage: "Superior streaming quality and reliability"
  },
  {
    id: 5,
    title: "What You Really Get",
    duration: "60 seconds",
    voiceGender: "female",
    platform: ["Facebook Ads", "YouTube Pre-roll", "LinkedIn"],
    hook: "Other sites promise jailbroken Fire Sticks with hundreds of broken apps. Here's what we actually give you.",
    script: [
      "Let me be honest with you about jailbroken Fire Sticks.",
      "Most sellers load them with 50 different apps that barely work.",
      "Half the links are dead. Nothing is organized. It's a mess.",
      "StreamUnlimited.tv does it differently.",
      "We give you ONE professional app with everything organized perfectly.",
      "Every channel works. Every movie plays. Every link is tested.",
      "We update it daily, so new content appears automatically.",
      "You're not getting a Fire Stick loaded with junk.",
      "You're getting a professionally curated streaming system.",
      "18,000 channels that actually work, 60,000 movies that actually play.",
      "Setup takes 5 minutes. Customer support is available 24/7.",
      "This is the difference between a professional service and someone's side hustle."
    ],
    cta: "StreamUnlimited.tv - This is the future.",
    visualStyle: "Side-by-side comparison showing cluttered competitor interface vs clean StreamUnlimited interface.",
    hashtags: ["#StreamingDoneRight", "#QualityStreaming", "#FireStickPro", "#StreamUnlimited"],
    targetAudience: "Buyers researching jailbroken Fire Sticks",
    keyMessage: "Professional quality vs amateur competition"
  },
  {
    id: 6,
    title: "Pay-Per-View for Free",
    duration: "30 seconds",
    voiceGender: "male",
    platform: ["TikTok", "Twitter/X", "Reddit Video Ads", "Facebook"],
    hook: "Imagine never paying $79.99 for UFC or boxing again.",
    script: [
      "UFC pay-per-view: $79.99 every single event.",
      "Boxing matches: $89.99.",
      "WWE premium events: $49.99.",
      "That's over $1,000 per year just for sports.",
      "StreamUnlimited.tv includes EVERY pay-per-view event.",
      "UFC, boxing, wrestling, soccer, NFL, NBA playoffs.",
      "All in perfect HD quality with no additional fees.",
      "You paid once. You're done."
    ],
    cta: "StreamUnlimited.tv - Every fight, every game, included.",
    visualStyle: "Sports action montage with overlay showing $0.00 price tags. High energy and excitement.",
    hashtags: ["#UFC", "#Boxing", "#PPV", "#SportsStreaming", "#StreamUnlimited", "#FreePPV"],
    targetAudience: "Sports fans tired of PPV fees",
    keyMessage: "All sports and PPV included at no extra cost"
  },
  {
    id: 7,
    title: "Movie Theater at Home",
    duration: "35 seconds",
    voiceGender: "female",
    platform: ["Instagram Reels", "Pinterest Video Pins", "YouTube"],
    hook: "60,000 movies. No subscriptions. No rental fees. No limits.",
    script: [
      "Movie tickets: $15 per person.",
      "Streaming rental: $6.99 per movie.",
      "Premium streaming services: $20 per month each.",
      "You're spending hundreds just to watch movies.",
      "StreamUnlimited.tv has 60,000 movies ready to stream.",
      "New releases added the same day they come out.",
      "Classic films, foreign cinema, documentaries, everything.",
      "All in 4K quality when available.",
      "No rental fees. No pay-per-view. Just unlimited movies."
    ],
    cta: "StreamUnlimited.tv - Your unlimited movie vault.",
    visualStyle: "Cinematic movie posters morphing and cascading, golden theater aesthetic with premium feel.",
    hashtags: ["#MovieNight", "#StreamingMovies", "#4KMovies", "#HomeTheater", "#StreamUnlimited"],
    targetAudience: "Movie enthusiasts and families",
    keyMessage: "Massive movie library with latest releases"
  },
  {
    id: 8,
    title: "Setup in 5 Minutes",
    duration: "40 seconds",
    voiceGender: "male",
    platform: ["TikTok", "YouTube Shorts", "Facebook"],
    hook: "Too complicated? Watch how easy this actually is.",
    script: [
      "People think jailbroken Fire Sticks are complicated.",
      "Let me show you the actual setup process.",
      "Step 1: Plug the Fire Stick into your TV's HDMI port.",
      "Step 2: Connect to your WiFi network.",
      "Step 3: Open the pre-installed app.",
      "That's it. You're streaming.",
      "The app is already configured. Everything is organized.",
      "Sports in one section, movies in another, live TV right there.",
      "Your grandmother could set this up.",
      "And if you somehow get stuck, we have 24/7 support ready to help."
    ],
    cta: "StreamUnlimited.tv - Setup tutorial included with every purchase.",
    visualStyle: "Clean screen recording with clear voiceover showing actual setup process step by step.",
    hashtags: ["#EasySetup", "#FireStickSetup", "#TechTutorial", "#StreamUnlimited", "#5MinuteSetup"],
    targetAudience: "Non-tech-savvy buyers hesitant about complexity",
    keyMessage: "Simple and easy setup process"
  },
  {
    id: 9,
    title: "International Channels",
    duration: "30 seconds",
    voiceGender: "female",
    platform: ["TikTok", "Instagram", "Google Search Ads", "Facebook"],
    hook: "Missing channels from your home country? We've got you covered.",
    script: [
      "Living abroad but missing TV from home?",
      "StreamUnlimited.tv has international channels from every country.",
      "Spanish channels from Mexico, Spain, and Latin America.",
      "Portuguese channels from Brazil and Portugal.",
      "Indian channels in Hindi, Tamil, Telugu, and more.",
      "Arabic channels from the Middle East.",
      "Filipino channels, Korean dramas, Japanese anime.",
      "European sports, African news, Asian entertainment.",
      "If it exists, we probably have it.",
      "Stay connected to home, no matter where you are."
    ],
    cta: "StreamUnlimited.tv - Stream from anywhere, in any language.",
    visualStyle: "World map with animated channel icons and flags appearing across different continents.",
    hashtags: ["#InternationalTV", "#Expat", "#WorldTV", "#StreamUnlimited", "#GlobalStreaming"],
    targetAudience: "Immigrants and expats missing home country content",
    keyMessage: "Comprehensive international content library"
  },
  {
    id: 10,
    title: "The Math Makes Sense",
    duration: "45 seconds",
    voiceGender: "male",
    platform: ["Facebook Ads", "LinkedIn", "YouTube", "Google Ads"],
    hook: "Let me show you the actual math on why cable makes no sense anymore.",
    script: [
      "Cable TV: $150 per month.",
      "That's $1,800 per year.",
      "Netflix: $20. Hulu: $18. Disney Plus: $14. HBO Max: $16.",
      "That's another $68 per month, or $816 per year.",
      "Total: $2,616 per year for TV.",
      "StreamUnlimited.tv Fire Stick with 3 months: $149.99.",
      "IPTV subscription after that: $24.99 per month.",
      "Year one total: $374.91.",
      "You're saving $2,241 in the first year alone.",
      "And you're getting MORE content, not less.",
      "The math is simple. Cable is dead."
    ],
    cta: "StreamUnlimited.tv - Save thousands, get more.",
    visualStyle: "Animated calculator with dollar signs and side-by-side cost comparison charts. Professional and data-driven.",
    hashtags: ["#CordCutter", "#SaveMoney", "#StreamingVsCable", "#StreamUnlimited", "#BudgetSmart"],
    targetAudience: "Budget-conscious consumers and financial planners",
    keyMessage: "Massive cost savings with superior content"
  }
];

export function generateVideoHTML(video: VideoScript): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${video.title} - StreamUnlimited.tv</title>
  <style>
    body {
      margin: 0;
      padding: 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .meta {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }
    .badge {
      background: rgba(255,255,255,0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9em;
    }
    .section {
      margin: 30px 0;
      padding: 20px;
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
    }
    .section h2 {
      margin-top: 0;
      color: #ffd700;
    }
    .hook {
      font-size: 1.3em;
      font-weight: bold;
      color: #ffd700;
      padding: 20px;
      background: rgba(0,0,0,0.3);
      border-left: 4px solid #ffd700;
      border-radius: 5px;
    }
    .script-line {
      padding: 12px;
      margin: 8px 0;
      background: rgba(255,255,255,0.08);
      border-radius: 8px;
      line-height: 1.6;
    }
    .cta {
      font-size: 1.2em;
      font-weight: bold;
      padding: 20px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border-radius: 10px;
      text-align: center;
      margin: 20px 0;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .hashtags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }
    .hashtag {
      background: rgba(255,255,255,0.15);
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎬 ${video.title}</h1>

    <div class="meta">
      <span class="badge">⏱️ ${video.duration}</span>
      <span class="badge">🎤 ${video.voiceGender === 'male' ? 'Male Voice' : 'Female Voice'}</span>
      <span class="badge">📱 ${video.platform.join(', ')}</span>
    </div>

    <div class="section">
      <h2>🎯 Hook (First 3 Seconds)</h2>
      <div class="hook">${video.hook}</div>
    </div>

    <div class="section">
      <h2>📝 Full Script</h2>
      ${video.script.map((line, i) => `<div class="script-line">${i + 1}. ${line}</div>`).join('')}
    </div>

    <div class="cta">
      ${video.cta}
    </div>

    <div class="section">
      <h2>🎨 Visual Style</h2>
      <p>${video.visualStyle}</p>
    </div>

    <div class="section">
      <h2>👥 Target Audience</h2>
      <p>${video.targetAudience}</p>
    </div>

    <div class="section">
      <h2>💡 Key Message</h2>
      <p>${video.keyMessage}</p>
    </div>

    <div class="section">
      <h2>#️⃣ Hashtags</h2>
      <div class="hashtags">
        ${video.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
