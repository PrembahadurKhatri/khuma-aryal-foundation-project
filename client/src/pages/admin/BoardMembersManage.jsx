import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { fetchBoardMembers, createBoardMember, updateBoardMember, deleteBoardMember } from "../../services/boardMemberService.js";
import ImageSourceField from "../../components/admin/ImageSourceField.jsx";
import useToast from "../../hooks/useToast.js";

const emptyForm = {
  order: 0,
  nameEn: "",
  nameNe: "",
  designationEn: "",
  designationNe: "",
  photoFile: null,
};

const BoardMembersManage = () => {
  const queryClient = useQueryClient();
  const { theme } = useOutletContext();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["admin-board-members"], queryFn: fetchBoardMembers });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-board-members"] });
  const onError = (err) => toast.error(err.response?.data?.message || "Something went wrong.");

  const createMutation = useMutation({
    mutationFn: createBoardMember,
    onSuccess: () => {
      invalidate();
      toast.success("Board member added.");
    },
    onError,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateBoardMember(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Board member updated.");
    },
    onError,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteBoardMember,
    onSuccess: () => {
      invalidate();
      toast.success("Board member removed.");
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
      order: item.order ?? 0,
      nameEn: item.name?.en || "",
      nameNe: item.name?.ne || "",
      designationEn: item.designation?.en || "",
      designationNe: item.designation?.ne || "",
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
    if (confirm("Remove this board member? This cannot be undone.")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-body text-2xl font-bold">Board Members</h1>
          <p className={`text-sm ${mutedClass}`}>The board roster shown in the "Board Members" section on the Home page.</p>
        </div>
        <button onClick={openCreate} className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 sm:w-auto sm:py-2">
          + New Board Member
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
                  <th className="px-4 py-3">Designation (EN)</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.length === 0 && (
                  <tr>
                    <td colSpan={5} className={`px-4 py-6 text-center ${mutedClass}`}>
                      No board members yet.
                    </td>
                  </tr>
                )}
                {data?.data?.map((item) => (
                  <tr key={item._id} className={`border-t ${rowClass}`}>
                    <td className="px-4 py-3">
                      <img src={item.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                    </td>
                    <td className="px-4 py-3">{item.name?.en}</td>
                    <td className="max-w-xs truncate px-4 py-3">{item.designation?.en}</td>
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
            <h2 className="mb-2 font-body text-lg font-semibold">{editing ? "Edit Board Member" : "New Board Member"}</h2>

            <div>
              <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Display Order</label>
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className={inputClass} />
              <p className={`mt-1 text-xs ${mutedClass}`}>Lower numbers show first in the grid.</p>
            </div>

            <input required placeholder="Name (English)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className={inputClass} />
            <input required placeholder="नाम (नेपाली)" value={form.nameNe} onChange={(e) => setForm({ ...form, nameNe: e.target.value })} className={inputClass} />
            <input
              required
              placeholder="Designation e.g. Chairperson (English)"
              value={form.designationEn}
              onChange={(e) => setForm({ ...form, designationEn: e.target.value })}
              className={inputClass}
            />
            <input
              required
              placeholder="पद (नेपाली)"
              value={form.designationNe}
              onChange={(e) => setForm({ ...form, designationNe: e.target.value })}
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
                {editing ? "Save Changes" : "Add Board Member"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BoardMembersManage;
