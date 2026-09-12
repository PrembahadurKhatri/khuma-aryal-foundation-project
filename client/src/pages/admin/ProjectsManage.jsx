import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { fetchProjects, createProject, updateProject, deleteProject } from "../../services/projectService.js";
import { fetchAlbums } from "../../services/galleryService.js";
import useToast from "../../hooks/useToast.js";
import NepaliDateField from "../../components/admin/NepaliDateField.jsx";
import Spinner from "../../components/admin/Spinner.jsx";
import AdminMobileCard from "../../components/admin/AdminMobileCard.jsx";

// Same category list as gallery Albums (see admin/GalleryManage.jsx) — value
// is what's stored (and used for the public Projects page's gallery.category*
// translation lookups, so must stay space-free), label is admin-display-only.
const CATEGORIES = [
  { value: "Event", label: "Event" },
  { value: "Education", label: "Education" },
  { value: "Health", label: "Health" },
  { value: "Community", label: "Community" },
  { value: "Distribution", label: "Distribution" },
  { value: "DisasterRelief", label: "Disaster Relief" },
];

const emptyForm = {
  titleEn: "",
  titleNe: "",
  descriptionEn: "",
  descriptionNe: "",
  status: "ongoing",
  category: "Event",
  date: "",
  endDate: "",
  durationEn: "",
  durationNe: "",
  locationEn: "",
  locationNe: "",
  beneficiariesEn: "",
  beneficiariesNe: "",
  objectiveEn: "",
  objectiveNe: "",
  album: "",
  featured: false,
  keepImages: [],
  newImageFiles: [],
  keepThumbnail: "",
  thumbnailFile: null,
};

// Mongo gives back a full ISO datetime; <input type="date"> needs "YYYY-MM-DD".
const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

const statusTone = {
  ongoing: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  upcoming: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
};

