import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { fetchGalleryImages, createGalleryImage, updateGalleryImage, deleteGalleryImage } from "../../services/galleryService.js";
import ImageSourceField from "../../components/admin/ImageSourceField.jsx";
import useToast from "../../hooks/useToast.js";

const emptyForm = { altEn: "", altNe: "", imageFile: null };

const GalleryManage = () => {
  const queryClient = useQueryClient();
  const { theme } = useOutletContext();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["admin-gallery"], queryFn: fetchGalleryImages });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
  const onError = (err) => toast.error(err.response?.data?.message || "Something went wrong.");

  const createMutation = useMutation({
    mutationFn: createGalleryImage,
    onSuccess: () => {
      invalidate();
      toast.success("Image added.");
    },
    onError,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateGalleryImage(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Image updated.");
    },
    onError,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteGalleryImage,
    onSuccess: () => {
      invalidate();
      toast.success("Image deleted.");
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

  const openEdit = (image) => {
    setEditing(image);
    setForm({ altEn: image.alt?.en || "", altNe: image.alt?.ne || "", imageFile: null });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !form.imageFile) {
      toast.error("Please choose an image file.");
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
    if (confirm("Delete this image? This cannot be undone.")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-body text-2xl font-bold">Gallery</h1>
        <button onClick={openCreate} className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 sm:w-auto sm:py-2">
          + Add Image
        </button>
      </div>

      {isLoading ? (
        <p className={mutedClass}>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data?.data?.length === 0 && <p className={`col-span-full text-center ${mutedClass}`}>No images yet.</p>}
          {data?.data?.map((image) => (
            <div key={image._id} className={`overflow-hidden rounded-xl border ${panelClass}`}>
              <img src={image.src} alt={image.alt?.en} className="h-32 w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-sm font-medium">{image.alt?.en}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => openEdit(image)} className="flex-1 rounded-lg bg-forest-600/10 py-1.5 text-xs font-medium text-forest-700 dark:text-forest-400">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(image._id)} className="flex-1 rounded-lg bg-red-50 py-1.5 text-xs font-medium text-red-500 dark:bg-red-950/40 dark:text-red-400">
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
            <h2 className="mb-2 font-body text-lg font-semibold">{editing ? "Edit Image" : "Add Image"}</h2>

            <input required placeholder="Caption (English)" value={form.altEn} onChange={(e) => setForm({ ...form, altEn: e.target.value })} className={inputClass} />
            <input required placeholder="क्याप्शन (नेपाली)" value={form.altNe} onChange={(e) => setForm({ ...form, altNe: e.target.value })} className={inputClass} />

            <ImageSourceField
              theme={theme}
              label="Image"
              required={!editing}
              existingUrl={editing?.src}
              fileValue={form.imageFile}
              onFileChange={(f) => setForm((prev) => ({ ...prev, imageFile: f }))}
            />

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
              <button type="button" onClick={() => setShowForm(false)} className={`w-full rounded-lg px-4 py-2.5 text-center sm:w-auto ${mutedClass}`}>
                Cancel
              </button>
              <button type="submit" className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 sm:w-auto sm:py-2">
                {editing ? "Save Changes" : "Add Image"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GalleryManage;
