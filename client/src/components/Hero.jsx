import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import Container from "./Container.jsx";
import Button from "./Button.jsx";

const HERO_IMAGES = [
  "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/612840432_1210440831271300_6264311500156313399_n.jpg?stp=dst-jpg_tt6&cstp=mx1600x1200&ctp=s1600x1200&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=JV7LCZ4OW94Q7kNvwEihMaZ&_nc_oc=Adrlt0rzysaJ8x1dFRNTbSxNeF7YRpk-3IzmcmWppV7Iety99XgQsHc3c-hMsv_pjk93gUSpNyMlLVlFJkQ9yVJs&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=mj_IcuhC2ctsA_YUmmDo8Q&_nc_ss=7b2a8&oh=00_AQE70kvZ8JAobHzaltU47GVmreUgKxl11BSpy6c5ZVcdfQ&oe=6A80D825",

  "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/635500393_1244924151156301_1995148282506706674_n.jpg?stp=dst-jpg_tt6&cstp=mx1600x1200&ctp=s1600x1200&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEec1llwMXY4jmUjSCzeewgKtIY9i1hTlMq0hj2LWFOU48eDawdJxnNVatqv_Izj3gCYeiyzCqS91PdITiG6QUK&_nc_ohc=t1R9JFQXwb8Q7kNvwHKRpl_&_nc_oc=AdpH-qKrSLrPAv5T9POxCSwN89bZEgQUjOPII4BCnOELm87QQ54B-v7n8BUPFYC-WbFRAD5jBenmbDdKZMrp5Uc5&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=wCdPx4JSlWUwOT6BLDb95A&_nc_ss=7b2a8&oh=00_AQElkd4d8i02zvWGztORI055rCZ2nXEKqWoi5T4gL5PWpQ&oe=6A84A891",

  "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/587012697_1176232828025434_1804289357828893127_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1536&ctp=s2048x1536&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=EX1CkDTNNVMQ7kNvwGzJQHj&_nc_oc=AdrM70Sg8qY1EnBXTaYd4rVcfTvAQaAkEOLCaZiRc7Qpnb1BjW0i-Q5uNnFNIHKyInHWgpp_R1iylw1R3pmzYGSN&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=0y5r7pbHXVMUws1EhveltA&_nc_ss=7b2a8&oh=00_AQENxvsQPO8h0YtBdF-uz_MRJynRdcDWmC-X97O9NYp94g&oe=6A80DC35",
  
  "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/677925899_1301130065535709_607819062010126301_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x948&ctp=s2048x948&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHHEfR9X_f_jROEXcRXMgYFw3mXMO3P-WXDeZcw7c_5ZY-DoV7qKQn7UfHZR46bCoMRbuoabEFwIGVrAglYQ_1s&_nc_ohc=13TV07DBmaUQ7kNvwEOiDBh&_nc_oc=Adq3NTlLazhQDy7XVUU4cJFE1rxfukpU0VzLJLSETAdJjmo9kXIgGr3JTSNIuwariAmpcrXMibPseI1q1gQExvgS&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=VIJegTG3swSBbbcdylBrwA&_nc_ss=7b2a8&oh=00_AQHfXH1qcSlYTwbWSR_Sh8-JZTPDsDPE4lOeBrAORa7BTQ&oe=6A84CA19",

  "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/616193004_1215521387429911_5719217226397333462_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1367&ctp=s2048x1367&_nc_cat=109&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeE68hB2nr1jKaL0IQHw0pOuDuLEefSZBBsO4sR59JkEG0n1B9H-Rlp_BkVt42N6QnvrueLHv9VBGH-UlesfktZ5&_nc_ohc=L9_MzqQQexYQ7kNvwHFricQ&_nc_oc=AdpYFq9JJR4Z-7LjeFK2xXmQqbAfmVG3fzFrc5i6NcX8Dw_ZzpZCTDKtLeV2Q6Mgk4k3tL3Lzgcy5mk0m-e7q31X&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=RBABktXl6KudF6i91itbrQ&_nc_ss=7b2a8&oh=00_AQGVx4M9zKWewRTcVe9XMfW-H8MSBcd2DexE5QK1m_rFvg&oe=6A8646CC",

  
];

const SLIDE_INTERVAL = 3000;

// The Foundation's 5 focus areas — keys resolve against home.pillar* in
// translations.js. Must be valid dot-path segments (no spaces/hyphens) or
// t() silently falls back to rendering the raw, untranslated key string.
const PILLAR_KEYS = ["pillarEducation", "pillarHealth", "pillarSports", "pillarEmployment", "pillarDisasterManagement"];

const TRUST_KEYS = ["trustBadge1", "trustBadge2", "trustBadge3"];


