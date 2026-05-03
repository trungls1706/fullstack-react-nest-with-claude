import { useNavigate, useParams } from 'react-router';
import { UserForm, type UserFormValues } from '../components/UserForm';
import {
  useCreateUser,
  useUpdateUser,
  useUser,
} from '../hooks/useUsers';
import { ROUTES } from '@/routes/routes';

export const AdminUserFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id !== 'new' && id !== undefined;
  const userId = isEdit ? Number(id) : undefined;

  const { data, isLoading } = useUser(userId);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const submitting = createUser.isPending || updateUser.isPending;

  const onSubmit = async (values: UserFormValues) => {
    const phone = values.phone || undefined;
    const password = values.password || undefined;

    if (isEdit && userId) {
      await updateUser.mutateAsync({
        id: userId,
        payload: { ...values, phone, password },
      });
    } else {
      if (!password) return;
      await createUser.mutateAsync({
        email: values.email,
        password,
        fullName: values.fullName,
        roleId: values.roleId,
        phone,
        isActive: values.isActive,
      });
    }
    navigate(ROUTES.ADMIN_USERS);
  };

  if (isEdit && isLoading) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{isEdit ? 'Edit User' : 'New User'}</h1>
      <UserForm
        initial={data?.data}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    </div>
  );
};
