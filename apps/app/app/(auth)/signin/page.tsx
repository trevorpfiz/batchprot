import type { Metadata } from 'next';

import { CardWrapper } from '~/components/auth/card-wrapper';
import { SignInForm } from '~/components/auth/sign-in-form';
import { BRAND_NAME } from '~/lib/constants';

export const metadata: Metadata = {
  title: `Welcome back | ${BRAND_NAME}`,
  description: 'Welcome back! Please sign in to continue.',
};

export default function SignInPage() {
  return (
    <CardWrapper
      backButtonHref="/signup"
      backButtonLabel="Don't have an account?"
      backButtonLinkLabel="Sign up"
      headerSubtitle="Welcome back! Please sign in to continue."
      headerTitle={`Sign in to ${BRAND_NAME}`}
      showCredentials
      showSocial
    >
      <SignInForm />
    </CardWrapper>
  );
}
