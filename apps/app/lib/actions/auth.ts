'use server';

import {
  RequestPasswordResetSchema,
  SignInSchema,
  SignUpSchema,
  UpdatePasswordSchema,
} from '@repo/validators/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { flattenValidationErrors } from 'next-safe-action';
import { auth } from '~/auth/server';
import { actionClient, authActionClient } from '~/lib/safe-action';

export const signInWithPassword = actionClient
  .metadata({ actionName: 'signInWithPassword' })
  .inputSchema(SignInSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput: { email, password } }) => {
    try {
      await auth.api.signInEmail({
        body: {
          email,
          password,
        },
      });

      revalidatePath('/', 'layout');
      redirect('/');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred.');
    }
  });

export const signUp = actionClient
  .metadata({ actionName: 'signUp' })
  .inputSchema(SignUpSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput: { email, password, name } }) => {
    try {
      await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: name ?? '',
        },
      });

      revalidatePath('/', 'layout');
      redirect('/');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred.');
    }
  });

export const requestResetPassword = actionClient
  .metadata({ actionName: 'requestResetPassword' })
  .inputSchema(RequestPasswordResetSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput: { email } }) => {
    try {
      await auth.api.requestPasswordReset({
        body: {
          email,
          redirectTo: '/account/update-password',
        },
      });

      revalidatePath('/', 'layout');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred.');
    }
  });

export const updatePassword = authActionClient
  .metadata({ actionName: 'updatePassword' })
  .inputSchema(UpdatePasswordSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput: { newPassword, token } }) => {
    try {
      await auth.api.resetPassword({
        body: {
          token,
          newPassword,
        },
      });

      revalidatePath('/', 'layout');
      redirect('/');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred.');
    }
  });

export const signInWithGithub = async () => {
  const res = await auth.api.signInSocial({
    body: {
      provider: 'github',
      callbackURL: '/',
    },
  });

  if (!res.url) {
    throw new Error('No URL returned from signInSocial');
  }
  redirect(res.url);
};

export const signOut = async () => {
  await auth.api.signOut({
    headers: await headers(),
  });
  revalidatePath('/', 'layout');
  redirect('/');
};
