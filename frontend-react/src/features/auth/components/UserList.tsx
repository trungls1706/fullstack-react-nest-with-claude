import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useToggleUserActive } from '../hooks/useToggleUserActive';
import type { User } from '../types/user.types';

interface Props {
  users: User[];
}

export const UserList = ({ users }: Props) => {
  const navigate = useNavigate();
  const { mutate: toggleActive, isPending } = useToggleUserActive();

  if (users.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">No users found.</div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Full Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-500">{user.id}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {user.fullName}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {user.role?.name ?? `Role #${user.roleId}`}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm">
                <button
                  onClick={() =>
                    navigate(
                      ROUTES.ADMIN_USER_EDIT.replace(':id', String(user.id)),
                    )
                  }
                  className="mr-3 text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(user.id)}
                  disabled={isPending}
                  className="text-amber-600 hover:text-amber-900 disabled:opacity-50"
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