export default function Hero() {
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
      {/* ================= HERO IMAGE SLIDER ================= */}
      <section className="relative h-[62vh] overflow-hidden bg-white">
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

          {/* Image overlay — cinematic vignette so edges stay moody but the
              center of each photo (where the people usually are) stays clear */}
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/25 to-forest-950/55" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 35%, rgba(23,59,37,0.55) 100%)" }}
          />
        </div>

        {/* Gold glow */}
        <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-gilt-500/20 blur-3xl" />

        <div className="absolute inset-0 bg-grain" />

      

        {/* Trust strip — transparent glass pills sitting on the image itself,
            positioned lower (roughly where the old slide-indicator dots used
            to sit) now that those dots are gone, and above the curve so the
            wave stays fully visible and the photo shows through behind the text */}
        <Container className="absolute inset-x-0 bottom-16 z-10 sm:bottom-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-1.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
            {TRUST_KEYS.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-center shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-md sm:gap-2 sm:px-4 sm:py-2"
              >
                <span className="text-[9px] font-semibold uppercase leading-snug tracking-wide text-white sm:text-xs">
                  {t(`home.${key}`)}
                </span>
              </motion.div>
            ))}
          </div>
        </Container>

        {/* Bottom curve — a layered wave shared by every hero section (Home,
            About, Gallery, Projects, News). The green + gold curve shares
            the exact same control points as the cream curve, only its two
            endpoints are pulled further out — with a cubic bezier that
            makes the gap between them largest right at the two corners and
            shrink to almost nothing by the middle, instead of a band of
            constant thickness running the full width. */}
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

      {/* ================= FOUNDATION INTRO ================= */}
      <section className="relative overflow-hidden bg-cream-100 pb-10 pt-14 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20">

        {/* Decorative background */}
        <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-gilt-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-forest-500/20 blur-3xl" />

        <Container className="relative">
          <div className="mx-auto max-w-6xl">

            <div className="grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr] lg:gap-16">

              {/* LEFT */}
              <motion.div
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9 }}
                className="flex flex-col items-center gap-5 text-center font-body md:items-start md:text-left -mt-2"
              >
          
                <h2 className="text-4xl mt-10 font-bold leading-[1.05] tracking-tight text-forest-900 sm:text-2xl lg:text-6xl">
                  {t("home.heroNameFirst")}
                  <span className="block text-gilt-500">{t("home.heroNameSecond")}</span>
                </h2>

             

                {/* Focus areas */}
                <div className="sm:flex sm:flex-wrap justify-center gap-2 md:justify-start hidden mt-6 ">
                  {PILLAR_KEYS.map((key) => (
                    <span
                      key={key}
                      className="group relative inline-flex cursor-default items-center gap-1.5
                        overflow-hidden rounded-full
                        border border-gilt-500/25
                        bg-white/80 px-4 py-2
                        text-xs font-semibold tracking-wide
                        text-forest-900
                        shadow-[0_4px_14px_rgba(23,59,37,0.08)]
                        backdrop-blur-sm
                        transition-all duration-300
                        hover:-translate-y-0.5
                        hover:border-gilt-500/60
                        hover:bg-forest-900
                        hover:text-cream-100
                        hover:shadow-[0_8px_22px_rgba(23,59,37,0.16)]"
                    >
                      {t(`home.${key}`)}
                    </span>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1 md:justify-start">
                  <Button to="/projects" variant="primary" className="!bg-forest-900 hover:!bg-forest-800">
                    {t("home.heroCtaPrimary")}
                  </Button>
                  <Button to="/about" variant="ghost">
                    {t("home.heroCtaSecondary")}
                  </Button>
                </div>
              </motion.div>

              {/* AIM CARD */}
 <motion.div
  initial={{ opacity: 0, x: 25, scale: 0.96 }}
  whileInView={{ opacity: 1, x: 0, scale: 1 }}
  viewport={{ once: true }}
  transition={{
    duration: 0.8,
    delay: 0.2,
    ease: [0.22, 1, 0.36, 1],
  }}
  whileHover={{
    y: -8,
    scale: 1.015,
  }}
  className="
    group
    relative
    overflow-hidden
    rounded-3xl
    border border-gray-100
    bg-gradient-to-br
    from-white
    via-white
    to-cream-100
    p-6
    shadow-[0_12px_35px_rgba(0,0,0,0.08)]
    transition-all
    duration-500
    hover:border-gilt-300
    hover:shadow-[0_30px_70px_rgba(18,55,42,0.18)]
    sm:p-8
    lg:p-10
  "
>
  {/* Animated Left Accent */}
  <span
    className="
      absolute
      left-0
      top-0
      h-full
      w-1
      origin-top
      bg-gradient-to-b
      from-gilt-500
      via-forest-900
      to-gilt-500
      transition-transform
      duration-700
      ease-in-out
      group-hover:scale-y-0
    "
  />

  {/* Soft Glow */}
  <div
    className="
      absolute
      -right-24
      -top-24
      h-56
      w-56
      rounded-full
      bg-gilt-300/10
      blur-3xl
      transition-all
      duration-700
      group-hover:scale-125
    "
  />

  {/* Quote */}
  <span
    aria-hidden="true"
    className="
      pointer-events-none
      absolute
      -top-4
      right-5
      select-none
      text-[7rem]
      leading-none
      text-gilt-400/10
      transition-all
      duration-500
      group-hover:rotate-6
      group-hover:text-gilt-400/20
      sm:text-[9rem]
    "
  >
    &ldquo;
  </span>

  {/* Main Text */}
  <p className="relative -mt-2 pl-2 text-lg leading-8 text-gray-700 sm:pl-0 sm:text-xl sm:leading-9">
    {aimBefore}
    {aimAfter && (
      <span className="font-bold text-gilt-600">
        {aimHighlight}
      </span>
    )}
    {aimAfter}
  </p>

  {/* Horizontal Divider */}
  <div className="relative my-6 flex items-center">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gilt-400 to-transparent" />
  </div>

  {/* Note */}
  <p className="relative max-w-2xl pl-2 text-xs leading-7 text-gray-500 sm:pl-0 sm:text-base">
    {t("home.aimNote")}
  </p>
</motion.div>

            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
