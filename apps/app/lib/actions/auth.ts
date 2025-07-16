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
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific Better Auth errors
        if (error.message.includes('Invalid email or password')) {
          throw new Error('Invalid email or password');
        }
        if (error.message.includes('User not found')) {
          throw new Error('No account found with this email');
        }
        throw new Error(error.message);
      }
      throw new Error('Authentication failed. Please try again.');
    }

    // Redirect after successful authentication
    redirect('/');
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
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific Better Auth errors
        if (error.message.includes('User already exists')) {
          throw new Error('An account with this email already exists');
        }
        if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address');
        }
        throw new Error(error.message);
      }
      throw new Error('Account creation failed. Please try again.');
    }

    // Redirect after successful registration
    redirect('/');
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
        // Don't reveal whether email exists for security
        if (error.message.includes('User not found')) {
          return {
            success:
              'If an account with this email exists, you will receive a reset link.',
          };
        }
        throw new Error(error.message);
      }
      throw new Error('Password reset request failed. Please try again.');
    }

    return {
      success:
        'If an account with this email exists, you will receive a reset link.',
    };
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
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid token')) {
          throw new Error('Reset link is invalid or has expired');
        }
        if (error.message.includes('Token expired')) {
          throw new Error('Reset link has expired. Please request a new one.');
        }
        throw new Error(error.message);
      }
      throw new Error('Password update failed. Please try again.');
    }

    // Redirect after successful password update
    redirect('/');
  });

export const signInWithGithub = async () => {
  try {
    const res = await auth.api.signInSocial({
      body: {
        provider: 'github',
        callbackURL: '/',
      },
    });

    if (!res.url) {
      throw new Error('GitHub authentication failed');
    }

    redirect(res.url);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('GitHub authentication failed. Please try again.');
  }
};

export const signOut = async () => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });

    revalidatePath('/', 'layout');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Sign out failed. Please try again.');
  }

  redirect('/');
};
