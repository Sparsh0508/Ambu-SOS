const imageUrls = {
  landingHero:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAiIsyvx2UJu_mAxrPYJnW_-fY5uKBMpbFP9x2y8ZTAkqZYDIQRLhsKcoVheo93T6XeqF6TmvC1L-KmbvzqSpY8n6knqu62T1CRIYt5TBkAPJuhODmhyNDX0oh_bTxEiLaEThdvwF3vSimhop3fLkwCXcE_3-2SRQFAh6XK0YFECWrgvFN2MMUJxbaVB_LhCse7igPweW4fBSjNtgLvq2LxvliAUsXwbeGNh2DwOKFdbEUC693Gcjs-0Wg1wN2JMuI7lQdGVUUEF_Q",
  loginHero:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCLr_-p25DKrXlpTxBaEP8UhwfU41eDasZ9biORWBUV89M0hEEjVZwBwRug08EavHJFWhruBvttHcjEkNlx6N-a0BUQjxHfTXflSdnfSp-w0Gwl961TRxnINk65Gq14WonKQJ1_Ld0MsJ6l449IqdeFbYPEYUr9j6dMYUrQQHfpxngHpFOhOJku1ImOEgFzgxd79VyF89Kpu92CSUwFZzIa2t1jVttgDs3NbKv6TYjO4ipKWtmeUPt7MJ4634lxa9ikVOquw4eQQv0",
  patientHomeMap:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD-CNQSlmJ8VIk7CP-d69aBiLKvYjXtmknRQJSLNjxLxQ5Shqb-Rq7E4CWUGgCMIke_qLW4VhPcXRzAZr39nJ8endrsIuDg8EOf92I9a2buELkhJauhme-f7NMNVZ5Ie8g1NW7GZg_j3bFDVj9hq07o7CpRTnoIEn9dUpxdoEdVkVb9P4RzqDjjxuzQv1fvW_7VAEiNTxZUim_G2UhccIsyo2WNwJlY_AlHyiBapJqVIbB3D2z9w7HvHADEw4_hzMiBeqz9Ju_sg6k",
  driverDashboardMap:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBewfGFpAXY_Urt7FdnwxU9hkLkZdDEbhrKDF1mgfZ9IfmMfqoV_R-FLmGcJ0CsngJ6d9oRDetSx6hllqC1EOpfoT1-ddjxjp6-37VDn7AJEWOL_ow1dQ4w8IE0ATWtr0Tu3p7koXRozXGKMkFLgiXcgkDklTcsYMXjEuT_XUQ9HQNTJFA5kHTGzfJteNbf9VYlZK0UeX-dSe6OhPr0r0-qVLcnDNH4R4bt2al_WdSnt1-hTzm4wKMOiGx1T5-LE8IBabJYCiXQpgk",
  scanningMap:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDyU9Nq-wuMozb9fC8DyCxEOxiPonZlXv2p98B-JPgFCs53FiokPMOrhSwbMb_6XlRRwXW_UWgA80DZ388BqmBr4jm2eiC-Nb45_QStggqqpQYiJC6Rp-qdYnXQC-pGDZDGG4jjLIpDhq3K32f7ng7odwS3L0a1ViP-vJE-eyMoxanbiqmUklxGY3n1BHevcohx9ApEesPBQAAttJPV-w29CBSBja9b6YuYAprhkp9Jn7GvEa6LMdh84_bfbteTOfQeG9bRRYelUWE",
  patientAvatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB_j5hCGLlcJ1x9Kh4ZQqz3svA-SMimdP2-_Wmyjl8c-D_tzqScLuRwNnG3uu-kgwThCgvUT6nWFAjAAsVGzlRsBKV8LerHRoaF9tOI9qdz_zv9tAs5w_7PONy3Za5UgZIwZb2GULFtvTR802JRJ1BgUMkFZDTF0_DXmLErDGvX4Bpy_h3yHCLtvsqE2O5A1gtLJ7TKDHBlYCf43D0uGuqBhHPHsVJCWcjztzqGuH4qS32c56ircPcpjp-23-2YCb1LuTJ74dFHelo",
  driverAvatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDRnJ4sCpoGggCdXDEZhFpS44cradI-4mfBmhAgvoacvNW3NEZ5alkD2gC3G4eErLPMHLfJ7yTVGh-ZH1x8cJ2IBc_FptlV2M6IBaXkO1DwzDf6oJpgtULW268xLYfZFQY1plVdeZeLTlcrFNoY2Tryq1VhWKYm9Vzt1Ecv3QsiUEEUPOysMLRVe5u6w6pgWFjCNeXPA__xrBEkMmV_vwGshVMEHNQ1bERXl-7YkKM3wCND1rhN5Hdm50Cog_ce1KScOetB1Ih9RuA",
  paramedicAvatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAIu2PuyDaLBAR2iSaS4NvvxJfv6TTGtDmKZ1H6yxy0BgLR1-0W6amZqLYjYn4DqrYekbNKEH7SXXm8D7u3Apv7W9WTSD7V_ipwoY0sqvqNblV9EW3otY2V-0GLgbeEfwCrMu3igSJT9k2_n8ITsMLok2sMqKKzrAKmDEl0JnCzNklmU8X99uECSwbJKpni5PmbG5mvj-juEYxbiRgik8zLR7pWY6AU-vuqZec3RuH1t38ydD9UzFPOXRstldusnlokgXJq8f01LH8",
  tripMap:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAnyj7_RAUNQ34FQLoUL1okMeKvb-khf4wu_P4TSj79ON1ngymMQaGAdaRN_HH6htX6r-RxUoKsniG9H7aT5sC1pwc7BBwmyNz1ZSiu-_AssBlwMD6V4pIFH3mAfHnRzxYpt8CNwFKYppSJ2qwC27UFhctygoy3-AGZZRMdupTLcjr1ZhKrJ17Xxgt5hSR_jq1dMeWPq9VKGEG5M2uC5GDpbQC1GRXel200B-Dcai-03lfIMiksdxP5SxhO-7YYJ3yWZUA4nn2I0-E",
};

