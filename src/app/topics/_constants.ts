import type { TopicArea } from "@/db/schema";

export const AREA_LABELS: Record<TopicArea, string> = {
  cardiac: "Cardiac",
  airway: "Airway",
  trauma: "Trauma",
  medical: "Medical",
  drugs: "Drugs",
  operational: "Operational",
};
