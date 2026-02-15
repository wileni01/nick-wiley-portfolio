export type PressMentionCategory =
  | "Media"
  | "Academic"
  | "Tourism"
  | "Listings";

export interface PressMention {
  name: string;
  url: string;
  logo?: string;
  category: PressMentionCategory;
  description?: string;
}

export const pressMentions: PressMention[] = [
  // ── Media Coverage ─────────────────────────────────────────────
  {
    name: "The TV Traveler",
    url: "https://thetvtraveler.com/gettysburg-battle-virtual-reality/",
    logo: "/images/press/tv-traveler.jpg",
    category: "Media",
    description:
      "Gettysburg Battle Virtual Reality — featured AR tour coverage",
  },
  {
    name: "The TV Traveler — Cassie's Corner",
    url: "https://thetvtraveler.com/insite-gettysburg-ipad-tour-cassies-corner/",
    logo: "/images/press/tv-traveler.jpg",
    category: "Media",
    description: "InSite Gettysburg iPad Tour — family travel feature",
  },
  {
    name: "Mid-Atlantic Day Trips",
    url: "https://midatlanticdaytrips.com/2015/11/insite-gettysburg-brings-the-battlefield-into-clearer-focus/",
    category: "Media",
    description:
      "InSite Gettysburg Brings the Battlefield into Clearer Focus",
  },
  {
    name: "The Frugal Foodie Mama",
    url: "https://www.thefrugalfoodiemama.com/2016/03/3-historical-must-dos-in-gettysburg.html",
    logo: "/images/press/frugal-foodie-mama.png",
    category: "Media",
    description: "3 Historical Must-Dos in Gettysburg",
  },
  {
    name: "Berks County Living",
    url: "https://berkscountyliving.com/everything-berks/travel/4-quick-easy-getaways/",
    logo: "/images/press/berks-county-living.svg",
    category: "Media",
    description: "4 Quick & Easy Getaways — featured travel destination",
  },
  {
    name: "Macaroni KID",
    url: "https://familytravel.macaronikid.com/articles/5be1e8d44739493a08a4e90f/travel-through-time-6-trips-to-teach-your-kids-about-american-history",
    logo: "/images/press/macaroni-kid.png",
    category: "Media",
    description:
      "Travel Through Time: 6 Trips to Teach Your Kids About American History",
  },
  {
    name: "Penn State News",
    url: "https://www.psu.edu/news/impact/story/online-alumnus-brings-history-life-through-gettysburg-tour-app",
    category: "Media",
    description:
      "Online Alumnus Brings History to Life Through Gettysburg Tour App",
  },

  // ── Tourism & Listings ─────────────────────────────────────────
  {
    name: "Celebrate Gettysburg",
    url: "https://celebrategettysburg.com/insite-gettysburg/",
    logo: "/images/press/celebrate-gettysburg.png",
    category: "Tourism",
    description: "InSite Gettysburg — official listing",
  },
  {
    name: "Celebrate Gettysburg — Tours Galore",
    url: "https://celebrategettysburg.com/tours-galore/",
    logo: "/images/press/celebrate-gettysburg.png",
    category: "Tourism",
    description: "Tours Galore — Gettysburg touring guide",
  },
  {
    name: "Destination Gettysburg",
    url: "https://destinationgettysburg.com/wp-content/uploads/files/meetings%20section/Meeting%20Excursion%20Piece_website.pdf",
    category: "Tourism",
    description: "Meeting Excursion Guide — official tourism resource",
  },
  {
    name: "Stqry",
    url: "https://stqry.com/blog/gettysburg-battlefield-gps-driving-tour/",
    category: "Tourism",
    description: "Gettysburg Battlefield GPS Driving Tour — platform feature",
  },

  // ── Academic Citations ─────────────────────────────────────────
  {
    name: "University of Huddersfield — Thesis",
    url: "https://eprints.hud.ac.uk/id/eprint/35036/1/FINAL%20THESIS%20-%20Foster.pdf",
    category: "Academic",
    description:
      "Cited in doctoral thesis on augmented reality in heritage tourism",
  },
  {
    name: "ResearchGate — Dark Tourism & AR",
    url: "https://www.researchgate.net/publication/340503388_HUZUN_TURIZMI_ARTIRILMIS_GERCEKLIK_TEKNOLOJISI_ILE_SAVAS_ALANLARINA_BIR_ZAMAN_YOLCULUGU",
    category: "Academic",
    description:
      "Referenced in academic paper on dark tourism and augmented reality at battlefields",
  },

  // ── App Listings ───────────────────────────────────────────────
  {
    name: "Apple App Store",
    url: "https://apps.apple.com/us/app/gettysburg-driving-tour/id1141956682",
    category: "Listings",
    description: "Gettysburg Driving Tour on the App Store",
  },
  {
    name: "TripAdvisor — Attraction",
    url: "https://www.tripadvisor.com/Attraction_Review-g60798-d12225534-Reviews-InSite_Gettysburg-Gettysburg_Pennsylvania.html",
    category: "Tourism",
    description: "InSite Gettysburg — TripAdvisor listing",
  },
  {
    name: "TripAdvisor — Forum",
    url: "https://www.tripadvisor.com/ShowTopic-g60798-i335-k11763363-App_for_Gettysburg_auto_tour-Gettysburg_Pennsylvania.html",
    category: "Tourism",
    description: "Community discussion recommending InSite Gettysburg",
  },
];

/**
 * Returns press mentions with logos — used for the logo grid display.
 */
export function getMentionsWithLogos(): PressMention[] {
  return pressMentions.filter((m) => m.logo);
}

/**
 * Returns mentions grouped by category.
 */
export function getMentionsByCategory(): Record<
  PressMentionCategory,
  PressMention[]
> {
  return {
    Media: pressMentions.filter((m) => m.category === "Media"),
    Tourism: pressMentions.filter((m) => m.category === "Tourism"),
    Academic: pressMentions.filter((m) => m.category === "Academic"),
    Listings: pressMentions.filter((m) => m.category === "Listings"),
  };
}
