import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useDeleteUser, useUsers } from '../hooks/useUsers';
import { ROUTES } from '@/routes/routes';

export const AdminUserListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useUsers({ page, limit: 10, search: search || undefined });
  const deleteUser = useDeleteUser();

  const handleDelete = (id: number) => {
    if (!confirm('Delete this user?')) return;
    deleteUser.mutate(id);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => navigate(`${ROUTES.ADMIN_USERS}/new`)}
        >
          New User
        </button>
      </div>

      <input
        className="border rounded px-3 py-2 w-full max-w-sm"
        placeholder="Search by email or name…"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      {isLoading && <p>Loading…</p>}
      {isError && <p className="text-red-600">Failed to load users.</p>}

      {data && (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2">ID</th>
                <th className="p-2">Email</th>
                <th className="p-2">Full name</th>
                <th className="p-2">Role</th>
                <th className="p-2">Active</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.id}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.fullName}</td>
                  <td className="p-2">{u.role?.name ?? u.roleId}</td>
                  <td className="p-2">{u.isActive ? '✓' : '—'}</td>
                  <td className="p-2 space-x-2">
                    <button
                      className="text-blue-600"
                      onClick={() => navigate(`${ROUTES.ADMIN_USERS}/${u.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(u.id)}
                      disabled={deleteUser.isPending}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <span>
              Page {data.meta.page} / {data.meta.totalPages}
            </span>
            <button
              className="px-3 py-1 border rounded"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};