const ProjectsManage = () => {
  const queryClient = useQueryClient();
  const { theme } = useOutletContext();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["admin-projects"], queryFn: fetchProjects });
  const { data: albumsData } = useQuery({ queryKey: ["admin-gallery"], queryFn: fetchAlbums });
  const albums = albumsData?.data || [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
  const onError = (err) => toast.error(err.response?.data?.message || "Something went wrong.");

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      invalidate();
      toast.success("Project created.");
    },
    onError,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateProject(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Project updated.");
    },
    onError,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      invalidate();
      toast.success("Project deleted.");
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

  const openEdit = (project) => {
    setEditing(project);
    setForm({
      titleEn: project.title?.en || "",
      titleNe: project.title?.ne || "",
      descriptionEn: project.description?.en || "",
      descriptionNe: project.description?.ne || "",
      status: project.status,
      category: project.category || "Event",
      date: toDateInput(project.date),
      endDate: toDateInput(project.endDate),
      durationEn: project.duration?.en || "",
      durationNe: project.duration?.ne || "",
      locationEn: project.location?.en || "",
      locationNe: project.location?.ne || "",
      beneficiariesEn: project.beneficiaries?.en || "",
      beneficiariesNe: project.beneficiaries?.ne || "",
      objectiveEn: project.objective?.en || "",
      objectiveNe: project.objective?.ne || "",
      // Could be a populated object ({_id, title, ...}) or a plain ID
      // string depending on where this project object came from — normalize
      // to just the ID string the <select> needs.
      album: (typeof project.album === "object" ? project.album?._id : project.album) || "",
      featured: !!project.featured,
      keepImages: project.images || [],
      newImageFiles: [],
      keepThumbnail: project.thumbnail || "",
      thumbnailFile: null,
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
    if (confirm("Delete this project? This cannot be undone.")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-body text-2xl font-bold">Projects</h1>
        <button onClick={openCreate} className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 sm:w-auto sm:py-2">
          + New Project
        </button>
      </div>

      {isLoading ? (
        <p className={mutedClass}>Loading...</p>
      ) : data?.data?.length === 0 ? (
        <div className={`rounded-xl border p-6 text-center ${panelClass} ${mutedClass}`}>No projects yet.</div>
      ) : (
        <>
          <div className={`hidden overflow-hidden rounded-xl border md:block ${panelClass}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={`text-left ${theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-cream-100 text-ink-600"}`}>
                  <tr>
                    <th className="px-4 py-3">Title (EN)</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Images</th>
                    <th className="px-4 py-3">Featured</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((project) => (
                    <tr key={project._id} className={`border-t ${rowClass}`}>
                      <td className="px-4 py-3">{project.title?.en}</td>
                      <td className="px-4 py-3">{CATEGORIES.find((c) => c.value === project.category)?.label || "Event"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[project.status] || ""}`}>{project.status}</span>
                      </td>
                      <td className="px-4 py-3">{project.images?.length || 0}</td>
                      <td className="px-4 py-3">
                        {project.featured && (
                          <span className="rounded-full bg-gilt-500 px-2.5 py-1 text-xs font-semibold text-white">Featured</span>
                        )}
                      </td>
                      <td className="space-x-3 px-4 py-3 text-right">
                        <button onClick={() => openEdit(project)} className="text-forest-700 hover:underline dark:text-forest-400">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(project._id)} className="text-red-500 hover:underline dark:text-red-400">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {data?.data?.map((project) => (
              <AdminMobileCard key={project._id} theme={theme} onEdit={() => openEdit(project)} onDelete={() => handleDelete(project._id)}>
                <p className="font-body text-sm font-semibold text-ink-900 dark:text-gray-100">{project.title?.en}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusTone[project.status] || ""}`}>{project.status}</span>
                  <span className={`font-body text-xs ${mutedClass}`}>{CATEGORIES.find((c) => c.value === project.category)?.label || "Event"}</span>
                  <span className={`font-body text-xs ${mutedClass}`}>· {project.images?.length || 0} photo{project.images?.length === 1 ? "" : "s"}</span>
                  {project.featured && (
                    <span className="rounded-full bg-gilt-500 px-2 py-0.5 text-[11px] font-semibold text-white">Featured</span>
                  )}
                </div>
              </AdminMobileCard>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/60 sm:items-center sm:p-4">
          <form onSubmit={handleSubmit} className={`my-0 max-h-[92vh] w-full space-y-3 overflow-y-auto rounded-t-2xl border p-6 sm:my-8 sm:max-w-lg sm:rounded-2xl ${panelClass}`}>
            <h2 className="mb-2 font-body text-lg font-semibold">{editing ? "Edit Project" : "New Project"}</h2>

            <input required placeholder="Title (English)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className={inputClass} />
            <input required placeholder="शीर्षक (नेपाली)" value={form.titleNe} onChange={(e) => setForm({ ...form, titleNe: e.target.value })} className={inputClass} />
            <textarea
              required
              rows={3}
              placeholder="Description (English)"
              value={form.descriptionEn}
              onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              className={inputClass}
            />
            <textarea
              required
              rows={3}
              placeholder="विवरण (नेपाली)"
              value={form.descriptionNe}
              onChange={(e) => setForm({ ...form, descriptionNe: e.target.value })}
              className={inputClass}
            />

            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
            </select>

            <div>
              <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Start Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} />
                <NepaliDateField
                  adValue={form.date}
                  onAdChange={(next) => setForm({ ...form, date: next })}
                  inputClass={inputClass}
                  mutedClass={mutedClass}
                />
              </div>
              <div>
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Finish Date</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
                <NepaliDateField
                  adValue={form.endDate}
                  onAdChange={(next) => setForm({ ...form, endDate: next })}
                  inputClass={inputClass}
                  mutedClass={mutedClass}
                />
                {form.endDate && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, endDate: "" })}
                    className={`mt-1 text-[11px] underline ${mutedClass}`}
                  >
                    Clear finish date
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Duration e.g. 6 Months"
                value={form.durationEn}
                onChange={(e) => setForm({ ...form, durationEn: e.target.value })}
                className={inputClass}
              />
              <input placeholder="अवधि (नेपाली)" value={form.durationNe} onChange={(e) => setForm({ ...form, durationNe: e.target.value })} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Location (English)" value={form.locationEn} onChange={(e) => setForm({ ...form, locationEn: e.target.value })} className={inputClass} />
              <input placeholder="स्थान (नेपाली)" value={form.locationNe} onChange={(e) => setForm({ ...form, locationNe: e.target.value })} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Beneficiaries e.g. 120+ Students"
                value={form.beneficiariesEn}
                onChange={(e) => setForm({ ...form, beneficiariesEn: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="लाभान्वित (नेपाली)"
                value={form.beneficiariesNe}
                onChange={(e) => setForm({ ...form, beneficiariesNe: e.target.value })}
                className={inputClass}
              />
            </div>

            <textarea
              rows={2}
              placeholder="Objective (English)"
              value={form.objectiveEn}
              onChange={(e) => setForm({ ...form, objectiveEn: e.target.value })}
              className={inputClass}
            />
            <textarea
              rows={2}
              placeholder="उद्देश्य (नेपाली)"
              value={form.objectiveNe}
              onChange={(e) => setForm({ ...form, objectiveNe: e.target.value })}
              className={inputClass}
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
              <p className={`mt-1 text-xs ${mutedClass}`}>
                Lets visitors jump from this project's page to that album's full photo collection under Gallery.
              </p>
            </div>

            <label className={`flex items-center gap-2 text-sm font-medium ${mutedClass}`}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="h-4 w-4 rounded border-forest-300 text-forest-700 focus:ring-forest-500"
              />
              Feature this project on the Projects page
            </label>

            <div>
              <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Hero / Cover Photo</label>
              <p className={`mb-2 text-xs ${mutedClass}`}>
                Shown on the project's hero banner and its card cover. If not set, the first gallery photo below is used instead.
              </p>
              {form.keepThumbnail && (
                <div className="group relative mb-2 w-32">
                  <img src={form.keepThumbnail} alt="" className="h-20 w-32 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, keepThumbnail: "" }))}
                    className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((prev) => ({ ...prev, thumbnailFile: e.target.files?.[0] || null }))}
                className={inputClass}
              />
            </div>

            {form.keepImages.length > 0 && (
              <div>
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Current Images</label>
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
              <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Add Images (up to 6 total)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const picked = Array.from(e.target.files || []);
                  // Appended, not replaced — picking files again (a second
                  // batch, or one at a time on mobile) used to silently drop
                  // whatever was already queued. Reset the input after so
                  // the same file can be re-picked if it's ever removed below.
                  setForm((prev) => ({ ...prev, newImageFiles: [...prev.newImageFiles, ...picked] }));
                  e.target.value = "";
                }}
                className={inputClass}
              />
              <p className={`mt-1 text-xs ${mutedClass}`}>Select more than once to keep adding.</p>

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
                {isSaving ? (editing ? "Saving…" : "Uploading…") : editing ? "Save Changes" : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProjectsManage;
