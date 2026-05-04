import { useNavigate, useParams } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { RoleForm } from '../components/RoleForm';
import { useRole } from '../hooks/useRole';
import { useUpdateRole } from '../hooks/useUpdateRole';

export const RoleEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const roleId = Number(id);

  const { data: role, isLoading, isError } = useRole(roleId);
  const { mutate: updateRole, isPending } = useUpdateRole(roleId);

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Loading...</div>;
  }

  if (isError || !role) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        Role not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.ADMIN_ROLES)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Role</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <RoleForm
          defaultValues={role}
          isLoading={isPending}
          onSubmit={(values) => {
            updateRole(values, {
              onSuccess: () => navigate(ROUTES.ADMIN_ROLES),
            });
          }}
        />
      </div>
    </div>
  );
};
