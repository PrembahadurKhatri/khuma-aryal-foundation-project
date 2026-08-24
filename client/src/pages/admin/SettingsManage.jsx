import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useNavigate } from "react-router-dom";
import { fetchSettings, updateSettings } from "../../services/settingsService.js";
import { changePassword as changePasswordRequest, changeEmail as changeEmailRequest } from "../../services/authService.js";
import useToast from "../../hooks/useToast.js";
import useAuth from "../../hooks/useAuth.js";
import getErrorMessage from "../../utils/getErrorMessage.js";

const emptyForm = {
  nameEn: "", nameNe: "", taglineEn: "", taglineNe: "", addressEn: "", addressNe: "",
  officeHoursEn: "", officeHoursNe: "", phone: "", email: "", facebook: "", instagram: "", youtube: "",
  statYears: "", statBeneficiaries: "", statProjects: "", statVolunteers: "",
  maintenanceEnabled: false, maintenanceMessage: "",
};

const emptyPasswordForm = { currentPassword: "", newPassword: "" };
const emptyEmailForm = { currentPassword: "", newEmail: "" };

const SettingsManage = () => {
  const queryClient = useQueryClient();
  const { theme } = useOutletContext();
  const toast = useToast();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [changingPassword, setChangingPassword] = useState(false);
  const [emailForm, setEmailForm] = useState(emptyEmailForm);
  const [changingEmail, setChangingEmail] = useState(false);

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
      statYears: s.stats?.years || "", statBeneficiaries: s.stats?.beneficiaries || "",
      statProjects: s.stats?.projects || "", statVolunteers: s.stats?.volunteers || "",
      maintenanceEnabled: s.maintenanceMode?.enabled || false,
      maintenanceMessage: s.maintenanceMode?.message || "",
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await changePasswordRequest(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success("Password changed. Please log in again.");
      setPasswordForm(emptyPasswordForm);
      setTimeout(async () => {
        await logout();
        navigate("/admin/login");
      }, 1500);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change password."));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setChangingEmail(true);
    try {
      await changeEmailRequest(emailForm.currentPassword, emailForm.newEmail);
      toast.success("Email changed. Please log in again.");
      setEmailForm(emptyEmailForm);
      setTimeout(async () => {
        await logout();
        navigate("/admin/login");
      }, 1500);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change email."));
    } finally {
      setChangingEmail(false);
    }
  };

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

        <div>
          <h2 className="mb-3 font-body font-semibold">Homepage Stats</h2>
          <p className={`mb-3 text-xs ${mutedClass}`}>Shown as the animated counter strip on the home page. Free text — keep the "+"/commas exactly how you want them displayed.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelClass}>Years of Service</label>
              <input placeholder="10+" value={form.statYears} onChange={(e) => setForm({ ...form, statYears: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Youth Supported</label>
              <input placeholder="5,000+" value={form.statBeneficiaries} onChange={(e) => setForm({ ...form, statBeneficiaries: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Projects Completed</label>
              <input placeholder="40+" value={form.statProjects} onChange={(e) => setForm({ ...form, statProjects: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Active Volunteers</label>
              <input placeholder="120+" value={form.statVolunteers} onChange={(e) => setForm({ ...form, statVolunteers: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-body font-semibold">Site Maintenance</h2>
          <p className={`mb-3 text-xs ${mutedClass}`}>
            When enabled, every public page shows a "we'll be back soon" page instead of the normal site. The admin panel stays fully accessible so you can turn it back off.
          </p>
          <label className="mb-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.maintenanceEnabled}
              onChange={(e) => setForm({ ...form, maintenanceEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-forest-300 text-forest-700 focus:ring-forest-500"
            />
            <span className={form.maintenanceEnabled ? "font-semibold text-forest-700 dark:text-forest-400" : mutedClass}>
              {form.maintenanceEnabled ? "Maintenance mode is ON — the public site is showing the message below" : "Maintenance mode is off"}
            </span>
          </label>
          <div>
            <label className={labelClass}>Message shown to visitors</label>
            <textarea
              rows={3}
              value={form.maintenanceMessage}
              onChange={(e) => setForm({ ...form, maintenanceMessage: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-forest-700 px-6 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 disabled:opacity-60">
            {mutation.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Account security — separate from the site-content Settings form
          above: these change the logged-in admin's own login credentials,
          not anything about the public site. */}
      <div className="mt-8 grid max-w-2xl gap-6 sm:grid-cols-2">
        <form onSubmit={handleChangePassword} className={`space-y-4 rounded-xl border p-6 ${panelClass}`}>
          <h2 className="font-body font-semibold">Change Password</h2>
          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={changingPassword}
            className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 disabled:opacity-60"
          >
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>

        <form onSubmit={handleChangeEmail} className={`space-y-4 rounded-xl border p-6 ${panelClass}`}>
          <h2 className="font-body font-semibold">Change Login Email</h2>
          <p className={`text-xs ${mutedClass}`}>
            Currently signed in as <strong className={theme === "dark" ? "text-gray-200" : "text-ink-800"}>{user?.email}</strong>. This is
            separate from the public contact email above.
          </p>
          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              required
              value={emailForm.currentPassword}
              onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>New Login Email</label>
            <input
              type="email"
              required
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={changingEmail}
            className="w-full rounded-lg bg-forest-700 px-4 py-2.5 font-semibold text-white shadow-soft hover:bg-forest-800 disabled:opacity-60"
          >
            {changingEmail ? "Changing..." : "Change Email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsManage;
