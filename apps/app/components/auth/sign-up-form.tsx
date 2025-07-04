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
import type { SignUp } from '@repo/validators/auth';
import { SignUpSchema } from '@repo/validators/auth';
import { ArrowRight } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormError } from '~/components/auth/form-error';
import { FormSuccess } from '~/components/auth/form-success';
import { signUp } from '~/lib/actions/auth';

export const SignUpForm = () => {
  const form = useForm<SignUp>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const { execute, result, isExecuting, hasSucceeded } = useAction(signUp);

  useEffect(() => {
    if (hasSucceeded) {
      form.reset();
    }
  }, [hasSucceeded, form]);

  const onSubmit = (values: SignUp) => {
    execute(values);
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] leading-snug">Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-8"
                    disabled={isExecuting}
                    type="text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {hasSucceeded && <FormSuccess message="Confirmation email sent!" />}
        <FormError message={result.serverError} />

        <Button
          className="group w-full text-[13px] leading-snug"
          disabled={isExecuting}
          size="sm"
          type="submit"
        >
          {isExecuting && <Spinner className="-ms-1 me-2" />}
          Create account
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
