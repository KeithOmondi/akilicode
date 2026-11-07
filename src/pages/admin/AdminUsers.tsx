import { useEffect, useState } from "react";
import { Users as UsersIcon, ShieldCheck, MailCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getAllUsers, updateUserRole, adminDeleteUser, clearAdminError } from "../../store/slices/userSlice";
import type { IUser } from "../../interfaces/user.interface";
import { PageHeader, StatCard, StatusBadge, SearchBox, TableSkeleton, EmptyState } from "../../components/admin/ui";
import { dateShort } from "../../components/admin/format";

const AdminUsers = () => {
  const dispatch = useAppDispatch();
  const { adminUsers, adminLoading, adminError } = useAppSelector((s) => s.user);
  const me = useAppSelector((s) => s.auth.user);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getAllUsers());
    return () => { dispatch(clearAdminError()); };
  }, [dispatch]);

  useEffect(() => {
    if (adminError) toast.error(adminError);
  }, [adminError]);

  const rows = adminUsers.filter((u: IUser) => {
    const q = search.trim().toLowerCase();
    return !q || [u.name, u.email, u.phone].some((v) => v?.toLowerCase().includes(q));
  });

  const changeRole = async (u: IUser, role: "admin" | "parent") => {
    if (!window.confirm(`Make ${u.name} ${role === "admin" ? "an administrator" : "a parent"}?`)) return;
    await dispatch(updateUserRole({ userId: u.id, role }));
    dispatch(getAllUsers());
  };

  const remove = async (u: IUser) => {
    if (window.confirm(`Delete ${u.name}? This removes their account for good.`)) await dispatch(adminDeleteUser(u.id));
  };

  return (
    <>
      <PageHeader title="Users" subtitle="Parents and administrators with an account." />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="All accounts" value={adminUsers.length} icon={<UsersIcon size={20} />} />
        <StatCard label="Verified" value={adminUsers.filter((u: IUser) => u.is_verified).length} icon={<MailCheck size={20} />} tone="ok" />
        <StatCard label="Administrators" value={adminUsers.filter((u: IUser) => u.role === "admin").length} icon={<ShieldCheck size={20} />} tone="info" />
      </div>

      <div className="adm-card">
        <div className="p-4 border-b border-ink-200"><SearchBox value={search} onChange={setSearch} placeholder="Search name, email or phone…" /></div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Name</th><th>Contact</th><th>Role</th><th>Email</th><th>Joined</th><th><span className="sr-only-text">Actions</span></th></tr></thead>
            {adminLoading && adminUsers.length === 0 ? <TableSkeleton cols={6} /> : (
              <tbody>
                {rows.map((u: IUser) => (
                  <tr key={u.id}>
                    <td className="font-semibold">{u.name}{u.id === me?.id && <span className="ml-2 text-xs font-semibold text-ink-500">(you)</span>}</td>
                    <td><p>{u.email || "—"}</p><p className="text-xs text-ink-500">{u.phone || ""}</p></td>
                    <td>
                      <select className="adm-input !min-h-9 py-0" value={u.role} disabled={u.id === me?.id} aria-label={`Role for ${u.name}`} onChange={(e) => changeRole(u, e.target.value as "admin" | "parent")}>
                        <option value="parent">Parent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td><StatusBadge status={u.is_verified ? "verified" : "unverified"} /></td>
                    <td className="whitespace-nowrap">{dateShort(u.created_at)}</td>
                    <td className="text-right">{u.id !== me?.id && <button className="ds-btn ds-btn-ghost ds-btn-sm text-red-700" onClick={() => remove(u)}>Delete</button>}</td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {!adminLoading && rows.length === 0 && <EmptyState icon={<UsersIcon size={22} />} title="No users found" />}
        </div>
      </div>
    </>
  );
};

export default AdminUsers;
