import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { fetchApplications, updateApplicationStatus, deleteApplication } from "../../services/applicationService.js";
import useToast from "../../hooks/useToast.js";

// Order matches the natural pipeline; badge colors are deliberately distinct
// per stage so the table reads at a glance. `notifies` statuses also email
// the applicant (see server/controllers/applicationController.js).
const STATUS_META = {
  new: { label: "New", badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300", notifies: false },
  reviewed: { label: "Reviewed", badge: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300", notifies: false },
  shortlisted: { label: "Shortlisted", badge: "bg-gilt-100 text-gilt-700 dark:bg-gilt-900/40 dark:text-gilt-300", notifies: true },
  interview: { label: "Interview", badge: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300", notifies: true },
  hired: { label: "Hired", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", notifies: true },
  rejected: { label: "Rejected", badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300", notifies: true },
};

// Buttons offered in the detail panel, in pipeline order.
const STATUS_ACTIONS = ["reviewed", "shortlisted", "interview", "hired", "rejected"];

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.new;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>{meta.label}</span>;
}

// Sensible default so the admin only has to adjust it, not build it from
// scratch: 3 days out, 10:00 AM.
const defaultInterviewDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().slice(0, 10);
};

const formatInterviewAt = (iso) =>
  new Date(iso).toLocaleString(undefined, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });

const ApplicationsManage = () => {
  const queryClient = useQueryClient();
  const { theme } = useOutletContext();
  const toast = useToast();
  const [selected, setSelected] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [note, setNote] = useState("");
  const [interviewDate, setInterviewDate] = useState(defaultInterviewDate());
  const [interviewTime, setInterviewTime] = useState("10:00");

  const { data, isLoading } = useQuery({ queryKey: ["admin-applications"], queryFn: () => fetchApplications() });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
  const onError = (err) => toast.error(err.response?.data?.message || "Something went wrong.");

  const markReviewedMutation = useMutation({
    mutationFn: (id) => updateApplicationStatus(id, "reviewed"),
    onSuccess: invalidate,
    onError,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, note, interviewAt }) => updateApplicationStatus(id, status, note, interviewAt),
    onSuccess: (res, { status }) => {
      invalidate();
      setSelected(res.data);
      setPendingStatus(null);
      setNote("");
      setInterviewDate(defaultInterviewDate());
      setInterviewTime("10:00");
      const meta = STATUS_META[status];
      toast.success(meta.notifies ? `Marked as ${meta.label} — applicant notified by email.` : `Marked as ${meta.label}.`);
    },
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
  const inputClass =
    theme === "dark" ? "w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100" : "w-full rounded-lg border border-forest-100 bg-white px-3 py-2 text-ink-900";

  const openApplication = (app) => {
    setSelected(app);
    setPendingStatus(null);
    setNote("");
    setInterviewDate(defaultInterviewDate());
    setInterviewTime("10:00");
    if (app.status === "new") markReviewedMutation.mutate(app._id);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this application? This cannot be undone.")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  // Statuses that notify the applicant ask for an optional note first
  // (e.g. interview date/time) rather than firing the email immediately.
  const chooseStatus = (status) => {
    if (STATUS_META[status].notifies) {
      setPendingStatus(status);
    } else {
      statusMutation.mutate({ id: selected._id, status });
    }
  };

  const confirmStatus = () => {
    const interviewAt = pendingStatus === "interview" && interviewDate && interviewTime ? new Date(`${interviewDate}T${interviewTime}`).toISOString() : undefined;
    statusMutation.mutate({ id: selected._id, status: pendingStatus, note, interviewAt });
  };

  return (
    <div>
      <h1 className="mb-6 font-body text-2xl font-bold">Job Applications</h1>

      {isLoading ? (
        <p className={mutedClass}>Loading...</p>
      ) : data?.data?.length === 0 ? (
        <div className={`rounded-xl border p-6 text-center ${panelClass} ${mutedClass}`}>No applications yet.</div>
      ) : (
        <>
          {/* Desktop: table, whole row opens the detail panel. */}
          <div className={`hidden overflow-hidden rounded-xl border md:block ${panelClass}`}>
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
                  {data?.data?.map((app) => (
                    <tr key={app._id} className={`cursor-pointer border-t ${rowClass}`} onClick={() => openApplication(app)}>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status} />
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

          {/* Mobile: whole card still opens the detail panel (same as
              tapping a table row would) — Delete sits in its own corner
              with stopPropagation so it doesn't also trigger that. */}
          <div className="space-y-3 md:hidden">
            {data?.data?.map((app) => (
              <div key={app._id} onClick={() => openApplication(app)} className={`cursor-pointer rounded-xl border p-4 ${panelClass}`}>
                <div className="flex items-start justify-between gap-2">
                  <StatusBadge status={app.status} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(app._id);
                    }}
                    className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-red-500 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-2 font-body text-sm font-semibold text-ink-900 dark:text-gray-100">{app.applicantName}</p>
                <p className={`font-body text-xs ${mutedClass}`}>{app.email}</p>
                <p className={`mt-1 truncate font-body text-xs ${mutedClass}`}>{app.vacancyTitle}</p>
                <p className={`mt-1 font-body text-xs ${mutedClass}`}>{new Date(app.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/60 sm:items-center sm:p-4" onClick={() => setSelected(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className={`my-0 max-h-[92vh] w-full space-y-4 overflow-y-auto rounded-t-2xl border p-6 sm:my-8 sm:max-w-lg sm:rounded-2xl ${panelClass}`}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-body text-lg font-semibold">{selected.vacancyTitle}</h2>
              <StatusBadge status={selected.status} />
            </div>
            <p className={`text-sm ${mutedClass}`}>
              From <span className="font-medium text-ink-900 dark:text-gray-100">{selected.applicantName}</span> —{" "}
              <a href={`mailto:${selected.email}`} className="text-forest-700 hover:underline dark:text-forest-400">
                {selected.email}
              </a>
            </p>
            {selected.phone && <p className={`text-sm ${mutedClass}`}>Phone: {selected.phone}</p>}
            <p className={`text-xs ${mutedClass}`}>{new Date(selected.createdAt).toLocaleString()}</p>
            {selected.status === "interview" && selected.interviewAt && (
              <p className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                🗓 Interview: {formatInterviewAt(selected.interviewAt)}
              </p>
            )}
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

            {/* Status pipeline */}
            <div className={`rounded-xl border p-4 ${theme === "dark" ? "border-gray-800 bg-gray-800/40" : "border-forest-100 bg-cream-50"}`}>
              <p className={`mb-3 text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Update Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_ACTIONS.map((status) => {
                  const meta = STATUS_META[status];
                  const isCurrent = selected.status === status;
                  return (
                    <button
                      key={status}
                      disabled={isCurrent}
                      onClick={() => chooseStatus(status)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        isCurrent ? `${meta.badge} opacity-60` : `${meta.badge} hover:-translate-y-0.5 hover:shadow-soft`
                      } disabled:cursor-default`}
                    >
                      {meta.label}
                      {meta.notifies && !isCurrent && <span className="ml-1 opacity-70">✉</span>}
                    </button>
                  );
                })}
              </div>

              {pendingStatus && (
                <div className="mt-4 space-y-2">
                  <p className={`text-xs ${mutedClass}`}>
                    This emails {selected.applicantName} at <span className="font-medium">{selected.email}</span>
                    {pendingStatus === "interview" ? " with the interview time below." : ". Add an optional note — it'll be included in the email."}
                  </p>

                  {pendingStatus === "interview" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Interview date</label>
                        <input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className={`mb-1 block text-xs font-medium ${mutedClass}`}>Interview time</label>
                        <input type="time" value={interviewTime} onChange={(e) => setInterviewTime(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  )}

                  <textarea
                    rows={3}
                    placeholder={pendingStatus === "interview" ? "Additional details (location, video call link, what to bring...)" : "Optional note for the applicant..."}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={inputClass}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setPendingStatus(null);
                        setNote("");
                      }}
                      className={`rounded-lg px-3 py-1.5 text-sm ${mutedClass}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmStatus}
                      disabled={statusMutation.isPending}
                      className="rounded-lg bg-forest-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
                    >
                      {statusMutation.isPending ? "Sending..." : `Mark as ${STATUS_META[pendingStatus].label} & Notify`}
                    </button>
                  </div>
                </div>
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