function markActive(items, activeLabel) {
  return items.map((item) => ({ ...item, active: item.label === activeLabel }));
}

const patientNavBase = [
  { label: "Map", icon: "map", to: "/patient/home" },
  { label: "Missions", icon: "assignment", to: "/patient/history" },
  { label: "Chat", icon: "forum", to: "/patient/tracking" },
  { label: "Profile", icon: "person", to: "/patient/profile" },
];

const adminNavBase = [
  { label: "Dashboard", icon: "dashboard", to: "/driver/dashboard" },
  { label: "Incidents", icon: "emergency", to: "/driver/navigation" },
  { label: "Resources", icon: "ambulance", to: "/cfr/dashboard" },
  { label: "Personnel", icon: "local_hospital", to: "/patient/trip" },
  { label: "Reports", icon: "analytics", to: "/patient/history" },
];

export function getPatientBottomNav(activeLabel) {
  return markActive(patientNavBase, activeLabel);
}

export function getAdminBottomNav(activeLabel) {
  return markActive(
    [
      { label: "Dashboard", icon: "dashboard", to: "/cfr/dashboard" },
      { label: "Incidents", icon: "emergency", to: "/driver/navigation" },
      { label: "Map", icon: "map", to: "/driver/dashboard" },
      { label: "Profile", icon: "person", to: "/patient/profile" },
    ],
    activeLabel,
  );
}

export function getAdminSideNav(activeLabel) {
  return markActive(adminNavBase, activeLabel);
}

