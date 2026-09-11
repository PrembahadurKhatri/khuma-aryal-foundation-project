import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import Container from "./Container.jsx";
import Reveal from "./Reveal.jsx";
import Skeleton from "./Skeleton.jsx";
import Avatar from "./Avatar.jsx";

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden="true">
      <path d="M4 18h16l-1.4-8.5-4.1 3.3L12 6l-2.5 6.8-4.1-3.3L4 18Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 shrink-0" aria-hidden="true">
      <path d="M12 3.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7L12 3.5Z" />
    </svg>
  );
}
function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden="true">
      <path d="M4 20l.9-3.6L15.6 5.7a1.5 1.5 0 0 1 2.1 0l.6.6a1.5 1.5 0 0 1 0 2.1L7.6 19.1 4 20Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden="true">
      <rect x="3.5" y="6.5" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16.5" cy="14" r="1.1" fill="currentColor" />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden="true">
      <path d="M5 3.5v17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5 4.5h12.5l-2.5 3.5 2.5 3.5H5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden="true">
      <circle cx="9" cy="8.5" r="2.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 19c0-3 2.46-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M15 19c0-2.3 1-4 3.5-4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden="true">
      <path d="M3.5 8.5A1.5 1.5 0 0 1 5 7h14a1.5 1.5 0 0 1 1.5 1.5V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V8.5Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 19.5c0-3.6 3.13-6.5 7-6.5s7 2.9 7 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

// Best-effort icon per role, matched by keyword against the *English*
// designation regardless of which language is currently displayed
// (designation is free text the admin types — not a fixed enum — so
// English keywords are the more reliable thing to pattern-match against
// than trying to also maintain a Nepali keyword list). Checked in order,
// most specific first ("vice president"/"joint secretary" before the
// plain "president"/"secretary" they'd otherwise also match), falling
// back to a generic person icon for anything unrecognized.
function designationIcon(designationEn = "") {
  const d = designationEn.toLowerCase();
  if (d.includes("vice") && d.includes("president")) return <StarIcon />;
  if (d.includes("president")) return <CrownIcon />;
  if (d.includes("joint") && d.includes("secretary")) return <PenIcon />;
  if (d.includes("secretary")) return <PenIcon />;
  if (d.includes("treasurer")) return <WalletIcon />;
  if (d.includes("coordinator")) return <FlagIcon />;
  if (d.includes("committee") || d.includes("member")) return <UsersIcon />;
  if (d.includes("advisor") || d.includes("advisory")) return <BriefcaseIcon />;
  return <PersonIcon />;
}

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
          <p className="max-w-xl text-sm leading-relaxed text-ink-700 sm:text-base ">{t("home.boardSubtitle")}</p>
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
                        <Avatar name={name} src={member.photo} fallbackSrc="/images/blank.avif" size="lg" />
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col items-center">
                    <p className="text-sm font-bold text-forest-900 transition-colors duration-300 group-hover:text-forest-700 sm:text-base">{name}</p>
                    {/* w-full + a fixed min-height (rather than sizing to
                        each badge's own text) is what actually makes every
                        badge in the grid the same size — designations range
                        from one short word ("President") to several
                        ("Election Committee Member"), so letting each pill
                        hug its own text left them visibly different sizes. */}
                    <span className="mt-1.5 flex min-h-[2.5rem] w-full items-center justify-center gap-1.5 rounded-full bg-[#FF8C00] px-3 py-1.5 text-center font-body text-xs font-semibold uppercase leading-tight tracking-wide text-white shadow-soft">
                      {designationIcon(member.designation?.en)}
                      {designation}
                    </span>
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
