import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { fetchVacancies, createVacancy, updateVacancy, deleteVacancy } from "../../services/vacancyService.js";
import useToast from "../../hooks/useToast.js";

const TYPES = ["FullTime", "PartTime", "Volunteer", "Internship", "Contract"];
const TYPE_LABELS = { FullTime: "Full-Time", PartTime: "Part-Time", Volunteer: "Volunteer", Internship: "Internship", Contract: "Contract" };
const emptyForm = { titleEn: "", titleNe: "", descriptionEn: "", descriptionNe: "", type: "FullTime", locationEn: "", locationNe: "", deadline: "", applyLink: "" };

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

const VacanciesManage = () => {
  const queryClient = useQueryClient();
  const { theme } = useOutletContext();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["admin-vacancies"], queryFn: fetchVacancies });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-vacancies"] });
  const onError = (err) => toast.error(err.response?.data?.message || "Something went wrong.");

  const createMutation = useMutation({
    mutationFn: createVacancy,
    onSuccess: () => {
      invalidate();
      toast.success("Vacancy created.");
    },
    onError,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateVacancy(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Vacancy updated.");
    },
    onError,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteVacancy,
    onSuccess: () => {
      invalidate();
      toast.success("Vacancy deleted.");
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
      type: item.type || "FullTime",
      locationEn: item.location?.en || "",
      locationNe: item.location?.ne || "",
      deadline: toDateInput(item.deadline),
      applyLink: item.applyLink || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateMutation.mutateAsync({ id: editing._id, payload: form });
    } else {
      await createMutation.mutateAsync(form);
    }
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this vacancy? This cannot be undone.")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-body text-2xl font-bold">Job Vacancies</h1>
        <button onClick={openCreate} className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 sm:w-auto sm:py-2">
          + New Vacancy
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
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.length === 0 && (
                  <tr>
                    <td colSpan={4} className={`px-4 py-6 text-center ${mutedClass}`}>
                      No vacancies yet.
                    </td>
                  </tr>
                )}
                {data?.data?.map((item) => (
                  <tr key={item._id} className={`border-t ${rowClass}`}>
                    <td className="px-4 py-3">{item.title?.en}</td>
                    <td className="px-4 py-3">{TYPE_LABELS[item.type] || item.type}</td>
                    <td className="px-4 py-3">{new Date(item.deadline).toLocaleDateString()}</td>
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
            <h2 className="mb-2 font-body text-lg font-semibold">{editing ? "Edit Vacancy" : "New Vacancy"}</h2>

            <input required placeholder="Position Title (English)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className={inputClass} />
            <input required placeholder="पद (नेपाली)" value={form.titleNe} onChange={(e) => setForm({ ...form, titleNe: e.target.value })} className={inputClass} />

            <textarea
              required
              rows={3}
              placeholder="Description / Requirements (English)"
              value={form.descriptionEn}
              onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              className={inputClass}
            />
            <textarea
              required
              rows={3}
              placeholder="विवरण / आवश्यकता (नेपाली)"
              value={form.descriptionNe}
              onChange={(e) => setForm({ ...form, descriptionNe: e.target.value })}
              className={inputClass}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Application Deadline</label>
                <input type="date" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={inputClass} />
              </div>
            </div>

            <input placeholder="Location (English, optional)" value={form.locationEn} onChange={(e) => setForm({ ...form, locationEn: e.target.value })} className={inputClass} />
            <input placeholder="स्थान (नेपाली, वैकल्पिक)" value={form.locationNe} onChange={(e) => setForm({ ...form, locationNe: e.target.value })} className={inputClass} />

            <div>
              <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Apply Link (optional)</label>
              <input
                placeholder="https://forms.gle/... or mailto:hr@..."
                value={form.applyLink}
                onChange={(e) => setForm({ ...form, applyLink: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
              <button type="button" onClick={() => setShowForm(false)} className={`w-full rounded-lg px-4 py-2.5 text-center sm:w-auto ${mutedClass}`}>
                Cancel
              </button>
              <button type="submit" className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 sm:w-auto sm:py-2">
                {editing ? "Save Changes" : "Create Vacancy"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VacanciesManage;
