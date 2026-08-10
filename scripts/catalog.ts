/**
 * The Tiger catalogue — single source of truth for seeding.
 *
 * Kept separate from seed.ts so product copy can be edited without touching
 * the seeding logic. `category` is a slug; seed.ts resolves it to an ObjectId.
 *
 * Pricing convention: `price` is MRP (shown struck through), `discountPrice`
 * is what the customer actually pays.
 */

export interface SeedProduct {
  title: string;
  slug: string;
  category: string;
  price: number;
  discountPrice: number;
  sku: string;
  stock: number;
  tags: string[];
  isFeatured?: boolean;
  isBestseller?: boolean;
  description: string;
}

export const CATEGORIES = [
  { name: "Strength & Vitality", slug: "strength-vitality" },
  { name: "Stamina & Energy", slug: "stamina-energy" },
  { name: "Men's Wellness", slug: "mens-wellness" },
  { name: "Sleep & Recovery", slug: "sleep-recovery" },
  { name: "Fertility", slug: "fertility" },
  { name: "Combos & Stacks", slug: "combos-stacks" },
];

export const PRODUCTS: SeedProduct[] = [
  {
    title: "Tiger Power Capsule — Daily Strength & Vitality Formula | 60 Capsules",
    slug: "tiger-power-capsule",
    category: "strength-vitality",
    price: 3299,
    discountPrice: 2499,
    sku: "TGR-VIT-001-60C",
    stock: 150,
    isFeatured: true,
    isBestseller: true,
    tags: ["ashwagandha", "KSM-66 600mg", "safed musli", "shilajit", "gokshura", "kaunch beej", "mens vitality", "strength supplement", "ayurvedic capsules", "daily vitality"],
    description: `Our flagship daily formula, built on five of Ayurveda's most-studied adaptogens for men who want to feel stronger through the whole day rather than for one hour of it.

WHAT'S INSIDE (per 2-capsule serving)
- Ashwagandha KSM-66 600mg (5% withanolides) — supports healthy cortisol levels and physical endurance
- Safed Musli 300mg — classical Balya (strength-promoting) herb
- Purified Shilajit 250mg — fulvic acid for cellular energy
- Gokshura 200mg — supports healthy circulation and hormonal balance
- Kaunch Beej 150mg — natural L-Dopa source

WHO IT'S FOR
Men 25-50 dealing with low energy, poor recovery, and the wear of long working hours.

HOW TO USE
2 capsules daily after dinner with warm milk or water. Take consistently.

WHAT TO EXPECT
Week 1-3: better sleep and steadier energy. Week 4-8: improved stamina and recovery. Week 8-12: peak benefit. Adaptogens build gradually — this is a course, not a quick fix.

QUALITY
GMP-certified manufacturing. Every batch third-party tested at an NABL-accredited lab for heavy metals and adulterants.

Shipped in plain, unmarked packaging.`,
  },
  {
    title: "Tiger Power Gold — Premium Vitality Formula | 60 Capsules",
    slug: "tiger-power-gold",
    category: "strength-vitality",
    price: 5499,
    discountPrice: 3999,
    sku: "TGR-VIT-002-60C",
    stock: 80,
    isFeatured: true,
    tags: ["shilajit gold", "swarna bhasma", "premium ayurvedic", "shilajit 500mg", "rasayana", "high potency", "strength formula"],
    description: `The concentrated version of our flagship, for men who want the strongest formulation we make.

WHAT'S INSIDE (per 2-capsule serving)
- Everything in Tiger Power Capsule, at higher potency
- Premium Himalayan Shilajit 500mg (60%+ fulvic acid) — double the standard formula
- Swarna Bhasma 10mg — classical Ayurvedic gold preparation, Rasayana category
- Ashwagandha KSM-66 600mg

WHO IT'S FOR
Men 35+ who have completed a course of the standard formula and want deeper support, or anyone starting with high physical and mental load.

HOW TO USE
2 capsules daily after dinner with warm milk. Minimum 90-day course recommended.

WHAT TO EXPECT
A noticeably faster response than the standard formula, typically from week 3-4, with full benefit at 10-12 weeks.

QUALITY
Manufactured under an AYUSH licence at a GMP-certified facility. Every batch heavy-metal tested by an NABL lab — certificate of analysis available for your batch number on request.

Shipped in plain, unmarked packaging.`,
  },
  {
    title: "Stamina & Endurance — Cordyceps, Ginseng & Rhodiola | 60 Capsules",
    slug: "stamina-endurance",
    category: "stamina-energy",
    price: 1799,
    discountPrice: 1299,
    sku: "TGR-STM-005-60C",
    stock: 200,
    isBestseller: true,
    tags: ["cordyceps 1000mg", "panax ginseng", "rhodiola rosea", "beetroot", "pre workout", "endurance supplement", "gym supplement", "fatigue support"],
    description: `A performance formula for training and physically demanding work. Four evidence-backed actives that support oxygen use and delay fatigue.

WHAT'S INSIDE (per 2-capsule serving)
- Cordyceps militaris 1000mg — studied for oxygen utilisation and exercise capacity
- Panax Ginseng 300mg (standardised ginsenosides) — supports mental and physical endurance
- Rhodiola Rosea 200mg (3% rosavins) — adaptogen studied for fatigue resistance
- Beetroot Extract 200mg — natural dietary nitrate

WHO IT'S FOR
Gym-goers, runners, cyclists, and men in physically demanding jobs who fade before their session ends.

HOW TO USE
2 capsules 45-60 minutes before training. On rest days, take with breakfast.

WHAT TO EXPECT
Cordyceps and Rhodiola build over 2-4 weeks. Ginseng often gives a same-week lift in perceived energy.

NOTE
Contains stimulant-adjacent adaptogens. Not recommended within 6 hours of bedtime.`,
  },
  {
    title: "Deep Sleep & Recovery — Ashwagandha, Jatamansi & Magnesium | 60 Capsules",
    slug: "deep-sleep-recovery",
    category: "sleep-recovery",
    price: 1099,
    discountPrice: 799,
    sku: "TGR-SLP-008-60C",
    stock: 250,
    isBestseller: true,
    tags: ["ashwagandha 300mg", "jatamansi", "tagara", "magnesium glycinate 400mg", "sleep supplement", "recovery", "cortisol support", "non habit forming"],
    description: `Recovery is where strength is actually built. This formula supports the deep sleep stages your body uses to repair and regulate hormones.

WHAT'S INSIDE (per 2-capsule serving)
- Ashwagandha KSM-66 300mg — supports healthy cortisol at night
- Jatamansi 200mg — classical Ayurvedic Medhya herb for calm
- Tagara (Indian Valerian) 200mg — traditionally used to support sleep onset
- Magnesium Glycinate 400mg — the best-absorbed, gentlest magnesium form

WHO IT'S FOR
Men who fall asleep late, wake through the night, or wake unrefreshed. Also a strong companion to any training or vitality formula — most men see better results from those when sleep improves first.

HOW TO USE
2 capsules 45 minutes before bed.

WHAT TO EXPECT
Many notice easier sleep onset within the first week. Sleep depth and morning energy typically improve over 3-4 weeks.

QUALITY
Non-habit forming. No melatonin, no sedatives. GMP-certified and batch-tested.

Do not combine with prescription sedatives without consulting your doctor.`,
  },
  {
    title: "Sperm Count & Motility — Male Fertility Support | 60 Capsules",
    slug: "sperm-count-motility",
    category: "fertility",
    price: 2599,
    discountPrice: 1899,
    sku: "TGR-FRT-011-60C",
    stock: 120,
    isFeatured: true,
    tags: ["male fertility", "sperm count", "sperm motility", "l-carnitine 500mg", "coq10 100mg", "kaunch beej", "zinc 15mg", "trying to conceive", "IVF support"],
    description: `A complete male fertility formula combining Ayurvedic herbs with the nutrients most consistently studied in andrology research.

WHAT'S INSIDE (per 2-capsule serving)
- L-Carnitine 500mg — concentrated in seminal fluid, studied for motility
- Kaunch Beej 300mg — classical herb for reproductive health
- Coenzyme Q10 100mg — mitochondrial energy for sperm cells
- Zinc 15mg — essential for spermatogenesis and testosterone
- Selenium 55mcg — antioxidant protection
- Folate 400mcg — supports healthy DNA formation
- Lycopene 10mg — reduces oxidative stress

WHO IT'S FOR
Couples trying to conceive, men preparing for a semen analysis, or men supporting an IVF/IUI cycle.

HOW TO USE
2 capsules daily with food. Take for a minimum of 90 days.

WHY 90 DAYS
Sperm production takes roughly 72-90 days from start to maturity. Nothing you take today affects the sample you give next week — it affects the one three months from now. Plan accordingly.

Discuss with your fertility specialist if you are in an active treatment cycle.

Shipped in plain, unmarked packaging.`,
  },
  {
    title: "Blood Flow & Circulation Support — L-Citrulline & Pine Bark | 90 Capsules",
    slug: "blood-flow-circulation",
    category: "mens-wellness",
    price: 2599,
    discountPrice: 1899,
    sku: "TGR-MEN-023-90C",
    stock: 140,
    tags: ["l-citrulline 1500mg", "l-arginine", "nitric oxide", "pine bark extract", "circulation support", "gokshura", "vascular health"],
    description: `A nitric oxide formula built around vascular health. Nitric oxide relaxes blood vessels and supports healthy circulation throughout the body.

WHAT'S INSIDE (per 3-capsule serving)
- L-Citrulline 1500mg — converts to arginine, raising nitric oxide more effectively than arginine alone
- L-Arginine 500mg
- Pine Bark Extract 100mg (95% proanthocyanidins) — studied for endothelial function
- Panax Ginseng 200mg
- Gokshura 200mg — classical herb for circulation

WHO IT'S FOR
Men 30+ who want to support cardiovascular and circulatory health, and anyone looking for better blood flow during training.

HOW TO USE
3 capsules daily on an empty stomach, or 45-60 minutes before exercise.

HONEST NOTE ON DOSE
Clinical studies on citrulline typically use 3-6g. Capsules cannot hold that much without becoming impractical, so this delivers a maintenance dose. For a full clinical dose, our Stamina Powder gives 6g per serving. We would rather tell you this than let you assume otherwise.

Consult your doctor before use if you take nitrates or blood pressure medication.`,
  },
  {
    title: "Calm & Control — Stress and Confidence Formula | 60 Capsules",
    slug: "calm-and-control",
    category: "mens-wellness",
    price: 2299,
    discountPrice: 1699,
    sku: "TGR-MEN-024-60C",
    stock: 130,
    tags: ["ashwagandha KSM-66 600mg", "kaunch beej", "jatamansi", "magnesium glycinate", "stress relief", "cortisol support", "adaptogen"],
    description: `Performance anxiety is a stress response. This formula targets the underlying nervous system load rather than the symptom.

WHAT'S INSIDE (per 2-capsule serving)
- Ashwagandha KSM-66 600mg — the most-studied adaptogen for cortisol reduction, with multiple randomised controlled trials behind it
- Kaunch Beej 300mg — natural L-Dopa, supports dopamine pathways
- Jatamansi 200mg — classical Medhya Rasayana for mental calm
- Zinc 15mg
- Magnesium Glycinate 200mg — supports nervous system regulation

WHO IT'S FOR
Men whose stress shows up as tension, racing thoughts, or loss of confidence under pressure.

HOW TO USE
2 capsules daily, evening preferred. Consistency matters more than timing.

WHAT TO EXPECT
Ashwagandha's effect on cortisol builds over 4-8 weeks. This is not a same-day product.

IMPORTANT
Anxiety that affects your daily life deserves proper medical attention. This is a supplement, not a substitute for a doctor or therapist. If symptoms persist, please speak to a professional.

Shipped in plain, unmarked packaging.`,
  },
  {
    title: "Drive & Vitality — Shilajit, Safed Musli & Maca | 60 Capsules",
    slug: "drive-and-vitality",
    category: "mens-wellness",
    price: 2199,
    discountPrice: 1599,
    sku: "TGR-MEN-025-60C",
    stock: 160,
    isBestseller: true,
    tags: ["shilajit 500mg", "safed musli", "maca root 500mg", "fenugreek", "tribulus terrestris", "testosterone support", "hormonal balance"],
    description: `A hormonal support formula for men whose energy and motivation have flattened out.

WHAT'S INSIDE (per 2-capsule serving)
- Purified Shilajit 500mg (60%+ fulvic acid) — studied for testosterone support in men
- Safed Musli 300mg — classical Balya and Rasayana herb
- Maca Root 500mg — Andean adaptogen traditionally used for energy and drive
- Fenugreek Extract 300mg (50% saponins) — studied for free testosterone
- Tribulus Terrestris 250mg (45% saponins)

WHO IT'S FOR
Men 30+ noticing lower motivation, flat mood, reduced training drive, or general loss of edge.

HOW TO USE
2 capsules daily with breakfast.

WHAT TO EXPECT
Energy and mood often shift first, around weeks 2-4. Full effect at 8-12 weeks.

WORTH KNOWING
If you suspect low testosterone, get a morning total and free testosterone blood test before and after your course. Real numbers beat guesswork, and we would rather you knew whether this is working.`,
  },
  {
    title: "Stamina Powder — 6g L-Citrulline Clinical Dose | 30 Sachets",
    slug: "stamina-powder",
    category: "stamina-energy",
    price: 2599,
    discountPrice: 1899,
    sku: "TGR-STM-034-30S",
    stock: 100,
    isFeatured: true,
    isBestseller: true,
    tags: ["l-citrulline 6000mg", "beetroot 500mg", "l-arginine 2000mg", "nitric oxide", "pre workout powder", "clinical dose", "watermelon"],
    description: `A full clinical dose of citrulline in a format that can actually deliver it. Most stamina capsules on the market give you a fraction of what the research uses — this gives you all of it.

WHAT'S INSIDE (per sachet)
- L-Citrulline 6000mg — the dose used in clinical exercise studies, not a token amount
- Beetroot Extract 500mg (standardised nitrate)
- L-Arginine 2000mg
- Natural watermelon flavour, no added sugar

WHY POWDER, NOT CAPSULES
6g of citrulline needs roughly 12-15 capsules. It is physically impossible to deliver a clinical dose in a capsule at a sensible serving size. Any brand claiming otherwise is either under-dosing or not telling you the serving count. We chose the format that lets the dose be real.

HOW TO USE
Mix one sachet in 250ml water. Take 45-60 minutes before training, or daily on an empty stomach.

Consult your doctor before use if you take nitrates or blood pressure medication.`,
  },
  {
    title: "Endurance Capsule — Cordyceps Militaris 1.5g | 90 Capsules",
    slug: "endurance-capsule",
    category: "stamina-energy",
    price: 1999,
    discountPrice: 1499,
    sku: "TGR-STM-035-90C",
    stock: 110,
    tags: ["cordyceps militaris 1500mg", "fruiting body", "cordycepin", "panax ginseng 400mg", "rhodiola 300mg", "aerobic capacity", "high dose"],
    description: `Our highest-dose endurance formula, using Cordyceps militaris fruiting body at a serving size most brands avoid because of cost.

WHAT'S INSIDE (per 3-capsule serving)
- Cordyceps militaris 1500mg (fruiting body extract, standardised cordycepin)
- Panax Ginseng 400mg (standardised ginsenosides)
- Rhodiola Rosea 300mg (3% rosavins, 1% salidroside)

WHO IT'S FOR
Endurance athletes, high-altitude trekkers, and anyone whose limiter is aerobic capacity rather than strength.

HOW TO USE
3 capsules daily, morning or 60 minutes pre-training.

HOW THIS DIFFERS FROM STAMINA & ENDURANCE
Same herb family, roughly 50% higher dosing on every active, and fruiting body rather than mycelium extract for the Cordyceps. If you are starting out, begin with the standard version. Move up if you want maximum dose.

Not recommended within 6 hours of bedtime.`,
  },
  {
    title: "Ashwagandha KSM-66 600mg — Clinically Studied Extract | 60 Capsules",
    slug: "ashwagandha-ksm-66",
    category: "stamina-energy",
    price: 1199,
    discountPrice: 899,
    sku: "TGR-STM-036-60C",
    stock: 300,
    isFeatured: true,
    isBestseller: true,
    tags: ["ashwagandha", "KSM-66 600mg", "5% withanolides", "root extract", "clinically studied", "stress relief", "adaptogen", "entry level"],
    description: `The single most evidence-backed product we make. KSM-66 is the branded ashwagandha extract used in the majority of published human trials.

WHAT'S INSIDE (per capsule)
- Ashwagandha root extract KSM-66 600mg, standardised to 5% withanolides
- Full-spectrum root-only extract — no leaf, no fillers

WHY KSM-66 SPECIFICALLY
Generic ashwagandha powder varies enormously in withanolide content. KSM-66 is standardised, root-only, and is the material behind most of the randomised controlled trials on stress, endurance, strength, and sleep. When we say "clinically studied," we mean this exact extract at this exact dose.

WHO IT'S FOR
Everyone. This is the foundation product — the one to start with if you buy nothing else.

HOW TO USE
1 capsule daily with food. Can be taken morning or evening. Safe to stack with any other product in our range.

Avoid if pregnant, breastfeeding, or on thyroid medication without consulting your doctor.`,
  },
  {
    title: "Shilajit Gold Resin — 60%+ Fulvic Acid with CoQ10 | 20g",
    slug: "shilajit-gold-resin",
    category: "strength-vitality",
    price: 2999,
    discountPrice: 2199,
    sku: "TGR-VIT-037-20G",
    stock: 90,
    isBestseller: true,
    tags: ["shilajit resin", "himalayan", "60% fulvic acid", "coq10", "heavy metal tested", "lab tested", "authentic shilajit"],
    description: `Pure Himalayan shilajit resin in its traditional form, with the lab reports to prove what is in it.

WHAT'S INSIDE
- Purified Himalayan Shilajit Resin 20g — standardised to 60%+ fulvic acid
- Coenzyme Q10 — added for mitochondrial energy support
- Sourced above 16,000 feet, purified by traditional Shodhana

WHY RESIN, NOT CAPSULES
Resin is the traditional form and lets you verify quality yourself — genuine shilajit softens with warmth and dissolves fully in warm water without residue. Powders and capsules hide adulteration. Resin cannot.

THE HONEST WARNING
Shilajit is among the most adulterated products in the Indian market, commonly cut with clay or contaminated with heavy metals from poor sourcing. Every one of our batches is tested at an NABL-accredited lab for lead, arsenic, mercury and cadmium. If a seller will not show you that report, do not buy their shilajit.

HOW TO USE
A pea-sized portion (300-500mg) dissolved in warm milk or water, once daily.`,
  },
];

