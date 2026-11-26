"use client";

import { useEffect, useState } from "react";
import { FiCheck, FiMinus } from "react-icons/fi";
import AppLayout from "@/components/layout/AppLayout";
import ToastStack from "@/components/ui/ToastStack";
import { useAuth } from "@/hooks/useAuth";
import { listUsers, updateUserProfile, updateUserRole } from "@/lib/firebase/users";

const navTabs = ["Profile", "AI Configuration", "Notifications", "Integrations", "Security"];
const roleOptions = ["writer", "reviewer", "approver", "admin"];
const permissionMatrix = {
  writer: { refine: true, requestRevision: false, approve: false, publish: false },
  reviewer: { refine: true, requestRevision: true, approve: true, publish: false },
  approver: { refine: true, requestRevision: true, approve: true, publish: true },
  admin: { refine: true, requestRevision: true, approve: true, publish: true },
};

function PermissionCell({ allowed }) {
  return allowed ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success-soft text-success ring-1 ring-success-line">
      <FiCheck className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">Allowed</span>
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center text-faint">
      <FiMinus className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">Not allowed</span>
    </span>
  );
}

export default function SettingsPage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [profileRole, setProfileRole] = useState("writer");
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("writer");
  const [saving, setSaving] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userProfile) {
      return;
    }

    setDisplayName(userProfile.displayName || "");
    setProfileRole((userProfile.role || "writer").toLowerCase());
  }, [userProfile]);

  useEffect(() => {
    if ((userProfile?.role || "").toLowerCase() !== "admin") {
      setUsers([]);
      return;
    }

    let cancelled = false;
    listUsers()
      .then((rows) => {
        if (!cancelled) {
          setUsers(rows);
          setSelectedUserId((current) => current || String(userProfile.id || rows[0]?.id || ""));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load users.");
      });

    return () => { cancelled = true; };
  }, [userProfile]);

  useEffect(() => {
    const selectedUser = users.find((row) => String(row.id) === String(selectedUserId));
    if (selectedUser) setSelectedRole((selectedUser.role || "writer").toLowerCase());
  }, [users, selectedUserId]);

  async function handleSave() {
    if (!user) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateUserProfile(user.uid, {
        displayName,
        role: profileRole,
      });
      await refreshProfile();
      setMessage("Profile and role updated successfully.");
    } catch (err) {
      setError(err?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRole() {
    if (!selectedUserId) return;

    setSavingRole(true);
    setMessage("");
    setError("");
    try {
      const updatedUser = await updateUserRole(selectedUserId, selectedRole);
      setUsers((current) => current.map((row) => row.id === updatedUser.id ? { ...row, ...updatedUser } : row));
      if (String(updatedUser.id) === String(userProfile?.id)) await refreshProfile();
      setMessage(`Role updated for ${updatedUser.name || updatedUser.email}.`);
    } catch (err) {
      setError(err?.message || "Failed to update role.");
    } finally {
      setSavingRole(false);
    }
  }

  const email = userProfile?.email || user?.email || "";
  const currentRole = profileRole;
  const currentRoleLabel = ({ writer: "Writer", reviewer: "Reviewer", approver: "Approver", admin: "Admin" })[currentRole] || "Writer";
  const initial = (displayName || email || "U").charAt(0).toUpperCase();

  return (
    <AppLayout initialSelectedNav="Settings">
      <div className="page">
        <div className="page-header">
          <div className="min-w-0">
            <p className="eyebrow">Settings</p>
            <h1 className="page-title mt-1">Role</h1>
            <p className="page-subtitle">
              Manage user access and role permissions across the platform.
            </p>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <section className="card card-pad min-w-0">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-gradient-to-br from-brand to-amber font-display text-[24px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(226,67,41,0.6)] ring-4 ring-surface" aria-hidden="true">
                {initial}
              </div>

              <div className="min-w-0 flex-1">
                <div className="break-anywhere text-[17px] font-semibold text-ink">{displayName || "User"}</div>
                <div className="break-anywhere mt-0.5 text-[14px] text-muted">{email}</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t border-line pt-6 md:grid-cols-2">
              <label className="block min-w-0">
                <span className="field-label">Full Name</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input"
                />
              </label>

              <label className="block min-w-0">
                <span className="field-label">Email Address</span>
                <input
                  value={email}
                  readOnly
                  className="input"
                />
              </label>

              <label className="block min-w-0 md:col-span-2">
                <span className="field-label">Application Role</span>
                <select
                  value={profileRole}
                  onChange={(event) => setProfileRole(event.target.value)}
                  className="input"
                >
                  {roleOptions.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {({ writer: "Writer", reviewer: "Reviewer", approver: "Approver", admin: "Admin" })[roleOption]}
                    </option>
                  ))}
                </select>
                <span className="field-hint">Choose your application access role.</span>
              </label>

            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="card-title">Role permissions</h3>
                <span className="badge badge-brand">
                  {currentRoleLabel}
                </span>
              </div>

              <div className="table-wrap">
                <table className="data-table min-w-[480px]">
                  <thead>
                    <tr>
                      <th scope="col">Role</th>
                      <th scope="col" className="text-center">Refine</th>
                      <th scope="col" className="text-center">Request Revision</th>
                      <th scope="col" className="text-center">Approve</th>
                      <th scope="col" className="text-center">Publish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleOptions.map((roleOption) => {
                      const currentPermissions = permissionMatrix[roleOption];
                      const isSelected = roleOption === currentRole;
                      return (
                        <tr
                          key={roleOption}
                          className={isSelected ? "bg-brand-soft/60" : ""}
                          aria-current={isSelected ? "true" : undefined}
                        >
                          <th scope="row" className={`border-b border-line px-[14px] py-3 text-left text-[14px] font-medium ${isSelected ? "text-ink shadow-[inset_3px_0_0_var(--color-brand)]" : "text-body"}`}>
                            {({ writer: "Writer", reviewer: "Reviewer", approver: "Approver", admin: "Admin" })[roleOption]}
                          </th>
                          <td className="text-center">
                            <PermissionCell allowed={currentPermissions.refine} />
                          </td>
                          <td className="text-center">
                            <PermissionCell allowed={currentPermissions.requestRevision} />
                          </td>
                          <td className="text-center">
                            <PermissionCell allowed={currentPermissions.approve} />
                          </td>
                          <td className="text-center">
                            <PermissionCell allowed={currentPermissions.publish} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="card card-pad min-w-0 lg:sticky lg:top-24">
            <h2 className="section-title">Role Summary</h2>

            <div className="mt-5 space-y-4">
              <ToastStack toasts={[{ id: "settings-error", message: error, tone: "error" }, { id: "settings-message", message, tone: "success" }]} />

              <div className="card stat-card tone-brand">
                <div className="text-[13px] text-muted">Current access</div>
                <div className="display-num mt-1 text-[22px]">{currentRoleLabel}</div>
              </div>

              {currentRole === "admin" && (
                <div className="space-y-4 rounded-[10px] border border-line p-4">
                  <div>
                    <label className="field-label" htmlFor="role-user">Change role for</label>
                    <select
                      id="role-user"
                      value={selectedUserId}
                      onChange={(event) => setSelectedUserId(event.target.value)}
                      className="input"
                    >
                      {users.map((row) => (
                        <option key={row.id} value={row.id}>{row.name || row.email} ({row.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="user-role">Application role</label>
                    <select
                      id="user-role"
                      value={selectedRole}
                      onChange={(event) => setSelectedRole(event.target.value)}
                      className="input"
                    >
                      {roleOptions.map((roleOption) => (
                        <option key={roleOption} value={roleOption}>
                          {({ writer: "Writer", reviewer: "Reviewer", approver: "Approver", admin: "Admin" })[roleOption]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveRole}
                    disabled={savingRole || !selectedUserId || users.length === 0}
                    className="btn btn-secondary w-full"
                  >
                    {savingRole ? "Saving role..." : "Save Role"}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary btn-lg w-full"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
