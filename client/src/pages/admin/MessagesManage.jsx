import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { fetchMessages, updateMessageStatus, deleteMessage } from "../../services/messageService.js";
import useToast from "../../hooks/useToast.js";

const MessagesManage = () => {
  const queryClient = useQueryClient();
  const { theme } = useOutletContext();
  const toast = useToast();
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ["admin-messages"], queryFn: () => fetchMessages() });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
  const onError = (err) => toast.error(err.response?.data?.message || "Something went wrong.");

  const markReadMutation = useMutation({
    mutationFn: (id) => updateMessageStatus(id, "read"),
    onSuccess: invalidate,
    onError,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      invalidate();
      toast.success("Message deleted.");
      setSelected(null);
    },
    onError,
  });

  const panelClass = theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-forest-100 shadow-sm";
  const rowClass = theme === "dark" ? "border-gray-800" : "border-forest-100";
  const mutedClass = theme === "dark" ? "text-gray-400" : "text-ink-600";

  const openMessage = (msg) => {
    setSelected(msg);
    if (msg.status === "new") markReadMutation.mutate(msg._id);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this message? This cannot be undone.")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <h1 className="mb-6 font-body text-2xl font-bold">Messages</h1>

      {isLoading ? (
        <p className={mutedClass}>Loading...</p>
      ) : data?.data?.length === 0 ? (
        <div className={`rounded-xl border p-6 text-center ${panelClass} ${mutedClass}`}>No messages yet.</div>
      ) : (
        <>
          <div className={`hidden overflow-hidden rounded-xl border md:block ${panelClass}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={`text-left ${theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-cream-100 text-ink-600"}`}>
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">From</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Received</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((msg) => (
                    <tr key={msg._id} className={`cursor-pointer border-t ${rowClass}`} onClick={() => openMessage(msg)}>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            msg.status === "new" ? "bg-forest-600/15 text-forest-700 dark:text-forest-400" : mutedClass
                          }`}
                        >
                          {msg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{msg.name}</div>
                        <div className={`text-xs ${mutedClass}`}>{msg.email}</div>
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-3">{msg.subject || "—"}</td>
                      <td className="px-4 py-3">{new Date(msg.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleDelete(msg._id)} className="text-red-500 hover:underline dark:text-red-400">
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
            {data?.data?.map((msg) => (
              <div key={msg._id} onClick={() => openMessage(msg)} className={`cursor-pointer rounded-xl border p-4 ${panelClass}`}>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      msg.status === "new" ? "bg-forest-600/15 text-forest-700 dark:text-forest-400" : mutedClass
                    }`}
                  >
                    {msg.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(msg._id);
                    }}
                    className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-red-500 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-2 font-body text-sm font-semibold text-ink-900 dark:text-gray-100">{msg.name}</p>
                <p className={`font-body text-xs ${mutedClass}`}>{msg.email}</p>
                <p className={`mt-1 truncate font-body text-xs ${mutedClass}`}>{msg.subject || "—"}</p>
                <p className={`mt-1 font-body text-xs ${mutedClass}`}>{new Date(msg.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/60 sm:items-center sm:p-4" onClick={() => setSelected(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className={`my-0 max-h-[92vh] w-full space-y-3 overflow-y-auto rounded-t-2xl border p-6 sm:my-8 sm:max-w-lg sm:rounded-2xl ${panelClass}`}
          >
            <h2 className="mb-2 font-body text-lg font-semibold">{selected.subject || "Message"}</h2>
            <p className={`text-sm ${mutedClass}`}>
              From <span className="font-medium text-ink-900 dark:text-gray-100">{selected.name}</span> —{" "}
              <a href={`mailto:${selected.email}`} className="text-forest-700 hover:underline dark:text-forest-400">
                {selected.email}
              </a>
            </p>
            <p className={`text-xs ${mutedClass}`}>{new Date(selected.createdAt).toLocaleString()}</p>
            <p className="whitespace-pre-line rounded-lg bg-cream-100 p-4 text-sm dark:bg-gray-800">{selected.message}</p>
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

export default MessagesManage;
