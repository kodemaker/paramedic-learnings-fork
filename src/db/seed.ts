import { eq, sql } from "drizzle-orm";
import { db } from "./index";
import { sources, topics, topicVersions } from "./schema";

type SeedSource = {
  title: string;
  citation: string;
  url?: string;
};

type SeedTopic = {
  name: string;
  area:
    | "cardiac"
    | "airway"
    | "trauma"
    | "medical"
    | "drugs"
    | "operational";
  owner: string;
  summary: string;
  guidance: string;
  rationale: string | null;
  sources: SeedSource[];
};

const seedTopics: SeedTopic[] = [
  {
    name: "Adrenaline in cardiac arrest",
    area: "cardiac",
    owner: "Dr. Smith",
    summary:
      "1 mg IV every 3–5 minutes during ACLS. Avoid before defibrillation in shockable rhythms.",
    guidance:
      "Administer adrenaline 1 mg IV/IO every 3–5 minutes during ACLS for non-shockable rhythms (asystole, PEA). For shockable rhythms (VF/pVT), prioritize defibrillation; defer adrenaline until after the second shock. Use a 10 mL flush after each dose. Continue CPR throughout.",
    rationale:
      "Adrenaline's vasoconstrictive effect raises coronary perfusion pressure during compressions, improving the chance of ROSC. Recent randomised data show improved survival to hospital but mixed neurological outcomes — current guidance therefore preserves the dose but emphasises early defibrillation in shockable rhythms.",
    sources: [
      {
        title: "AHA 2020 ACLS Guidelines",
        citation:
          "Panchal AR et al. Circulation 142(16) S366–S468. 2020.",
      },
      {
        title: "PARAMEDIC2 — Adrenaline in OHCA",
        citation:
          "Perkins GD et al. NEJM 379:711–721. 2018. RCT, n=8014.",
      },
    ],
  },
  {
    name: "Hypothermic patient — passive rewarming",
    area: "trauma",
    owner: "Dr. Lindberg",
    summary:
      "Do not actively warm a pulseless patient with no spontaneous circulation; passive rewarming and continued resuscitation only.",
    guidance:
      "For severely hypothermic (T < 30 °C) patients in cardiac arrest, defer active rewarming until ROSC. Continue CPR, remove wet clothing, insulate. Limit defibrillation to one attempt below 30 °C; resume after rewarming. Transport to a centre with ECMO capability if available.",
    rationale:
      "Active rewarming of a pulseless hypothermic patient causes core-temperature afterdrop and arrhythmia. Cold-protected myocardium tolerates extended low-flow states; long down-times have produced neurologically intact survival. The rule of thumb: 'no one is dead until warm and dead.'",
    sources: [
      {
        title: "ERC Guidelines — Cardiac arrest in special circumstances",
        citation:
          "Lott C et al. Resuscitation 161:152–219. 2021.",
      },
    ],
  },
  {
    name: "Supraglottic airway as first-line in OHCA",
    area: "airway",
    owner: "Dr. Smith",
    summary:
      "Prefer supraglottic airway (i-gel, LMA) over endotracheal intubation in field cardiac arrest unless contraindicated.",
    guidance:
      "Insert a supraglottic airway as the first advanced airway in OHCA. Reserve endotracheal intubation for cases where ventilation cannot be achieved through a supraglottic device, in a crew with verified intubation competency, and only when interruptions to compressions can be limited to <10 seconds.",
    rationale:
      "Pre-hospital intubation interrupts CPR and has a meaningful first-pass failure rate in field conditions. RCT evidence (AIRWAYS-2) shows supraglottic devices are non-inferior to ETI for OHCA and produce shorter compression-pause times.",
    sources: [
      {
        title: "AIRWAYS-2 — Supraglottic vs ETI in OHCA",
        citation:
          "Benger JR et al. JAMA 320(8):779–791. 2018. RCT, n=9296.",
      },
    ],
  },
  {
    name: "Patient handover — the AT-MIST framework",
    area: "operational",
    owner: "L. Hansen",
    summary:
      "Use AT-MIST (Age, Time, Mechanism, Injuries, Signs, Treatment) for every trauma handover. 30 seconds, hands off, room silent.",
    guidance:
      "On arrival at the receiving facility, request 30 seconds of silence and deliver AT-MIST: patient's age and sex, time of incident, mechanism, identified injuries, current vital signs, and treatment given. The receiving team listens without interruption. Follow-up questions come after.",
    rationale: null,
    sources: [],
  },
];

async function seed() {
  await db.execute(
    sql`TRUNCATE TABLE sources, topic_versions, topics RESTART IDENTITY CASCADE`,
  );

  for (const t of seedTopics) {
    const [topic] = await db
      .insert(topics)
      .values({
        name: t.name,
        area: t.area,
        owner: t.owner,
      })
      .returning();

    const [version] = await db
      .insert(topicVersions)
      .values({
        topicId: topic.id,
        versionNumber: 1,
        summary: t.summary,
        guidance: t.guidance,
        rationale: t.rationale,
      })
      .returning();

    await db
      .update(topics)
      .set({ currentVersionId: version.id, updatedAt: new Date() })
      .where(eq(topics.id, topic.id));

    if (t.sources.length > 0) {
      await db.insert(sources).values(
        t.sources.map((s) => ({
          topicVersionId: version.id,
          title: s.title,
          citation: s.citation,
          url: s.url ?? null,
        })),
      );
    }
  }
}

seed()
  .then(() => {
    console.log(`Seeded ${seedTopics.length} topics.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
