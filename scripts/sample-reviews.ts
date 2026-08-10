/**
 * SAMPLE review content — demo/staging data only.
 * ---------------------------------------------------------------------------
 * These reviews were written to populate the storefront so the ratings UI can
 * be seen with realistic content. They are NOT from real customers.
 *
 * Publishing invented customer reviews is treated as an unfair trade practice
 * under the Consumer Protection Act 2019 and the BIS review guidelines
 * (IS 19000:2022), and supplement listings are an active enforcement area.
 * Use these on staging, then run `npm run seed:reviews -- --purge` to remove
 * them before the store goes live, and let real reviews take their place.
 *
 * Every reviewer created from this file gets an @sample.invalid email address,
 * so sample accounts and their reviews are always identifiable and removable
 * in one query — nothing here can quietly survive into production.
 */

export interface SampleReview {
  name: string;
  /** Used to build the deterministic sample email, so reruns don't duplicate. */
  handle: string;
  rating: number;
  comment: string;
  /** Days before "now" the review was posted, so the list isn't all one date. */
  daysAgo: number;
}

export const SAMPLE_REVIEWS: Record<string, SampleReview[]> = {
  // ── Strength & Vitality ───────────────────────────────────────────────
  "tiger-power-capsule": [
    {
      name: "Rohit Deshmukh",
      handle: "rohit-deshmukh",
      rating: 5,
      daysAgo: 12,
      comment:
        "Bhai honestly I was not expecting much, itne saare brands try kar chuka hun. First 2 weeks kuch feel nahi hua, thoda doubt bhi hua. But 4th week se difference clear hai — 10-11 ghante ki shift ke baad bhi thakan wo wali nahi hoti. Neend bhi theek ho gayi. Second bottle order kar diya.",
    },
    {
      name: "Anand K.",
      handle: "anand-k",
      rating: 4,
      daysAgo: 26,
      comment:
        "Good product, no complaints on quality — the label actually prints the mg per serving which is why I bought it in the first place. Only thing is the capsule size is on the bigger side, takes some getting used to. Energy through the afternoon is noticeably better. Taking it after dinner as written.",
    },
    {
      name: "Sandeep Rawat",
      handle: "sandeep-rawat",
      rating: 5,
      daysAgo: 41,
      comment:
        "Packaging bilkul plain thi, courier wale ko kuch pata nahi chala — that mattered to me. Product ki baat karun to gym me recovery fast hui hai, next day soreness kam. 35+ age me jo slow feeling aati hai wo definitely kam hui hai. Paisa vasool.",
    },
    {
      name: "Vikram Iyer",
      handle: "vikram-iyer",
      rating: 4,
      daysAgo: 58,
      comment:
        "Been on it about two months now. It is not an overnight thing, so if you are expecting day-one results skip it. What I did notice is steadier energy and less of that 4pm crash. Ordering again.",
    },
  ],

  "tiger-power-gold": [
    {
      name: "Mahesh Pillai",
      handle: "mahesh-pillai",
      rating: 5,
      daysAgo: 9,
      comment:
        "Costly hai, that I will admit. But I moved up from the regular one and the difference is there — recovery is quicker and I am sleeping deeper. If budget allows, worth it. If not, the normal Power Capsule is also fine honestly.",
    },
    {
      name: "Gurpreet Singh",
      handle: "gurpreet-singh",
      rating: 5,
      daysAgo: 22,
      comment:
        "Third bottle chal raha hai. Quality ekdum solid, koi weird smell nahi jaisa sasta shilajit products me aata hai. Delivery bhi time pe. Wife ne notice kiya ki main subah zyada fresh uthta hun, that says something.",
    },
    {
      name: "Debashish Roy",
      handle: "debashish-roy",
      rating: 4,
      daysAgo: 47,
      comment:
        "Genuinely good formulation and I appreciate the lab report being available. Knocking off one star only for the price — it is a stretch for a monthly repeat. Results wise I have no complaints at all.",
    },
  ],

  // ── Stamina & Energy ──────────────────────────────────────────────────
  "stamina-endurance": [
    {
      name: "Karan Malhotra",
      handle: "karan-malhotra",
      rating: 5,
      daysAgo: 7,
      comment:
        "Cycling karta hun weekends pe, 40-50km. Pehle last 10km me legs dead ho jaate the. Ab wo wall wali feeling nahi aati. Cordyceps ka dose bhi proper hai yahan, maine compare kiya doosre brands se — most of them are underdosed.",
    },
    {
      name: "Faizan Ahmed",
      handle: "faizan-ahmed",
      rating: 4,
      daysAgo: 19,
      comment:
        "Works for endurance, not for a stimulant kick — just so people know what they are buying. No jitters, no crash, which I prefer. Took about three weeks to feel it properly.",
    },
    {
      name: "Nitin Kulkarni",
      handle: "nitin-kulkarni",
      rating: 5,
      daysAgo: 34,
      comment:
        "Badminton khelta hun 4 din a week. Third game tak stamina hold ho raha hai ab, pehle doosre game me hi hafna shuru. Ginseng aur rhodiola ka combo kaam kar raha hai lagta hai. Repeat order pakka.",
    },
    {
      name: "Aravind S.",
      handle: "aravind-s",
      rating: 3,
      daysAgo: 52,
      comment:
        "Decent but not dramatic for me. Some improvement in gym endurance, though nothing I would call night and day. Maybe my expectations were too high. Quality of the product itself seems fine and delivery was quick.",
    },
  ],

  "deep-sleep-recovery": [
    {
      name: "Prashant Gaikwad",
      handle: "prashant-gaikwad",
      rating: 5,
      daysAgo: 5,
      comment:
        "Night shift karta hun aur neend hamesha se problem thi. Melatonin try kiya tha, subah groggy feel hota tha. Yeh alag hai — sona easy ho gaya aur subah heavy nahi lagta. Genuinely surprised, ek dum honest review hai ye.",
    },
    {
      name: "Manish Bhatia",
      handle: "manish-bhatia",
      rating: 5,
      daysAgo: 18,
      comment:
        "Falling asleep was never my issue, staying asleep was. I used to be up at 3am every night. Two weeks in and that has mostly stopped. The magnesium in it probably helps. Very happy.",
    },
    {
      name: "Tarun Rajput",
      handle: "tarun-rajput",
      rating: 4,
      daysAgo: 36,
      comment:
        "Achha kaam karta hai but ek baat — isko dinner ke baad hi lena, warna thoda heavy lagta hai empty stomach pe. Mujhe pehle 3-4 din adjust karne me lage. Uske baad sleep quality clearly better hai.",
    },
  ],

  // ── Fertility ─────────────────────────────────────────────────────────
  "sperm-count-motility": [
    {
      name: "Verified Buyer",
      handle: "verified-buyer-fert-1",
      rating: 5,
      daysAgo: 15,
      comment:
        "Keeping this anonymous for obvious reasons. We were advised to try lifestyle and supplement support for 3 months before going further. Repeat test after the course showed improvement in the numbers. Cannot say it was only this, we changed diet also, but I am glad we tried it. Packaging was discreet which I really appreciated.",
    },
    {
      name: "R. Menon",
      handle: "r-menon",
      rating: 4,
      daysAgo: 29,
      comment:
        "Doctor ne bola tha zinc, folate aur CoQ10 dekhna hai — ye sab isme proper dose me hai, isliye liya. 3 months ka course complete kiya. Reports me improvement aaya hai. Sabke liye same hoga ya nahi wo main nahi keh sakta, but for us it helped.",
    },
    {
      name: "Sumit Chowdhury",
      handle: "sumit-chowdhury",
      rating: 5,
      daysAgo: 44,
      comment:
        "What sold me was that the ingredient amounts are actually printed instead of hiding behind a proprietary blend. Took it for the full three months as instructed. No side effects at all. Plain packaging, delivered on time, no awkward questions from anyone.",
    },
    {
      name: "Ajay P.",
      handle: "ajay-p",
      rating: 4,
      daysAgo: 61,
      comment:
        "Patience chahiye is product me, 90 din ka cycle hota hai apparently isliye jaldi result expect mat karo. Maine full course kiya. Overall satisfied hun. Customer care ne bhi dosage ke baare me theek se guide kiya.",
    },
  ],

  // ── Men's Wellness ────────────────────────────────────────────────────
  "blood-flow-circulation": [
    {
      name: "Deepak Nair",
      handle: "deepak-nair",
      rating: 5,
      daysAgo: 11,
      comment:
        "The citrulline dose here is the real thing, not the 500mg token amount most brands put in. Pump in the gym is noticeably better and my hands and feet do not go cold the way they used to. 90 capsules lasts a proper month at the full dose.",
    },
    {
      name: "Harshad Mehta",
      handle: "harshad-mehta-c",
      rating: 4,
      daysAgo: 25,
      comment:
        "Kaam karta hai, especially workout se pehle lo to. Ek star kam isliye ki capsule count zyada hai — 3 capsule daily lena padta hai, thoda tedious lagta hai. But results se koi complaint nahi.",
    },
    {
      name: "Joseph Thomas",
      handle: "joseph-thomas",
      rating: 5,
      daysAgo: 39,
      comment:
        "Bought this after reading up on pine bark extract. Stacking it with the stamina powder. Six weeks in and I am happy — better endurance on runs and general circulation feels improved. Reordered already.",
    },
  ],

  "calm-and-control": [
    {
      name: "Siddharth Jain",
      handle: "siddharth-jain",
      rating: 5,
      daysAgo: 8,
      comment:
        "Work stress kaafi tha, presentations ke pehle hands shake hote the. Ye lene ke baad wo edgy feeling kaafi kam ho gayi hai. Drowsy bilkul nahi karta, that was my main worry. Office me poori tarah functional rehta hun.",
    },
    {
      name: "Naveen Reddy",
      handle: "naveen-reddy",
      rating: 4,
      daysAgo: 23,
      comment:
        "Takes the edge off without dulling you out, which is exactly what I wanted. Not a magic fix for real anxiety — I still do my therapy sessions — but as daily support it has genuinely helped my baseline.",
    },
    {
      name: "Imran Shaikh",
      handle: "imran-shaikh",
      rating: 4,
      daysAgo: 46,
      comment:
        "Ek mahina ho gaya. Overthinking thodi kam hui hai aur temper better control me hai. Family ne bhi notice kiya. Price thodi zyada lagti hai but quality dekhke justify ho jaati hai.",
    },
  ],

  "drive-and-vitality": [
    {
      name: "Suresh Yadav",
      handle: "suresh-yadav",
      rating: 5,
      daysAgo: 6,
      comment:
        "42 ka hun aur pichle kuch saal se energy kaafi down thi. Ye lene ke baad wo 20s wali feeling to nahi aayi obviously, but din bhar ka josh wapas aaya hai. Shilajit ki quality bhi genuine lag rahi hai, nakli wala smell nahi hai.",
    },
    {
      name: "Rakesh Menon",
      handle: "rakesh-menon",
      rating: 5,
      daysAgo: 21,
      comment:
        "Solid formula. Maca and safed musli together actually work well. Gave it a full eight weeks before writing this because I did not want to review too early. Would recommend, especially if you are past 35.",
    },
    {
      name: "Bhavesh Patel",
      handle: "bhavesh-patel",
      rating: 4,
      daysAgo: 38,
      comment:
        "Product achha hai, mood aur energy dono better hua. Delivery me 2 din extra lag gaye the but support team ne track karke update diya, so no complaints there. Repeat karunga.",
    },
  ],

  "stamina-powder": [
    {
      name: "Aditya Bansal",
      handle: "aditya-bansal",
      rating: 5,
      daysAgo: 4,
      comment:
        "6g citrulline in one sachet at this price is hard to beat, I compared four brands before buying. Taste is not amazing, slightly tart, but I mix it in cold water and it goes down fine. Pump and endurance in the gym are clearly better.",
    },
    {
      name: "Yash Chauhan",
      handle: "yash-chauhan",
      rating: 4,
      daysAgo: 17,
      comment:
        "Kaam ekdum solid karta hai, lekin taste thoda improve ho sakta hai bhai. Main juice me mix karta hun ab, tab theek lagta hai. Sachet format travel ke liye convenient hai, that I liked.",
    },
    {
      name: "Kunal Sethi",
      handle: "kunal-sethi",
      rating: 5,
      daysAgo: 33,
      comment:
        "Take it 40 minutes before training. Difference on the last few sets is real, especially on leg day. No tingling or itching like the pre-workouts with beta alanine, which suits me. Second box now.",
    },
    {
      name: "Mohit Verma",
      handle: "mohit-verma",
      rating: 4,
      daysAgo: 50,
      comment:
        "Dose proper hai, label pe sab clearly likha hai, no proprietary blend nonsense. 30 sachets ek mahina chalta hai agar daily lo. Only wish it came in a bigger tub option, sachets create a lot of waste.",
    },
  ],

  "endurance-capsule": [
    {
      name: "Ganesh Iyer",
      handle: "ganesh-iyer",
      rating: 5,
      daysAgo: 13,
      comment:
        "Half marathon ki training kar raha hun. 1.5g cordyceps proper dose hai, most Indian brands 200-300mg dete hain aur claim badi karte hain. Long runs pe breathing easier feel hoti hai. Genuinely happy with this one.",
    },
    {
      name: "Alok Srivastava",
      handle: "alok-srivastava",
      rating: 4,
      daysAgo: 28,
      comment:
        "Good for sustained energy rather than a quick hit. I take it in the morning. Noticed better stamina in the second half of my sessions after about three weeks. Capsules are easy to swallow.",
    },
    {
      name: "Ravi Shankar",
      handle: "ravi-shankar-e",
      rating: 5,
      daysAgo: 45,
      comment:
        "Football khelta hun Sunday league me. Second half me legs bharne wali problem kaafi kam hui hai. 90 capsules ka bottle value for money hai. Lab report bhi maine check kiya website pe, transparency achhi lagi.",
    },
  ],

  "ashwagandha-ksm-66": [
    {
      name: "Nikhil Joshi",
      handle: "nikhil-joshi",
      rating: 5,
      daysAgo: 3,
      comment:
        "Actual KSM-66 with the licence, not generic ashwagandha sold under a fancy name. 600mg is the dose used in the studies which is why I picked this. One month in — sleep is better and my stress response is calmer. Best value product on the site in my opinion.",
    },
    {
      name: "Pooja Sharma",
      handle: "pooja-sharma",
      rating: 5,
      daysAgo: 16,
      comment:
        "Main aur mere husband dono le rahe hain, label pe likha hai for men and women dono. Mera cortisol issue tha aur nigh sleep disturb hoti thi. 3 hafte me clearly better feel kar rahi hun. Root only extract hai, leaf nahi, that is the right thing.",
    },
    {
      name: "Chetan Kapoor",
      handle: "chetan-kapoor",
      rating: 4,
      daysAgo: 30,
      comment:
        "Does what ashwagandha is supposed to do. Not a miracle product and anyone promising that is lying to you. Steady, mild, and it stacks well with the sleep formula. Would buy again.",
    },
    {
      name: "Zainab Qureshi",
      handle: "zainab-qureshi",
      rating: 5,
      daysAgo: 55,
      comment:
        "Exam stress ke time pe start kiya tha, ab regular ho gaya hai. Anxiety wali racing thoughts kam hui hain. Capsule me koi weird taste nahi hai. Price bhi reasonable hai compared to imported brands.",
    },
  ],

  "shilajit-gold-resin": [
    {
      name: "Devendra Rathore",
      handle: "devendra-rathore",
      rating: 5,
      daysAgo: 10,
      comment:
        "Asli shilajit ki pehchaan hoti hai — garam paani me pura ghul jata hai, koi residue nahi. Ye wahi quality hai. Market me 90% nakli milta hai, isliye lab report wala brand hi lena chahiye. Taste kadwa hai but wo to hona hi hai.",
    },
    {
      name: "Arjun Kashyap",
      handle: "arjun-kashyap",
      rating: 5,
      daysAgo: 24,
      comment:
        "The fulvic acid percentage is tested and published, which is the only reason I trusted it. Resin form is messier than capsules but it is the real deal. A pea sized amount in warm milk at night. 20g has lasted me nearly two months.",
    },
    {
      name: "Lokesh Bhandari",
      handle: "lokesh-bhandari",
      rating: 4,
      daysAgo: 42,
      comment:
        "Quality top class hai, isme koi doubt nahi. Ek star kam sirf isliye ki jar se nikalna thoda messy hai, spoon dena chahiye tha with it. Energy levels definitely improved after about a month.",
    },
  ],

  // ── Combos & Stacks ───────────────────────────────────────────────────
  "foundation-starter-pack": [
    {
      name: "Amit Ranjan",
      handle: "amit-ranjan",
      rating: 5,
      daysAgo: 14,
      comment:
        "Perfect starting point agar confuse ho ki kahan se shuru karein. Maine yahi liya tha first order me. Dono products alag alag lete to zyada mehenga padta. Ashwagandha ne sleep fix ki aur endurance wala gym me help karta hai.",
    },
    {
      name: "Rahul Dass",
      handle: "rahul-dass",
      rating: 5,
      daysAgo: 27,
      comment:
        "Sensible pairing — no overlapping ingredients, so you are not double dosing on anything. That is a rare thing in combo packs, most brands just bundle whatever is not selling. Good value and it got me into a proper routine.",
    },
    {
      name: "Sameer Wagh",
      handle: "sameer-wagh",
      rating: 4,
      daysAgo: 49,
      comment:
        "Value for money accha hai. Dono bottles ek saath aaye, packaging plain thi. Ek suggestion — ek chhota routine card daal do box me, kab kya lena hai, beginners ke liye helpful hoga.",
    },
  ],

  "gym-performance-stack": [
    {
      name: "Varun Chhabra",
      handle: "varun-chhabra",
      rating: 5,
      daysAgo: 6,
      comment:
        "Citrulline pre workout, cordyceps morning, ashwagandha raat ko. Poora din covered hai. 8 hafte me strength numbers clearly upar gaye hain, bench 5kg badha. Individually kharidne se yahan kaafi bachat hui.",
    },
    {
      name: "Dhruv Menon",
      handle: "dhruv-menon",
      rating: 5,
      daysAgo: 20,
      comment:
        "This is the stack I would recommend to anyone training seriously four or more days a week. Everything in it is dosed at the amounts the research actually uses. Recovery between sessions is the biggest difference I have felt.",
    },
    {
      name: "Prateek Solanki",
      handle: "prateek-solanki",
      rating: 4,
      daysAgo: 37,
      comment:
        "Good stack, no complaints on the products. Only feedback is that it is a lot to take at once if you are new to supplements — I would ease into it rather than starting everything on day one like I did.",
    },
    {
      name: "Hardik Panchal",
      handle: "hardik-panchal",
      rating: 5,
      daysAgo: 53,
      comment:
        "Trainer ne recommend kiya tha proper doses wala brand lene ko. Ye stack sabse sensible laga. Powder ka taste thoda tart hai but mix kar lo to problem nahi. Overall bahut satisfied, repeat kar raha hun.",
    },
  ],

  "sleep-recovery-duo": [
    {
      name: "Ashish Tandon",
      handle: "ashish-tandon",
      rating: 5,
      daysAgo: 9,
      comment:
        "Deep sleep formula raat ko aur shilajit subah — ye combination mere liye perfect baitha. Neend gehri ho gayi hai aur subah utho to fresh lagta hai. Pehle alarm ke baad bhi 20 min lagta tha uthne me.",
    },
    {
      name: "Kaushik Sen",
      handle: "kaushik-sen",
      rating: 4,
      daysAgo: 31,
      comment:
        "Both products are good on their own and they work fine together. Sleep improved within about ten days. The resin takes some getting used to if you have only ever taken capsules, but the instructions are clear.",
    },
    {
      name: "Irfan Khan",
      handle: "irfan-khan-sr",
      rating: 5,
      daysAgo: 48,
      comment:
        "Shift work ki wajah se sleep cycle bilkul kharab thi. Ye duo lene ke baad routine set ho gaya hai. Recovery bhi better hai, gym ke agle din utna sore nahi hota. Worth the price.",
    },
  ],

  "gold-premium-stack": [
    {
      name: "Vivek Anand",
      handle: "vivek-anand",
      rating: 5,
      daysAgo: 12,
      comment:
        "The full package and priced accordingly. If you are going to commit to one thing properly, this is it. Ten weeks in and the difference in energy, sleep and gym output together is more than any single product gave me.",
    },
    {
      name: "Jaideep Rana",
      handle: "jaideep-rana",
      rating: 4,
      daysAgo: 26,
      comment:
        "Mehenga hai, no doubt. But three products alag lete to aur zyada padta. Quality sabki top notch hai. Star ek isliye kam kiya kyunki delivery me 4 din lag gaye, expected 2 tha.",
    },
    {
      name: "Srinivas Rao",
      handle: "srinivas-rao",
      rating: 5,
      daysAgo: 43,
      comment:
        "Bought this for my husband as a gift and he has been on it for two months. He says the sleep formula alone was worth it. Discreet packaging was a big plus, nothing on the box gives it away.",
    },
  ],

  "testosterone-support-stack": [
    {
      name: "Abhishek Pandey",
      handle: "abhishek-pandey",
      rating: 5,
      daysAgo: 8,
      comment:
        "Important baat — ye koi steroid nahi hai, natural support hai, to expectations realistic rakho. Maine 10 hafte liya saath me proper sleep aur training. Energy, mood aur gym performance teeno me clear improvement hai.",
    },
    {
      name: "Rajat Khurana",
      handle: "rajat-khurana",
      rating: 4,
      daysAgo: 24,
      comment:
        "Sensible combination and I like that the sleep product is included — most people ignore that sleep is half the equation here. Gradual results, nothing dramatic, but consistent. Would buy again.",
    },
    {
      name: "Sanjay Mistry",
      handle: "sanjay-mistry",
      rating: 5,
      daysAgo: 40,
      comment:
        "38 saal ka hun, do saal se energy aur motivation dono low the. Doctor se check karwaya, sab normal tha, to socha natural support try karun. Do mahine ho gaye hain, difference genuinely feel ho raha hai. Neend sabse zyada improve hui.",
    },
    {
      name: "Tushar Ghosh",
      handle: "tushar-ghosh",
      rating: 4,
      daysAgo: 57,
      comment:
        "Products are well made and the dosing is transparent, which is why I keep coming back to this brand. Give it at least eight weeks before you judge it. Support team answered my dosage question the same day.",
    },
  ],
};
