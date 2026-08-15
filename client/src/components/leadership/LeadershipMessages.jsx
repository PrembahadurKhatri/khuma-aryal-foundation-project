import { useState, useMemo } from "react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import Container from "../Container.jsx";
import Reveal from "../Reveal.jsx";
import Skeleton from "../Skeleton.jsx";
import FounderFeature from "./FounderFeature.jsx";
import PresidentFeature from "./PresidentFeature.jsx";
import LeaderCard from "./LeaderCard.jsx";
import MessageModal from "./MessageModal.jsx";

// Preferred display order for the supporting-leadership grid — independent
// of whatever order the CMS/data source returns entries in.
const OTHER_ROLE_ORDER = ["past-president", "advisor", "spouse", "secretary"];

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 19.5c0-3.6 3.13-6.5 7-6.5s7 2.9 7 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Small navy pill badge sitting above the Founder/President feature cards. */
function RoleBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-yellow-600 px-4 py-2 font-body text-sm font-semibold text-white shadow-soft">
      <PersonIcon />
      {children}
    </span>
  );
}

/**
 * "Leadership & Messages" — the Home page section presenting messages from
 * the Founder, President and supporting leadership (Past President, Advisor,
 * Spouse, Secretary, ...). Deliberately NOT a uniform team grid: the Founder
 * and President each get a full-width featured treatment, and everyone else
 * shares a quieter two-column card grid — a visual hierarchy matching their
 * roles in the Foundation.
 *
 * Fully data-driven: pass the `messages` array from contentService
 * (via useContent(getMessages) in the parent page) and this component does
 * the rest, including full-message modals. Reusable anywhere that array is
 * available.
 */
export default function LeadershipMessages({ messages, loading }) {
  const { t } = useLanguage();
  const [activeLeader, setActiveLeader] = useState(null);

  const { founder, president, others } = useMemo(() => {
    const list = messages || [];
    const founder = list.find((m) => m.role === "founder");
    const president = list.find((m) => m.role === "president");
    const rest = list.filter((m) => m !== founder && m !== president);
    const ordered = OTHER_ROLE_ORDER.map((role) => rest.find((m) => m.role === role)).filter(Boolean);
    const remaining = rest.filter((m) => !ordered.includes(m));
    return { founder, president, others: [...ordered, ...remaining] };
  }, [messages]);

  return (
    <section className="bg-cream-100 py-24 sm:py-28 lg:py-32">
      <Container className="flex flex-col gap-16 sm:gap-20">
        {/* Section header */}
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-body font-bold text-3xl  uppercase tracking-[0.08em] text-forest-900 sm:text-4xl">
            {t("home.leadershipTitle")}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-ink-700 sm:text-base">{t("home.leadershipSubtitle")}</p>
        </Reveal>

        {loading || !messages ? (
          <Skeleton count={4} />
        ) : (
          <>
            {/* Founder — highest hierarchy */}
            {founder && (
              <div className="flex flex-col items-center gap-6 ">
                <Reveal>
                  <RoleBadge>{t("home.founderLabel")}</RoleBadge>
                </Reveal>
                <FounderFeature leader={founder} onRead={() => setActiveLeader(founder)} />
              </div>
            )}

            {/* President — second hierarchy */}
            {president && (
              <div className="flex flex-col items-center gap-6">
                <Reveal>
                  <RoleBadge>{t("home.presidentLabel")}</RoleBadge>
                </Reveal>
                <PresidentFeature leader={president} onRead={() => setActiveLeader(president)} />
              </div>
            )}

            {/* Supporting leadership — quieter, uniform card grid */}
            {others.length > 0 && (
              <div className="flex flex-col gap-10">
                <Reveal className="flex flex-col items-center gap-3 text-center">
                  
                  <h3 className="font-body text-3xl font-bold text-forest-900 sm:text-4xl">
                    {t("home.otherLeadershipTitle")}
                  </h3>
                  <p className="font-body text-sm text-ink-600 sm:text-base">{t("home.otherLeadershipSubtitle")}</p>
                </Reveal>
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 font-body ">
                  {others.map((leader, i) => (
                    <LeaderCard key={leader.id} leader={leader} delay={(i % 2) * 0.08} onRead={() => setActiveLeader(leader)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Container>

      {activeLeader && <MessageModal leader={activeLeader} onClose={() => setActiveLeader(null)} />}
    </section>
  );
}
