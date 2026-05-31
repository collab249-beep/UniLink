import { UniversityId } from "@/constants/universities";

export type EventCategory =
  | "night_out"
  | "society"
  | "sports"
  | "study"
  | "social"
  | "food"
  | "music";

export interface CampusEvent {
  id: string;
  title: string;
  organizer: string;
  category: EventCategory;
  universityId: UniversityId | "both";
  campus: string;
  venue: string;
  timeLabel: string;
  hour: number;
  free: boolean;
  price?: string;
  attendees: number;
  description: string;
}

export const EVENT_CATEGORY_CONFIG: Record<
  EventCategory,
  { label: string; iconName: string; gradientStart: string; gradientEnd: string }
> = {
  night_out: {
    label: "Night Out",
    iconName: "moon",
    gradientStart: "#1A237E",
    gradientEnd: "#0D1457",
  },
  society: {
    label: "Society",
    iconName: "people",
    gradientStart: "#00897B",
    gradientEnd: "#00695C",
  },
  sports: {
    label: "Sports",
    iconName: "football",
    gradientStart: "#00C853",
    gradientEnd: "#00960A",
  },
  study: {
    label: "Study",
    iconName: "book",
    gradientStart: "#1A6BFF",
    gradientEnd: "#0041CC",
  },
  social: {
    label: "Social",
    iconName: "people-circle",
    gradientStart: "#FF6B35",
    gradientEnd: "#E53935",
  },
  food: {
    label: "Food",
    iconName: "restaurant",
    gradientStart: "#FF9F0A",
    gradientEnd: "#E08600",
  },
  music: {
    label: "Music",
    iconName: "musical-notes",
    gradientStart: "#E91E63",
    gradientEnd: "#AD1457",
  },
};

