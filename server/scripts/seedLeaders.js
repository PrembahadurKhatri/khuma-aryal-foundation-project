// One-off migration: copies the leadership entries that used to live in
// client/src/data/content.js (leaderMessages) into the new Leader
// collection, so the homepage keeps showing the same people/messages after
// switching to the admin-managed CMS instead of going blank. Safe to run
// more than once — skips if the collection already has data.
import "dotenv/config";
import mongoose from "mongoose";
import Leader from "../models/Leader.js";

const leaders = [
  {
    role: "founder",
    order: 0,
    name: { en: "Khuma Aryal", ne: "खुमा अर्याल" },
    title: { en: "Founder", ne: "संस्थापक" },
    photo: "https://i.pravatar.cc/600?img=13",
    message: {
      en: "I started this Foundation with a simple belief — that most of the struggles young people face can be prevented if someone is willing to guide them early with honesty and care. Every school we support, every health camp we run and every young person we counsel brings us closer to that vision.",
      ne: "मैले यो फाउन्डेशन एउटा सामान्य विश्वासका साथ सुरु गरेको हुँ — यदि कसैले इमान्दारी र मायाका साथ सुरुमै मार्गदर्शन गर्न तयार भयो भने युवाहरूले भोग्ने अधिकांश समस्या रोक्न सकिन्छ। हामीले सहयोग गर्ने हरेक विद्यालय, सञ्चालन गर्ने हरेक स्वास्थ्य शिविर र परामर्श दिने हरेक युवाले हामीलाई त्यो दृष्टिकोणको नजिक पुऱ्याउँछ।",
    },
  },
  {
    role: "president",
    order: 0,
    name: { en: "Ramesh Bahadur Thapa", ne: "रमेश बहादुर थापा" },
    title: { en: "President", ne: "अध्यक्ष" },
    photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDoxsUYsx70B4lLwzgWhb0AoAqsES3uIjL6MGDjbY5iextaOcnYfbGHTQ&s=10",
    message: {
      en: "As President, my focus is on turning our Founder's vision into programmes that reach real families and real communities. Together with our team and volunteers, we are committed to expanding our work in education, healthcare, sports and employment every year.",
      ne: "अध्यक्षको हैसियतले, मेरो ध्यान संस्थापकको दृष्टिकोणलाई वास्तविक परिवार र समुदायसम्म पुग्ने कार्यक्रममा बदल्नमा केन्द्रित छ। हाम्रो टिम र स्वयंसेवकहरूसँग मिलेर हामी हरेक वर्ष शिक्षा, स्वास्थ्य, खेलकुद र रोजगारीमा हाम्रो काम विस्तार गर्न प्रतिबद्ध छौं।",
    },
  },
  {
    role: "past-president",
    order: 1,
    name: { en: "Suresh Kumar Shrestha", ne: "सुरेश कुमार श्रेष्ठ" },
    title: { en: "Past President", ne: "पूर्व अध्यक्ष" },
    photo: "https://i.pravatar.cc/600?img=52",
    message: {
      en: "It has been an honour to serve this Foundation and watch it grow from a small local initiative into an organisation trusted by many communities. I remain committed as an advisor to supporting the next generation of leadership here.",
      ne: "यो फाउन्डेशनको सेवा गर्न र यसलाई एउटा सानो स्थानीय पहलबाट धेरै समुदायले विश्वास गर्ने संस्थामा बढ्दै गएको हेर्न पाउनु मेरो लागि सम्मानको कुरा हो। म सल्लाहकारको रूपमा यहाँको अर्को पुस्ताको नेतृत्वलाई सहयोग गर्न प्रतिबद्ध रहनेछु।",
    },
  },
  {
    role: "secretary",
    order: 2,
    name: { en: "Sabina Gurung", ne: "साबिना गुरुङ" },
    title: { en: "Secretary", ne: "सचिव" },
    photo: "https://i.pravatar.cc/600?img=47",
    message: {
      en: "Behind every programme is careful planning, coordination and record-keeping. My role is to make sure our commitments to donors, partners and the communities we serve are always followed through with transparency and accountability.",
      ne: "हरेक कार्यक्रमको पछाडि सावधानीपूर्वक योजना, समन्वय र अभिलेखीकरण हुन्छ। दाता, साझेदार र सेवा पाउने समुदायप्रतिको हाम्रो प्रतिबद्धता सधैं पारदर्शिता र जवाफदेहिताका साथ पूरा होस् भन्ने सुनिश्चित गर्नु मेरो भूमिका हो।",
    },
  },
  {
    role: "advisor",
    order: 3,
    name: { en: "Dr. Prakash Adhikari", ne: "डा. प्रकाश अधिकारी" },
    title: { en: "Advisor — Healthcare", ne: "सल्लाहकार — स्वास्थ्य" },
    photo: "https://i.pravatar.cc/600?img=14",
    message: {
      en: "Good health is the foundation of everything else — learning, playing, working. I advise the Foundation on designing health camps and awareness programmes that are practical, sustainable and genuinely useful to the communities we visit.",
      ne: "राम्रो स्वास्थ्य अरू सबै कुराको आधार हो — पढाइ, खेल, काम। म फाउन्डेशनलाई व्यावहारिक, दिगो र साँच्चै उपयोगी स्वास्थ्य शिविर र सचेतना कार्यक्रम डिजाइन गर्न सल्लाह दिन्छु।",
    },
  },
  {
    role: "spouse",
    order: 4,
    name: { en: "Menuka Aryal", ne: "मेनुका अर्याल" },
    title: { en: "Foundation Patron", ne: "फाउन्डेशन संरक्षक" },
    photo: "https://i.pravatar.cc/600?img=45",
    message: {
      en: "I have watched this Foundation grow from an idea shared at our family table into a movement that touches hundreds of lives. I continue to support this mission because I have seen, first-hand, the difference good counselling and timely help can make.",
      ne: "मैले यो फाउन्डेशनलाई हाम्रो घरको कुराकानीबाट सुरु भएको विचारदेखि सयौं जीवनलाई छुने अभियानसम्म बढ्दै गएको देखेकी छु। राम्रो परामर्श र समयमै दिइने सहयोगले ल्याउने फरक मैले आफ्नै आँखाले देखेकी हुनाले म यो अभियानलाई निरन्तर साथ दिन्छु।",
    },
  },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await Leader.countDocuments();
  if (existing > 0) {
    console.log(`Leader collection already has ${existing} document(s) — skipping seed.`);
  } else {
    await Leader.insertMany(leaders);
    console.log(`Seeded ${leaders.length} leaders.`);
  }
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
