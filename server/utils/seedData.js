// Seeds the database with a working admin user and the same demo
// news/projects/gallery content already shown on the frontend
// (client/src/data/content.js), so the CMS isn't empty on first run.
// Run with: npm run seed
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import News from "../models/News.js";
import Project from "../models/Project.js";
import Album from "../models/Album.js";
import Settings from "../models/Settings.js";

dotenv.config();

const run = async () => {
  await connectDB();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@khumaaryalfoundation.org";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({ name: "Admin", email: adminEmail, password: adminPassword, role: "admin" });
    console.log(`Created default admin -> email: ${adminEmail} / password: ${adminPassword}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  console.log("Clearing existing demo content...");
  await Promise.all([News.deleteMany({}), Project.deleteMany({}), Album.deleteMany({})]);

  console.log("Seeding news...");
  await News.create([
    {
      date: new Date("2026-07-28"),
      title: { en: "Foundation Launches New Scholarship Cycle for 2026", ne: "फाउन्डेशनद्वारा २०२६ को नयाँ छात्रवृत्ति चक्र सुरु" },
      description: {
        en: "Applications are now open for the 2026 school scholarship cycle. Interested students and guardians can contact our office or visit any partner school for details.",
        ne: "२०२६ को विद्यालय छात्रवृत्ति चक्रका लागि आवेदन खुला भएको छ। इच्छुक विद्यार्थी र अभिभावकले हाम्रो कार्यालय वा नजिकैको साझेदार विद्यालयमा सम्पर्क गर्न सक्नुहुन्छ।",
      },
      createdBy: admin._id,
    },
    {
      date: new Date("2026-06-15"),
      title: { en: "Free Health Camp Reaches 250+ Villagers", ne: "निःशुल्क स्वास्थ्य शिविरले २५०+ गाउँलेलाई सेवा" },
      description: {
        en: "Our monthly health camp, held in partnership with local volunteer doctors, provided free check-ups and medicine to over 250 community members.",
        ne: "स्थानीय स्वयंसेवी डाक्टरहरूको साझेदारीमा सञ्चालित हाम्रो मासिक स्वास्थ्य शिविरले २५० भन्दा बढी समुदायका सदस्यलाई निःशुल्क जाँच र औषधि उपलब्ध गरायो।",
      },
      createdBy: admin._id,
    },
    {
      date: new Date("2026-05-02"),
      title: { en: "Youth Sports League Finals Draw Record Crowd", ne: "युवा खेलकुद लिगको फाइनलमा रेकर्ड भीड" },
      description: {
        en: "The season finale of our Youth Sports League brought together eight teams and hundreds of spectators for a celebration of teamwork and healthy competition.",
        ne: "हाम्रो युवा खेलकुद लिगको सिजन फाइनलमा आठ टिम र सयौं दर्शक जम्मा भई टिमवर्क र स्वस्थ प्रतिस्पर्धाको उत्सव मनाइयो।",
      },
      createdBy: admin._id,
    },
    {
      date: new Date("2026-03-20"),
      title: { en: "New Batch Begins Vocational Skill Training", ne: "व्यावसायिक सीप तालिमको नयाँ ब्याच सुरु" },
      description: {
        en: "Thirty youth have enrolled in our latest round of tailoring and electrical-work training, with job placement support to follow on completion.",
        ne: "हाम्रो पछिल्लो सिलाई र विद्युतीय काम तालिममा तीस जना युवा भर्ना भएका छन्, तालिम सकिएपछि रोजगारी सहयोग समेत उपलब्ध हुनेछ।",
      },
      createdBy: admin._id,
    },
  ]);

  console.log("Seeding projects...");
  await Project.create([
    {
      status: "ongoing",
      title: { en: "School Scholarship Programme", ne: "विद्यालय छात्रवृत्ति कार्यक्रम" },
      description: {
        en: "Providing full and partial scholarships, textbooks and school supplies to underprivileged students across five community schools.",
        ne: "पाँच सामुदायिक विद्यालयका विपन्न विद्यार्थीहरूलाई पूर्ण र आंशिक छात्रवृत्ति, पाठ्यपुस्तक र शैक्षिक सामग्री उपलब्ध गराउने कार्यक्रम।",
      },
      images: [],
      createdBy: admin._id,
    },
    {
      status: "ongoing",
      title: { en: "Community Health Camps", ne: "सामुदायिक स्वास्थ्य शिविर" },
      description: {
        en: "Monthly free health check-up camps offering basic diagnostics, medicine and referrals in partnership with local health posts.",
        ne: "स्थानीय स्वास्थ्य चौकीहरूसँगको साझेदारीमा आधारभूत जाँच, औषधि र रिफरल उपलब्ध गराउने मासिक निःशुल्क स्वास्थ्य जाँच शिविर।",
      },
      images: [],
      createdBy: admin._id,
    },
    {
      status: "ongoing",
      title: { en: "Youth Sports League", ne: "युवा खेलकुद लिग" },
      description: {
        en: "A grassroots football and volleyball league for youth aged 12-20, promoting discipline, teamwork and healthy habits.",
        ne: "१२-२० वर्ष उमेर समूहका युवाहरूका लागि फुटबल र भलिबल लिग, जसले अनुशासन, टिमवर्क र स्वस्थ बानीलाई बढावा दिन्छ।",
      },
      images: [],
      createdBy: admin._id,
    },
    {
      status: "completed",
      title: { en: "Winter Clothing Drive", ne: "जाडो लुगा अभियान" },
      description: {
        en: "Distributed warm clothing and blankets to over 300 families in remote hill communities ahead of the winter season.",
        ne: "जाडो सुरु हुनुअघि दुर्गम पहाडी समुदायका ३०० भन्दा बढी परिवारलाई न्यानो लुगा र कम्बल वितरण।",
      },
      images: [],
      createdBy: admin._id,
    },
  ]);

  console.log("Seeding gallery albums...");
  await Album.create([
    {
      title: { en: "School Scholarship Distribution", ne: "विद्यालय छात्रवृत्ति वितरण" },
      coverImage: "/images/gallery/gallery-1.jpg",
      photos: ["/images/gallery/gallery-1.jpg"],
      createdBy: admin._id,
    },
    {
      title: { en: "Community Health Camp", ne: "सामुदायिक स्वास्थ्य शिविर" },
      coverImage: "/images/gallery/gallery-2.jpg",
      photos: ["/images/gallery/gallery-2.jpg"],
      createdBy: admin._id,
    },
    {
      title: { en: "Youth Sports League", ne: "युवा खेलकुद लिग" },
      coverImage: "/images/gallery/gallery-3.jpg",
      photos: ["/images/gallery/gallery-3.jpg"],
      createdBy: admin._id,
    },
    {
      title: { en: "Vocational Skills Training", ne: "व्यावसायिक सीप तालिम" },
      coverImage: "/images/gallery/gallery-4.jpg",
      photos: ["/images/gallery/gallery-4.jpg"],
      createdBy: admin._id,
    },
  ]);

  console.log("Seeding settings...");
  const existingSettings = await Settings.findOne();
  if (!existingSettings) {
    await Settings.create({
      name: { en: "Khuma Aryal Foundation", ne: "खुमा अर्याल फाउन्डेशन" },
      tagline: { en: "Education • Healthcare • Sports • Employment", ne: "शिक्षा • स्वास्थ्य • खेलकुद • रोजगारी" },
      address: { en: "Bhirkot Municipality, Syangja, Nepal", ne: "भिरकोट नगरपालिका, स्याङ्जा, नेपाल" },
      officeHours: { en: "Sun – Fri: 10:00 AM – 5:00 PM", ne: "आइतबार – शुक्रबार: बिहान १०:०० – साँझ ५:००" },
      phone: "+977-98XXXXXXXX",
      email: "info@khumaaryalfoundation.org",
    });
  }

  console.log("Done.");
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
