import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import { getVacancy } from "../services/contentService.js";
import { submitApplication } from "../services/applicationService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import FileDropField from "../components/FileDropField.jsx";

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };

const TYPE_TONE = {
  FullTime: { border: "border-t-forest-600", badge: "bg-forest-50 text-forest-700", button: "bg-forest-700 hover:bg-forest-800", icon: "bg-forest-50 text-forest-700" },
  PartTime: { border: "border-t-forest-400", badge: "bg-forest-50 text-forest-600", button: "bg-forest-500 hover:bg-forest-600", icon: "bg-forest-50 text-forest-600" },
  Volunteer: { border: "border-t-gilt-500", badge: "bg-gilt-50 text-gilt-700", button: "bg-gilt-500 hover:bg-gilt-600", icon: "bg-gilt-50 text-gilt-700" },
  Internship: { border: "border-t-ink-600", badge: "bg-ink-100 text-ink-800", button: "bg-ink-800 hover:bg-ink-900", icon: "bg-ink-100 text-ink-800" },
  Contract: { border: "border-t-ink-800", badge: "bg-ink-100 text-ink-900", button: "bg-ink-900 hover:bg-ink-800", icon: "bg-ink-100 text-ink-900" },
};

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M12 21s-6.5-5.86-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.14-6.5 11-6.5 11Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CheckListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.5 5.5l1 1 1.5-2M4.5 11.5l1 1 1.5-2M4.5 17.5l1 1 1.5-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GradCapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M12 4.5 2.5 9 12 13.5 21.5 9 12 4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6.5 11v4.5c0 1.4 2.46 3 5.5 3s5.5-1.6 5.5-3V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M21.5 9v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M3.5 8.5A1.5 1.5 0 0 1 5 7h14a1.5 1.5 0 0 1 1.5 1.5V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V8.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3.5 12.5h17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 20c0-3.6 3.36-6.5 7.5-6.5s7.5 2.9 7.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 7l7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M6 4.5h2.8l1.2 4-2 1.4a10 10 0 0 0 5.1 5.1l1.4-2 4 1.2V17a1.5 1.5 0 0 1-1.6 1.5A15 15 0 0 1 4.5 6.1 1.5 1.5 0 0 1 6 4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Icon-prefixed text input — shared by the Name/Email/Phone fields so the
// form reads as a cohesive, polished thing instead of plain bordered boxes.
function IconInput({ icon, label, required, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={props.id} className="font-body text-xs font-semibold text-ink-600">
        {label} {required && "*"}
      </label>
      <div className="group relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 transition-colors group-focus-within:text-forest-600">{icon}</span>
        <input
          {...props}
          required={required}
          className="w-full rounded-xl2 border border-forest-100 bg-white py-2.5 pl-10 pr-4 font-body text-sm text-ink-900 outline-none transition-all duration-200 focus:border-gilt-400 focus:shadow-soft"
        />
      </div>
    </div>
  );
}

