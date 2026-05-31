export type ActivityType =
  | "study"
  | "coffee"
  | "lunch"
  | "football"
  | "gym"
  | "gaming"
  | "night_out"
  | "society";

export interface ActivityConfig {
  id: ActivityType;
  label: string;
  iconLib: "Ionicons";
  iconName: string;
  gradientStart: string;
  gradientEnd: string;
  statLabel: string;
}

export const ACTIVITIES: ActivityConfig[] = [
  {
    id: "study",
    label: "Study Together",
    iconLib: "Ionicons",
    iconName: "book",
    gradientStart: "#1A6BFF",
    gradientEnd: "#0041CC",
    statLabel: "studying nearby",
  },
  {
    id: "coffee",
    label: "Coffee Chat",
    iconLib: "Ionicons",
    iconName: "cafe",
    gradientStart: "#795548",
    gradientEnd: "#4B2C20",
    statLabel: "looking for coffee",
  },
  {
    id: "lunch",
    label: "Lunch",
    iconLib: "Ionicons",
    iconName: "restaurant",
    gradientStart: "#FF6B35",
    gradientEnd: "#E53935",
    statLabel: "looking for lunch",
  },
  {
    id: "football",
    label: "Football",
    iconLib: "Ionicons",
    iconName: "football",
    gradientStart: "#00C853",
    gradientEnd: "#00960A",
    statLabel: "playing football",
  },
  {
    id: "gym",
    label: "Gym Partner",
    iconLib: "Ionicons",
    iconName: "barbell",
    gradientStart: "#F44336",
    gradientEnd: "#B71C1C",
    statLabel: "at the gym",
  },
  {
    id: "gaming",
    label: "Gaming",
    iconLib: "Ionicons",
    iconName: "game-controller",
    gradientStart: "#9C27B0",
    gradientEnd: "#6A0080",
    statLabel: "gaming",
  },
  {
    id: "night_out",
    label: "Night Out",
    iconLib: "Ionicons",
    iconName: "moon",
    gradientStart: "#1A237E",
    gradientEnd: "#0D1457",
    statLabel: "going out tonight",
  },
  {
    id: "society",
    label: "Society Meetup",
    iconLib: "Ionicons",
    iconName: "people",
    gradientStart: "#00897B",
    gradientEnd: "#00695C",
    statLabel: "at society events",
  },
];

export const FAKE_PARTICIPANTS = [
  { id: "p1", firstName: "Alex", university: "University of Nottingham" },
  { id: "p2", firstName: "Priya", university: "Nottingham Trent University" },
  { id: "p3", firstName: "Jake", university: "University of Nottingham" },
  { id: "p4", firstName: "Sofia", university: "Nottingham Trent University" },
  { id: "p5", firstName: "Marcus", university: "University of Nottingham" },
  { id: "p6", firstName: "Aisha", university: "Nottingham Trent University" },
  { id: "p7", firstName: "Tom", university: "University of Nottingham" },
  { id: "p8", firstName: "Mei", university: "Nottingham Trent University" },
];
