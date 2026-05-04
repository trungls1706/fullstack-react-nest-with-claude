import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { RoleForm } from '../components/RoleForm';
import { useCreateRole } from '../hooks/useCreateRole';

export const RoleCreatePage = () => {
  const navigate = useNavigate();
  const { mutate: createRole, isPending } = useCreateRole();

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.ADMIN_ROLES)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Role</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <RoleForm
          isLoading={isPending}
          onSubmit={(values) => {
            createRole(values, {
              onSuccess: () => navigate(ROUTES.ADMIN_ROLES),
            });
          }}
        />
      </div>
    </div>
  );
};
