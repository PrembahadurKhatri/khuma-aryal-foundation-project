import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { fetchStories, createStory, updateStory, deleteStory } from "../../services/storyService.js";
import { fetchAlbums } from "../../services/galleryService.js";
import ImageSourceField from "../../components/admin/ImageSourceField.jsx";
import Spinner from "../../components/admin/Spinner.jsx";
import useToast from "../../hooks/useToast.js";

const emptyForm = {
  nameEn: "",
  nameNe: "",
  summaryEn: "",
  summaryNe: "",
  descriptionEn: "",
  descriptionNe: "",
  photoFile: null,
  album: "",
  keepImages: [],
  newImageFiles: [],
};

const StoriesManage = () => {
  const queryClient = useQueryClient();
  const { theme } = useOutletContext();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["admin-stories"], queryFn: fetchStories });
  const { data: albumsData } = useQuery({ queryKey: ["admin-gallery"], queryFn: fetchAlbums });
  const albums = albumsData?.data || [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
  const onError = (err) => toast.error(err.response?.data?.message || "Something went wrong.");

  const createMutation = useMutation({
    mutationFn: createStory,
    onSuccess: () => {
      invalidate();
      toast.success("Story created.");
    },
    onError,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateStory(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Story updated.");
    },
    onError,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteStory,
    onSuccess: () => {
      invalidate();
      toast.success("Story deleted.");
    },
    onError,
  });

  const panelClass = theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-forest-100 shadow-sm";
  const rowClass = theme === "dark" ? "border-gray-800" : "border-forest-100";
  const mutedClass = theme === "dark" ? "text-gray-400" : "text-ink-600";
  const inputClass =
    theme === "dark" ? "w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100" : "w-full rounded-lg border border-forest-100 bg-white px-3 py-2 text-ink-900";

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      nameEn: item.name?.en || "",
      nameNe: item.name?.ne || "",
      summaryEn: item.summary?.en || "",
      summaryNe: item.summary?.ne || "",
      descriptionEn: item.description?.en || "",
      descriptionNe: item.description?.ne || "",
      photoFile: null,
      album: (typeof item.album === "object" ? item.album?._id : item.album) || "",
      keepImages: item.images || [],
      newImageFiles: [],
    });
    setShowForm(true);
  };

  const removeKeptImage = (url) => {
    setForm((prev) => ({ ...prev, keepImages: prev.keepImages.filter((u) => u !== url) }));
  };

  // Uploads (files going through the API server) can take a few seconds —
  // with no feedback the admin tends to click "Create"/"Save" again, firing
  // duplicate requests. The loading toast + disabled/spinner button below
  // (isSaving) both exist to make that wait visible instead of silent.
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !form.photoFile) {
      toast.error("A photo is required.");
      return;
    }
    const loadingId = toast.loading(editing ? "Saving changes — please wait…" : "Uploading and creating — please wait…");
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing._id, payload: form });
      } else {
        await createMutation.mutateAsync(form);
      }
      setShowForm(false);
    } finally {
      toast.dismiss(loadingId);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this story? This cannot be undone.")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-body text-2xl font-bold">Impact / Success Stories</h1>
        <button onClick={openCreate} className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 sm:w-auto sm:py-2">
          + New Story
        </button>
      </div>

      {isLoading ? (
        <p className={mutedClass}>Loading...</p>
      ) : (
        <div className={`overflow-hidden rounded-xl border ${panelClass}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`text-left ${theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-cream-100 text-ink-600"}`}>
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Summary (EN)</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.length === 0 && (
                  <tr>
                    <td colSpan={3} className={`px-4 py-6 text-center ${mutedClass}`}>
                      No stories yet.
                    </td>
                  </tr>
                )}
                {data?.data?.map((item) => (
                  <tr key={item._id} className={`border-t ${rowClass}`}>
                    <td className="px-4 py-3">{item.name?.en || "—"}</td>
                    <td className="max-w-xs truncate px-4 py-3">{item.summary?.en}</td>
                    <td className="space-x-3 px-4 py-3 text-right">
                      <button onClick={() => openEdit(item)} className="text-forest-700 hover:underline dark:text-forest-400">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:underline dark:text-red-400">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/60 sm:items-center sm:p-4">
          <form onSubmit={handleSubmit} className={`my-0 max-h-[92vh] w-full space-y-3 overflow-y-auto rounded-t-2xl border p-6 sm:my-8 sm:max-w-lg sm:rounded-2xl ${panelClass}`}>
            <h2 className="mb-2 font-body text-lg font-semibold">{editing ? "Edit Story" : "New Story"}</h2>

            <input placeholder="Beneficiary Name (English, optional)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className={inputClass} />
            <input placeholder="लाभग्राहीको नाम (नेपाली, वैकल्पिक)" value={form.nameNe} onChange={(e) => setForm({ ...form, nameNe: e.target.value })} className={inputClass} />

            <textarea
              required
              rows={3}
              placeholder="Story Summary (English) — short blurb shown on the card"
              value={form.summaryEn}
              onChange={(e) => setForm({ ...form, summaryEn: e.target.value })}
              className={inputClass}
            />
            <textarea
              required
              rows={3}
              placeholder="कथा सारांश (नेपाली)"
              value={form.summaryNe}
              onChange={(e) => setForm({ ...form, summaryNe: e.target.value })}
              className={inputClass}
            />

            <div>
              <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Full Description (English, optional)</label>
              <textarea
                rows={5}
                placeholder="The full story, shown on this story's own detail page. Leave blank to just show the summary there."
                value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>पूर्ण विवरण (नेपाली, वैकल्पिक)</label>
              <textarea
                rows={5}
                placeholder="पूरा कथा, यस कथाको आफ्नै पृष्ठमा देखाइन्छ।"
                value={form.descriptionNe}
                onChange={(e) => setForm({ ...form, descriptionNe: e.target.value })}
                className={inputClass}
              />
            </div>

            <ImageSourceField
              theme={theme}
              label="Photo"
              required={!editing}
              existingUrl={editing?.photo}
              fileValue={form.photoFile}
              onFileChange={(f) => setForm((prev) => ({ ...prev, photoFile: f }))}
            />

            <div>
              <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Linked Gallery Album (optional)</label>
              <select value={form.album} onChange={(e) => setForm({ ...form, album: e.target.value })} className={inputClass}>
                <option value="">None</option>
                {albums.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.title?.en}
                  </option>
                ))}
              </select>
              <p className={`mt-1 text-xs ${mutedClass}`}>Lets visitors jump from this story's page to that album's full photo collection under Gallery.</p>
            </div>

            {form.keepImages.length > 0 && (
              <div>
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Current Photos</label>
                <div className="grid grid-cols-3 gap-2">
                  {form.keepImages.map((url) => (
                    <div key={url} className="group relative">
                      <img src={url} alt="" className="h-16 w-full rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => removeKeptImage(url)}
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
              <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Add Photos (up to 6 total, optional)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const picked = Array.from(e.target.files || []);
                  setForm((prev) => ({ ...prev, newImageFiles: [...prev.newImageFiles, ...picked] }));
                  e.target.value = "";
                }}
                className={inputClass}
              />
              <p className={`mt-1 text-xs ${mutedClass}`}>Shown as a photo gallery on this story's own detail page. Select more than once to keep adding.</p>

              {form.newImageFiles.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {form.newImageFiles.map((file, i) => (
                    <div key={`${file.name}-${i}`} className="group relative">
                      <img src={URL.createObjectURL(file)} alt="" className="h-16 w-full rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, newImageFiles: prev.newImageFiles.filter((_, idx) => idx !== i) }))}
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
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setShowForm(false)}
                className={`w-full rounded-lg px-4 py-2.5 text-center disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${mutedClass}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:py-2"
              >
                {isSaving && <Spinner />}
                {isSaving ? (editing ? "Saving…" : "Uploading…") : editing ? "Save Changes" : "Create Story"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StoriesManage;
