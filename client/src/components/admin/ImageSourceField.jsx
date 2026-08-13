// Shows an existing image (if any) with an option to replace it via file
// upload. Used by NewsManage/GalleryManage (single image) forms.
const ImageSourceField = ({ theme, label, required, existingUrl, fileValue, onFileChange }) => {
  const inputClass =
    theme === "dark"
      ? "w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100"
      : "w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink";
  const helpClass = theme === "dark" ? "text-gray-500" : "text-gray-500";

  const preview = fileValue ? URL.createObjectURL(fileValue) : existingUrl;

  return (
    <div>
      <label className={`mb-1 block text-xs font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        className={inputClass}
      />
      <p className={`mt-1 text-xs ${helpClass}`}>
        {existingUrl && !fileValue ? "Leave empty to keep the current image." : "Upload an image from your device."}
      </p>
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mt-2 h-32 w-full rounded-lg object-cover"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}
    </div>
  );
};

export default ImageSourceField;
