import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { fetchEvents, createEvent, updateEvent, deleteEvent } from "../../services/eventService.js";
import { fetchAlbums } from "../../services/galleryService.js";
import ImageSourceField from "../../components/admin/ImageSourceField.jsx";
import Spinner from "../../components/admin/Spinner.jsx";
import useToast from "../../hooks/useToast.js";

const emptyForm = {
  nameEn: "",
  nameNe: "",
  date: "",
  time: "",
  locationEn: "",
  locationNe: "",
  descriptionEn: "",
  descriptionNe: "",
  imageFile: null,
  album: "",
  keepImages: [],
  newImageFiles: [],
};

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

const EventsManage = () => {
  const queryClient = useQueryClient();
  const { theme } = useOutletContext();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["admin-events"], queryFn: fetchEvents });
  const { data: albumsData } = useQuery({ queryKey: ["admin-gallery"], queryFn: fetchAlbums });
  const albums = albumsData?.data || [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-events"] });
  const onError = (err) => toast.error(err.response?.data?.message || "Something went wrong.");

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      invalidate();
      toast.success("Event created.");
    },
    onError,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateEvent(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Event updated.");
    },
    onError,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      invalidate();
      toast.success("Event deleted.");
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
      date: toDateInput(item.date),
      time: item.time || "",
      locationEn: item.location?.en || "",
      locationNe: item.location?.ne || "",
      descriptionEn: item.description?.en || "",
      descriptionNe: item.description?.ne || "",
      imageFile: null,
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
    if (confirm("Delete this event? This cannot be undone.")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-body text-2xl font-bold">Upcoming Events</h1>
        <button onClick={openCreate} className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 sm:w-auto sm:py-2">
          + New Event
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
                  <th className="px-4 py-3">Name (EN)</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Location (EN)</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.length === 0 && (
                  <tr>
                    <td colSpan={4} className={`px-4 py-6 text-center ${mutedClass}`}>
                      No events yet.
                    </td>
                  </tr>
                )}
                {data?.data?.map((item) => (
                  <tr key={item._id} className={`border-t ${rowClass}`}>
                    <td className="px-4 py-3">{item.name?.en}</td>
                    <td className="px-4 py-3">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{item.location?.en}</td>
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
            <h2 className="mb-2 font-body text-lg font-semibold">{editing ? "Edit Event" : "New Event"}</h2>

            <input required placeholder="Event Name (English)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className={inputClass} />
            <input required placeholder="कार्यक्रमको नाम (नेपाली)" value={form.nameNe} onChange={(e) => setForm({ ...form, nameNe: e.target.value })} className={inputClass} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Date</label>
                <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Time</label>
                <input placeholder="e.g. 10:00 AM - 2:00 PM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputClass} />
              </div>
            </div>

            <input placeholder="Location (English)" value={form.locationEn} onChange={(e) => setForm({ ...form, locationEn: e.target.value })} className={inputClass} />
            <input placeholder="स्थान (नेपाली)" value={form.locationNe} onChange={(e) => setForm({ ...form, locationNe: e.target.value })} className={inputClass} />

            <div>
              <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Description (English, optional)</label>
              <textarea
                rows={3}
                placeholder="What's this event about? Shown in full on the event's detail page."
                value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>विवरण (नेपाली, वैकल्पिक)</label>
              <textarea
                rows={3}
                placeholder="यो कार्यक्रम के बारे मा हो?"
                value={form.descriptionNe}
                onChange={(e) => setForm({ ...form, descriptionNe: e.target.value })}
                className={inputClass}
              />
            </div>

            <ImageSourceField
              theme={theme}
              label="Image (optional)"
              existingUrl={editing?.image}
              fileValue={form.imageFile}
              onFileChange={(f) => setForm((prev) => ({ ...prev, imageFile: f }))}
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
              <p className={`mt-1 text-xs ${mutedClass}`}>Lets visitors jump from this event's page to that album's full photo collection under Gallery.</p>
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
              <p className={`mt-1 text-xs ${mutedClass}`}>Shown as a photo gallery on this event's own detail page. Select more than once to keep adding.</p>

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
                {isSaving ? (editing ? "Saving…" : "Uploading…") : editing ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EventsManage;
