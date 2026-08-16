import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { fetchApplications, updateApplicationStatus, deleteApplication } from "../../services/applicationService.js";
import useToast from "../../hooks/useToast.js";

const ApplicationsManage = () => {
  const queryClient = useQueryClient();
  const { theme } = useOutletContext();
  const toast = useToast();
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ["admin-applications"], queryFn: () => fetchApplications() });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
  const onError = (err) => toast.error(err.response?.data?.message || "Something went wrong.");

  const markReviewedMutation = useMutation({
    mutationFn: (id) => updateApplicationStatus(id, "reviewed"),
    onSuccess: invalidate,
    onError,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      invalidate();
      toast.success("Application deleted.");
      setSelected(null);
    },
    onError,
  });

  const panelClass = theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-forest-100 shadow-sm";
  const rowClass = theme === "dark" ? "border-gray-800" : "border-forest-100";
  const mutedClass = theme === "dark" ? "text-gray-400" : "text-ink-600";

  const openApplication = (app) => {
    setSelected(app);
    if (app.status === "new") markReviewedMutation.mutate(app._id);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this application? This cannot be undone.")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <h1 className="mb-6 font-body text-2xl font-bold">Job Applications</h1>

      {isLoading ? (
        <p className={mutedClass}>Loading...</p>
      ) : (
        <div className={`overflow-hidden rounded-xl border ${panelClass}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`text-left ${theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-cream-100 text-ink-600"}`}>
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.length === 0 && (
                  <tr>
                    <td colSpan={5} className={`px-4 py-6 text-center ${mutedClass}`}>
                      No applications yet.
                    </td>
                  </tr>
                )}
                {data?.data?.map((app) => (
                  <tr key={app._id} className={`cursor-pointer border-t ${rowClass}`} onClick={() => openApplication(app)}>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          app.status === "new" ? "bg-forest-600/15 text-forest-700 dark:text-forest-400" : mutedClass
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{app.applicantName}</div>
                      <div className={`text-xs ${mutedClass}`}>{app.email}</div>
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3">{app.vacancyTitle}</td>
                    <td className="px-4 py-3">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleDelete(app._id)} className="text-red-500 hover:underline dark:text-red-400">
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/60 sm:items-center sm:p-4" onClick={() => setSelected(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className={`my-0 max-h-[92vh] w-full space-y-3 overflow-y-auto rounded-t-2xl border p-6 sm:my-8 sm:max-w-lg sm:rounded-2xl ${panelClass}`}
          >
            <h2 className="mb-2 font-body text-lg font-semibold">{selected.vacancyTitle}</h2>
            <p className={`text-sm ${mutedClass}`}>
              From <span className="font-medium text-ink-900 dark:text-gray-100">{selected.applicantName}</span> —{" "}
              <a href={`mailto:${selected.email}`} className="text-forest-700 hover:underline dark:text-forest-400">
                {selected.email}
              </a>
            </p>
            {selected.phone && <p className={`text-sm ${mutedClass}`}>Phone: {selected.phone}</p>}
            <p className={`text-xs ${mutedClass}`}>{new Date(selected.createdAt).toLocaleString()}</p>
            <div className="flex flex-col gap-2">
              {selected.coverLetter && (
                <a href={selected.coverLetter} target="_blank" rel="noreferrer" className="inline-block text-sm font-semibold text-forest-700 hover:underline dark:text-forest-400">
                  View cover letter →
                </a>
              )}
              {selected.resume && (
                <a href={selected.resume} target="_blank" rel="noreferrer" className="inline-block text-sm font-semibold text-forest-700 hover:underline dark:text-forest-400">
                  View resume/CV →
                </a>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelected(null)} className="rounded-lg bg-forest-700 px-4 py-2 font-semibold text-white hover:bg-forest-800">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsManage;
