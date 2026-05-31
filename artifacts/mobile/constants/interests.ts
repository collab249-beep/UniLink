export interface Interest {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export const INTERESTS: Interest[] = [
  { id: "study",       label: "Study",        emoji: "📚", color: "#1565C0" },
  { id: "coffee",      label: "Coffee",        emoji: "☕", color: "#5D4037" },
  { id: "football",    label: "Football",      emoji: "⚽", color: "#2E7D32" },
  { id: "gym",         label: "Gym",           emoji: "💪", color: "#E64A19" },
  { id: "gaming",      label: "Gaming",        emoji: "🎮", color: "#6A1B9A" },
  { id: "night_out",   label: "Night Out",     emoji: "🎉", color: "#1A237E" },
  { id: "society",     label: "Societies",     emoji: "🎓", color: "#00695C" },
  { id: "music",       label: "Music",         emoji: "🎵", color: "#880E4F" },
  { id: "cooking",     label: "Cooking",       emoji: "🍳", color: "#E65100" },
  { id: "travel",      label: "Travel",        emoji: "✈️", color: "#01579B" },
  { id: "movies",      label: "Movies",        emoji: "🎬", color: "#4A148C" },
  { id: "reading",     label: "Reading",       emoji: "📖", color: "#1B5E20" },
  { id: "art",         label: "Art & Design",  emoji: "🎨", color: "#AD1457" },
  { id: "tech",        label: "Tech",          emoji: "💻", color: "#0277BD" },
  { id: "sports",      label: "Other Sports",  emoji: "🏃", color: "#558B2F" },
  { id: "food",        label: "Food",          emoji: "🍜", color: "#BF360C" },
];

export const STUDY_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Masters",
  "PhD",
  "Exchange Student",
];

export function getInterest(id: string): Interest | undefined {
  return INTERESTS.find((i) => i.id === id);
}

export function profileCompletionScore(
  bio?: string,
  interests?: string[],
  year?: string,
  profilePicture?: string,
): number {
  let score = 0;
  if (profilePicture) score += 25;
  if (bio && bio.trim().length > 10) score += 25;
  if (interests && interests.length >= 3) score += 25;
  if (year) score += 25;
  return score;
}
