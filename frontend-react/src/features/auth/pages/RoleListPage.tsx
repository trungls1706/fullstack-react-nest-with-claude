import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { RoleList } from '../components/RoleList';
import { useRoles } from '../hooks/useRoles';

export const RoleListPage = () => {
  const navigate = useNavigate();
  const { data: roles, isLoading, isError } = useRoles();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
        <button
          onClick={() => navigate(ROUTES.ADMIN_ROLE_CREATE)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Role
        </button>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      )}

      {isError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load roles. Please try again.
        </div>
      )}

      {roles && <RoleList roles={roles} />}
    </div>
  );
};
