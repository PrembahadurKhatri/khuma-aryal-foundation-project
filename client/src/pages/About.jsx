import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import { useSiteInfo } from "../contexts/SiteInfoContext.jsx";
import { submitMessage } from "../services/messageService.js";
import Container from "../components/Container.jsx";
import Reveal from "../components/Reveal.jsx";
import PlaceholderImage from "../components/PlaceholderImage.jsx";
import PageHero from "../components/PageHero.jsx";

// The 4 pillars reuse the exact same titles/descriptions shown on the Home
// page (home.pillar*) — no new copy, just a new card treatment here.
// Blood Donation & School Support have their own about.work* keys since
// there's no existing equivalent elsewhere on the site.
const WORK_ITEMS = [
  {  titleKey: "home.pillarEducation", descKey: "home.pillarEducationDesc", image: "https://scontent.fpkr1-1.fna.fbcdn.net/v/t1.6435-9/69793051_125662108785690_5809715434240344064_n.jpg?stp=dst-jpg_tt6&cstp=mx960x720&ctp=s960x720&_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=MfFKCgZ9PEUQ7kNvwHowYS0&_nc_oc=Adpdx3Bnh_yyEJQV6R26Ca3r6bNyOcC3y7kb0JQcXHjtcloik9tvScw1Iq9GaWZXcX-wrrKq0Ryi1iVsUDDcY06P&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=rwvpyhxK1-vJ2eu8sXH8EA&_nc_ss=7b2a8&oh=00_AQHadRIRD_c4Jry1NRyMQge9nyOx36FIT0AyyoP40fe08A&oe=6AA421AD" },
  {  titleKey: "home.pillarHealth", descKey: "home.pillarHealthDesc", image: "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/486823106_984248633890522_484607770406747500_n.jpg?stp=dst-jpg_tt6&cstp=mx960x960&ctp=s960x960&_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_ohc=OU64WDiYVfsQ7kNvwGid1zq&_nc_oc=Adr3I3JaPxFotW2vsMtScX-6gf9NMWZ2QY5gYfY91xhObx2anMI0GBDJ1CjtEKCJnw8RJIkQueh5PsOQKlOtM9IO&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=2aZlIJUyyFexfVATwhZ-aA&_nc_ss=7b2a8&oh=00_AQFwRPvgB7DKMRa7rFNsOk16pg2CY5CvYTfs7i13OoHwsw&oe=6A825431" },
  {  titleKey: "home.pillarSports", descKey: "home.pillarSportsDesc", image: "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/624837580_1228335686148481_5155746346685952178_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1365&ctp=s2048x1365&_nc_cat=110&ccb=1-7&_nc_sid=f727a1&_nc_ohc=ulgEADvOtOMQ7kNvwEaUgOJ&_nc_oc=Adq3t6ZESFbPEYQanGl3SMbAcEtB4KJJYzuD6ZxGiySC-owNepgTVUJlemn4w54k4zJf_WRu7g_21YwSZl7Orlzf&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=-X_kidxgaDsWuuoJ7lIaCA&_nc_ss=7b2a8&oh=00_AQGMx5U7jk-t-qlGbMwcccd_eq9OXLHCsaYb5VlBVeJGjA&oe=6A826F0E" },
  {  titleKey: "about.workBloodDonationTitle", descKey: "about.workBloodDonationDesc", image: "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/587032325_1176229684692415_2894262075189041904_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx736x1000&ctp=s736x1000&_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_ohc=iYMUZ4j3QmAQ7kNvwF1cqN0&_nc_oc=AdocCXjG35WI4dVid9HDnYSDofYXArM_zVC1h8R_wF4q4YEHfOHEgxZIEq6sMXM_dNZm2Oysed-QfNpQjFSUK7pO&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=GYh1Qus9d8hJPqszqnuL1Q&_nc_ss=7b2a8&oh=00_AQHdRpcAj5Wjm4j7J34p8cf_Rosz89cTZnhG50cJuBTpvQ&oe=6A827AB4" },
  {  titleKey: "about.workSchoolSupportTitle", descKey: "about.workSchoolSupportDesc", image: "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/593458221_1184793670502683_8870967002735546520_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1536&ctp=s2048x1536&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=SijN99myihMQ7kNvwHEE-mF&_nc_oc=AdqSD2F4wJfP5wGulrLWLHaAlh5-H-gKAxQ7BhMODbv8R_k6S5zewxmL-tUefC0obexpfaJ4OKikNLR1susW0Io_&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=bEWrLnpI2KSyqlFkfY8cNA&_nc_ss=7b2a8&oh=00_AQFtS7aNiv5RFCaR4gxwfpfQ0C_dy-vN5IWhPqNLbglOAw&oe=6A8279E1" },
  {  titleKey: "home.pillarEmployment", descKey: "home.pillarEmploymentDesc", image: "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/676586471_1300140468968002_1277633533144413178_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x948&ctp=s2048x948&_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=1Mqg3qB_6F0Q7kNvwHsiZ34&_nc_oc=AdqcSH44WjFSnYY3SbWfOEtug8q125GL-kSJEiYPr9v_inU_5GGuo07CHWXhH-HodPFRuid0Epd9YpgdprJ2TrfM&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=vN_JG9FWKWXbfi1HgRWD2w&_nc_ss=7b2a8&oh=00_AQEm4jG9lZQX0HJsr4oL8z82iiURJUs8_SNobBmuX18w_A&oe=6A826AC3" },
];

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 21s-6.5-5.86-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.14-6.5 11-6.5 11Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M6.5 4h2.7l1.3 4-2 1.4a11 11 0 0 0 5.1 5.1l1.4-2 4 1.3v2.7c0 1-.85 1.77-1.83 1.63A16.5 16.5 0 0 1 4.87 5.83 1.65 1.65 0 0 1 6.5 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.75" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 6.5 12 12.5l7.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.3 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.3-3.6-8.5S9.6 5.8 12 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const SOCIAL_ICONS = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M13.5 21v-8.2h2.75l.41-3.2H13.5V7.4c0-.93.26-1.56 1.6-1.56h1.7V2.98A22.7 22.7 0 0 0 14.5 2.85c-2.42 0-4.08 1.48-4.08 4.2v2.55H7.65v3.2h2.77V21h3.08Z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2.2c2.7 0 3 .01 4.1.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.64.42 1.37.47 2.43.05 1.1.06 1.4.06 4.1s-.01 3-.06 4.1c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.64.25-1.37.42-2.43.47-1.1.05-1.4.06-4.1.06s-3-.01-4.1-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.25-.64-.42-1.37-.47-2.43C2.21 15 2.2 14.7 2.2 12s.01-3 .06-4.1c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.15-1.77A4.9 4.9 0 0 1 5.65 2.55c.64-.25 1.37-.42 2.43-.47C9.18 2.03 9.48 2.02 12 2.02Zm0 1.8c-2.66 0-2.97.01-4.02.06-.86.04-1.33.18-1.64.3-.41.16-.71.35-1.02.66-.31.31-.5.61-.66 1.02-.12.31-.26.78-.3 1.64-.05 1.05-.06 1.36-.06 4.02s.01 2.97.06 4.02c.04.86.18 1.33.3 1.64.16.41.35.71.66 1.02.31.31.61.5 1.02.66.31.12.78.26 1.64.3 1.05.05 1.36.06 4.02.06s2.97-.01 4.02-.06c.86-.04 1.33-.18 1.64-.3.41-.16.71-.35 1.02-.66.31-.31.5-.61.66-1.02.12-.31.26-.78.3-1.64.05-1.05.06-1.36.06-4.02s-.01-2.97-.06-4.02c-.04-.86-.18-1.33-.3-1.64a2.76 2.76 0 0 0-.66-1.02 2.76 2.76 0 0 0-1.02-.66c-.31-.12-.78-.26-1.64-.3C14.97 4.01 14.66 4 12 4Zm0 3.38A4.62 4.62 0 1 1 7.38 12 4.62 4.62 0 0 1 12 7.38Zm0 1.8A2.82 2.82 0 1 0 14.82 12 2.82 2.82 0 0 0 12 9.18Zm4.8-2.02a1.08 1.08 0 1 1-1.08-1.08 1.08 1.08 0 0 1 1.08 1.08Z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M21.6 7.2s-.21-1.48-.86-2.14c-.82-.86-1.74-.87-2.16-.92C15.6 4 12 4 12 4h-.01s-3.6 0-6.58.14c-.42.05-1.34.06-2.16.92-.65.66-.86 2.14-.86 2.14S2.18 8.94 2.18 10.68v1.53c0 1.74.21 3.48.21 3.48s.21 1.48.86 2.14c.82.86 1.9.83 2.38.92 1.72.16 7.37.21 7.37.21s3.6 0 6.58-.15c.42-.05 1.34-.06 2.16-.92.65-.66.86-2.14.86-2.14s.21-1.74.21-3.48v-1.53c0-1.74-.21-3.48-.21-3.48ZM9.98 14.5v-5.4l4.9 2.71-4.9 2.69Z" />
    </svg>
  ),
};

