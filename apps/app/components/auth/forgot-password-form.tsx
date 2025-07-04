'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from '@repo/design-system/components/spinner';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import type { RequestPasswordReset } from '@repo/validators/auth';
import { RequestPasswordResetSchema } from '@repo/validators/auth';
import { ArrowRight } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { FormError } from '~/components/auth/form-error';
import { FormSuccess } from '~/components/auth/form-success';
import { requestResetPassword } from '~/lib/actions/auth';

export const ForgotPasswordForm = () => {
  const form = useForm<RequestPasswordReset>({
    resolver: zodResolver(RequestPasswordResetSchema),
    defaultValues: {
      email: '',
    },
  });

  const { execute, result, isExecuting, hasSucceeded } =
    useAction(requestResetPassword);

  const onSubmit = (values: RequestPasswordReset) => {
    execute(values);
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-[13px] leading-snug">
                    Email address
                  </FormLabel>
                </div>
                <FormControl>
                  <Input
                    {...field}
                    className="h-8"
                    disabled={isExecuting}
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {hasSucceeded && (
          <FormSuccess message="Check your email for a password reset link." />
        )}
        <FormError message={result.serverError} />

        <Button
          className="group w-full text-[13px] leading-snug"
          disabled={isExecuting}
          size="sm"
          type="submit"
        >
          {isExecuting && <Spinner className="-ms-1 me-2" />}
          Send reset link
          <ArrowRight
            aria-hidden="true"
            className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
            size={13}
            strokeWidth={2}
          />
        </Button>
      </form>
    </Form>
  );
};
