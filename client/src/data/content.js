// ---------------------------------------------------------------------------
// SAMPLE / PLACEHOLDER CONTENT
// ---------------------------------------------------------------------------
// Every name, message, project and photo path below is placeholder data so
// the site is fully browsable out of the box. Replace it with real content.
//
// Bilingual fields use the shape { en: "...", ne: "..." } and are resolved
// with src/utils/localize.js -> pick(field, language). This shape mirrors
// what a future MongoDB document / CMS form would store, so when the backend
// (Express + MongoDB, per the plan) is added, src/services/contentService.js
// is the ONLY file that needs to change — swap the local arrays below for
// fetch() calls returning the same shape, and every page keeps working.
//
// Photos: the leadership section's `photo` fields currently point at
// i.pravatar.cc stand-in portraits so the section looks complete out of the
// box. Gallery/project photos point at /public/images/... — drop a matching
// file in and it shows automatically. In every case, if an image is missing
// or fails to load, a soft placeholder (initials avatar / gradient card) is
// shown instead, so nothing ever looks broken. To use a real leader photo,
// just replace the `photo` URL below with a local path, e.g.
// "/images/leaders/founder.jpg", and drop the file into
// public/images/leaders/.
// ---------------------------------------------------------------------------

export const siteInfo = {
  name: { en: "Khuma Aryal Foundation", ne: "खुमा अर्याल फाउन्डेशन" },
  tagline: { en: "Education • Healthcare • Sports • Employment", ne: "शिक्षा • स्वास्थ्य • खेलकुद • रोजगारी" },
  address: { en: "Bhirkot Municipality, Syangja, Nepal", ne: "भिरकोट नगरपालिका, स्याङ्जा, नेपाल" },
  phone: "+977-98XXXXXXXX",
  email: "info@khumaaryalfoundation.org",
  officeHours: { en: "Sun – Fri: 10:00 AM – 5:00 PM", ne: "आइतबार – शुक्रबार: बिहान १०:०० – साँझ ५:००" },
  social: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
  },
};