export default function VacancyDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  useEffect(() => {
    let active = true;
    setLoading(true);
    getVacancy(id)
      .then((result) => {
        if (active) {
          setVacancy(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setVacancy(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (!loading && !vacancy) {
    return <Navigate to="/news" replace />;
  }

  const title = vacancy ? pick(vacancy.title, language) : "";
  const description = vacancy ? pick(vacancy.description, language) : "";
  const location = vacancy ? pick(vacancy.location, language) : "";
  const education = vacancy ? pick(vacancy.education, language) : "";
  // Admin enters one requirement per line (see VacanciesManage.jsx) — split
  // into a real bulleted list rather than showing raw line breaks.
  const requirements = vacancy
    ? pick(vacancy.requirements, language)
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];
  const type = vacancy?.type || "FullTime";
  const tone = TYPE_TONE[type] || TYPE_TONE.FullTime;

  // The backend's isURL() validator accepts a bare domain with no scheme
  // (e.g. "khumaaryalfoundation.org.np") -- used directly as an <a href>,
  // a browser treats that as a relative path on this same site instead of
  // an external link. Normalize at render time rather than tightening the
  // validator, so an admin can still paste a bare domain and have it work.
  const applyHref = vacancy?.applyLink ? (/^(https?:|mailto:)/i.test(vacancy.applyLink) ? vacancy.applyLink : `https://${vacancy.applyLink}`) : "";

  let deadline = vacancy?.deadline;
  try {
    deadline = vacancy?.deadline
      ? new Date(vacancy.deadline).toLocaleDateString(DATE_LOCALES[language] || "en-US", { year: "numeric", month: "long", day: "numeric" })
      : "";
  } catch {
    deadline = vacancy?.deadline;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const coverLetterFile = form.coverLetter.files?.[0];
    if (!coverLetterFile) {
      setStatus("error");
      return;
    }
    const payload = {
      applicantName: form.applicantName.value,
      email: form.email.value,
      phone: form.phone.value,
      coverLetterFile,
      resumeFile: form.resume.files?.[0] || null,
    };
    setStatus("sending");
    try {
      await submitApplication(id, payload);
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <PageHero label={loading ? t("news.sectionVacancies") : title} />

      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-gilt-400/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-forest-100/40 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-grain" aria-hidden="true" />

        <Container className="relative max-w-3xl">
          <Link
            to="/news"
            className="group mb-8 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-white py-2.5 pl-3 pr-5 font-body text-sm font-semibold text-forest-700 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-700 hover:bg-forest-700 hover:text-white hover:shadow-lift"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-50 text-forest-700 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:bg-white/15 group-hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M19 12H5M5 12l6-6M5 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {t("news.backToNews")}
          </Link>

          {loading || !vacancy ? (
            <div className="h-96 animate-pulse rounded-xl3 border border-forest-100 bg-forest-50/60" />
          ) : (
            <div className="flex flex-col gap-8">
              {/* ================= Job info ================= */}
              <Reveal>
                <div className={`relative flex flex-col gap-5 overflow-hidden rounded-xl3 border border-t-4 border-forest-100 bg-white p-7 shadow-card sm:p-9 ${tone.border}`}>
                  <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-gilt-400/10 blur-3xl" aria-hidden="true" />

                  <div className="relative flex items-center gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone.icon}`}>
                      <BriefcaseIcon />
                    </span>
                    <span className={`w-fit rounded-full px-3 py-1 font-body text-xs font-bold uppercase tracking-wide ${tone.badge}`}>{t(`news.vacancy${type}`)}</span>
                  </div>

                  <h1 className="relative font-body text-2xl font-bold leading-tight text-forest-900 sm:text-3xl">{title}</h1>
             

                  <div className="relative flex flex-wrap items-center gap-x-5 gap-y-2 font-body text-sm text-ink-600">
                    <span className="inline-flex items-center gap-1.5">
                      <ClockIcon />
                      {t("news.deadline")}: <strong className="font-semibold text-ink-800">{deadline}</strong>
                    </span>
                    {location && (
                      <span className="inline-flex items-center gap-1.5">
                        <PinIcon />
                        {location}
                      </span>
                    )}
                  </div>

                  <p className="relative whitespace-pre-line font-body text-base leading-relaxed text-ink-600">{description}</p>

                  {(requirements.length > 0 || education) && (
                    <div className="relative flex flex-col gap-5 border-t border-forest-100 pt-5 sm:flex-row sm:gap-8">
                      {requirements.length > 0 && (
                        <div className="flex flex-1 flex-col gap-2.5">
                          <span className="inline-flex items-center gap-2 font-body text-sm font-bold text-forest-900">
                            <CheckListIcon />
                            {t("news.requirements")}
                          </span>
                          <ul className="flex flex-col gap-1.5">
                            {requirements.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 font-body text-sm leading-relaxed text-ink-600">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gilt-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {education && (
                        <div className="flex flex-1 flex-col gap-2.5">
                          <span className="inline-flex items-center gap-2 font-body text-sm font-bold text-forest-900">
                            <GradCapIcon />
                            {t("news.education")}
                          </span>
                          <p className="font-body text-sm leading-relaxed text-ink-600">{education}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Reveal>

              {/* ================= External apply link (optional) =================
                  Separate from the in-site application form below -- an admin can
                  set this (a Google Form, mailto:, third-party job board, ...) via
                  Apply Link in the admin panel when they'd rather collect
                  applications there instead of / in addition to here. Only shown
                  when set; otherwise the in-site form is the only way to apply. */}
              {applyHref && (
                <Reveal delay={0.04}>
                  <div className="flex flex-col items-center gap-3 rounded-xl3 border border-dashed border-forest-200 bg-forest-50/50 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
                    <p className="font-body text-sm font-medium text-ink-700">{t("news.orApplyExternally")}</p>
                    <a
                      href={applyHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative inline-flex w-fit shrink-0 items-center gap-2 overflow-hidden rounded-full px-6 py-2.5 font-body text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift ${tone.button}`}
                    >
                      {t("news.applyNow")}
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                        <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </div>
                </Reveal>
              )}

              {/* ================= Application form ================= */}
              <Reveal delay={0.08}>
                <div className="relative overflow-hidden rounded-xl3 border border-forest-100 bg-white p-7 shadow-card sm:p-9">
                  <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-forest-100/50 blur-3xl" aria-hidden="true" />

                  <div className="relative mb-7 flex items-center gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone.icon}`}>
                      <UserIcon />
                    </span>
                    <div>
                      <h2 className="font-body text-xl font-bold text-forest-900">{t("news.applyForThisRole")}</h2>
                      <p className="font-body text-sm text-ink-600">{t("news.applyFormSubtitle")}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <IconInput id="applicantName" name="applicantName" type="text" placeholder="Enter your fullname" required label={t("news.formFullName")} icon={<UserIcon />} />
                      <IconInput id="email" name="email" type="email" placeholder="Enter your email" required label={t("news.formEmail")} icon={<MailIcon />} />
                    </div>

                    <IconInput id="phone" name="phone" type="tel" placeholder="Enter your number"  label={t("news.formPhone")} icon={<PhoneIcon />} />

                    <FileDropField
                      name="coverLetter"
                      accept="application/pdf,image/*"
                      required
                      label={t("news.formCoverLetter")}
                      hint={t("news.formCoverLetterHint")}
                      tone={type === "Volunteer" ? "gilt" : "forest"}
                    />

                    <FileDropField
                      name="resume"
                      accept=".pdf,.doc,.docx"
                      label={t("news.formResume")}
                      hint={t("news.formResumeHint")}
                      tone={type === "Volunteer" ? "gilt" : "forest"}
                    />

                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className={`group relative mt-2 inline-flex w-fit items-center gap-2 overflow-hidden rounded-full px-7 py-3 font-body text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:opacity-60 disabled:hover:translate-y-0 ${tone.button}`}
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[200%] -skew-x-12 bg-white/25 transition-transform duration-700 ease-out group-hover:translate-x-[380%]"
                      />
                      <span className="relative">{status === "sending" ? t("news.formSending") : t("news.formSubmitApplication")}</span>
                    </button>

                    {status === "sent" && (
                      <div className="flex items-center gap-2.5 rounded-xl2 bg-forest-50 px-4 py-3 font-body text-sm font-medium text-forest-700">
                        <CheckCircleIcon />
                        {t("news.formApplicationSent")}
                      </div>
                    )}
                    {status === "error" && (
                      <div className="flex items-center gap-2.5 rounded-xl2 bg-red-50 px-4 py-3 font-body text-sm font-medium text-red-600">
                        <AlertIcon />
                        {t("news.formApplicationError")}
                      </div>
                    )}
                  </form>
                </div>
              </Reveal>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
