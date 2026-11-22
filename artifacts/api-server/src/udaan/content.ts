export type Language = "en" | "hinglish" | "hi" | "kn";
export type Profile = typeof defaultProfile;
export const defaultProfile = {
  shopName: "Udaan Breakfast House",
  ownerName: "Ravi",
  category: "South Indian breakfast café",
  location: "Whitefield, Bengaluru",
  openingHours: "6:30 AM – 12:00 PM",
  challenge: "Fewer weekday customers",
  budget: 1500,
  averageOrders: 156,
  menu: [
    { name: "Idli (2 pieces)", price: 40, cost: 15 },
    { name: "Masala dosa", price: 80, cost: 35 },
    { name: "Vada", price: 25, cost: 10 },
    { name: "Filter coffee", price: 30, cost: 12 },
  ],
  provenance: "Synthetic demo data",
};
export const baseline = { revenue: 87600, orders: 1095, averageOrderValue: 80, variableCosts: 38325, contribution: 49275 };
export const local = <T>(lang: Language, en: T, hinglish: T, hi: T, kn: T): T => ({ en, hinglish, hi, kn })[lang];

type Copy = { title: string; description: string; story: string; firstStep: string; benefit: string; assumption: string };
type Idea = {
  id: string; category: "experiment" | "story" | "technology"; budget: number;
  sellingPrice: number; makingCost: number; expectedUnits: number;
  copy: Record<Language, Copy>;
};
const ideas: Idea[] = [
  {
    id: "combo", category: "experiment", budget: 1500, sellingPrice: 99, makingCost: 45, expectedUnits: 100,
    copy: {
      en: { title: "The ₹99 breakfast combo", description: "Make weekday mornings worth stopping for. Idli, vada and filter coffee, together.", story: "A seven-day offer using your existing menu. A small test, not a permanent price cut.", firstStep: "Ask five regulars which breakfast combination they would choose.", benefit: "₹3,900 modeled contribution at 100 combos", assumption: "₹45 making cost and 100 sales are estimates to validate, not a forecast." },
      hinglish: { title: "₹99 ka breakfast combo", description: "Weekday mornings ko special banayein. Idli, vada aur filter coffee, ek saath.", story: "Apne existing menu se seven-day offer try karein. Chhota test hai, permanent price cut nahi.", firstStep: "Paanch regular customers se poochhein unhe kaunsa combo pasand aayega.", benefit: "100 combos par ₹3,900 bach sakte hain", assumption: "₹45 making cost aur 100 sales assumptions hain, guarantee nahi." },
      hi: { title: "₹99 का breakfast combo", description: "Weekday mornings बनाइए खास। Idli, vada और filter coffee, एक साथ।", story: "अपने existing menu से सात दिन का offer try करें। छोटा test है, permanent price cut नहीं।", firstStep: "पाँच regular customers से पूछें उन्हें कौन सा combo पसंद आएगा।", benefit: "100 combos पर ₹3,900 बच सकते हैं", assumption: "₹45 making cost और 100 sales assumptions हैं, guarantee नहीं।" },
      kn: { title: "₹99 breakfast combo", description: "Weekday ಬೆಳಿಗ್ಗೆ ಸ್ವಲ್ಪ ವಿಶೇಷವಾಗಿರಲಿ. Idli, vada ಮತ್ತು filter coffee ಒಟ್ಟಿಗೆ.", story: "ಈಗಿನ menu ಬಳಸಿ ಏಳು ದಿನದ offer try ಮಾಡಿ. ಇದು ಸಣ್ಣ test, ಶಾಶ್ವತ ಬೆಲೆ ಇಳಿಕೆ ಅಲ್ಲ.", firstStep: "ಐದು regular customers ಗೆ ಯಾವ combo ಇಷ್ಟ ಎಂದು ಕೇಳಿ.", benefit: "100 combos ಗೆ ₹3,900 ಉಳಿಯಬಹುದು", assumption: "₹45 making cost ಮತ್ತು 100 sales ಅಂದಾಜುಗಳು, guarantee ಅಲ್ಲ." },
    },
  },
  {
    id: "subscription", category: "experiment", budget: 1000, sellingPrice: 120, makingCost: 65, expectedUnits: 50,
    copy: {
      en: { title: "Your next regulars work next door", description: "Office breakfast subscriptions. A fresh start for their day, a little certainty for yours.", story: "Illustrative story: a fictional café collected office pre-orders the night before. Ravi could test one nearby office, not build a delivery operation.", firstStep: "Ask one nearby office for five opt-in breakfast pre-orders. Confirm packaging and pickup first.", benefit: "Test repeat demand before increasing production", assumption: "Office interest, packaging costs and pickup logistics are unverified." },
      hinglish: { title: "Office breakfast subscriptions", description: "Paas ke office ke liye fresh breakfast. Unka din fresh, aapki planning aasaan.", story: "Fictional story: ek café ne raat ko office pre-orders liye. Ravi ek office se test kar sakte hain; delivery business banana zaroori nahi.", firstStep: "Ek office se paanch opt-in pre-orders lein. Packaging aur pickup pehle confirm karein.", benefit: "Production badhane se pehle repeat demand test karein", assumption: "Office interest, packaging cost aur pickup abhi verify karna hai." },
      hi: { title: "Office breakfast subscriptions", description: "पास के office के लिए fresh breakfast। उनका दिन fresh, आपकी planning आसान।", story: "काल्पनिक कहानी: एक café ने रात में office pre-orders लिए। रवि एक office से test कर सकते हैं, delivery business नहीं बनाना।", firstStep: "एक office से पाँच opt-in pre-orders लें। Packaging और pickup पहले confirm करें।", benefit: "Production बढ़ाने से पहले repeat demand test करें", assumption: "Office interest, packaging cost और pickup अभी verify करना है।" },
      kn: { title: "Office breakfast subscriptions", description: "ಹತ್ತಿರದ office ಗೆ fresh breakfast. ಅವರ ದಿನಕ್ಕೆ ಒಳ್ಳೆಯ ಆರಂಭ, ನಿಮ್ಮ planning ಗೆ ಸಹಾಯ.", story: "ಕಾಲ್ಪನಿಕ ಕಥೆ: ಒಂದು café ಹಿಂದಿನ ರಾತ್ರಿ office pre-orders ಪಡೆಯಿತು. ರವಿ ಒಂದೇ office ನಿಂದ test ಮಾಡಬಹುದು.", firstStep: "ಒಂದು office ನಿಂದ ಐದು opt-in pre-orders ಕೇಳಿ. Packaging ಮತ್ತು pickup ಮೊದಲು ಖಚಿತಪಡಿಸಿ.", benefit: "Production ಹೆಚ್ಚಿಸುವ ಮೊದಲು repeat demand test ಮಾಡಿ", assumption: "Office ಆಸಕ್ತಿ, packaging cost ಮತ್ತು pickup ಇನ್ನೂ ಪರಿಶೀಲಿಸಬೇಕು." },
    },
  },
  {
    id: "loyalty", category: "experiment", budget: 500, sellingPrice: 30, makingCost: 12, expectedUnits: 80,
    copy: {
      en: { title: "A little loyalty, one coffee at a time", description: "Turn a morning coffee into a reason to come back.", story: "Test a simple stamped card with 20 willing customers. Include the cost of rewards in making costs before launching.", firstStep: "Design a five-visit card and ask regulars if it would be useful.", benefit: "Learn whether a small reward encourages another visit", assumption: "Repeat visits are not guaranteed; reward costs must be included." },
      hinglish: { title: "Har coffee se ek naya connection", description: "Morning coffee ko wapas aane ki wajah banayein.", story: "20 willing customers ke saath stamped card test karein. Reward ki cost making cost mein jodein.", firstStep: "Five-visit card banayein aur regulars se feedback lein.", benefit: "Chhota reward repeat visit mein help karta hai ya nahi, seekhein", assumption: "Repeat visits guaranteed nahi; rewards ki cost jodna zaroori hai." },
      hi: { title: "हर coffee से एक नया connection", description: "Morning coffee को वापस आने की वजह बनाइए।", story: "20 willing customers के साथ stamped card test करें। Reward की cost making cost में जोड़ें।", firstStep: "Five-visit card बनाएं और regulars से feedback लें।", benefit: "सीखें कि छोटा reward repeat visit में मदद करता है या नहीं", assumption: "Repeat visits guaranteed नहीं; rewards की cost जोड़ें।" },
      kn: { title: "ಪ್ರತಿ coffee ಜೊತೆ ಒಂದು connection", description: "ಬೆಳಗಿನ coffee ಮತ್ತೆ ಬರಲು ಒಂದು ಕಾರಣವಾಗಲಿ.", story: "20 ಆಸಕ್ತ customers ಜೊತೆ stamped card test ಮಾಡಿ. Rewards ವೆಚ್ಚವನ್ನು making cost ಗೆ ಸೇರಿಸಿ.", firstStep: "Five-visit card ಮಾಡಿ regulars feedback ಕೇಳಿ.", benefit: "ಸಣ್ಣ reward ಮತ್ತೆ ಬರಲು ಸಹಾಯವಾಗುತ್ತದೆಯೇ ತಿಳಿಯಿರಿ", assumption: "Repeat visits ಖಚಿತವಲ್ಲ; rewards cost ಸೇರಿಸಿ." },
    },
  },
  {
    id: "preorder", category: "technology", budget: 0, sellingPrice: 99, makingCost: 45, expectedUnits: 30,
    copy: {
      en: { title: "Let WhatsApp take tomorrow's breakfast order", description: "Start with a message, not another complicated app.", story: "A manual WhatsApp pre-order idea, not an implemented integration. Ask permission before messaging customers.", firstStep: "Write a short opt-in message with tomorrow's menu, order cutoff and pickup time.", benefit: "Test demand before preparing food", assumption: "Customer consent and manual order tracking are required. No messages are sent by Udaan." },
      hinglish: { title: "Kal ka breakfast, aaj ka WhatsApp", description: "Ek message se shuru karein, complicated app se nahi.", story: "Yeh manual WhatsApp pre-order idea hai, integration nahi. Customers ki permission pehle lein.", firstStep: "Kal ka menu, order cutoff aur pickup time wala opt-in message likhein.", benefit: "Khana banane se pehle demand ka idea lein", assumption: "Consent aur manual tracking chahiye. Udaan koi message send nahi karta." },
      hi: { title: "कल का breakfast, आज का WhatsApp", description: "एक message से शुरू करें, complicated app से नहीं।", story: "यह manual WhatsApp pre-order idea है, integration नहीं। Customers की permission पहले लें।", firstStep: "कल का menu, order cutoff और pickup time वाला opt-in message लिखें।", benefit: "खाना बनाने से पहले demand का अंदाज़ा लें", assumption: "Consent और manual tracking चाहिए। Udaan कोई message send नहीं करता।" },
      kn: { title: "ನಾಳೆಯ breakfast, ಇಂದಿನ WhatsApp", description: "ಒಂದು message ನಿಂದ ಶುರು ಮಾಡಿ, complicated app ಬೇಡ.", story: "ಇದು manual WhatsApp pre-order idea, integration ಅಲ್ಲ. Customers ಅನುಮತಿ ಮೊದಲು ಪಡೆಯಿರಿ.", firstStep: "ನಾಳೆಯ menu, order cutoff ಮತ್ತು pickup time ಇರುವ opt-in message ಬರೆಯಿರಿ.", benefit: "ಅಡುಗೆ ಮಾಡುವ ಮೊದಲು demand ತಿಳಿಯಿರಿ", assumption: "Consent ಮತ್ತು manual tracking ಬೇಕು. Udaan messages ಕಳುಹಿಸುವುದಿಲ್ಲ." },
    },
  },
  {
    id: "qr", category: "technology", budget: 300, sellingPrice: 80, makingCost: 35, expectedUnits: 30,
    copy: {
      en: { title: "A smarter menu, without a bigger team", description: "Explore a QR menu that explains every dish in your customers' language.", story: "A technology exploration, not an active QR ordering or payment integration. Start with a read-only menu.", firstStep: "Put three dishes and prices on one mobile-friendly menu. Ask five customers to try it.", benefit: "Test whether clearer menu information helps customers choose", assumption: "Smartphone access and QR comfort vary; keep a printed menu." },
      hinglish: { title: "Smart menu, bina extra team", description: "Customers ki language mein har dish samjhane wala QR menu explore karein.", story: "Technology idea hai, active ordering ya payment integration nahi. Read-only menu se shuru karein.", firstStep: "Teen dishes aur prices ka mobile menu banayein. Paanch customers se test karayein.", benefit: "Clear menu se choice aasaan hoti hai ya nahi, test karein", assumption: "Sab QR use nahi karte; printed menu bhi rakhein." },
      hi: { title: "Smart menu, बिना extra team", description: "Customers की language में हर dish समझाने वाला QR menu explore करें।", story: "Technology idea है, active ordering या payment integration नहीं। Read-only menu से शुरू करें।", firstStep: "तीन dishes और prices का mobile menu बनाएं। पाँच customers से test कराएं।", benefit: "Test करें कि clear menu से choice आसान होती है या नहीं", assumption: "सब QR use नहीं करते; printed menu भी रखें।" },
      kn: { title: "Smart menu, extra team ಬೇಡ", description: "Customers ಭಾಷೆಯಲ್ಲಿ ಪ್ರತಿಯೊಂದು dish ವಿವರಿಸುವ QR menu explore ಮಾಡಿ.", story: "Technology idea ಮಾತ್ರ, active ordering ಅಥವಾ payment integration ಅಲ್ಲ. Read-only menu ಇಂದ ಆರಂಭಿಸಿ.", firstStep: "ಮೂರು dishes ಮತ್ತು prices ಇರುವ mobile menu ಮಾಡಿ. ಐದು customers ಜೊತೆ test ಮಾಡಿ.", benefit: "ಸ್ಪಷ್ಟ menu ಆಯ್ಕೆ ಮಾಡಲು ಸಹಾಯವಾಗುತ್ತದೆಯೇ test ಮಾಡಿ", assumption: "ಎಲ್ಲರೂ QR ಬಳಸುವುದಿಲ್ಲ; printed menu ಸಹ ಇರಲಿ." },
    },
  },
  {
    id: "bakery", category: "story", budget: 400, sellingPrice: 99, makingCost: 45, expectedUnits: 40,
    copy: {
      en: { title: "What a neighbourhood bakery could teach us", description: "Fewer leftovers can start with a better question.", story: "Fictional, illustrative story: a neighbourhood bakery asked regulars to reserve the next day's favourites. No real business results or research are claimed.", firstStep: "Ask ten customers what they would reserve for tomorrow. Measure waste before and after.", benefit: "Explore a small pre-order test to understand waste", assumption: "Reservations may not convert to pickup. No waste reduction is proven." },
      hinglish: { title: "Pados ki bakery se ek naya idea", description: "Kam leftovers ki shuruaat ek achhe sawaal se.", story: "Fictional example: bakery ne regulars se agle din ke favourites reserve karne ko kaha. Koi real business result claim nahi hai.", firstStep: "Dus customers se poochhein kal ke liye kya reserve karenge. Waste pehle aur baad mein measure karein.", benefit: "Pre-orders se waste samajhne ka chhota test", assumption: "Reservation pickup mein badlega, zaroori nahi. Waste reduction proven nahi." },
      hi: { title: "पड़ोस की bakery से एक नया idea", description: "कम leftovers की शुरुआत एक अच्छे सवाल से।", story: "काल्पनिक उदाहरण: bakery ने regulars से अगले दिन के favourites reserve करने को कहा। कोई real business result claim नहीं है।", firstStep: "दस customers से पूछें कल के लिए क्या reserve करेंगे। Waste पहले और बाद में measure करें।", benefit: "Pre-orders से waste समझने का छोटा test", assumption: "Reservation pickup में बदलेगा, ज़रूरी नहीं। Waste reduction proven नहीं।" },
      kn: { title: "ಪಕ್ಕದ bakery ಇಂದ ಹೊಸ idea", description: "ಕಡಿಮೆ leftovers ಗೆ ಒಂದು ಒಳ್ಳೆಯ ಪ್ರಶ್ನೆ ಆರಂಭವಾಗಬಹುದು.", story: "ಕಾಲ್ಪನಿಕ ಉದಾಹರಣೆ: bakery regulars ಗೆ ನಾಳೆಯ favourites reserve ಮಾಡಲು ಕೇಳಿತು. ನಿಜವಾದ business results claim ಇಲ್ಲ.", firstStep: "ಹತ್ತು customers ಗೆ ನಾಳೆ ಏನು reserve ಮಾಡುತ್ತಾರೆ ಎಂದು ಕೇಳಿ. Waste ಮೊದಲು ಮತ್ತು ನಂತರ ಅಳೆಯಿರಿ.", benefit: "Pre-orders ಮೂಲಕ waste ತಿಳಿಯಲು ಸಣ್ಣ test", assumption: "Reservation pickup ಆಗುವುದು ಖಚಿತವಲ್ಲ. Waste ಕಡಿಮೆಯಾಗಿದೆ ಎಂಬ ಪುರಾವೆ ಇಲ್ಲ." },
    },
  },
];

