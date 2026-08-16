import { useRef, useState } from "react";

function UploadCloudIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M7 18a4.5 4.5 0 0 1-.5-8.97A5.5 5.5 0 0 1 17.3 8.03 4 4 0 0 1 17 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12v7m0-7 3 3m-3-3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FileCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 13.5l2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A styled click-to-browse (and drag-and-drop) upload zone, replacing the
 * plain browser <input type="file"> look — used by VacancyDetail.jsx's
 * application form for both the cover letter and resume fields.
 */
export default function FileDropField({ name, accept, label, hint, required, tone = "forest" }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  const toneClasses = tone === "gilt" ? "border-gilt-300 bg-gilt-50/50 text-gilt-700 hover:border-gilt-400" : "border-forest-200 bg-forest-50/50 text-forest-700 hover:border-forest-400";

  const setFiles = (fileList) => {
    const picked = fileList?.[0] || null;
    setFile(picked);
    if (inputRef.current) {
      const dt = new DataTransfer();
      if (picked) dt.items.add(picked);
      inputRef.current.files = dt.files;
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-xs font-semibold text-ink-600">
        {label} {required && "*"}
      </label>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          setFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer items-center gap-3 rounded-xl2 border-2 border-dashed px-4 py-4 transition-all duration-300 ${toneClasses} ${
          dragging ? "scale-[1.01] shadow-soft" : ""
        }`}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-soft">
          {file ? <FileCheckIcon /> : <UploadCloudIcon />}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          {file ? (
            <span className="truncate font-body text-sm font-semibold text-ink-900">{file.name}</span>
          ) : (
            <span className="font-body text-sm font-semibold">Click to upload, or drag and drop</span>
          )}
          <span className="font-body text-xs text-ink-400">{hint}</span>
        </div>
        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFiles(null);
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-white hover:text-red-500"
            aria-label="Remove file"
          >
            <XIcon />
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" name={name} accept={accept} required={required} onChange={(e) => setFiles(e.target.files)} className="hidden" />
    </div>
  );
}