export const COMBOS: SeedProduct[] = [
  {
    title: "Foundation Starter Pack — Ashwagandha KSM-66 + Stamina & Endurance",
    slug: "foundation-starter-pack",
    category: "combos-stacks",
    price: 2198,
    discountPrice: 1749,
    sku: "TGR-CMB-101",
    stock: 60,
    isFeatured: true,
    tags: ["starter pack", "ashwagandha combo", "stamina combo", "beginner stack", "value pack", "600mg KSM-66"],
    description: `The simplest place to begin. Two products, two different mechanisms, no overlapping ingredients.

WHAT'S IN THE BOX
- Ashwagandha KSM-66 600mg — 60 capsules (30-day)
- Stamina & Endurance — 60 capsules (30-day)

WHY THESE TWO TOGETHER
Ashwagandha works on the stress axis and builds slowly over 8-12 weeks. Cordyceps and Ginseng work on oxygen use and give a faster, more noticeable lift. Running both means you feel something in week one while the deeper adaptation is still building — which is exactly why most people quit supplements too early.

DAILY ROUTINE
Morning: 2 Stamina & Endurance capsules with breakfast
Evening: 1 Ashwagandha capsule with dinner

You save Rs 449 versus buying separately.`,
  },
  {
    title: "Gym Performance Stack — Citrulline Powder + Cordyceps + Ashwagandha",
    slug: "gym-performance-stack",
    category: "combos-stacks",
    price: 4297,
    discountPrice: 3299,
    sku: "TGR-CMB-102",
    stock: 50,
    isFeatured: true,
    isBestseller: true,
    tags: ["gym stack", "6000mg citrulline", "cordyceps 1500mg", "pre workout combo", "training stack", "athletic performance"],
    description: `Three products covering the three separate systems that limit training: blood flow, oxygen delivery, and recovery.

WHAT'S IN THE BOX
- Stamina Powder — 6g L-Citrulline clinical dose, 30 sachets
- Endurance Capsule — Cordyceps militaris 1.5g, 90 capsules
- Ashwagandha KSM-66 600mg — 60 capsules

WHY THESE THREE TOGETHER
Citrulline raises nitric oxide for blood flow and pump. Cordyceps supports oxygen utilisation and aerobic capacity. Ashwagandha lowers cortisol so you actually recover between sessions. Zero ingredient overlap — every rupee buys a different mechanism.

DAILY ROUTINE
Pre-workout: 1 Stamina Powder sachet + 3 Endurance capsules, 45-60 min before
Evening: 1 Ashwagandha capsule

You save Rs 998 versus buying separately.`,
  },
  {
    title: "Sleep & Recovery Duo — Deep Sleep + Shilajit Gold Resin",
    slug: "sleep-recovery-duo",
    category: "combos-stacks",
    price: 2998,
    discountPrice: 2399,
    sku: "TGR-CMB-103",
    stock: 55,
    tags: ["sleep combo", "recovery stack", "shilajit resin", "magnesium 400mg", "night recovery"],
    description: `Night repair and daytime cellular energy — the two halves of feeling recovered.

WHAT'S IN THE BOX
- Deep Sleep & Recovery — 60 capsules (30-day)
- Shilajit Gold Resin — 20g, NABL heavy-metal tested

WHY THESE TWO TOGETHER
Most men chase energy products when the actual problem is that they never reach deep sleep. Testosterone is produced predominantly during deep sleep stages, and recovery, mood and training results all follow from it. Fix the night first, then add mitochondrial support for the day.

DAILY ROUTINE
Morning: pea-sized Shilajit resin in warm milk or water
45 min before bed: 2 Deep Sleep capsules

You save Rs 599 versus buying separately.`,
  },
  {
    title: "Gold Premium Stack — Tiger Power Gold + Stamina Powder + Deep Sleep",
    slug: "gold-premium-stack",
    category: "combos-stacks",
    price: 6697,
    discountPrice: 5299,
    sku: "TGR-CMB-107",
    stock: 40,
    isFeatured: true,
    tags: ["premium stack", "gold combo", "shilajit swarna", "6000mg citrulline", "advanced stack", "high potency"],
    description: `Our highest-potency combination, for men who want the strongest protocol we offer.

WHAT'S IN THE BOX
- Tiger Power Gold — 60 capsules, premium shilajit and Swarna
- Stamina Powder — 6g L-Citrulline clinical dose, 30 sachets
- Deep Sleep & Recovery — 60 capsules

WHY THESE THREE TOGETHER
Tiger Power Gold covers hormonal and adaptogenic support. Stamina Powder delivers a full clinical citrulline dose for circulation. Deep Sleep protects the recovery window where the other two actually do their work. Total ashwagandha across the stack stays at 900mg daily — deliberately within the studied safe range.

DAILY ROUTINE
Morning: 1 Stamina Powder sachet in 250ml water
After dinner: 2 Tiger Power Gold capsules with warm milk
45 min before bed: 2 Deep Sleep capsules

You save Rs 1,398 versus buying separately.`,
  },
  {
    title: "Testosterone Support Stack — Drive & Vitality + Deep Sleep + Endurance",
    slug: "testosterone-support-stack",
    category: "combos-stacks",
    price: 3897,
    discountPrice: 2999,
    sku: "TGR-CMB-108",
    stock: 50,
    isBestseller: true,
    tags: ["testosterone stack", "shilajit 500mg", "fenugreek", "tribulus", "hormonal support", "sleep testosterone"],
    description: `Built around the three levers that actually move testosterone: hormonal precursors, deep sleep, and training capacity.

WHAT'S IN THE BOX
- Drive & Vitality — 60 capsules (Shilajit, Fenugreek, Tribulus, Maca)
- Deep Sleep & Recovery — 60 capsules
- Endurance Capsule — 90 capsules

WHY THESE THREE TOGETHER
Supplements alone move testosterone modestly. Sleep and training move it considerably more. This stack supports the hormonal pathway directly, protects the deep sleep stages where most testosterone is produced, and improves your capacity to train — which is the single largest natural lever available to you.

TRACK IT PROPERLY
Get a morning total and free testosterone test before you start and again at day 90. Fasted, before 10am, same lab both times. If your numbers come back clinically low, see an endocrinologist — that is a medical condition, not a supplement problem.

DAILY ROUTINE
Morning: 2 Drive & Vitality with breakfast, 3 Endurance capsules
Before bed: 2 Deep Sleep capsules

You save Rs 898 versus buying separately.`,
  },
];
