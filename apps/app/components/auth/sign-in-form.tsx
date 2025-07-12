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
import type { SignIn } from '@repo/validators/auth';
import { SignInSchema } from '@repo/validators/auth';
import { ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { FormError } from '~/components/auth/form-error';
import { signInWithPassword } from '~/lib/actions/auth';

export const SignInForm = () => {
  const searchParams = useSearchParams();
  const urlError =
    searchParams.get('error') === 'OAuthAccountNotLinked'
      ? 'Email already in use with different provider'
      : '';

  const form = useForm<SignIn>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { execute, result, isExecuting } = useAction(signInWithPassword);

  const onSubmit = (values: SignIn) => {
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
                <FormLabel className="text-[13px] leading-snug">
                  Email address
                </FormLabel>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] leading-snug">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-8"
                    disabled={isExecuting}
                    type="password"
                  />
                </FormControl>
                {/* <Button
                  asChild
                  className="px-0 font-normal"
                  size="sm"
                  variant="link"
                >
                  <Link href="/forgot-password">Forgot password?</Link>
                </Button> */}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormError message={result.serverError ?? urlError} />

        <Button
          className="group w-full text-[13px] leading-snug"
          disabled={isExecuting}
          size="sm"
          type="submit"
        >
          {isExecuting && <Spinner className="-ms-1 me-2" />}
          Continue with Email
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
