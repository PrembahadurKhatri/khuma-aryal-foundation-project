import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import Container from "./Container.jsx";
import Button from "./Button.jsx";
import CountUpStat from "./CountUpStat.jsx";
import Reveal from "./Reveal.jsx";

const HERO_IMAGES = [
  "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/612840432_1210440831271300_6264311500156313399_n.jpg?stp=dst-jpg_tt6&cstp=mx1600x1200&ctp=s1600x1200&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=JV7LCZ4OW94Q7kNvwEihMaZ&_nc_oc=Adrlt0rzysaJ8x1dFRNTbSxNeF7YRpk-3IzmcmWppV7Iety99XgQsHc3c-hMsv_pjk93gUSpNyMlLVlFJkQ9yVJs&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=mj_IcuhC2ctsA_YUmmDo8Q&_nc_ss=7b2a8&oh=00_AQE70kvZ8JAobHzaltU47GVmreUgKxl11BSpy6c5ZVcdfQ&oe=6A80D825",

  "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/635500393_1244924151156301_1995148282506706674_n.jpg?stp=dst-jpg_tt6&cstp=mx1600x1200&ctp=s1600x1200&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEec1llwMXY4jmUjSCzeewgKtIY9i1hTlMq0hj2LWFOU48eDawdJxnNVatqv_Izj3gCYeiyzCqS91PdITiG6QUK&_nc_ohc=t1R9JFQXwb8Q7kNvwHKRpl_&_nc_oc=AdpH-qKrSLrPAv5T9POxCSwN89bZEgQUjOPII4BCnOELm87QQ54B-v7n8BUPFYC-WbFRAD5jBenmbDdKZMrp5Uc5&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=wCdPx4JSlWUwOT6BLDb95A&_nc_ss=7b2a8&oh=00_AQElkd4d8i02zvWGztORI055rCZ2nXEKqWoi5T4gL5PWpQ&oe=6A84A891",

  "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/587012697_1176232828025434_1804289357828893127_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1536&ctp=s2048x1536&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=EX1CkDTNNVMQ7kNvwGzJQHj&_nc_oc=AdrM70Sg8qY1EnBXTaYd4rVcfTvAQaAkEOLCaZiRc7Qpnb1BjW0i-Q5uNnFNIHKyInHWgpp_R1iylw1R3pmzYGSN&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=0y5r7pbHXVMUws1EhveltA&_nc_ss=7b2a8&oh=00_AQENxvsQPO8h0YtBdF-uz_MRJynRdcDWmC-X97O9NYp94g&oe=6A80DC35",

  "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/677925899_1301130065535709_607819062010126301_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x948&ctp=s2048x948&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHHEfR9X_f_jROEXcRXMgYFw3mXMO3P-WXDeZcw7c_5ZY-DoV7qKQn7UfHZR46bCoMRbuoabEFwIGVrAglYQ_1s&_nc_ohc=13TV07DBmaUQ7kNvwEOiDBh&_nc_oc=Adq3NTlLazhQDy7XVUU4cJFE1rxfukpU0VzLJLSETAdJjmo9kXIgGr3JTSNIuwariAmpcrXMibPseI1q1gQExvgS&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=VIJegTG3swSBbbcdylBrwA&_nc_ss=7b2a8&oh=00_AQHfXH1qcSlYTwbWSR_Sh8-JZTPDsDPE4lOeBrAORa7BTQ&oe=6A84CA19",

  "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/616193004_1215521387429911_5719217226397333462_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1367&ctp=s2048x1367&_nc_cat=109&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeE68hB2nr1jKaL0IQHw0pOuDuLEefSZBBsO4sR59JkEG0n1B9H-Rlp_BkVt42N6QnvrueLHv9VBGH-UlesfktZ5&_nc_ohc=L9_MzqQQexYQ7kNvwHFricQ&_nc_oc=AdpYFq9JJR4Z-7LjeFK2xXmQqbAfmVG3fzFrc5i6NcX8Dw_ZzpZCTDKtLeV2Q6Mgk4k3tL3Lzgcy5mk0m-e7q31X&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=RBABktXl6KudF6i91itbrQ&_nc_ss=7b2a8&oh=00_AQGVx4M9zKWewRTcVe9XMfW-H8MSBcd2DexE5QK1m_rFvg&oe=6A8646CC",
];

const SLIDE_INTERVAL = 3000;

const TRUST_KEYS = ["trustBadge1", "trustBadge2", "trustBadge3"];

// `statField` maps to Settings.stats.<field> (see admin's Settings page,
// "Homepage Stats") — `fallback` covers a freshly-created Settings document
// or a field the admin hasn't filled in yet.
const STATS = [
  { key: "statYears", statField: "years", fallback: "10+", icon: "clock" },
  { key: "statBeneficiaries", statField: "beneficiaries", fallback: "5,000+", icon: "grad" },
  { key: "statProjects", statField: "projects", fallback: "40+", icon: "flag" },
  { key: "statVolunteers", statField: "volunteers", fallback: "120+", icon: "heart" },
];

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M12 21V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M12 10C12 10 6 10 6 5c5 0 6 3 6 5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 13C12 13 18 13 18 8c-5 0-6 3-6 5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <circle cx="9" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="9" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19c.6-3 2.7-4.8 5.5-4.8s4.9 1.8 5.5 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.5 14.6c2.2.2 3.9 1.9 4.4 4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const TRUST_ICONS = [ShieldIcon, GrowthIcon, PeopleIcon];

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GradCapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M12 4 2 9l10 5 10-5-10-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 9v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M5 21V4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 4h13l-3 4 3 4H5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.7-9.5-9.2C1.2 8 3 5 6.3 5c2 0 3.4 1.1 4.2 2.3C11.3 6.1 12.7 5 14.7 5 18 5 19.8 8 18.5 11.3 16.5 15.8 12 20.5 12 20.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STAT_ICONS = { clock: ClockIcon, grad: GradCapIcon, flag: FlagIcon, heart: HeartIcon };

