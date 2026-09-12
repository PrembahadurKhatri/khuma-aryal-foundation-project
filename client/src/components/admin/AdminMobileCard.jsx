/**
 * One list item's mobile-friendly "card" — the small-screen sibling of an
 * admin manage page's desktop <table> row. A table with 3-6 columns reads
 * fine on a laptop, but squeezed into a phone width it forces horizontal
 * scrolling and shrinks Edit/Delete down to tiny, easy-to-mistap text
 * links — exactly what makes the admin panel "difficult to use" on mobile.
 * This renders the same item as a stacked card instead, with full-width,
 * generously-sized action buttons.
 *
 * Each page supplies its own content (title, badges, meta lines) as
 * children — this only supplies the shared shell + action row, reusing
 * the same ghostBtnClass/dangerBtnClass button look every manage page
 * already defines for its desktop Edit/Delete text links.
 */
export default function AdminMobileCard({ theme, onEdit, onDelete, editLabel = "Edit", deleteLabel = "Delete", children }) {
  const cardClass = theme === "dark" ? "border-gray-800 bg-gray-900" : "border-forest-100 bg-white shadow-sm";
  const dividerClass = theme === "dark" ? "border-gray-800" : "border-forest-100";
  const editBtnClass =
    theme === "dark"
      ? "flex-1 min-h-[42px] rounded-lg bg-gray-800 text-sm font-medium text-gray-100"
      : "flex-1 min-h-[42px] rounded-lg bg-cream-100 text-sm font-medium text-ink-900";
  const deleteBtnClass =
    theme === "dark"
      ? "flex-1 min-h-[42px] rounded-lg bg-red-950/40 text-sm font-medium text-red-400"
      : "flex-1 min-h-[42px] rounded-lg bg-red-50 text-sm font-medium text-red-500";

  return (
    <div className={`rounded-xl border p-4 ${cardClass}`}>
      {children}
      {(onEdit || onDelete) && (
        <div className={`mt-3 flex gap-2 border-t pt-3 ${dividerClass}`}>
          {onEdit && (
            <button type="button" onClick={onEdit} className={editBtnClass}>
              {editLabel}
            </button>
          )}
          {onDelete && (
            <button type="button" onClick={onDelete} className={deleteBtnClass}>
              {deleteLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