// Shown on the Home page. `role` maps to a display order; add/remove entries
// here — this is exactly the list a future "Messages" CMS screen would manage.
export const leaderMessages = [
  {
    id: "founder",
    role: "founder",
    name: { en: "Khuma Aryal", ne: "खुमा अर्याल" },
    title: { en: "Founder", ne: "संस्थापक" },
    photo: "https://i.pravatar.cc/600?img=13",
    message: {
      en: "I started this Foundation with a simple belief — that most of the struggles young people face can be prevented if someone is willing to guide them early with honesty and care. Every school we support, every health camp we run and every young person we counsel brings us closer to that vision.",
      ne: "मैले यो फाउन्डेशन एउटा सामान्य विश्वासका साथ सुरु गरेको हुँ — यदि कसैले इमान्दारी र मायाका साथ सुरुमै मार्गदर्शन गर्न तयार भयो भने युवाहरूले भोग्ने अधिकांश समस्या रोक्न सकिन्छ। हामीले सहयोग गर्ने हरेक विद्यालय, सञ्चालन गर्ने हरेक स्वास्थ्य शिविर र परामर्श दिने हरेक युवाले हामीलाई त्यो दृष्टिकोणको नजिक पुऱ्याउँछ।",
    },
  },
  {
    id: "president",
    role: "president",
    name: { en: "Ramesh Bahadur Thapa", ne: "रमेश बहादुर थापा" },
    title: { en: "President", ne: "अध्यक्ष" },
    photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDoxsUYsx70B4lLwzgWhb0AoAqsES3uIjL6MGDjbY5iextaOcnYfbGHTQ&s=10",
    message: {
      en: "As President, my focus is on turning our Founder's vision into programmes that reach real families and real communities. Together with our team and volunteers, we are committed to expanding our work in education, healthcare, sports and employment every year.",
      ne: "अध्यक्षको हैसियतले, मेरो ध्यान संस्थापकको दृष्टिकोणलाई वास्तविक परिवार र समुदायसम्म पुग्ने कार्यक्रममा बदल्नमा केन्द्रित छ। हाम्रो टिम र स्वयंसेवकहरूसँग मिलेर हामी हरेक वर्ष शिक्षा, स्वास्थ्य, खेलकुद र रोजगारीमा हाम्रो काम विस्तार गर्न प्रतिबद्ध छौं।",
    },
  },
  {
    id: "past-president",
    role: "past-president",
    name: { en: "Suresh Kumar Shrestha", ne: "सुरेश कुमार श्रेष्ठ" },
    title: { en: "Past President", ne: "पूर्व अध्यक्ष" },
    photo: "https://i.pravatar.cc/600?img=52",
    message: {
      en: "It has been an honour to serve this Foundation and watch it grow from a small local initiative into an organisation trusted by many communities. I remain committed as an advisor to supporting the next generation of leadership here.",
      ne: "यो फाउन्डेशनको सेवा गर्न र यसलाई एउटा सानो स्थानीय पहलबाट धेरै समुदायले विश्वास गर्ने संस्थामा बढ्दै गएको हेर्न पाउनु मेरो लागि सम्मानको कुरा हो। म सल्लाहकारको रूपमा यहाँको अर्को पुस्ताको नेतृत्वलाई सहयोग गर्न प्रतिबद्ध रहनेछु।",
    },
  },
  {
    id: "secretary",
    role: "secretary",
    name: { en: "Sabina Gurung", ne: "साबिना गुरुङ" },
    title: { en: "Secretary", ne: "सचिव" },
    photo: "https://i.pravatar.cc/600?img=47",
    message: {
      en: "Behind every programme is careful planning, coordination and record-keeping. My role is to make sure our commitments to donors, partners and the communities we serve are always followed through with transparency and accountability.",
      ne: "हरेक कार्यक्रमको पछाडि सावधानीपूर्वक योजना, समन्वय र अभिलेखीकरण हुन्छ। दाता, साझेदार र सेवा पाउने समुदायप्रतिको हाम्रो प्रतिबद्धता सधैं पारदर्शिता र जवाफदेहिताका साथ पूरा होस् भन्ने सुनिश्चित गर्नु मेरो भूमिका हो।",
    },
  },
  {
    id: "advisor-1",
    role: "advisor",
    name: { en: "Dr. Prakash Adhikari", ne: "डा. प्रकाश अधिकारी" },
    title: { en: "Advisor — Healthcare", ne: "सल्लाहकार — स्वास्थ्य" },
    photo: "https://i.pravatar.cc/600?img=14",
    message: {
      en: "Good health is the foundation of everything else — learning, playing, working. I advise the Foundation on designing health camps and awareness programmes that are practical, sustainable and genuinely useful to the communities we visit.",
      ne: "राम्रो स्वास्थ्य अरू सबै कुराको आधार हो — पढाइ, खेल, काम। म फाउन्डेशनलाई व्यावहारिक, दिगो र साँच्चै उपयोगी स्वास्थ्य शिविर र सचेतना कार्यक्रम डिजाइन गर्न सल्लाह दिन्छु।",
    },
  },
  {
    id: "spouse",
    role: "spouse",
    name: { en: "Menuka Aryal", ne: "मेनुका अर्याल" },
    title: { en: "Foundation Patron", ne: "फाउन्डेशन संरक्षक" },
    photo: "https://i.pravatar.cc/600?img=45",
    message: {
      en: "I have watched this Foundation grow from an idea shared at our family table into a movement that touches hundreds of lives. I continue to support this mission because I have seen, first-hand, the difference good counselling and timely help can make.",
      ne: "मैले यो फाउन्डेशनलाई हाम्रो घरको कुराकानीबाट सुरु भएको विचारदेखि सयौं जीवनलाई छुने अभियानसम्म बढ्दै गएको देखेकी छु। राम्रो परामर्श र समयमै दिइने सहयोगले ल्याउने फरक मैले आफ्नै आँखाले देखेकी हुनाले म यो अभियानलाई निरन्तर साथ दिन्छु।",
    },
  },
];