export default function Hero({ siteInfo }) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);

  // "Education, Healthcare, Sports & Employment" (translated) is bolded inline
  // inside the aim paragraph — split the translated sentence on the translated
  // highlight phrase so both languages stay fully translated and grammatical.
  const aimText = t("home.aimText");
  const aimHighlight = t("home.aimHighlight");
  const [aimBefore, aimAfter] = aimText.includes(aimHighlight)
    ? aimText.split(aimHighlight)
    : [aimText, ""];

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* ================= HERO IMAGE + HEADLINE ================= */}
      <section className="relative h-[68vh] min-h-[520px] overflow-hidden bg-forest-950 sm:h-[74vh]">
        <div className="absolute inset-0">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.img
              key={index}
              src={HERO_IMAGES[index]}
              alt="Khuma Aryal Foundation"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.9,
                ease: [0.65, 0, 0.35, 1],
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>

          {/* Image overlay — darker on the left where the headline sits so
              the text stays readable over any photo in the rotation */}
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950/90 via-forest-950/55 to-forest-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-forest-950/10" />
        </div>

        <div className="absolute inset-0 bg-grain" />

        {/* Headline block */}
        <Container className="relative z-10 flex h-full items-center pb-16 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl font-body"
          >
            <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-forest-100 sm:text-base">
              {t("home.heroSubtitle")}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button to="/projects" variant="primary">
                {t("home.heroCtaPrimary")}
                <span aria-hidden="true">→</span>
              </Button>
              <Button to="/news" variant="outline">
                {t("home.exploreNews")}
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          </motion.div>
        </Container>

        {/* Bottom curve — shared by every hero section (Home, About, Gallery,
            Projects, News). */}
        <svg
          className="absolute bottom-0 left-0 block h-16 w-full sm:h-24"
          viewBox="0 0 1440 74"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 6C420 90 1020 -10 1440 34V74H0V6Z" className="fill-forest-800" />
          <path
            d="M0 6C420 90 1020 -10 1440 34"
            fill="none"
            stroke="#C9A65B"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ filter: "drop-shadow(0 1px 2px rgba(201,166,91,0.45))" }}
          />
          <path d="M0 20C420 90 1020 -10 1440 48V74H0V20Z" className="fill-cream-100" />
        </svg>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="bg-cream-100 py-8 sm:py-10">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
            {TRUST_KEYS.map((key, i) => {
              const Icon = TRUST_ICONS[i];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-center gap-3 font-body"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-700 text-white">
                    <Icon />
                  </span>
                  <span className="text-sm font-semibold leading-snug text-forest-900">{t(`home.${key}`)}</span>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ================= MISSION ================= */}
      <section className="relative overflow-hidden bg-cream-100 pb-16 pt-4 sm:pb-24 sm:pt-6">
        <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-gilt-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-forest-500/20 blur-3xl" />

        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            {/* LEFT — mission copy */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-body"
            >
              <div className="mb-2 flex items-center gap-2">
             
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">{t("home.ourAimKicker")}</span>
              </div>

              <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink-900 sm:text-4xl">
                {t("home.heroNameFirst")} <span className="text-forest-600">{t("home.heroNameSecond")}</span>
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-ink-600 sm:text-base">
                {aimBefore}
                {aimAfter && <span className="font-semibold text-forest-700">{aimHighlight}</span>}
                {aimAfter}
              </p>

              <Button to="/about" variant="primary" className="mt-6">
                {t("home.exploreAbout")}
                <span aria-hidden="true">→</span>
              </Button>
            </motion.div>

            {/* RIGHT — photo + stat cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[0.8fr_1.2fr] sm:items-stretch">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="aspect-square overflow-hidden rounded-2xl shadow-card sm:aspect-auto"
              >
                <img src={HERO_IMAGES[1]} alt="" className="h-full w-full object-cover" />
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                {STATS.map((stat, i) => {
                  const Icon = STAT_ICONS[stat.icon];
                  return (
                    <Reveal key={stat.key} delay={i * 0.08} variant="scale" className="h-full">
                      <div className="flex h-full flex-col gap-2 rounded-2xl border border-forest-100 bg-white p-5 text-center shadow-card">
                        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-forest-50 text-forest-700">
                          <Icon />
                        </span>
                        <span className="font-display text-2xl font-semibold text-forest-900 sm:text-3xl">
                          <CountUpStat value={siteInfo?.stats?.[stat.statField] || stat.fallback} />
                        </span>
                        <span className="text-[11px] font-medium leading-snug text-ink-600 sm:text-xs">{t(`home.${stat.key}`)}</span>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
