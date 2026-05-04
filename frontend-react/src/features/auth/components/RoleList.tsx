import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useDeleteRole } from '../hooks/useDeleteRole';
import type { Role } from '../types/role.types';

interface Props {
  roles: Role[];
}

export const RoleList = ({ roles }: Props) => {
  const navigate = useNavigate();
  const { mutate: deleteRole, isPending } = useDeleteRole();

  const handleDelete = (role: Role) => {
    if (!confirm(`Delete role "${role.name}"?`)) return;
    deleteRole(role.id);
  };

  if (roles.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No roles found.
      </div>
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
              Name
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {roles.map((role) => (
            <tr key={role.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-500">{role.id}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {role.name}
              </td>
              <td className="px-6 py-4 text-right text-sm">
                <button
                  onClick={() =>
                    navigate(
                      ROUTES.ADMIN_ROLE_EDIT.replace(':id', String(role.id)),
                    )
                  }
                  className="mr-3 text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(role)}
                  disabled={isPending}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