export const projects = [
  {
    id: "proj-1",
    status: "ongoing",
    title: { en: "School Scholarship Programme", ne: "विद्यालय छात्रवृत्ति कार्यक्रम" },
    description: {
      en: "Providing full and partial scholarships, textbooks and school supplies to underprivileged students across five community schools.",
      ne: "पाँच सामुदायिक विद्यालयका विपन्न विद्यार्थीहरूलाई पूर्ण र आंशिक छात्रवृत्ति, पाठ्यपुस्तक र शैक्षिक सामग्री उपलब्ध गराउने कार्यक्रम।",
    },
    images: ["/images/projects/scholarship-1.jpg", "/images/projects/scholarship-2.jpg"],
  },
  {
    id: "proj-2",
    status: "ongoing",
    title: { en: "Community Health Camps", ne: "सामुदायिक स्वास्थ्य शिविर" },
    description: {
      en: "Monthly free health check-up camps offering basic diagnostics, medicine and referrals in partnership with local health posts.",
      ne: "स्थानीय स्वास्थ्य चौकीहरूसँगको साझेदारीमा आधारभूत जाँच, औषधि र रिफरल उपलब्ध गराउने मासिक निःशुल्क स्वास्थ्य जाँच शिविर।",
    },
    images: ["/images/projects/health-camp-1.jpg", "/images/projects/health-camp-2.jpg"],
  },
  {
    id: "proj-3",
    status: "ongoing",
    title: { en: "Youth Sports League", ne: "युवा खेलकुद लिग" },
    description: {
      en: "A grassroots football and volleyball league for youth aged 12-20, promoting discipline, teamwork and healthy habits.",
      ne: "१२-२० वर्ष उमेर समूहका युवाहरूका लागि फुटबल र भलिबल लिग, जसले अनुशासन, टिमवर्क र स्वस्थ बानीलाई बढावा दिन्छ।",
    },
    images: ["/images/projects/sports-league-1.jpg"],
  },
  {
    id: "proj-4",
    status: "ongoing",
    title: { en: "Skill Training & Job Linkage", ne: "सीप तालिम र रोजगारी जडान" },
    description: {
      en: "Vocational training in tailoring, electrical work and computer skills, followed by direct linkage to local employers.",
      ne: "सिलाई, विद्युतीय काम र कम्प्युटर सीपमा व्यावसायिक तालिम, त्यसपछि स्थानीय रोजगारदातासँग प्रत्यक्ष जडान।",
    },
    images: ["/images/projects/skills-1.jpg", "/images/projects/skills-2.jpg"],
  },
  {
    id: "proj-5",
    status: "completed",
    title: { en: "Winter Clothing Drive", ne: "जाडो लुगा अभियान" },
    description: {
      en: "Distributed warm clothing and blankets to over 300 families in remote hill communities ahead of the winter season.",
      ne: "जाडो सुरु हुनुअघि दुर्गम पहाडी समुदायका ३०० भन्दा बढी परिवारलाई न्यानो लुगा र कम्बल वितरण।",
    },
    images: ["/images/projects/winter-drive-1.jpg"],
  },
  {
    id: "proj-6",
    status: "completed",
    title: { en: "Career Counselling Workshops", ne: "करियर परामर्श कार्यशाला" },
    description: {
      en: "A series of workshops in secondary schools helping students understand career paths, further education and self-employment options.",
      ne: "माध्यमिक विद्यालयहरूमा सञ्चालित कार्यशाला शृंखला, जसले विद्यार्थीलाई करियर मार्ग, उच्च शिक्षा र स्वरोजगारका विकल्प बुझ्न मद्दत गर्छ।",
    },
    images: ["/images/projects/career-workshop-1.jpg"],
  },
];