export const marketingData = {
  heroImage: imageUrls.landingHero,
  trustSignals: [
    { icon: "nest_clock_farsight_analog", title: "24/7 Active", subtitle: "Uninterrupted Grid" },
    { icon: "satellite_alt", title: "Live Dispatch", subtitle: "Zero Latency Routing" },
    { icon: "local_shipping", title: "1,200+ Units", subtitle: "Fleet Capacity" },
    { icon: "speed", title: "< 8 Min", subtitle: "Avg Response Time" },
  ],
  roleCards: [
    {
      title: "Patient Initiator",
      description:
        "One-tap SOS triggers immediate GPS localization and dispatches the nearest active unit based on real-time traffic and triage protocols.",
      icon: "personal_injury",
      accent: "primary",
      layout: "large",
      detailTitle: "Hold to Dispatch",
      detailText: "Locating nearest unit via GPS...",
      detailIcon: "sos",
    },
    {
      title: "Driver HUD",
      description:
        "Dark-mode optimized routing terminal. Pre-clears traffic lights and signals via smart city integrations.",
      icon: "directions_car",
      accent: "inverse",
      layout: "tall",
      statLabel: "Turn Right in",
      statValue: "200m",
    },
    {
      title: "Hospital Command",
      description:
        "Receive incoming patient vitals before arrival. Prepare trauma bays with exact ETA sync.",
      icon: "local_hospital",
      accent: "tertiary",
    },
    {
      title: "CFR Network",
      description:
        "Community First Responders are pinged instantly if they are closer than the nearest ambulance.",
      icon: "medical_services",
      accent: "secondary",
    },
  ],
  technicalFeatures: [
    { icon: "flash_on", title: "Instant Dispatch", copy: "Automated algorithmic matching." },
    { icon: "my_location", title: "Live Tracking", copy: "1Hz GPS refresh rate." },
    { icon: "route", title: "Smart Routing", copy: "Traffic-aware dynamic paths." },
    { icon: "monitor_heart", title: "Remote Vitals", copy: "Continuous telemetry stream." },
  ],
  footerColumns: [
    {
      heading: "Platform",
      links: ["For Hospitals", "For Fleets", "API Docs"],
    },
    {
      heading: "Safety",
      links: ["Compliance", "Privacy Policy", "Terms of Service"],
    },
  ],
};

export const patientData = {
  images: imageUrls,
  profile: {
    name: "Eleanor Vance",
    id: "AMB-8472-XQ",
    bloodType: "O-",
    dateOfBirth: "14 Nov 1978 (45y)",
    sex: "Female",
    height: "165 cm",
    weight: "68 kg",
    allergies: ["Penicillin", "Peanuts (Anaphylaxis)", "Latex"],
    contacts: [
      { name: "Mark Vance", role: "Husband • Primary" },
      { name: "Dr. Sarah Jenkins", role: "Primary Care Physician" },
    ],
  },
  rideOverview: {
    total: 42,
    completed: 38,
    cancelled: 4,
  },
  rides: [
    { date: "Oct 24, 2023", time: "14:30 HRS", destination: "Mercy General Hospital", status: "COMPLETED" },
    { date: "Oct 20, 2023", time: "09:15 HRS", destination: "St. Jude Medical Center", status: "COMPLETED" },
    { date: "Oct 15, 2023", time: "22:45 HRS", destination: "City Central Clinic", status: "CANCELLED" },
  ],
  trip: {
    mission: "Mission #TRP-8492",
    code: "Code 2 • Non-Emergency Response",
    patientName: "Johnathan Doe",
    patientMeta: "M / 64",
    unit: "UNIT-04 ALS",
    severity: "Moderate",
    timeline: [
      ["Dispatch Req", "14:02:15"],
      ["En Route", "14:04:30"],
      ["Arrived Scene", "14:15:10"],
      ["Transfer Complete", "14:44:00"],
    ],
    crew: [
      { name: "Robert Chen", role: "Driver / EMT-B", avatar: imageUrls.driverAvatar },
      { name: "Sarah Jenkins", role: "Lead Paramedic", avatar: imageUrls.paramedicAvatar },
    ],
    vitals: [
      ["Blood Press.", "135/85 mmHg"],
      ["Heart Rate", "88 bpm"],
      ["SpO2", "98%"],
      ["Resp. Rate", "16 /min"],
    ],
    notes: [
      "14:15 - Patient assessed on scene. Alert and oriented x4.",
      "14:20 - Administered 400mg Ibuprofen orally per protocol.",
      "14:25 - Patient loaded onto stretcher, secured. Pain reported at 7/10.",
      "14:35 - Reassessment during transit. Vitals stable. Pain slightly reduced to 6/10. Ice pack applied.",
      "14:44 - Handover to Harborview Triage complete.",
    ],
  },
};

export const operationsData = {
  images: imageUrls,
  driverMetrics: [
    { label: "Today's Earnings", value: "$245.50" },
    { label: "Completed Trips", value: "6" },
  ],
  cfrIncidents: [
    {
      level: "Level 1 - Cardiac",
      patient: "John Doe, 68M",
      location: "124 Main St. Apt 4B",
      distance: "1.2 km away",
      elapsed: "02:14",
      tone: "danger",
    },
    {
      level: "Level 3 - Trauma",
      patient: "Jane Smith, 32F",
      location: "789 Oak Ave. Intersection",
      distance: "3.4 km away",
      elapsed: "12:45",
      tone: "success",
    },
  ],
};
