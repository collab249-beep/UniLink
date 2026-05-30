export type ActivityType = "food" | "study" | "sports" | "chill" | "coffee" | "events";

export interface ActivityConfig {
  id: ActivityType;
  label: string;
  iconLib: "Ionicons" | "MaterialCommunityIcons";
  iconName: string;
  gradientStart: string;
  gradientEnd: string;
  locations: string[];
}

export const ACTIVITIES: ActivityConfig[] = [
  {
    id: "food",
    label: "Get Food",
    iconLib: "Ionicons",
    iconName: "restaurant",
    gradientStart: "#FF6B35",
    gradientEnd: "#E53935",
    locations: ["The Campus Café", "Student Union Food Hall", "The Library Canteen", "Campus Diner"],
  },
  {
    id: "study",
    label: "Study",
    iconLib: "Ionicons",
    iconName: "book",
    gradientStart: "#1A6BFF",
    gradientEnd: "#0041CC",
    locations: ["Main Library", "Study Hub, Level 3", "Computer Science Building", "24hr Study Room"],
  },
  {
    id: "sports",
    label: "Sports",
    iconLib: "Ionicons",
    iconName: "football",
    gradientStart: "#00C853",
    gradientEnd: "#00960A",
    locations: ["Sports Complex", "University Gym", "Football Pitches", "Tennis Courts"],
  },
  {
    id: "chill",
    label: "Chill",
    iconLib: "Ionicons",
    iconName: "game-controller",
    gradientStart: "#9C27B0",
    gradientEnd: "#6A0080",
    locations: ["Student Union Lounge", "The Common Room", "Campus Garden", "Recreation Centre"],
  },
  {
    id: "coffee",
    label: "Coffee",
    iconLib: "Ionicons",
    iconName: "cafe",
    gradientStart: "#795548",
    gradientEnd: "#4B2C20",
    locations: ["Pret on Campus", "Campus Coffee Shop", "Arts Café", "The Brew Lab"],
  },
  {
    id: "events",
    label: "Events",
    iconLib: "Ionicons",
    iconName: "musical-notes",
    gradientStart: "#E91E63",
    gradientEnd: "#AD1457",
    locations: ["Student Union Main Hall", "Campus Theatre", "Events Space", "The Auditorium"],
  },
];

export const FAKE_PARTICIPANTS = [
  { id: "p1", firstName: "Alex", university: "University of Manchester" },
  { id: "p2", firstName: "Priya", university: "King's College London" },
  { id: "p3", firstName: "Jake", university: "University of Edinburgh" },
  { id: "p4", firstName: "Sofia", university: "Imperial College London" },
  { id: "p5", firstName: "Marcus", university: "University College London" },
  { id: "p6", firstName: "Aisha", university: "University of Bristol" },
  { id: "p7", firstName: "Tom", university: "University of Leeds" },
  { id: "p8", firstName: "Mei", university: "University of Birmingham" },
];
