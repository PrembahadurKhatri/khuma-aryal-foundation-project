import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import Container from "./Container.jsx";
import Reveal from "./Reveal.jsx";
import Skeleton from "./Skeleton.jsx";
import Avatar from "./Avatar.jsx";

/**
 * "Board Members" — a plain photo-directory grid on the Home page, separate
 * from LeadershipMessages.jsx's Founder/President/supporting-leadership
 * "Messages" section (see models/BoardMember.js vs models/Leader.js). No
 * quotes/modals here on purpose — just who's on the board and their
 * designation, sorted by the admin's chosen `order`.
 *
 * Fully data-driven: pass the `members` array from
 * contentService.getBoardMembers() (via useContent in the parent page).
 * Renders nothing if there are no board members yet, so an empty admin
 * table doesn't leave a bare, empty-looking section on the live site.
 */
export default function BoardMembers({ members, loading }) {
  const { t, language } = useLanguage();

  if (!loading && (!members || members.length === 0)) return null;

  return (
    // bg-cream-50 (pure white) instead of the cream-100 every neighboring
    // section uses — a subtle alternation so Leadership -> Board -> Updates
    // reads as three distinct, designed zones instead of one long flat
    // stretch of identical background.
    <section className="relative overflow-hidden bg-cream-100 py-10 sm:py-5">
      {/* Same premium decorative-glow treatment used on the other Home
          sections (Hero's Mission section, ProjectDetail, etc). */}
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-gilt-500/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-forest-500/10 blur-3xl" aria-hidden="true" />

      <Container className="relative flex flex-col gap-12">
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <span className="font-body text-xs font-bold uppercase tracking-[0.2em] text-forest-600">
            {t("home.boardKicker")}
          </span>
          <h2 className="font-body text-3xl font-bold uppercase tracking-[0.08em] text-forest-900 sm:text-4xl">
            {t("home.boardTitle")}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-ink-700 sm:text-base">{t("home.boardSubtitle")}</p>
        </Reveal>

        {loading || !members ? (
          <Skeleton count={5} />
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {members.map((member, i) => {
              const name = pick(member.name, language);
              const designation = pick(member.designation, language);
              return (
                <Reveal
                  key={member.id}
                  delay={(i % 5) * 0.06}
                  variant="scale"
                  className="group flex flex-col items-center gap-3  rounded-2xl border border-transparent p-3 text-center font-body transition-all duration-500 hover:-translate-y-2 hover:border-forest-100 hover:bg-white hover:shadow-lift"
                >
                  {/* Photo — a soft gilt glow blooms behind it and the ring
                      tightens + gilds on hover, while the photo itself
                      zooms slightly, all purely on the wrapping elements so
                      Avatar's own fallback/ring styling stays untouched. */}
                  <div className="relative">
                    <div className="absolute inset-0 -z-10 rounded-full bg-gilt-400/0 blur-xl transition-colors duration-500 group-hover:bg-gilt-400/35" />
                    <div className="rounded-full ring-0 ring-gilt-400/0 transition-all duration-500 group-hover:ring-4 group-hover:ring-gilt-400/60">
                      <div className="overflow-hidden rounded-full transition-transform duration-500 ease-out group-hover:scale-110">
                        <Avatar name={name} src={member.photo} size="lg" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-forest-900 transition-colors duration-300 group-hover:text-forest-700 sm:text-base">{name}</p>
                    <p className="relative mt-1 inline-block text-xs font-semibold uppercase tracking-wide text-gilt-600">
                      {designation}
                     
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
