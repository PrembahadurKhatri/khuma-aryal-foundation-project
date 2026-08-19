import { useMemo } from "react";
import { NEPALI_MONTHS, BS_YEAR_MIN, BS_YEAR_MAX, safeAdToBs, safeBsToAd, parseBs, formatBs } from "../../utils/nepaliDate.js";

// A Bikram Sambat (BS) equivalent of a plain AD "YYYY-MM-DD" value — an
// alternate way to set the *same* date, not a separate field. Reads from
// `adValue` (kept in sync automatically whenever it changes elsewhere, e.g.
// the native AD <input type="date">) and calls `onAdChange` with the
// converted AD string whenever the admin picks a BS year/month/day instead.
// Never touches or replaces the AD input itself.
export default function NepaliDateField({ adValue, onAdChange, inputClass, mutedClass }) {
  const bs = useMemo(() => parseBs(safeAdToBs(adValue) || ""), [adValue]);

  const years = useMemo(() => {
    const list = [];
    for (let y = BS_YEAR_MIN; y <= BS_YEAR_MAX; y++) list.push(y);
    return list;
  }, []);

  const updateBs = (year, month, day) => {
    const nextBs = formatBs(year, month, day);
    const nextAd = safeBsToAd(nextBs);
    if (nextAd) onAdChange(nextAd);
  };

  return (
    <div className="mt-1.5">
      <span className={`mb-1 block text-[11px] ${mutedClass}`}>Nepali date (BS) — same date, alternate picker</span>
      <div className="grid grid-cols-3 gap-1.5">
        <select
          className={`${inputClass} !py-1.5 !text-xs`}
          value={bs.year || ""}
          onChange={(e) => updateBs(e.target.value, bs.month || 1, bs.day || 1)}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          className={`${inputClass} !py-1.5 !text-xs`}
          value={bs.month || ""}
          onChange={(e) => updateBs(bs.year || years[0], e.target.value, bs.day || 1)}
        >
          <option value="">Month</option>
          {NEPALI_MONTHS.map((name, i) => (
            <option key={name} value={i + 1}>
              {name}
            </option>
          ))}
        </select>
        <select
          className={`${inputClass} !py-1.5 !text-xs`}
          value={bs.day || ""}
          onChange={(e) => updateBs(bs.year || years[0], bs.month || 1, e.target.value)}
        >
          <option value="">Day</option>
          {Array.from({ length: 32 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
