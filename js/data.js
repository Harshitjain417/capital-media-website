/* =========================================================
   EDIT THIS FILE TO MAKE THE SITE YOURS
   Everything on the site (name, niches, case studies, clients)
   comes from here.
   ========================================================= */

window.SITE = {
  name: "Capital Media",
  short: "cm",
  domain: "capitalmedia.studio",
  email: "hello@capitalmedia.studio",
  bookingUrl: "https://calendly.com/", // your Calendly / Cal.com link
  socials: {
    LinkedIn: "https://linkedin.com/",
    X: "https://x.com/",
    YouTube: "https://youtube.com/",
    Instagram: "https://instagram.com/"
  },
  // Rotating niche words in the hero ("Video & motion for …")
  niches: ["brokerages", "fund managers", "fintech apps", "ETF issuers", "B2B SaaS", "AI startups"],
  // Optional showreel (used inside case studies too). Leave "" to hide.
  showreel: "assets/videos/showreel.mp4"
};

/* ---------------------------------------------------------
   TEAM EXPERIENCE WALL
   IMPORTANT: Only list brands you have personally worked on,
   and check your current employment contract / NDA before
   naming them publicly.
   --------------------------------------------------------- */
window.EXPERIENCE = [
  { name: "Motilal Oswal", type: "Brokerage & wealth" },
  { name: "Angel One", type: "Trading app" },
  { name: "Vested Finance", type: "US-stocks investing app" },
  { name: "Tata Mutual Fund", type: "Asset manager" },
  { name: "UTI Mutual Fund", type: "Asset manager" },
  { name: "Kotak Neo", type: "Trading app" },
  { name: "SBI Mutual Fund", type: "Asset manager" },
  { name: "ICICI Direct", type: "Bank-backed brokerage" }
];

/* ---------------------------------------------------------
   CASE STUDIES (sample content: replace with your real work)
   Results here are placeholders. Only publish numbers you can prove.
   --------------------------------------------------------- */
window.CASES = [
  {
    id: "nfo-launch",
    client: "Top-5 Asset Manager",
    sector: "Finance · Mutual Funds",
    title: "Making a fund launch feel like a product drop",
    headline: "18.4M",
    headlineLabel: "organic views in 21 days",
    tags: ["Launch campaign", "Motion explainers", "Reels"],
    color: "#f2b544",
    video: "assets/videos/case-1.mp4",
    brief: "A new thematic fund had a 14-day subscription window. The category was crowded, and every competitor's launch looked like the same chart-and-disclaimer slideshow.",
    insight: "Retail investors don't buy funds, they buy a story about the future. So we sold the theme first and the fund second, and gave every compliance disclosure a designed slot instead of a wall of fine print.",
    execution: [
      { k: "12", v: "short-form explainers, one per sub-theme" },
      { k: "3", v: "long-form motion films for YouTube" },
      { k: "40+", v: "ad cut-downs for paid amplification" },
      { k: "48h", v: "turnaround per compliance revision" }
    ],
    results: [
      { n: 18.4, suf: "M", label: "Organic views" },
      { n: 62, suf: "%", label: "Avg. watch-through" },
      { n: 3.1, suf: "x", label: "Benchmark CTR" }
    ],
    quote: "Our compliance team actually enjoyed the review rounds. That has never happened before.",
    quoteBy: "Head of Digital, asset manager"
  },
  {
    id: "trading-app",
    client: "Discount Trading App",
    sector: "Finance · Brokerage",
    title: "Turning F&O jargon into 30-second habits",
    headline: "+212%",
    headlineLabel: "follower growth in one quarter",
    tags: ["Always-on content", "Talking heads", "Data-viz"],
    color: "#5aa9ff",
    video: "assets/videos/case-2.mp4",
    brief: "The app had millions of downloads but most users never placed a second trade. The content team was publishing generic market updates that nobody finished watching.",
    insight: "Beginners don't need more market news. They need one concept explained in the time it takes to wait for a lift. We built a recurring series format so every video taught exactly one idea.",
    execution: [
      { k: "5", v: "videos a week, every week" },
      { k: "1", v: "series format with a reusable motion system" },
      { k: "6", v: "in-house analysts turned into on-camera hosts" },
      { k: "9:16", v: "first, then cut for YouTube and LinkedIn" }
    ],
    results: [
      { n: 212, suf: "%", label: "Follower growth" },
      { n: 4.6, suf: "M", label: "Monthly reach" },
      { n: 41, suf: "%", label: "Lower cost per install" }
    ],
    quote: "They built us a content engine, not a pile of videos.",
    quoteBy: "Brand Lead, trading app"
  },
  {
    id: "saas-launch",
    client: "Series-B SaaS Platform",
    sector: "SaaS · B2B",
    title: "A 90-second launch film that did the sales demo's job",
    headline: "1,900+",
    headlineLabel: "demo requests in launch week",
    tags: ["Launch film", "UI motion", "Product marketing"],
    color: "#ff7a59",
    video: "assets/videos/case-3.mp4",
    brief: "A complex B2B product was launching a new AI feature. Sales demos were 45 minutes long and prospects were dropping off before they saw the good part.",
    insight: "Show the outcome before the interface. We storyboarded the film around one customer's Monday morning, and only revealed the UI once the problem hurt.",
    execution: [
      { k: "90s", v: "hero launch film" },
      { k: "8", v: "feature cut-downs for LinkedIn and X" },
      { k: "100%", v: "UI rebuilt as clean, animatable motion" },
      { k: "3wk", v: "from kickoff to launch" }
    ],
    results: [
      { n: 1900, suf: "+", label: "Demo requests" },
      { n: 2.4, suf: "M", label: "Launch impressions" },
      { n: 34, suf: "%", label: "Shorter sales cycle" }
    ],
    quote: "Our AEs now send the film before the first call. It's our best closer.",
    quoteBy: "VP Marketing, SaaS platform"
  }
];

window.SERVICES = [
  { name: "Market & product explainers", desc: "Complex ideas such as options, ETFs, APIs and pricing models, explained in motion that people finish watching." },
  { name: "Launch films", desc: "Fund launches, app releases and feature drops, built like product launches rather than press releases." },
  { name: "Always-on short-form", desc: "A weekly engine of Reels, Shorts, TikToks and LinkedIn video, built on a reusable series format." },
  { name: "Talking-head & founder content", desc: "Turn your analysts, PMs and founders into creators, with premium edits, B-roll and data-viz." },
  { name: "UI & data motion", desc: "Charts, dashboards and app flows rebuilt as crisp, on-brand motion graphics." },
  { name: "Performance ad creative", desc: "Hook-tested ad variations for Meta, YouTube and LinkedIn, with disclosures designed in from frame one." }
];

window.TESTIMONIALS = [
  { quote: "They speak finance. We didn't have to explain what an expense ratio is, or why that disclaimer can't move.", by: "Marketing Director", org: "Asset management" },
  { quote: "Fastest creative partner we've worked with, and the only one our compliance team asks for by name.", by: "Head of Content", org: "Brokerage" },
  { quote: "Our product finally looks as good as it works. The launch film paid for itself in a week.", by: "Founder & CEO", org: "B2B SaaS" }
];
