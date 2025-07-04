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
import type { UpdatePassword } from '@repo/validators/auth';
import { UpdatePasswordSchema } from '@repo/validators/auth';
import { ArrowRight, Check, Eye, EyeOff, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormError } from '~/components/auth/form-error';
import { FormSuccess } from '~/components/auth/form-success';
import { updatePassword } from '~/lib/actions/auth';

const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: 'At least 8 characters' },
  { regex: /[0-9]/, text: 'At least 1 number' },
  { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
  { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
] as const;

export const UpdatePasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isVisible, setIsVisible] = useState<boolean>(false);

  const form = useForm<UpdatePassword>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      newPassword: '',
      token: token ?? '',
    },
  });

  const { execute, result, isExecuting, hasSucceeded } =
    useAction(updatePassword);

  const onSubmit = (values: UpdatePassword) => {
    execute(values);
  };

  const checkStrength = (pass: string) => {
    return PASSWORD_REQUIREMENTS.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const strength = checkStrength(form.watch('newPassword'));

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getStrengthColor = (score: number) => {
    if (score === 0) {
      return 'bg-border';
    }
    if (score <= 1) {
      return 'bg-red-500';
    }
    if (score <= 2) {
      return 'bg-orange-500';
    }
    if (score === 3) {
      return 'bg-amber-500';
    }
    return 'bg-emerald-500';
  };

  const getStrengthText = (score: number) => {
    if (score === 0) {
      return 'Enter a password';
    }
    if (score <= 2) {
      return 'Weak password';
    }
    if (score === 3) {
      return 'Medium password';
    }
    return 'Strong password';
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-[13px] leading-snug">
                    New Password
                  </FormLabel>
                </div>
                <div className="relative">
                  <FormControl>
                    <Input
                      {...field}
                      aria-describedby="password-strength"
                      aria-invalid={strengthScore < 4}
                      className="h-8 pe-9"
                      disabled={isExecuting}
                      placeholder="Password"
                      type={isVisible ? 'text' : 'password'}
                    />
                  </FormControl>
                  <button
                    aria-label={isVisible ? 'Hide password' : 'Show password'}
                    aria-pressed={isVisible}
                    className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setIsVisible(!isVisible)}
                    type="button"
                  >
                    {isVisible ? (
                      <EyeOff aria-hidden="true" size={16} strokeWidth={2} />
                    ) : (
                      <Eye aria-hidden="true" size={16} strokeWidth={2} />
                    )}
                  </button>
                </div>
                <FormMessage />

                {/* Password strength indicator */}
                {/* biome-ignore lint/a11y/useAriaPropsForRole: <explanation> */}
                <div
                  aria-label="Password strength"
                  aria-valuemax={4}
                  aria-valuemin={0}
                  aria-valuenow={strengthScore}
                  aria-valuetext={`Password strength: ${strengthScore} out of 4`}
                  className="mt-3 mb-4 h-1 w-full overflow-hidden rounded-full bg-border"
                  role="progressbar"
                >
                  <div
                    className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
                    style={{ width: `${(strengthScore / 4) * 100}%` }}
                  />
                </div>

                {/* Password strength description */}
                <p
                  className="mb-2 font-medium text-[13px] text-foreground leading-snug"
                  id="password-strength"
                >
                  {getStrengthText(strengthScore)}. Must contain:
                </p>

                {/* Password requirements list */}
                <ul aria-label="Password requirements" className="space-y-1.5">
                  {strength.map((req) => (
                    <li className="flex items-center gap-2" key={req.text}>
                      {req.met ? (
                        <Check
                          aria-hidden="true"
                          className="text-emerald-500"
                          size={16}
                          strokeWidth={2}
                        />
                      ) : (
                        <X
                          aria-hidden="true"
                          className="text-muted-foreground/80"
                          size={16}
                          strokeWidth={2}
                        />
                      )}
                      <span
                        className={`text-xs ${req.met ? 'text-emerald-600' : 'text-muted-foreground'}`}
                      >
                        {req.text}
                        <span className="sr-only">
                          {req.met
                            ? ' - Requirement met'
                            : ' - Requirement not met'}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </FormItem>
            )}
          />
        </div>

        {hasSucceeded && (
          <FormSuccess message="Password updated successfully" />
        )}
        <FormError message={result.serverError} />

        <Button
          className="group w-full text-[13px] leading-snug"
          disabled={isExecuting || strengthScore < 4}
          size="sm"
          type="submit"
        >
          {isExecuting && <Spinner className="-ms-1 me-2" />}
          Update password
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
