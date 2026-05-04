import { useState } from 'react';
import { ROUTES } from '@/routes/routes';
import { useNavigate } from 'react-router';
import { UserList } from '../components/UserList';
import { useUsers } from '../hooks/useUsers';

export const UserListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useUsers({ page, limit: 10 });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <button
          onClick={() => navigate(ROUTES.ADMIN_USER_CREATE)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New User
        </button>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      )}

      {isError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load users. Please try again.
        </div>
      )}

      {data && <UserList users={data.data} />}

      {data && data.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
            disabled={page === data.meta.totalPages}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
