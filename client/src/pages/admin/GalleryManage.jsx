import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { fetchAlbums, createAlbum, updateAlbum, deleteAlbum } from "../../services/galleryService.js";
import ImageSourceField from "../../components/admin/ImageSourceField.jsx";
import useToast from "../../hooks/useToast.js";

// value = what's stored (and used for gallery.category* translation key
// lookups on the public Gallery page — must stay space-free); label = what
// this admin-only dropdown actually displays.
const CATEGORIES = [
  { value: "Event", label: "Event" },
  { value: "Education", label: "Education" },
  { value: "Health", label: "Health" },
  { value: "Community", label: "Community" },
  { value: "Distribution", label: "Distribution" },
  { value: "DisasterRelief", label: "Disaster Relief" },
];

const categoryLabel = (value) => CATEGORIES.find((c) => c.value === value)?.label || value || "Event";

const emptyForm = {
  titleEn: "",
  titleNe: "",
  descriptionEn: "",
  descriptionNe: "",
  category: "Event",
  beneficiaries: "",
  featured: false,
  coverFile: null,
  keepPhotos: [],
  newPhotoFiles: [],
};

const GalleryManage = () => {
  const queryClient = useQueryClient();
  const { theme } = useOutletContext();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["admin-gallery"], queryFn: fetchAlbums });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
  const onError = (err) => toast.error(err.response?.data?.message || "Something went wrong.");

  const createMutation = useMutation({
    mutationFn: createAlbum,
    onSuccess: () => {
      invalidate();
      toast.success("Album created.");
    },
    onError,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateAlbum(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Album updated.");
    },
    onError,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAlbum,
    onSuccess: () => {
      invalidate();
      toast.success("Album deleted.");
    },
    onError,
  });

  const panelClass = theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-forest-100 shadow-sm";
  const mutedClass = theme === "dark" ? "text-gray-400" : "text-ink-600";
  const inputClass =
    theme === "dark" ? "w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100" : "w-full rounded-lg border border-forest-100 bg-white px-3 py-2 text-ink-900";

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (album) => {
    setEditing(album);
    setForm({
      titleEn: album.title?.en || "",
      titleNe: album.title?.ne || "",
      descriptionEn: album.description?.en || "",
      descriptionNe: album.description?.ne || "",
      category: album.category || "Event",
      beneficiaries: album.beneficiaries != null ? String(album.beneficiaries) : "",
      featured: !!album.featured,
      coverFile: null,
      keepPhotos: album.photos || [],
      newPhotoFiles: [],
    });
    setShowForm(true);
  };

  const removeKeptPhoto = (url) => {
    setForm((prev) => ({ ...prev, keepPhotos: prev.keepPhotos.filter((u) => u !== url) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !form.coverFile) {
      toast.error("Please choose a cover image.");
      return;
    }
    if (editing) {
      await updateMutation.mutateAsync({ id: editing._id, payload: form });
    } else {
      await createMutation.mutateAsync(form);
    }
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this album and all its photos? This cannot be undone.")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-body text-2xl font-bold">Gallery Albums</h1>
        <button onClick={openCreate} className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 sm:w-auto sm:py-2">
          + New Album
        </button>
      </div>

      {isLoading ? (
        <p className={mutedClass}>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data?.data?.length === 0 && <p className={`col-span-full text-center ${mutedClass}`}>No albums yet.</p>}
          {data?.data?.map((album) => (
            <div key={album._id} className={`relative overflow-hidden rounded-xl border ${panelClass}`}>
              {album.featured && (
                <span className="absolute left-2 top-2 z-10 rounded-md bg-gilt-500 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-soft">Featured</span>
              )}
              <img src={album.coverImage} alt={album.title?.en} className="h-32 w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-sm font-medium">{album.title?.en}</p>
                <p className={`text-xs ${mutedClass}`}>
                  {categoryLabel(album.category)} · {album.photos?.length || 0} photos
                  {album.beneficiaries != null && ` · ${album.beneficiaries}+ beneficiaries`}
                </p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => openEdit(album)} className="flex-1 rounded-lg bg-forest-600/10 py-1.5 text-xs font-medium text-forest-700 dark:text-forest-400">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(album._id)} className="flex-1 rounded-lg bg-red-50 py-1.5 text-xs font-medium text-red-500 dark:bg-red-950/40 dark:text-red-400">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/60 sm:items-center sm:p-4">
          <form onSubmit={handleSubmit} className={`my-0 max-h-[92vh] w-full space-y-3 overflow-y-auto rounded-t-2xl border p-6 sm:my-8 sm:max-w-lg sm:rounded-2xl ${panelClass}`}>
            <h2 className="mb-2 font-body text-lg font-semibold">{editing ? "Edit Album" : "New Album"}</h2>

            <input required placeholder="Title (English)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className={inputClass} />
            <input required placeholder="शीर्षक (नेपाली)" value={form.titleNe} onChange={(e) => setForm({ ...form, titleNe: e.target.value })} className={inputClass} />

            <textarea
              placeholder="Short description (English) — shown on the gallery card"
              rows={2}
              value={form.descriptionEn}
              onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              className={inputClass}
            />
            <textarea
              placeholder="छोटो विवरण (नेपाली)"
              rows={2}
              value={form.descriptionNe}
              onChange={(e) => setForm({ ...form, descriptionNe: e.target.value })}
              className={inputClass}
            />

            <div className="flex gap-3">
              <div className="flex-1">
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Beneficiaries (number)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 200"
                  value={form.beneficiaries}
                  onChange={(e) => setForm({ ...form, beneficiaries: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <label className={`flex items-center gap-2 text-sm font-medium ${mutedClass}`}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="h-4 w-4 rounded border-forest-300 text-forest-700 focus:ring-forest-500"
              />
              Feature this album on the Gallery page
            </label>

            <ImageSourceField
              theme={theme}
              label="Cover Photo"
              required={!editing}
              existingUrl={editing?.coverImage}
              fileValue={form.coverFile}
              onFileChange={(f) => setForm((prev) => ({ ...prev, coverFile: f }))}
            />

            {form.keepPhotos.length > 0 && (
              <div>
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Photos in this Album</label>
                <div className="grid grid-cols-4 gap-2">
                  {form.keepPhotos.map((url) => (
                    <div key={url} className="group relative">
                      <img src={url} alt="" className="h-16 w-full rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => removeKeptPhoto(url)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Add Photos (up to 100 total)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const picked = Array.from(e.target.files || []);
                  // Appended, not replaced — picking files again (e.g. one
                  // folder at a time, or a second batch on mobile where
                  // multi-select is fiddly) used to silently drop whatever
                  // was already queued. Reset the input after so the same
                  // file can be re-picked if it's ever removed below.
                  setForm((prev) => ({ ...prev, newPhotoFiles: [...prev.newPhotoFiles, ...picked] }));
                  e.target.value = "";
                }}
                className={inputClass}
              />
              <p className={`mt-1 text-xs ${mutedClass}`}>These are added to the album alongside any photos kept above. Select more than once to keep adding.</p>

              {form.newPhotoFiles.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {form.newPhotoFiles.map((file, i) => (
                    <div key={`${file.name}-${i}`} className="group relative">
                      <img src={URL.createObjectURL(file)} alt="" className="h-16 w-full rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, newPhotoFiles: prev.newPhotoFiles.filter((_, idx) => idx !== i) }))}
                        className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
              <button type="button" onClick={() => setShowForm(false)} className={`w-full rounded-lg px-4 py-2.5 text-center sm:w-auto ${mutedClass}`}>
                Cancel
              </button>
              <button type="submit" className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 sm:w-auto sm:py-2">
                {editing ? "Save Changes" : "Create Album"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GalleryManage;
