import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import Avatar from "./Avatar.jsx";

export default function MessageCard({ message, compact = false }) {
  const { language } = useLanguage();
  const name = pick(message.name, language);
  const title = pick(message.title, language);
  const text = pick(message.message, language);

  return (
    <article className="flex h-full flex-col gap-4 rounded-xl2 border border-forest-100 bg-white p-6 shadow-card transition-transform duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-center gap-4">
        <Avatar name={name} src={message.photo} size={compact ? "sm" : "md"} />
        <div>
          <h3 className="font-display text-base font-semibold text-forest-900">{name}</h3>
          <p className="text-sm font-medium text-gilt-600">{title}</p>
        </div>
      </div>
      <p className={`leading-relaxed text-ink-600 ${compact ? "text-sm line-clamp-4" : "text-sm sm:text-base"}`}>
        <span className="font-display text-2xl leading-none text-gilt-300">&ldquo;</span>
        {text}
      </p>
    </article>
  );
}
