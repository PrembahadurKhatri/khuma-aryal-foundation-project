import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { fetchLeaders, createLeader, updateLeader, deleteLeader } from "../../services/leaderService.js";
import ImageSourceField from "../../components/admin/ImageSourceField.jsx";
import useToast from "../../hooks/useToast.js";

// "founder" and "president" are special (see server/models/Leader.js) — each
// gets one large featured card on the Home page. Every other value just
// renders in the "Other Leadership" grid, keyed off the Title/Post field for
// what actually shows — so the picker only needs to distinguish those two
// special cases from "everything else", not enumerate every possible post.
const ROLE_CHOICES = ["founder", "president", "other"];

const emptyForm = {
  role: "other",
  order: 0,
  nameEn: "",
  nameNe: "",
  titleEn: "",
  titleNe: "",
  messageEn: "",
  messageNe: "",
  photoFile: null,
};

const LeadersManage = () => {
  const queryClient = useQueryClient();
  const { theme } = useOutletContext();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["admin-leaders"], queryFn: fetchLeaders });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-leaders"] });
  const onError = (err) => toast.error(err.response?.data?.message || "Something went wrong.");

  const createMutation = useMutation({
    mutationFn: createLeader,
    onSuccess: () => {
      invalidate();
      toast.success("Leader added.");
    },
    onError,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateLeader(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Leader updated.");
    },
    onError,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteLeader,
    onSuccess: () => {
      invalidate();
      toast.success("Leader removed.");
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
      role: item.role || "other",
      order: item.order ?? 0,
      nameEn: item.name?.en || "",
      nameNe: item.name?.ne || "",
      titleEn: item.title?.en || "",
      titleNe: item.title?.ne || "",
      messageEn: item.message?.en || "",
      messageNe: item.message?.ne || "",
      photoFile: null,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateMutation.mutateAsync({ id: editing._id, payload: form });
    } else {
      if (!form.photoFile) {
        toast.error("A photo is required.");
        return;
      }
      await createMutation.mutateAsync(form);
    }
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Remove this leader? This cannot be undone.")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-body text-2xl font-bold">Leadership & Messages</h1>
          <p className={`text-sm ${mutedClass}`}>Founder, President and supporting leadership shown on the Home page.</p>
        </div>
        <button onClick={openCreate} className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 sm:w-auto sm:py-2">
          + New Leader
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
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Title (EN)</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.length === 0 && (
                  <tr>
                    <td colSpan={6} className={`px-4 py-6 text-center ${mutedClass}`}>
                      No leaders yet — add the Founder and President first.
                    </td>
                  </tr>
                )}
                {data?.data?.map((item) => (
                  <tr key={item._id} className={`border-t ${rowClass}`}>
                    <td className="px-4 py-3">
                      <img src={item.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                    </td>
                    <td className="px-4 py-3">{item.name?.en}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.role === "founder" || item.role === "president"
                            ? "bg-gilt-100 text-gilt-700"
                            : theme === "dark"
                              ? "bg-gray-800 text-gray-300"
                              : "bg-forest-50 text-forest-700"
                        }`}
                      >
                        {item.role}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3">{item.title?.en}</td>
                    <td className="px-4 py-3">{item.order}</td>
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
            <h2 className="mb-2 font-body text-lg font-semibold">{editing ? "Edit Leader" : "New Leader"}</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Role</label>
                <select
                  value={ROLE_CHOICES.includes(form.role) ? form.role : "other"}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={inputClass}
                >
                  <option value="founder">Founder</option>
                  <option value="president">President</option>
                  <option value="other">Other</option>
                </select>
                {!["founder", "president"].includes(form.role) && (
                  <p className={`mt-1 text-[11px] ${mutedClass}`}>Write the actual post (e.g. "Treasurer") in Title / Post below.</p>
                )}
              </div>
              <div>
                <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Display Order</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <p className={`text-xs ${mutedClass}`}>
              "Founder" and "President" each get one large featured card — only the first of each is used. "Other" covers every
              other post (Treasurer, Secretary, Advisor, ...) and appears in the "Other Leadership" grid, sorted by Display Order.
            </p>

            <input required placeholder="Name (English)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className={inputClass} />
            <input required placeholder="नाम (नेपाली)" value={form.nameNe} onChange={(e) => setForm({ ...form, nameNe: e.target.value })} className={inputClass} />
            <input required placeholder="Title / Post (English)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className={inputClass} />
            <input required placeholder="पद (नेपाली)" value={form.titleNe} onChange={(e) => setForm({ ...form, titleNe: e.target.value })} className={inputClass} />
            <textarea
              required
              rows={3}
              placeholder="Message (English)"
              value={form.messageEn}
              onChange={(e) => setForm({ ...form, messageEn: e.target.value })}
              className={inputClass}
            />
            <textarea
              required
              rows={3}
              placeholder="सन्देश (नेपाली)"
              value={form.messageNe}
              onChange={(e) => setForm({ ...form, messageNe: e.target.value })}
              className={inputClass}
            />

            <ImageSourceField
              theme={theme}
              label="Photo"
              required={!editing}
              existingUrl={editing?.photo}
              fileValue={form.photoFile}
              onFileChange={(f) => setForm((prev) => ({ ...prev, photoFile: f }))}
            />

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
              <button type="button" onClick={() => setShowForm(false)} className={`w-full rounded-lg px-4 py-2.5 text-center sm:w-auto ${mutedClass}`}>
                Cancel
              </button>
              <button type="submit" className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 sm:w-auto sm:py-2">
                {editing ? "Save Changes" : "Add Leader"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LeadersManage;
