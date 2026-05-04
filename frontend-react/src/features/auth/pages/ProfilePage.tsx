import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { ProfileForm, type ProfileFormValues } from '../components/ProfileForm';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import {
  useChangePassword,
  useLogout,
  useMe,
  useUpdateMe,
} from '../hooks/useAuth';
import { extractApiError } from '../utils/error.util';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const me = useMe();
  const updateMe = useUpdateMe();
  const changePassword = useChangePassword();
  const logout = useLogout();

  if (me.isLoading) return <p className="p-6">Loading…</p>;
  if (me.isError || !me.data) {
    return (
      <p className="p-6 text-red-600">
        Failed to load profile: {extractApiError(me.error, 'Unknown error')}
      </p>
    );
  }

  const handleProfile = (values: ProfileFormValues) => {
    updateMe.mutate({
      fullName: values.fullName,
      phone: values.phone || undefined,
    });
  };

  const handlePassword = (values: { currentPassword: string; newPassword: string }) => {
    changePassword.mutate(values);
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate(ROUTES.LOGIN, { replace: true }),
    });
  };

  return (
    <div className="p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My profile</h1>
        <button
          onClick={handleLogout}
          disabled={logout.isPending}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          {logout.isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </header>

      <section>
        <h2 className="text-lg font-medium mb-2">Profile details</h2>
        <ProfileForm
          initial={me.data}
          submitting={updateMe.isPending}
          onSubmit={handleProfile}
        />
        {updateMe.isSuccess && <p className="text-green-600 text-sm mt-2">Profile updated.</p>}
        {updateMe.isError && (
          <p className="text-red-600 text-sm mt-2">
            {extractApiError(updateMe.error, 'Failed to update')}
          </p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Change password</h2>
        <ChangePasswordForm
          submitting={changePassword.isPending}
          errorMessage={
            changePassword.isError
              ? extractApiError(changePassword.error, 'Failed to change password')
              : null
          }
          successMessage={changePassword.isSuccess ? 'Password updated.' : null}
          onSubmit={handlePassword}
        />
      </section>
    </div>
  );
};
