import type { Metadata } from 'next';

import { CardWrapper } from '~/components/auth/card-wrapper';
import { SignUpForm } from '~/components/auth/sign-up-form';
import { BRAND_NAME } from '~/lib/constants';

export const metadata: Metadata = {
  title: `Create your account | ${BRAND_NAME}`,
  description: 'Welcome! Please fill in your details to get started.',
};

export default function SignUpPage() {
  return (
    <CardWrapper
      backButtonHref="/signin"
      backButtonLabel="Have an account?"
      backButtonLinkLabel="Sign in"
      headerSubtitle="Welcome! Please fill in the details to get started."
      headerTitle="Create your account"
      showCredentials
      showSocial
    >
      <SignUpForm />
    </CardWrapper>
  );
}
