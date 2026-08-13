import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { fetchSettings, updateSettings } from "../../services/settingsService.js";
import useToast from "../../hooks/useToast.js";

const emptyForm = {
  nameEn: "", nameNe: "", taglineEn: "", taglineNe: "", addressEn: "", addressNe: "",
  officeHoursEn: "", officeHoursNe: "", phone: "", email: "", facebook: "", instagram: "", youtube: "",
};

const SettingsManage = () => {
  const queryClient = useQueryClient();
  const { theme } = useOutletContext();
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({ queryKey: ["admin-settings"], queryFn: fetchSettings });

  useEffect(() => {
    if (!data?.data) return;
    const s = data.data;
    setForm({
      nameEn: s.name?.en || "", nameNe: s.name?.ne || "",
      taglineEn: s.tagline?.en || "", taglineNe: s.tagline?.ne || "",
      addressEn: s.address?.en || "", addressNe: s.address?.ne || "",
      officeHoursEn: s.officeHours?.en || "", officeHoursNe: s.officeHours?.ne || "",
      phone: s.phone || "", email: s.email || "",
      facebook: s.social?.facebook || "", instagram: s.social?.instagram || "", youtube: s.social?.youtube || "",
    });
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Settings saved.");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Something went wrong."),
  });

  const panelClass = theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-forest-100 shadow-sm";
  const mutedClass = theme === "dark" ? "text-gray-400" : "text-ink-600";
  const inputClass =
    theme === "dark" ? "w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100" : "w-full rounded-lg border border-forest-100 bg-white px-3 py-2 text-ink-900";
  const labelClass = `mb-1 block text-xs font-medium ${mutedClass}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (isLoading) return <p className={mutedClass}>Loading...</p>;

  return (
    <div>
      <h1 className="mb-6 font-body text-2xl font-bold">Settings</h1>

      <form onSubmit={handleSubmit} className={`max-w-2xl space-y-5 rounded-xl border p-6 ${panelClass}`}>
        <div>
          <h2 className="mb-3 font-body font-semibold">Organization</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Name (English)</label>
              <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>नाम (नेपाली)</label>
              <input value={form.nameNe} onChange={(e) => setForm({ ...form, nameNe: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tagline (English)</label>
              <input value={form.taglineEn} onChange={(e) => setForm({ ...form, taglineEn: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>ट्यागलाइन (नेपाली)</label>
              <input value={form.taglineNe} onChange={(e) => setForm({ ...form, taglineNe: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-body font-semibold">Contact</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Address (English)</label>
              <input value={form.addressEn} onChange={(e) => setForm({ ...form, addressEn: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>ठेगाना (नेपाली)</label>
              <input value={form.addressNe} onChange={(e) => setForm({ ...form, addressNe: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Office Hours (English)</label>
              <input value={form.officeHoursEn} onChange={(e) => setForm({ ...form, officeHoursEn: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>कार्यालय समय (नेपाली)</label>
              <input value={form.officeHoursNe} onChange={(e) => setForm({ ...form, officeHoursNe: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-body font-semibold">Social Links</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Facebook URL</label>
              <input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Instagram URL</label>
              <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>YouTube URL</label>
              <input value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-forest-700 px-6 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 disabled:opacity-60">
            {mutation.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsManage;