export function opportunities(lang: Language, profile: Profile) {
  const list = ideas.map((idea) => {
    const c = idea.copy[lang];
    return {
      id: idea.id, category: idea.category, title: c.title, description: c.description, story: c.story,
      firstStep: c.firstStep, benefit: c.benefit, assumptions: [c.assumption],
      whyItFits: local(lang,
        `For ${profile.shopName} in ${profile.location}: a small test for your ${profile.category.toLowerCase()} and "${profile.challenge}". Your available promotion budget is ₹${profile.budget.toLocaleString("en-IN")}; confirm this idea's proposed spend before trying it.`,
        `${profile.shopName}, ${profile.location}: aapke menu aur "${profile.challenge}" ke liye chhota test. Promotion budget ₹${profile.budget.toLocaleString("en-IN")} hai.`,
        `${profile.shopName}, ${profile.location}: आपके menu और "${profile.challenge}" के लिए छोटा test। Promotion budget ₹${profile.budget.toLocaleString("en-IN")} है।`,
        `${profile.shopName}, ${profile.location}: ನಿಮ್ಮ menu ಮತ್ತು "${profile.challenge}" ಗೆ ಸಣ್ಣ test. Promotion budget ₹${profile.budget.toLocaleString("en-IN")}.`),
      image: idea.id === "combo" ? "/images/breakfast-photo.jpg" : `/images/${idea.id}.svg`,
      imageAlt: idea.id === "combo" ? "South Indian breakfast with idli, vada, sambar and chutney; illustrative serving, not Ravi's restaurant" : `${c.title} — original concept illustration`,
      budget: idea.budget, sellingPrice: idea.sellingPrice, makingCost: idea.makingCost,
      expectedUnits: idea.expectedUnits, promotionBudget: idea.budget, durationDays: 7,
      actionable: idea.category === "experiment" || idea.id === "preorder",
    };
  });
  const combo = list[0]!;
  list.push({
    ...combo, id: "visibility", budget: 600, promotionBudget: 600,
    title: local(lang, "Let the neighbourhood know", "Pados tak apni baat pahunchayein", "पड़ोस तक अपनी बात पहुँचाएं", "ಪಕ್ಕದವರಿಗೆ ನಿಮ್ಮ ಬಗ್ಗೆ ತಿಳಿಸಿ"),
    description: local(lang, "A ₹600 visibility test, not an assumption that awareness caused the shortfall.", "₹600 ka visibility test. Kam awareness wajah thi, yeh proven nahi.", "₹600 का visibility test। कम awareness वजह थी, यह proven नहीं।", "₹600 visibility test. ಕಡಿಮೆ awareness ಕಾರಣವೆಂದು proven ಅಲ್ಲ."),
    story: local(lang, "Compare daily demand with a small local sign and opt-in outreach. Keep price and menu unchanged.", "Chhota sign aur opt-in outreach try karein. Price aur menu same rakhein.", "छोटा sign और opt-in outreach try करें। Price और menu same रखें।", "ಸಣ್ಣ sign ಮತ್ತು opt-in outreach try ಮಾಡಿ. Price ಮತ್ತು menu ಹಾಗೆಯೇ ಇರಲಿ."),
    image: "/images/visibility.svg", benefit: local(lang, "Learn whether awareness affects demand", "Awareness aur demand ka connection test karein", "Awareness और demand का connection test करें", "Awareness ಮತ್ತು demand ಸಂಬಂಧ test ಮಾಡಿ"),
  });
  list.push({
    ...combo, id: "expansion", budget: 900, promotionBudget: 900, expectedUnits: 120,
    title: local(lang, "Give happy customers a reason to return", "Happy customers ko wapas bulayein", "Happy customers को वापस बुलाएं", "Happy customers ಮತ್ತೆ ಬರಲಿ"),
    description: local(lang, "A controlled repeat-customer offer after a strong result.", "Achhe result ke baad controlled repeat-customer offer.", "अच्छे result के बाद controlled repeat-customer offer।", "ಒಳ್ಳೆಯ result ನಂತರ controlled repeat-customer offer."),
    story: local(lang, "Invite customers who opted in. Keep capacity manageable and check reward costs before repeating.", "Opt-in customers ko invite karein. Capacity aur reward costs pehle check karein.", "Opt-in customers को invite करें। Capacity और reward costs पहले check करें।", "Opt-in customers ಆಹ್ವಾನಿಸಿ. Capacity ಮತ್ತು reward costs ಮೊದಲು ಪರಿಶೀಲಿಸಿ."),
    image: "/images/expansion.svg", benefit: local(lang, "Test whether demand continues", "Demand continue hoti hai ya nahi, test karein", "Demand continue होती है या नहीं, test करें", "Demand ಮುಂದುವರಿಯುತ್ತದೆಯೇ test ಮಾಡಿ"),
  });
  return list;
}