export default function About() {
  const { t, language } = useLanguage();
  const siteInfo = useSiteInfo();
  const [contactStatus, setContactStatus] = useState("idle"); // idle | sending | sent | error

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      name: form.name.value,
      email: form.email.value,
      subject: form.subject.value,
      message: form.message.value,
    };
    setContactStatus("sending");
    try {
      await submitMessage(payload);
      setContactStatus("sent");
      form.reset();
    } catch {
      setContactStatus("error");
    }
  };

  return (
    <>
      {/* ================= HERO ================= */}
      <PageHero label={t("about.title")} />

      {/* ================= FOUNDATION PROFILE ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream-100 via-cream to-cream-100 py-24">
        {/* Decorative Background */}
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-gilt-200/20 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[450px] w-[450px] rounded-full bg-forest-100/30 blur-3xl" />

        <Container className="relative z-10 flex flex-col gap-10">
          {/* Kicker + heading + short intro */}
          <Reveal>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
              
              </div>
              <h2 className="font-body text-4xl font-bold leading-tight text-forest-900 sm:text-5xl">
                {t("about.profileTitle")}
              </h2>
              <p className="max-w-2xl font-body text-sm leading-relaxed text-ink-600 sm:text-base">
                {t("about.subtitle")}
              </p>
            </div>
          </Reveal>

          <div className="h-px w-full bg-cream-100" aria-hidden="true" />

          {/* Image (left, sticky) + profile text (right, scrolls past it) —
              sticky positioning is what actually solves the "short image next
              to a tall paragraph" mismatch: instead of leaving a big empty
              gap under the photo, it stays pinned in view for as long as the
              text column takes to scroll by. The pull-quote lives as a
              caption overlaid on the photo itself instead of floating on its
              own afterwards, so image and text read as one composition. */}
          <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-lift sm:aspect-[3/4]">
                  <PlaceholderImage
                    src="https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/727613560_1349550987360283_6157546229556903312_n.jpg?stp=dst-jpg_tt6&cstp=mx1600x1200&ctp=s1600x1200&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=ZRzwTrLcEWkQ7kNvwGuflHZ&_nc_oc=Adq2bXmBqoGgikJ-yfzXQ5ruzFq-RTU0Ch_7LgtTKYE0Yik4_AmApFhFuZaQFe4J40rism6irozz8m4ym_5F3CQZ&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=kMfwwlkofrkcWwXgCb5ssg&_nc_ss=7b2a8&oh=00_AQEHZtIU2moHFKQIivVBmjqj3UmOcLm6Hsovar2PkU2HkQ&oe=6A828253"
                    alt={t("about.profileTitle")}
                    label="Foundation profile photo"
                    imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Caption overlay carries the pull-quote, tying it to the photo */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/90 via-forest-950/25 to-transparent p-6 pt-20 sm:p-7 sm:pt-24">
                    <p className="font-body text-base font-medium italic text-white sm:text-lg">
                      &ldquo;{t("about.profileTagline")}&rdquo;
                    </p>
                    <p className="mt-2 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-gilt-300">
                      {pick(siteInfo.address, language)}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="border-l-2 border-gilt-400/40 pl-6 sm:pl-8">
                <p className="whitespace-pre-line font-body text-[17px] leading-9 text-gray-700">
                  {t("about.profileText")}
                </p>
              </div>
            </Reveal>
          </div>

          <div className="h-px w-full bg-forest-100" aria-hidden="true" />
        </Container>
      </section>

      {/* ================= OUR WORK, OUR IMPACT ================= */}
      {/* An endless left-to-right marquee. The visible window is capped at
          75% width (not the full section) specifically so it's narrower
          than the total width of the 6 real cards — that's what guarantees
          you can never see the same photo twice on screen at once, even
          though the track itself still duplicates the list once (a standard
          trick for a seamless loop with no visible jump/reset). */}
      <section className="bg-white py-20 sm:py-24">
        <Container className="flex flex-col gap-12">
          <Reveal className="flex flex-col items-center gap-3 text-center">
            <h2 className="font-body text-2xl font-bold uppercase tracking-wide text-forest-900 sm:text-3xl">
              {t("about.workTitle")}
            </h2>
       
          </Reveal>

          {/* The track always holds exactly 12 cards (2 copies of the 6 real
              ones), so each card is a CONSTANT 1/12 of the track's own width
              — that never changes per breakpoint. What changes per breakpoint
              is only the track's width relative to the visible wrapper
              (400%/300%/200%), which is what actually controls how many of
              those 1/12-wide cards land inside the visible window (3 on
              mobile, 4 on tablet, 6 on desktop). Making the card width itself
              responsive too (the earlier bug) broke this ratio — on mobile
              each "card" ended up wider than the whole visible window, so
              only one ever fit on screen at a time. */}
          <div className="relative w-full overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-16" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-16" />

            <motion.div
              className="flex w-[400%] sm:w-[300%] lg:w-[200%]"
              animate={{ x: ["-50%", "0%"] }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            >
              {[...WORK_ITEMS, ...WORK_ITEMS].map((item, i) => (
                <div
                  key={`${item.titleKey}-${i}`}
                  className="flex w-1/12 shrink-0 flex-col items-center gap-2 px-2 text-center sm:gap-3 sm:px-3"
                >
                  <div className="h-14 w-14 overflow-hidden rounded-2xl border border-forest-300 shadow-card sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                    <PlaceholderImage src={item.image} alt={t(item.titleKey)} label="" />
                  </div>
                  <h3 className="font-body text-[9px] font-bold uppercase leading-tight tracking-wide text-gilt-500 sm:text-xs">
                    {t(item.titleKey)}
                  </h3>
                  <p className="font-body text-[8px] leading-snug text-gray-500 sm:text-xs lg:text-sm">
                    {t(item.descKey)}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ================= MISSION & VISION ================= */}
<section className="relative overflow-hidden bg-gradient-to-br from-white via-cream-50 to-cream-100 py-24 sm:py-28">

  {/* Background Decorations */}
  <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-gilt-400/10 blur-3xl" />
  <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-forest-800/5 blur-3xl" />

  <Container className="relative z-10">

    {/* Section Heading */}
    <Reveal>
      <div className="mb-16 text-center">

     

        <h2 className="font-body text-4xl font-bold text-forest-900 sm:text-5xl">
          {t("about.missionVisionTitle")}
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
          Guided by compassion, integrity, and service, our mission and vision
          define our commitment to creating meaningful and lasting change.
        </p>

      </div>
    </Reveal>

    {/* Cards */}
    <div className="grid gap-8 lg:grid-cols-2">

      {/* ==================== Mission ==================== */}

      <Reveal className="h-full">
        <div className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-forest-100 bg-white p-10 shadow-xl transition-all duration-700 hover:-translate-y-3 hover:border-gilt-300 hover:shadow-[0_35px_80px_rgba(0,0,0,0.12)]">

          {/* Animated Gold Border */}
          <div className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-gilt-500 via-yellow-400 to-gilt-500 transition-transform duration-700 group-hover:scale-x-100" />

          {/* Decorative Glow */}
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gilt-400/10 blur-3xl transition-all duration-700 group-hover:scale-125" />

          {/* Shine Effect */}
          <div className="absolute inset-0 overflow-hidden rounded-[32px]">
            <div className="absolute -left-[140%] top-0 h-full w-1/2 rotate-12 bg-white/30 blur-xl transition-all duration-1000 group-hover:left-[160%]" />
          </div>


          <div className="relative flex flex-1 flex-col">

            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-red-900 to-red-500 text-white shadow-xl ring-8 ring-gilt-400/10 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
              <TargetIcon />
            </div>

            <h3 className="mb-5 text-2xl font-bold tracking-tight text-forest-900 transition duration-500 group-hover:text-forest-700">
              {t("about.missionTitle")}
            </h3>

            <p className="text-[17px] leading-8 text-gray-600">
              {t("about.missionText")}
            </p>

          </div>

        </div>
      </Reveal>

      {/* ==================== Vision ==================== */}

      <Reveal delay={0.15} className="h-full">
        <div className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-forest-100 bg-white p-10 shadow-xl transition-all duration-700 hover:-translate-y-3 hover:border-gilt-300 hover:shadow-[0_35px_80px_rgba(0,0,0,0.12)]">

          <div className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-gilt-500 via-yellow-400 to-gilt-500 transition-transform duration-700 group-hover:scale-x-100" />

          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-forest-500/10 blur-3xl transition-all duration-700 group-hover:scale-125" />

          <div className="absolute inset-0 overflow-hidden rounded-[32px]">
            <div className="absolute -left-[140%] top-0 h-full w-1/2 rotate-12 bg-white/30 blur-xl transition-all duration-1000 group-hover:left-[160%]" />
          </div>

             <div className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-gilt-500 via-yellow-400 to-gilt-500 transition-transform duration-700 group-hover:scale-x-100" />

          {/* Decorative Glow */}
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gilt-400/10 blur-3xl transition-all duration-700 group-hover:scale-125" />

          {/* Shine Effect */}
          <div className="absolute inset-0 overflow-hidden rounded-[32px]">
            <div className="absolute -left-[140%] top-0 h-full w-1/2 rotate-12 bg-white/30 blur-xl transition-all duration-1000 group-hover:left-[160%]" />
          </div>


          <div className="relative flex flex-1 flex-col">

            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-red-900 to-red-500 text-white shadow-xl ring-8 ring-gilt-400/10 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110">
              <EyeIcon />
            </div>

            <h3 className="mb-5 text-2xl font-bold tracking-tight text-forest-900 transition duration-500 group-hover:text-forest-700">
              {t("about.visionTitle")}
            </h3>

            <p className="text-[17px] leading-8 text-gray-600">
              {t("about.visionText")}
            </p>

          </div>

        </div>
      </Reveal>

    </div>

  </Container>

</section>

      {/* ================= CONTACT ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 py-12 sm:py-14">
        {/* Decorative glow accents + subtle grain for tactile depth */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gilt-500/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-forest-400/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-grain" aria-hidden="true" />

        <Container className="relative flex flex-col gap-8">
          {/* Header, framed by fading gold dividers */}
          <Reveal className="flex flex-col items-center gap-3 text-center">
       
            <div className="flex flex-col items-center gap-1.5">
              <span className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.25em] text-gilt-400">
             
                {t("common.getInTouch")}
           
              </span>
              <h2 className="font-body text-2xl font-bold text-white sm:text-3xl">{t("about.contactHeading")}</h2>
            </div>
            <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-gilt-400/50 to-transparent" aria-hidden="true" />
          </Reveal>

          {/* One unified card: dark info panel + light form panel, instead of
              two separate boxes — a single shadow/border reads as more
              premium and takes up noticeably less room. */}
          <Reveal delay={0.1}>
            <div className="mx-auto grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-white/10 shadow-lift lg:grid-cols-[0.85fr_1.15fr]">
              {/* Info panel */}
              <div className="flex flex-col gap-4 bg-gradient-to-br from-forest-800 to-forest-950 p-6 sm:p-7">
                <h3 className="font-body text-lg font-bold text-white">{t("about.contactInfoTitle")}</h3>

                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gilt-500 text-white shadow-soft">
                    <PinIcon />
                  </span>
                  <div>
                    <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-gilt-300">{t("common.address")}</p>
                    <p className="font-body text-sm leading-snug text-white/85">{pick(siteInfo.address, language)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gilt-500 text-white shadow-soft">
                    <PhoneIcon />
                  </span>
                  <div>
                    <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-gilt-300">{t("common.phone")}</p>
                    <a href={`tel:${siteInfo.phone}`} className="font-body text-sm text-white/85 hover:text-white">
                      {siteInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gilt-500 text-white shadow-soft">
                    <MailIcon />
                  </span>
                  <div>
                    <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-gilt-300">{t("common.email")}</p>
                    <a href={`mailto:${siteInfo.email}`} className="font-body text-sm text-white/85 hover:text-white">
                      {siteInfo.email}
                    </a>
                  </div>
                </div>

             

                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gilt-500 text-white shadow-soft">
                    <GlobeIcon />
                  </span>
                  <div>
                    <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-gilt-300">{t("common.followUs")}</p>
                    <div className="mt-3 flex items-center gap-2">
                      {Object.entries(siteInfo.social).map(([key, url]) => (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={key}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-gilt-500"
                        >
                          {SOCIAL_ICONS[key]}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form panel */}
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-3 bg-white p-6 sm:p-7">
                <h3 className="font-body text-lg font-bold text-forest-900">{t("about.sendMessageTitle")}</h3>

                <label className="flex flex-col gap-1 font-body text-sm">
                  <span className="text-xs font-semibold text-ink-700">{t("about.formNameLabel")}</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    required
                    className="rounded-lg border border-forest-100 bg-cream-50 px-3.5 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-gilt-400"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 font-body text-sm">
                    <span className="text-xs font-semibold text-ink-700">{t("common.email")}</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      className="rounded-lg border border-forest-100 bg-cream-50 px-3.5 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-gilt-400"
                    />
                  </label>

                  <label className="flex flex-col gap-1 font-body text-sm">
                    <span className="text-xs font-semibold text-ink-700">{t("common.phone")}</span>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone number"
                      className="rounded-lg border border-forest-100 bg-cream-50 px-3.5 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-gilt-400"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1 font-body text-sm">
                  <span className="text-xs font-semibold text-ink-700">{t("about.formSubjectLabel")}</span>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Enter Subject"
                    className="rounded-lg border border-forest-100 bg-cream-50 px-3.5 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-gilt-400"
                  />
                </label>

                <label className="flex flex-col gap-1 font-body text-sm">
                  <span className="text-xs font-semibold text-ink-700">{t("about.formMessageLabel")}</span>
                  <textarea
                    name="message"
                    placeholder="Write your message here ..."
                    rows={3}
                    required
                    className="resize-none rounded-lg border border-forest-100 bg-cream-50 px-3.5 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-gilt-400"
                  />
                </label>

                <button
                  type="submit"
                  disabled={contactStatus === "sending"}
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gilt-400 to-gilt-600 px-6 py-2.5 font-body text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:shadow-lift disabled:opacity-60 disabled:hover:scale-100"
                >
                  {contactStatus === "sending" ? t("about.formSending") : t("about.formSubmit")}
                </button>

                {contactStatus === "sent" && (
                  <p className="rounded-lg bg-emerald-50 px-3.5 py-2 font-body text-sm text-emerald-700">{t("about.formSuccess")}</p>
                )}
                {contactStatus === "error" && (
                  <p className="rounded-lg bg-red-50 px-3.5 py-2 font-body text-sm text-red-600">{t("about.formError")}</p>
                )}
              </form>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