export const TODAY_EVENTS: CampusEvent[] = [
  {
    id: "e1",
    title: "UoN vs NTU — 5-a-side Football",
    organizer: "UoN Sports Union",
    category: "sports",
    universityId: "both",
    campus: "University Park Campus",
    venue: "University Park Football Pitches",
    timeLabel: "Today, 2:00 PM",
    hour: 14,
    free: true,
    attendees: 34,
    description: "The big inter-uni derby. All skill levels welcome. Show up and join a team.",
  },
  {
    id: "e2",
    title: "Crypto & Web3 Society — Weekly Meetup",
    organizer: "UoN Crypto Society",
    category: "society",
    universityId: "uon",
    campus: "University Park Campus",
    venue: "Trent Building, Room G14",
    timeLabel: "Today, 4:00 PM",
    hour: 16,
    free: true,
    attendees: 22,
    description: "Weekly meetup covering DeFi trends, NFT markets, and blockchain dev. All welcome.",
  },
  {
    id: "e3",
    title: "Pub Quiz Night @ The Cellar Bar",
    organizer: "UoN Students Union",
    category: "social",
    universityId: "uon",
    campus: "University Park Campus",
    venue: "The Cellar Bar, Portland Building",
    timeLabel: "Today, 7:00 PM",
    hour: 19,
    free: false,
    price: "£2/person",
    attendees: 61,
    description: "Teams of up to 6. Prizes for top 3 teams. Show up solo and we'll find you a team.",
  },
  {
    id: "e4",
    title: "NTU Basketball Open Session",
    organizer: "NTU Basketball Club",
    category: "sports",
    universityId: "ntu",
    campus: "NTU City Campus",
    venue: "NTU Sports Centre, Court 2",
    timeLabel: "Today, 5:00 PM",
    hour: 17,
    free: true,
    attendees: 18,
    description: "Open court session — all abilities welcome. Bring your own water bottle.",
  },
  {
    id: "e5",
    title: "Game Dev Society — Build Night",
    organizer: "UoN Game Dev Society",
    category: "society",
    universityId: "uon",
    campus: "Jubilee Campus",
    venue: "CS Building, Room A26",
    timeLabel: "Today, 4:30 PM",
    hour: 16,
    free: true,
    attendees: 29,
    description: "Monthly build night. Bring a project or join someone else's. Unity, Unreal, Godot — all welcome.",
  },
  {
    id: "e6",
    title: "Group Study Session — Finals Prep",
    organizer: "Hallward Library",
    category: "study",
    universityId: "uon",
    campus: "University Park Campus",
    venue: "Hallward Library, Study Zone 3",
    timeLabel: "Today, 3:00 PM",
    hour: 15,
    free: true,
    attendees: 47,
    description: "Drop-in group study. Silent zone + collaborative area. Bring your own notes.",
  },
  {
    id: "e7",
    title: "Ocean Freshers Thursday",
    organizer: "Ocean Nightclub",
    category: "night_out",
    universityId: "both",
    campus: "City Centre",
    venue: "Ocean, Market Square",
    timeLabel: "Tonight, 10:00 PM",
    hour: 22,
    free: false,
    price: "£4 before 11pm",
    attendees: 312,
    description: "Nottingham's biggest student night. R&B, chart, and classics across 4 floors. Student ID required.",
  },
  {
    id: "e8",
    title: "NTU Drama Society — Open Rehearsal",
    organizer: "NTU Drama Society",
    category: "society",
    universityId: "ntu",
    campus: "NTU City Campus",
    venue: "Arts & Humanities Building, Studio Theatre",
    timeLabel: "Today, 6:30 PM",
    hour: 18,
    free: true,
    attendees: 14,
    description: "Working on spring production of Midsummer Night's Dream. Come watch or join in.",
  },
  {
    id: "e9",
    title: "CrossFit Taster Class",
    organizer: "UoN Fitness",
    category: "sports",
    universityId: "uon",
    campus: "University Park Campus",
    venue: "David Ross Sports Village",
    timeLabel: "Today, 7:00 PM",
    hour: 19,
    free: false,
    price: "Free for members",
    attendees: 16,
    description: "Beginner-friendly CrossFit session. No experience needed. Book in or just show up.",
  },
  {
    id: "e10",
    title: "International Food Fair",
    organizer: "UoN International Society",
    category: "food",
    universityId: "uon",
    campus: "University Park Campus",
    venue: "Portland Building Atrium",
    timeLabel: "Today, 12:00 PM",
    hour: 12,
    free: true,
    attendees: 128,
    description: "30+ dishes from around the world, cooked by international students. Donation welcome.",
  },
  {
    id: "e11",
    title: "NTU Jazz Night",
    organizer: "NTU Music Society",
    category: "music",
    universityId: "ntu",
    campus: "NTU City Campus",
    venue: "The Hub, NTU City Campus",
    timeLabel: "Tonight, 8:00 PM",
    hour: 20,
    free: true,
    attendees: 43,
    description: "Live jazz from NTU Music students. Come grab a drink and enjoy the music.",
  },
  {
    id: "e12",
    title: "Postgraduate Networking Drinks",
    organizer: "UoN Graduate School",
    category: "social",
    universityId: "uon",
    campus: "University Park Campus",
    venue: "Trent Building Bar",
    timeLabel: "Today, 5:30 PM",
    hour: 17,
    free: true,
    attendees: 38,
    description: "Meet other postgrad students across departments. Informal drinks and nibbles.",
  },
];

export type EventFilter = "all" | "tonight" | "sports" | "study" | "society" | "social";

export const FILTERS: { id: EventFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "tonight", label: "Tonight" },
  { id: "sports", label: "Sports" },
  { id: "study", label: "Study" },
  { id: "society", label: "Society" },
  { id: "social", label: "Social" },
];

export function filterEvents(events: CampusEvent[], filter: EventFilter): CampusEvent[] {
  switch (filter) {
    case "tonight": return events.filter((e) => e.hour >= 18);
    case "sports": return events.filter((e) => e.category === "sports");
    case "study": return events.filter((e) => e.category === "study");
    case "society": return events.filter((e) => e.category === "society");
    case "social": return events.filter((e) => e.category === "social" || e.category === "music");
    default: return events;
  }
}