export function learningCopy(lang: Language, outcome: string) {
  const copy = {
    below: [
      local(lang, "Positive modeled contribution, but sales were below target.", "Modeled contribution positive hai, lekin sales target se kam hain.", "Modeled contribution positive है, लेकिन sales target से कम हैं।", "Modeled contribution positive ಇದೆ, ಆದರೆ sales target ಗಿಂತ ಕಡಿಮೆ."),
      local(lang, "The offer may be viable. Visibility is one hypothesis, not a proven cause. Rent, salaries and taxes are excluded.", "Offer useful ho sakta hai. Visibility sirf hypothesis hai, proven cause nahi. Rent, salaries aur taxes shamil nahi.", "Offer useful हो सकता है। Visibility सिर्फ hypothesis है, proven cause नहीं। Rent, salaries और taxes शामिल नहीं।", "Offer ಉಪಯುಕ್ತವಾಗಿರಬಹುದು. Visibility ಒಂದು hypothesis, proven ಕಾರಣವಲ್ಲ. Rent, salaries ಮತ್ತು taxes ಸೇರಿಲ್ಲ."),
      local(lang, "Try a ₹600 local visibility experiment", "₹600 ka local visibility experiment try karein", "₹600 का local visibility experiment try करें", "₹600 local visibility experiment try ಮಾಡಿ"),
    ],
    above: [
      local(lang, "Sales exceeded the target with positive modeled contribution.", "Sales target se zyada hain aur modeled contribution positive hai.", "Sales target से ज़्यादा हैं और modeled contribution positive है।", "Sales target ಮೀರಿದೆ ಮತ್ತು modeled contribution positive ಇದೆ."),
      local(lang, "This is a promising signal, not proof of sustained demand. Test repeat visits before scaling.", "Yeh achha signal hai, sustained demand ka proof nahi. Scale karne se pehle repeat visits test karein.", "यह अच्छा signal है, sustained demand का proof नहीं। Scale करने से पहले repeat visits test करें।", "ಇದು ಒಳ್ಳೆಯ signal, sustained demand ಗೆ proof ಅಲ್ಲ. Scale ಮಾಡುವ ಮೊದಲು repeat visits test ಮಾಡಿ."),
      local(lang, "Try a repeat-customer offer or controlled expansion", "Repeat-customer offer ya controlled expansion try karein", "Repeat-customer offer या controlled expansion try करें", "Repeat-customer offer ಅಥವಾ controlled expansion try ಮಾಡಿ"),
    ],
    loss: [
      local(lang, "Modeled costs were not recovered.", "Modeled costs recover nahi hue.", "Modeled costs recover नहीं हुए।", "Modeled costs recover ಆಗಿಲ್ಲ."),
      local(lang, "Pause paid promotion. Review price, making costs and feedback before spending more.", "Paid promotion rokein. Aur spend se pehle price, making costs aur feedback review karein.", "Paid promotion रोकें। और spend से पहले price, making costs और feedback review करें।", "Paid promotion ನಿಲ್ಲಿಸಿ. ಇನ್ನಷ್ಟು spend ಮೊದಲು price, making costs ಮತ್ತು feedback ಪರಿಶೀಲಿಸಿ."),
      local(lang, "Pause and validate demand with no-spend pre-orders", "Bina spend ke pre-orders se demand validate karein", "बिना spend के pre-orders से demand validate करें", "Spend ಇಲ್ಲದ pre-orders ಇಂದ demand validate ಮಾಡಿ"),
    ],
    insufficient: [
      local(lang, "No sales or promotion spend recorded.", "Sales ya promotion spend record nahi hua.", "Sales या promotion spend record नहीं हुआ।", "Sales ಅಥವಾ promotion spend record ಆಗಿಲ್ಲ."),
      local(lang, "There is not enough evidence to judge the idea. Confirm whether the experiment actually ran.", "Idea judge karne ke liye evidence kam hai. Confirm karein experiment actually chala tha ya nahi.", "Idea judge करने के लिए evidence कम है। Confirm करें experiment actually चला था या नहीं।", "Idea judge ಮಾಡಲು ಸಾಕಷ್ಟು evidence ಇಲ್ಲ. Experiment ನಿಜವಾಗಿ ನಡೆದಿದೆಯೇ ಖಚಿತಪಡಿಸಿ."),
      local(lang, "Validate interest with a no-spend pre-order test", "Bina spend ke pre-order interest test karein", "बिना spend के pre-order interest test करें", "Spend ಇಲ್ಲದೆ pre-order interest test ಮಾಡಿ"),
    ],
  };
  return copy[outcome === "on_target" ? "above" : outcome as keyof typeof copy] ?? copy.insufficient;
}
