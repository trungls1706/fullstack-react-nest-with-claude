import { useNavigate, useParams } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { UserForm } from '../components/UserForm';
import { useUser } from '../hooks/useUser';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { useRoles } from '../hooks/useRoles';

export const UserEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const { data: user, isLoading, isError } = useUser(userId);
  const { data: roles = [] } = useRoles();
  const { mutate: updateUser, isPending } = useUpdateUser(userId);

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Loading...</div>;
  }

  if (isError || !user) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        User not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.ADMIN_USERS)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
      </div>

      <div className="mb-4 rounded-md bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Email:</span> {user.email}
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <UserForm
          defaultValues={user}
          roles={roles}
          isLoading={isPending}
          onSubmit={(values) => {
            updateUser(values, {
              onSuccess: () => navigate(ROUTES.ADMIN_USERS),
            });
          }}
        />
      </div>
    </div>
  );
};
