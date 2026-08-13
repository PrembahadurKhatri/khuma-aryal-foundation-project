export default function SectionHeading({ kicker, title, subtitle, align = "center", light = false }) {
  const alignClasses = align === "left" ? "text-left items-start" : "text-center items-center";
  return (
    <div className={`flex flex-col gap-4 ${alignClasses}`}>
 
      <h2
        className={`font-body text-3xl font-semibold leading-tight sm:text-4xl ${
          light ? "text-white" : "text-forest-900"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`max-w-2xl text-base leading-relaxed ${light ? "text-cream-100/85" : "text-ink-600"} ${
            align === "left" ? "" : "mx-auto"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
