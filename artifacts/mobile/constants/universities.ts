export type UniversityId = "uon" | "ntu" | "other";

export interface UniversityConfig {
  id: UniversityId;
  name: string;
  shortName: string;
  domains: string[];
  primaryColor: string;
  secondaryColor: string;
  badgeLabel: string;
  campuses: CampusConfig[];
}

export interface CampusConfig {
  id: string;
  name: string;
  shortName: string;
  universityId: UniversityId;
  meetupSpots: string[];
}

export const UNIVERSITIES: UniversityConfig[] = [
  {
    id: "uon",
    name: "University of Nottingham",
    shortName: "UoN",
    domains: ["nottingham.ac.uk", "student.nottingham.ac.uk"],
    primaryColor: "#005EB8",
    secondaryColor: "#EEF4FD",
    badgeLabel: "UoN",
    campuses: [],
  },
  {
    id: "ntu",
    name: "Nottingham Trent University",
    shortName: "NTU",
    domains: ["ntu.ac.uk", "my.ntu.ac.uk"],
    primaryColor: "#6A1020",
    secondaryColor: "#F9EEF0",
    badgeLabel: "NTU",
    campuses: [],
  },
];

export const CAMPUSES: CampusConfig[] = [
  {
    id: "uon-university-park",
    name: "University Park Campus",
    shortName: "Uni Park",
    universityId: "uon",
    meetupSpots: [
      "Hallward Library",
      "Portland Building SU",
      "Science Library",
      "Cripps Health Centre Café",
      "Trent Building",
      "Sports Centre",
      "Pope Building Café",
      "Mooch (Student Union Bar)",
    ],
  },
  {
    id: "uon-jubilee",
    name: "Jubilee Campus",
    shortName: "Jubilee",
    universityId: "uon",
    meetupSpots: [
      "George Green Library",
      "Jubilee Campus SU",
      "Exchange Café",
      "Atrium Café",
      "Sports Hall",
      "Lake Pavilion",
      "B52 Bar",
    ],
  },
  {
    id: "ntu-city",
    name: "NTU City Campus",
    shortName: "City Campus",
    universityId: "ntu",
    meetupSpots: [
      "Boots Library",
      "SU Bar, Newton Building",
      "City Grind Café",
      "The Hub",
      "Newton Atrium",
      "Starbucks, Chaucer Building",
      "NTU Sports Centre",
    ],
  },
  {
    id: "ntu-clifton",
    name: "NTU Clifton Campus",
    shortName: "Clifton",
    universityId: "ntu",
    meetupSpots: [
      "Clifton Library",
      "Clifton SU",
      "Clifton Campus Café",
      "Sports Hall",
      "Study Hub",
    ],
  },
];

export function detectNottinghamUniversity(email: string): UniversityConfig | null {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  for (const uni of UNIVERSITIES) {
    if (uni.domains.some((d) => domain === d || domain.endsWith("." + d))) {
      return uni;
    }
  }
  return null;
}

export function getCampusesForUniversity(universityId: UniversityId): CampusConfig[] {
  return CAMPUSES.filter((c) => c.universityId === universityId);
}

export function getSpotForActivity(campusId: string, activityId: string): string {
  const campus = CAMPUSES.find((c) => c.id === campusId);
  if (!campus) return "Campus Meeting Point";
  const spots = campus.meetupSpots;

  const activitySpotMap: Record<string, number[]> = {
    study: [0, 1],
    coffee: [3, 4],
    lunch: [3, 5],
    football: [5, 6],
    gym: [5],
    gaming: [1, 6],
    night_out: [6, 7],
    society: [1, 2],
  };

  const preferredIndices = activitySpotMap[activityId] ?? [0];
  const idx = preferredIndices[Math.floor(Math.random() * preferredIndices.length)];
  return spots[idx ?? 0] ?? spots[0] ?? "Campus Meeting Point";
}
