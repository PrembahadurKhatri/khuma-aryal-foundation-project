import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { fetchVideos, createVideo, updateVideo, deleteVideo } from "../../services/videoService.js";
import ImageSourceField from "../../components/admin/ImageSourceField.jsx";
import Spinner from "../../components/admin/Spinner.jsx";
import useToast from "../../hooks/useToast.js";

// Matches server/models/Album.js's ALBUM_CATEGORIES (Video reuses it too).
const CATEGORIES = ["Event", "Education", "Health", "Community", "Distribution", "DisasterRelief"];
const emptyForm = {
  titleEn: "",
  titleNe: "",
  descriptionEn: "",
  descriptionNe: "",
  category: "Event",
  duration: "",
  embedUrl: "",
  videoFile: null,
  thumbnailFile: null,
};

const VideosManage = () => {
  const queryClient = useQueryClient();
  const { theme } = useOutletContext();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["admin-videos"], queryFn: fetchVideos });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
  const onError = (err) => toast.error(err.response?.data?.message || "Something went wrong.");

  const createMutation = useMutation({
    mutationFn: createVideo,
    onSuccess: () => {
      invalidate();
      toast.success("Video added.");
    },
    onError,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateVideo(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Video updated.");
    },
    onError,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => {
      invalidate();
      toast.success("Video deleted.");
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
      titleEn: item.title?.en || "",
      titleNe: item.title?.ne || "",
      descriptionEn: item.description?.en || "",
      descriptionNe: item.description?.ne || "",
      category: item.category || "Event",
      duration: item.duration || "",
      embedUrl: item.embedUrl || "",
      videoFile: null,
      thumbnailFile: null,
    });
    setShowForm(true);
  };

  // Video file uploads especially can take a while — with no feedback the
  // admin tends to click "Add"/"Save" again, firing duplicate requests.
  // The loading toast + disabled/spinner button below (isSaving) both
  // exist to make that wait visible instead of silent.
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !form.embedUrl && !form.videoFile) {
      toast.error("Provide either an embed link or upload a video file.");
      return;
    }
    const loadingId = toast.loading(editing ? "Saving changes — please wait…" : "Uploading video — this can take a moment…");
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
    if (confirm("Delete this video? This cannot be undone.")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-body text-2xl font-bold">Gallery Videos</h1>
        <button onClick={openCreate} className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 sm:w-auto sm:py-2">
          + New Video
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
                  <th className="px-4 py-3">Title (EN)</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.length === 0 && (
                  <tr>
                    <td colSpan={4} className={`px-4 py-6 text-center ${mutedClass}`}>
                      No videos yet.
                    </td>
                  </tr>
                )}
                {data?.data?.map((item) => (
                  <tr key={item._id} className={`border-t ${rowClass}`}>
                    <td className="px-4 py-3">{item.title?.en}</td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3">{item.embedUrl ? "Embed link" : "Uploaded file"}</td>
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
            <h2 className="mb-2 font-body text-lg font-semibold">{editing ? "Edit Video" : "New Video"}</h2>

            <input required placeholder="Title (English)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className={inputClass} />
            <input required placeholder="शीर्षक (नेपाली)" value={form.titleNe} onChange={(e) => setForm({ ...form, titleNe: e.target.value })} className={inputClass} />

            <textarea
              rows={2}
              placeholder="Description (English, optional)"
              value={form.descriptionEn}
              onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              className={inputClass}
            />
            <textarea
              rows={2}
              placeholder="विवरण (नेपाली, वैकल्पिक)"
              value={form.descriptionNe}
              onChange={(e) => setForm({ ...form, descriptionNe: e.target.value })}
              className={inputClass}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Duration (optional)</label>
                <input placeholder="e.g. 2 hr 44 min" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div className={`rounded-lg border p-3 ${theme === "dark" ? "border-gray-700" : "border-forest-100"}`}>
              <p className={`mb-2 text-xs font-medium ${mutedClass}`}>Provide EITHER an embed link OR upload a video file below.</p>

              <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Embed Link (YouTube, Vimeo, etc.)</label>
              <input
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.embedUrl}
                onChange={(e) => setForm({ ...form, embedUrl: e.target.value })}
                className={inputClass}
              />

              <p className={`my-2 text-center text-xs ${mutedClass}`}>— or —</p>

              <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Upload Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setForm({ ...form, videoFile: e.target.files?.[0] || null })}
                className={inputClass}
              />
              {editing?.videoFile && !form.videoFile && (
                <p className={`mt-1 text-xs ${mutedClass}`}>A video file is already uploaded — leave empty to keep it.</p>
              )}
            </div>

            <ImageSourceField
              theme={theme}
              label="Thumbnail (optional — auto-generated for YouTube links if left empty)"
              existingUrl={editing?.thumbnail}
              fileValue={form.thumbnailFile}
              onFileChange={(f) => setForm((prev) => ({ ...prev, thumbnailFile: f }))}
            />

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
                {isSaving ? (editing ? "Saving…" : "Uploading…") : editing ? "Save Changes" : "Add Video"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VideosManage;