export const newsItems = [
  {
    id: "news-1",
    date: "2026-07-28",
    title: { en: "Foundation Launches New Scholarship Cycle for 2026", ne: "फाउन्डेशनद्वारा २०२६ को नयाँ छात्रवृत्ति चक्र सुरु" },
    description: {
      en: "Applications are now open for the 2026 school scholarship cycle. Interested students and guardians can contact our office or visit any partner school for details.",
      ne: "२०२६ को विद्यालय छात्रवृत्ति चक्रका लागि आवेदन खुला भएको छ। इच्छुक विद्यार्थी र अभिभावकले हाम्रो कार्यालय वा नजिकैको साझेदार विद्यालयमा सम्पर्क गर्न सक्नुहुन्छ।",
    },
  },
  {
    id: "news-2",
    date: "2026-06-15",
    title: { en: "Free Health Camp Reaches 250+ Villagers", ne: "निःशुल्क स्वास्थ्य शिविरले २५०+ गाउँलेलाई सेवा" },
    description: {
      en: "Our monthly health camp, held in partnership with local volunteer doctors, provided free check-ups and medicine to over 250 community members.",
      ne: "स्थानीय स्वयंसेवी डाक्टरहरूको साझेदारीमा सञ्चालित हाम्रो मासिक स्वास्थ्य शिविरले २५० भन्दा बढी समुदायका सदस्यलाई निःशुल्क जाँच र औषधि उपलब्ध गरायो।",
    },
  },
  {
    id: "news-3",
    date: "2026-05-02",
    title: { en: "Youth Sports League Finals Draw Record Crowd", ne: "युवा खेलकुद लिगको फाइनलमा रेकर्ड भीड" },
    description: {
      en: "The season finale of our Youth Sports League brought together eight teams and hundreds of spectators for a celebration of teamwork and healthy competition.",
      ne: "हाम्रो युवा खेलकुद लिगको सिजन फाइनलमा आठ टिम र सयौं दर्शक जम्मा भई टिमवर्क र स्वस्थ प्रतिस्पर्धाको उत्सव मनाइयो।",
    },
  },
  {
    id: "news-4",
    date: "2026-03-20",
    title: { en: "New Batch Begins Vocational Skill Training", ne: "व्यावसायिक सीप तालिमको नयाँ ब्याच सुरु" },
    description: {
      en: "Thirty youth have enrolled in our latest round of tailoring and electrical-work training, with job placement support to follow on completion.",
      ne: "हाम्रो पछिल्लो सिलाई र विद्युतीय काम तालिममा तीस जना युवा भर्ना भएका छन्, तालिम सकिएपछि रोजगारी सहयोग समेत उपलब्ध हुनेछ।",
    },
  },
];

export const galleryImages = [
  { id: "g-1", src: "/images/gallery/gallery-1.jpg", alt: { en: "School scholarship distribution", ne: "विद्यालय छात्रवृत्ति वितरण" } },
  { id: "g-2", src: "/images/gallery/gallery-2.jpg", alt: { en: "Community health camp", ne: "सामुदायिक स्वास्थ्य शिविर" } },
  { id: "g-3", src: "/images/gallery/gallery-3.jpg", alt: { en: "Youth sports league match", ne: "युवा खेलकुद लिग खेल" } },
  { id: "g-4", src: "/images/gallery/gallery-4.jpg", alt: { en: "Vocational skills training session", ne: "व्यावसायिक सीप तालिम सत्र" } },
  { id: "g-5", src: "/images/gallery/gallery-5.jpg", alt: { en: "Winter clothing distribution", ne: "जाडो लुगा वितरण" } },
  { id: "g-6", src: "/images/gallery/gallery-6.jpg", alt: { en: "Career counselling workshop", ne: "करियर परामर्श कार्यशाला" } },
  { id: "g-7", src: "/images/gallery/gallery-7.jpg", alt: { en: "Foundation team meeting", ne: "फाउन्डेशन टिम बैठक" } },
  { id: "g-8", src: "/images/gallery/gallery-8.jpg", alt: { en: "Community outreach visit", ne: "सामुदायिक भ्रमण" } },
];
