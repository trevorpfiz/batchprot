import { CardWrapper } from '~/components/auth/card-wrapper';
import { UpdatePasswordForm } from '~/components/auth/update-password-form';

export default function UpdatePasswordPage() {
  return (
    <CardWrapper
      headerSubtitle="Enter your new password below."
      headerTitle="Update Password"
      showContent
    >
      <UpdatePasswordForm />
    </CardWrapper>
  );
}
