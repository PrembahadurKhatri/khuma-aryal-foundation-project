// Same idea as ImageSourceField.jsx but for non-image documents (Notice
// attachments, Download files) — no image preview, just a filename + a
// link to the currently-saved file (if any).
const FileSourceField = ({ theme, label, required, existingUrl, fileValue, onFileChange }) => {
  const inputClass =
    theme === "dark"
      ? "w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100"
      : "w-full rounded-lg border border-forest-100 bg-white px-3 py-2 text-ink-900";
  const helpClass = theme === "dark" ? "text-gray-500" : "text-gray-500";

  return (
    <div>
      <label className={`mb-1 block text-xs font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        className={inputClass}
      />
      <p className={`mt-1 text-xs ${helpClass}`}>
        {fileValue
          ? `Selected: ${fileValue.name}`
          : existingUrl
            ? "Leave empty to keep the current file."
            : "PDF, Word, Excel, or PowerPoint."}
      </p>
      {existingUrl && !fileValue && (
        <a href={existingUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-forest-700 underline dark:text-forest-400">
          View current file
        </a>
      )}
    </div>
  );
};

export default FileSourceField;
