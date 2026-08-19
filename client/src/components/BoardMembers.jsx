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
    <section className="bg-cream-100 py-20 sm:py-24">
      <Container className="flex flex-col gap-12">
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
          <Skeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {members.map((member, i) => {
              const name = pick(member.name, language);
              const designation = pick(member.designation, language);
              return (
                <Reveal key={member.id} delay={(i % 4) * 0.06} variant="scale" className="flex flex-col items-center gap-3 text-center font-body">
                  <Avatar name={name} src={member.photo} size="lg" />
                  <div>
                    <p className="text-sm font-bold text-forest-900 sm:text-base">{name}</p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-gilt-600">{designation}</p>
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
